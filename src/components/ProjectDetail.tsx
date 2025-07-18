"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import ConceptsSidebar from './ConceptsSidebar';
import ChatAssistant from './ChatAssistant';
import { triggerAgentProcessing, getAgentStatus, getProjectConcepts } from '../../services/api';

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

interface SelectedContent {
  type: 'project' | 'concept' | 'subtopic' | 'task';
  title: string;
  description: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { getToken, isLoaded } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [agentError, setAgentError] = useState<string>('');
  const [selectedContent, setSelectedContent] = useState<SelectedContent | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const loadProject = async () => {
      if (!isLoaded || !projectId) return;

      // Validate projectId is a number
      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        console.error('Invalid project ID:', projectId);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await getToken();
        
        // Load project details from backend
        const projectResponse = await fetch(`http://localhost:8000/projects/${projectIdNum}`, {
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

        // If project is processed, check agent status for detailed info
        if (projectData.is_processed) {
          try {
            const statusResponse = await getAgentStatus(projectIdNum, getToken);
            setProcessingStatus(`Completed: ${statusResponse.message}`);
            
            // Calculate actual completion percentage based on task progress
            if (token) {
              await calculateCompletionPercentage(projectIdNum, token);
            }
          } catch (error) {
            console.error('Failed to get agent status:', error);
        }
        }
        
      } catch (error) {
        console.error("Failed to load project details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [isLoaded, projectId, getToken]);

  const calculateCompletionPercentage = async (projectIdNum: number, token: string) => {
    try {
      // Get project concepts and tasks
      const conceptsData = await getProjectConcepts(projectIdNum, getToken);
      const concepts = conceptsData.concepts || [];
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      // Count all tasks and completed tasks
      concepts.forEach((concept: any) => {
        if (concept.subtopics) {
          concept.subtopics.forEach((subtopic: any) => {
            if (subtopic.tasks) {
              subtopic.tasks.forEach((task: any) => {
                totalTasks++;
                if (task.status === 'completed') {
                  completedTasks++;
                }
              });
            }
          });
        }
      });
      
      // Calculate percentage (avoid division by zero)
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      console.log(`📊 Progress: ${completedTasks}/${totalTasks} tasks completed (${percentage}%)`);
      setCompletionPercentage(percentage);
      
    } catch (error) {
      console.error('Failed to calculate completion percentage:', error);
      setCompletionPercentage(0);
    }
  };

  const handleGenerateLearningPath = async () => {
    if (!project) return;

    try {
      setIsProcessing(true);
      setAgentError('');
      setProcessingStatus('Starting AI analysis...');

      const projectIdNum = parseInt(project.project_id);
      
      // Trigger agent processing
      const response = await triggerAgentProcessing(projectIdNum, getToken);
      
      if (response.status === 'already_processed') {
        setProcessingStatus('Learning path already generated!');
        setIsProcessing(false);
        return;
      }

      setProcessingStatus('AI is analyzing the repository...');

      // Poll for status updates
      const pollStatus = async () => {
        try {
          const statusResponse = await getAgentStatus(projectIdNum, getToken);
          
          if (statusResponse.status === 'completed') {
            setProcessingStatus(`Completed! ${statusResponse.message}`);
            setIsProcessing(false);
            
            // Reload project data to get updated info
            window.location.reload();
            
          } else if (statusResponse.status === 'not_processed') {
            setProcessingStatus('Processing repository...');
            setTimeout(pollStatus, 3000); // Poll every 3 seconds
          } else {
            setProcessingStatus('AI is working on your learning path...');
            setTimeout(pollStatus, 3000);
          }
        } catch (error) {
          console.error('Status polling error:', error);
          setTimeout(pollStatus, 5000); // Retry in 5 seconds
        }
      };

      // Start polling after initial trigger
      setTimeout(pollStatus, 2000);

    } catch (error) {
      console.error('Failed to generate learning path:', error);
      setAgentError(`Failed to generate learning path: ${error instanceof Error ? error.message : String(error)}`);
      setIsProcessing(false);
    }
  };

  const handleContentSelect = (content: SelectedContent) => {
    setSelectedContent(content);
  };

  const handleVerifyTask = (taskTitle: string) => {
    // TODO: Implement task verification logic
    console.log('Verifying task:', taskTitle);
    // This could trigger an API call to verify the task completion
    // For now, just show a success message
    alert(`Task "${taskTitle}" verification initiated!`);
  };

  const getProjectName = (repoUrl: string) => {
    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      return match ? match[2] : 'Unknown Project';
    } catch {
      return 'Unknown Project';
    }
  };

  const getOwnerName = (repoUrl: string) => {
    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      return match ? match[1] : 'Unknown Owner';
    } catch {
      return 'Unknown Owner';
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading project details...</div>
      </div>
    );
  }

  const displayName = project.repo_name || getProjectName(project.repo_url);
  const ownerName = getOwnerName(project.repo_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Hierarchical Learning Path */}
        <ConceptsSidebar 
          projectId={projectId}
          projectDomain={project.domain}
          skillLevel={project.skill_level}
          onContentSelect={handleContentSelect}
        />

        {/* Center Section - Selected Content Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header Section - Simplified */}
          <div className="flex-shrink-0 bg-white/5 backdrop-blur-sm border-b border-white/10 px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                      {displayName}
          </h1>
                    <p className="text-gray-400 text-sm mt-1">
                      {ownerName} • {project.domain}
                    </p>
                  </div>
                </div>
          
                {/* Completion Percentage */}
                {project.is_processed && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{completionPercentage}%</div>
                      <div className="text-sm text-gray-400">Complete</div>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeDasharray={`${completionPercentage}, 100`}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area - Selected Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">
              
              {project.is_processed ? (
                // Show selected content
                selectedContent ? (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                      {selectedContent.type === 'project' && (
                        <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                      {selectedContent.type === 'concept' && (
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      )}
                      {selectedContent.type === 'subtopic' && (
                        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      {selectedContent.type === 'task' && (
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                      )}
                      {selectedContent.title}
                    </h2>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                      {selectedContent.description}
                    </div>
                    
                    {/* Verify Task Button for tasks */}
                    {selectedContent.type === 'task' && (
                      <div className="mt-8 pt-6 border-t border-white/20">
                        <button
                          onClick={() => handleVerifyTask(selectedContent.title)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verify Task
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
                    <div className="text-gray-400 text-lg">
                      Select an item from the learning path to view details
                    </div>
                  </div>
                )
              ) : (
                // Show generate learning path state
                <div className="space-y-8">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-3xl flex items-center justify-center mx-auto">
                      {isProcessing ? (
                        <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold text-white">
                        {isProcessing ? 'Generating Your Learning Path...' : 'Ready to Start Learning?'}
                      </h2>
                      <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        {isProcessing 
                          ? 'Our AI is analyzing your repository and creating a personalized learning experience.' 
                          : 'Let our AI analyze this repository and create a customized learning journey just for you.'
                        }
                      </p>
                    </div>
                  </div>

                  {isProcessing ? (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
                      <div className="text-center space-y-6">
                        <div className="text-blue-300 text-lg">
                          {processingStatus}
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3">
                          <div className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full animate-pulse transition-all duration-1000" 
                               style={{width: '60%'}}></div>
                        </div>
                        <p className="text-gray-400">
                          This may take 1-3 minutes depending on repository size...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={handleGenerateLearningPath}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-lg"
                      >
                        🚀 Generate My Learning Path
                      </button>
                      
                      {agentError && (
                        <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {agentError}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat Assistant */}
        <ChatAssistant 
          projectId={projectId}
        />
      </div>
    </div>
  );
} 