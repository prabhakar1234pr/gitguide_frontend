"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import ConceptsSidebarModular from './ConceptsSidebarModular';
import ChatAssistant from './ChatAssistant';
import ProjectDetailHeader from './project-detail/ProjectDetailHeader';
import LearningPathGenerator from './project-detail/LearningPathGenerator';
import ContentDisplay from './project-detail/ContentDisplay';
import DaysProgressBar from './DaysProgressBar';
import { SelectedContent } from './learning-path/types';
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
            const projectResponse = await fetch(`http://localhost:8000/projects/${projectIdNum}`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Learning Path */}
        <ConceptsSidebarModular
          projectId={projectId}
          onContentSelect={handleContentSelect}
          activeDayNumber={activeDayNumber}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          <ProjectDetailHeader
            project={project}
            processingStatus={processingStatus}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
          />
          
          {/* 14-Day Learning Progression - Only show if project is processed */}
          {project.is_processed && (
            <div className="px-6 pt-4 pb-2 border-b border-white/10">
              <DaysProgressBar 
                projectId={projectId} 
                onActiveDayChange={setActiveDayNumber} 
              />
            </div>
          )}
          
          <div className="flex-1 p-6 overflow-y-auto">
            {project.is_processed ? (
              selectedContent ? (
              <ContentDisplay
                selectedContent={selectedContent}
                onVerifyTask={handleVerifyTask}
                  projectId={projectId}
              />
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
                  <div className="text-gray-400 text-lg">
                    Select an item from the learning path to view details
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
        </div>

        {/* Right Sidebar - Chat Assistant */}
        <ChatAssistant projectId={projectId} activeDayNumber={activeDayNumber} />
      </div>
    </div>
  );
} 