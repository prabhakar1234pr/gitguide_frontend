"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import ConceptsSidebarModular from './ConceptsSidebarModular';
import FloatingChatWidget from './FloatingChatWidget';
import ProjectDetailHeader from './project-detail/ProjectDetailHeader';
import LearningPathGenerator from './project-detail/LearningPathGenerator';
import ContentDisplay from './project-detail/ContentDisplay';
import DaysProgressBar from './DaysProgressBar';
import { SelectedContent } from './learning-path/types';
import { triggerAgentProcessing, getAgentStatus, getProjectConcepts, API_BASE_URL } from '../../services/api';

interface Project {
  project_id: string;
  repo_url: string;
  skill_level: string;
  domain: string;
  is_processed?: boolean;
  project_overview?: string;
  repo_name?: string;
  tech_stack?: string;
}

interface ProjectDetailProps {
  projectId: string;
}


export default function ProjectDetailModular({ projectId }: ProjectDetailProps) {
  const { getToken, isLoaded } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [agentError, setAgentError] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [isDayProgressVisible, setIsDayProgressVisible] = useState(false);

  const calculateCompletionPercentage = useCallback(async (projectIdNum: number) => {
    try {
      const conceptsData = await getProjectConcepts(projectIdNum, getToken);
      
      let totalTasksCount = 0;
      let completedTasksCount = 0;
      
      const concepts = conceptsData.concepts || [];
      concepts.forEach((concept: unknown) => {
        const conceptData = concept as { 
          subTopics?: unknown[]; 
          subtopics?: unknown[];
          subconcepts?: unknown[];
        };
        
        // Handle new subconcept structure
        if (conceptData.subconcepts) {
          conceptData.subconcepts.forEach((subconcept: unknown) => {
            const subconceptData = subconcept as { task?: { status?: string } };
            if (subconceptData.task) {
              totalTasksCount++;
              if (subconceptData.task.status === 'completed') {
                completedTasksCount++;
              }
            }
          });
        } else {
          // Handle legacy subtopic structure
          const subtopics = conceptData.subTopics || conceptData.subtopics || [];
          subtopics.forEach((subtopic: unknown) => {
            const subtopicData = subtopic as { tasks?: unknown[] };
            const tasks = subtopicData.tasks || [];
            totalTasksCount += tasks.length;
            
            tasks.forEach((task: unknown) => {
              const taskData = task as { status?: string };
              if (taskData.status === 'completed') {
                completedTasksCount++;
              }
            });
          });
        }
      });
      
      setTotalTasks(totalTasksCount);
      setCompletedTasks(completedTasksCount);
    } catch (error) {
      console.error('Failed to calculate completion percentage:', error);
      setTotalTasks(0);
      setCompletedTasks(0);
    }
  }, [getToken]);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      if (!isLoaded || !projectId) return;

      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        console.error('Invalid project ID:', projectId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        
        const projectResponse = await fetch(`${API_BASE_URL}/projects/${projectIdNum}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!projectResponse.ok) {
          const errorText = await projectResponse.text();
          console.error('Project API Error:', errorText);
          throw new Error(`Failed to load project details: ${projectResponse.status} ${errorText}`);
        }

        const projectData = await projectResponse.json();
        setProject({
          project_id: projectData.project_id.toString(),
          repo_url: projectData.repo_url,
          skill_level: projectData.skill_level,
          domain: projectData.domain,
          is_processed: projectData.is_processed,
          project_overview: projectData.project_overview,
          repo_name: projectData.repo_name,
          tech_stack: projectData.tech_stack
        });

        // Set default selected content to project overview
        if (projectData.project_overview) {
          setSelectedContent({
            type: 'project',
            title: 'Project Overview',
            description: projectData.project_overview
          });
        }

        // If project is processed, check agent status
        if (projectData.is_processed) {
          try {
            const statusResponse = await getAgentStatus(projectIdNum, getToken);
            setProcessingStatus(`Completed: ${statusResponse.message}`);
            
            // Calculate completion percentage
            if (token) {
              await calculateCompletionPercentage(projectIdNum);
            }
          } catch (error) {
            console.warn('Could not fetch agent status:', error);
          }
        }

      } catch (error) {
        console.error('Error loading project:', error);
        setAgentError(error instanceof Error ? error.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [isLoaded, projectId, getToken, calculateCompletionPercentage]);

  const handleGenerateLearningPath = async () => {
    if (!project) return;

    try {
      setIsProcessing(true);
      setAgentError('');
      setProcessingStatus('Initializing AI agent...');

      const projectIdNum = parseInt(project.project_id);
      
      // Start agent processing
      console.log('🚀 Triggering agent processing...');
      const response = await triggerAgentProcessing(projectIdNum, getToken);
      console.log('✅ Agent processing triggered:', response);
      
      setProcessingStatus('AI agent is analyzing your repository...');
      
      // Poll for completion with proper cleanup
      let pollCount = 0;
      const maxPolls = 90; // Maximum 3 minutes of polling (90 * 2 seconds)
      let pollTimeoutId: NodeJS.Timeout | null = null;

      const pollStatus = async () => {
        try {
          pollCount++;
          
          // Stop polling after max attempts
          if (pollCount > maxPolls) {
            console.log('⏰ Polling timeout reached');
            setIsProcessing(false);
            setAgentError('Processing is taking longer than expected. Please refresh the page.');
            return;
          }

          console.log('📊 Checking agent status...');
          const status = await getAgentStatus(projectIdNum, getToken);
          console.log('📊 Status:', status);
          
          setProcessingStatus(status.message);
          
          if (status.status === 'completed') {
            console.log('✅ Processing completed!');
            setIsProcessing(false);
            
            // Reload project data
            console.log('📥 Reloading project data...');
            const projectResponse = await fetch(`${API_BASE_URL}/projects/${projectIdNum}`, {
              headers: {
                "Authorization": `Bearer ${await getToken()}`,
              },
            });
            
            if (projectResponse.ok) {
              const updatedProject = await projectResponse.json();
              console.log('📊 Updated project:', updatedProject);
              
              setProject(prev => prev ? { 
                ...prev, 
                is_processed: true, 
                project_overview: updatedProject.project_overview 
              } : null);
              
              if (updatedProject.project_overview) {
                setSelectedContent({
                  type: 'project',
                  title: 'Project Overview',
                  description: updatedProject.project_overview
                });
              }
            } else {
              console.error('❌ Failed to reload project:', await projectResponse.text());
            }
          } else if (status.status === 'failed') {
            console.error('❌ Processing failed:', status.message);
            setIsProcessing(false);
            setAgentError(status.message || 'Processing failed');
          } else {
            // Continue polling with timeout reference
            pollTimeoutId = setTimeout(pollStatus, 2000);  // Poll every 2 seconds
          }
        } catch (error) {
          console.error('❌ Status polling error:', error);
          
          // Stop polling on repeated errors
          if (pollCount > 5) {
            setIsProcessing(false);
            setAgentError(error instanceof Error ? error.message : 'Failed to check processing status');
            return;
          }
          
          // Retry with timeout reference
          pollTimeoutId = setTimeout(pollStatus, 3000);  // Retry in 3 seconds
        }
      };

      // Start polling immediately
      pollStatus();

      // Return cleanup function
      return () => {
        if (pollTimeoutId) {
          clearTimeout(pollTimeoutId);
        }
      };
      
    } catch (error) {
      console.error('❌ Agent processing error:', error);
      setIsProcessing(false);
      setAgentError(error instanceof Error ? error.message : 'Failed to start AI processing');
    }
  };

  const handleContentSelect = (content: SelectedContent) => {
    setSelectedContent(content);
  };

  const handleVerifyTask = (taskTitle: string) => {
    // This could be extended to mark tasks as complete
    console.log('Verifying task:', taskTitle);
    // For now, just show a success message
    alert(`Task "${taskTitle}" marked as verified!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full mx-auto"></div>
          <div className="text-white text-xl">Loading project details...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-400 text-xl">Failed to load project</div>
          <div className="text-gray-300">Please try again or check your project ID</div>
        </div>
      </div>
    );
  }

  const getRepositoryName = () => {
    if (project?.repo_name) {
      return project.repo_name;
    }
    if (project?.repo_url) {
      const urlParts = project.repo_url.split('/');
      return urlParts[urlParts.length - 1] || 'Repository';
    }
    return 'Repository';
  };

  const getRepositoryOwner = () => {
    if (project?.repo_url) {
      const urlParts = project.repo_url.split('/');
      if (urlParts.length >= 2) {
        return urlParts[urlParts.length - 2];
      }
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
      {/* Global Container */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-zinc-400">
            <li>GitGuide</li>
            <li className="before:content-['/'] before:mx-2">Project</li>
            <li className="before:content-['/'] before:mx-2 text-white font-medium">{getRepositoryName()}</li>
          </ol>
        </nav>

        {/* Hero Header Card */}
        <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">{getRepositoryName()}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-300">by</span>
                    <a href={project?.repo_url} target="_blank" rel="noopener noreferrer" 
                       className="text-indigo-400 hover:text-indigo-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 rounded">
                      {getRepositoryOwner()}
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Meta Badges */}
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-100/10 dark:bg-zinc-800/50 text-zinc-200 border border-zinc-700/50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {project?.skill_level || 'Beginner'}
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-100/10 dark:bg-zinc-800/50 text-zinc-200 border border-zinc-700/50">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {project?.domain || 'Full Stack'}
                </span>
                {project?.is_processed && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-500/20 text-green-300 border border-green-500/50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Learning Path Ready
                  </span>
                )}
              </div>
            </div>

            {/* Right: Progress & CTA */}
            <div className="flex items-center gap-6">
              {/* Circular Progress */}
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}, 100`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">
                      {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-sm text-zinc-300">
                  {completedTasks} of {totalTasks} tasks
                </div>
              </div>

              {/* Primary CTA */}
              {project?.is_processed ? (
                <a
                  href={project.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Repository
                </a>
              ) : (
                <button
                  onClick={handleGenerateLearningPath}
                  disabled={isProcessing}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                  {isProcessing ? (
                    <>
                      <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Start Journey
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Concepts */}
          <aside className="col-span-12 xl:col-span-3" role="navigation" aria-label="Learning path navigation">
            <div className="sticky top-20">
              <ConceptsSidebarModular
                projectId={projectId}
                onContentSelect={handleContentSelect}
                activeDayNumber={activeDayNumber}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="col-span-12 xl:col-span-9 min-w-0">
            {/* Learning Progression Toggle */}
            {project?.is_processed && (
              <div className="mb-6">
                <button
                  onClick={() => setIsDayProgressVisible(!isDayProgressVisible)}
                  className="flex items-center justify-between w-full p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
                  aria-expanded={isDayProgressVisible}
                  aria-controls="learning-progression"
                >
                  <span className="text-lg font-semibold text-white">Learning Progression</span>
                  <svg 
                    className={`w-5 h-5 text-white transition-transform ${isDayProgressVisible ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Collapsible Progression */}
                {isDayProgressVisible && (
                  <div id="learning-progression" className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <DaysProgressBar 
                      projectId={projectId} 
                      onActiveDayChange={setActiveDayNumber} 
                    />
                  </div>
                )}
              </div>
            )}

            {/* Content Display */}
            <div className="space-y-6">
              {project?.is_processed ? (
                selectedContent ? (
                  <ContentDisplay
                    selectedContent={selectedContent}
                    onVerifyTask={handleVerifyTask}
                    projectId={projectId}
                  />
                ) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-semibold text-white mb-3">Select a Learning Topic</h2>
                      <p className="text-zinc-300 text-sm leading-relaxed">
                        Choose any concept, subconcept, or task from the learning path to begin your journey
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <LearningPathGenerator
                  isProcessing={isProcessing}
                  processingStatus={processingStatus}
                  agentError={agentError}
                  onGenerateClick={handleGenerateLearningPath}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <FloatingChatWidget projectId={projectId} activeDayNumber={activeDayNumber} />
    </div>
  );
} 