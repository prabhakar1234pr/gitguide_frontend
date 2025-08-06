"use client";

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import ConceptsSidebar from './ConceptsSidebar';
import ChatAssistant from './ChatAssistant';
import DaysProgressBar from './DaysProgressBar';
import ContentDisplay from './project-detail/ContentDisplay';
import { triggerAgentProcessing, getAgentStatus, getProjectConcepts, markTaskCompleted } from '../../services/api';

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
  verification_type?: string;
  is_verified?: boolean;
  id?: string | number;
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

  // Refs for cleanup
  const isMountedRef = useRef(true);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling timeout
  const cleanupPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const calculateCompletionPercentage = useCallback(async (projectIdNum: number) => {
    try {
      // Get project concepts and tasks
      const conceptsData = await getProjectConcepts(projectIdNum, getToken);
      const concepts = conceptsData.concepts || [];
      
      let totalTasks = 0;
      let completedTasks = 0;
      
      // Count all tasks and completed tasks
      concepts.forEach((concept: any) => {
        // Handle both 'subTopics' and 'subtopics' naming conventions
        const subtopics = concept.subTopics || concept.subtopics || [];
        
        subtopics.forEach((subtopic: any) => {
          const tasks = subtopic.tasks || [];
          totalTasks += tasks.length;
          
          tasks.forEach((task: any) => {
            if (task.status === 'completed') {
              completedTasks++;
            }
          });
        });
      });
      
      // Calculate percentage (avoid division by zero)
      const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      console.log(`📊 Progress: ${completedTasks}/${totalTasks} tasks completed (${percentage}%)`);
      setCompletionPercentage(percentage);
      
    } catch (error) {
      console.error('Failed to calculate completion percentage:', error);
      setCompletionPercentage(0);
    }
  }, [getToken]);

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
              await calculateCompletionPercentage(projectIdNum);
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
  }, [isLoaded, projectId, getToken, calculateCompletionPercentage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanupPolling();
    };
  }, [cleanupPolling]);

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

      // Poll for status updates with proper cleanup
      let pollCount = 0;
      const maxPolls = 60; // Maximum 3 minutes of polling (60 * 3 seconds)

      const pollStatus = async () => {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        try {
          pollCount++;
          
          // Stop polling after max attempts
          if (pollCount > maxPolls) {
            if (isMountedRef.current) {
              setProcessingStatus('Processing is taking longer than expected. Please refresh the page.');
              setIsProcessing(false);
            }
            return;
          }

          const statusResponse = await getAgentStatus(projectIdNum, getToken);
          
          // Check again if component is still mounted after async call
          if (!isMountedRef.current) {
            return;
          }
          
          if (statusResponse.status === 'completed') {
            setProcessingStatus(`Completed! ${statusResponse.message}`);
            setIsProcessing(false);
            
            // Reload project data to get updated info
            window.location.reload();
            
          } else if (statusResponse.status === 'not_processed') {
            setProcessingStatus('Processing repository...');
            pollTimeoutRef.current = setTimeout(pollStatus, 3000); // Poll every 3 seconds
          } else {
            setProcessingStatus('AI is working on your learning path...');
            pollTimeoutRef.current = setTimeout(pollStatus, 3000);
          }
        } catch (error) {
          // Check if component is still mounted before updating state
          if (!isMountedRef.current) {
            return;
          }

          console.error('Status polling error:', error);
          
          // Stop polling on repeated errors
          if (pollCount > 5) {
            setProcessingStatus('Error checking status. Please refresh the page.');
            setIsProcessing(false);
            return;
          }
          
          pollTimeoutRef.current = setTimeout(pollStatus, 5000); // Retry in 5 seconds
        }
      };

      // Start polling after initial trigger
      pollTimeoutRef.current = setTimeout(pollStatus, 2000);

      // Cleanup function (should be called on component unmount)
      return () => {
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current);
        }
      };

    } catch (error) {
      console.error('Failed to generate learning path:', error);
      setAgentError(`Failed to generate learning path: ${error instanceof Error ? error.message : String(error)}`);
      setIsProcessing(false);
    }
  };

  const handleContentSelect = (content: SelectedContent) => {
    setSelectedContent(content);
  };

  const handleVerifyTask = async (taskTitle: string, taskId?: string | number) => {
    if (!project || !taskId) {
      alert('Task ID not available for completion');
      return;
    }

    try {
      // Convert taskId to number if it's a string
      const taskIdNum = typeof taskId === 'string' ? parseInt(taskId) : taskId;
      if (isNaN(taskIdNum)) {
        alert('Invalid task ID');
        return;
      }

      console.log('Marking task as completed:', taskTitle, 'ID:', taskIdNum);
      await markTaskCompleted(taskIdNum, getToken);

      alert(`Task "${taskTitle}" marked as completed!`);
      
      // Reload project data to update completion percentage and UI
      window.location.reload();
      
    } catch (error) {
      console.error('Failed to mark task as completed:', error);
      alert(`Failed to mark task "${taskTitle}" as completed: ${error instanceof Error ? error.message : String(error)}`);
    }
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
          onContentSelect={handleContentSelect}
        />

        {/* Center Section - Selected Content Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Header Section - Enhanced with Days */}
          <div className="flex-shrink-0 bg-white/5 backdrop-blur-sm border-b border-white/10 px-8 py-6">
            <div className="max-w-4xl mx-auto space-y-4">
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

              {/* 14-Day Learning Progression - Only show if project is processed */}
              {project.is_processed && (
                <DaysProgressBar projectId={projectId} />
              )}
            </div>
          </div>

          {/* Main Content Area - Selected Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">
              
              {project.is_processed ? (
                // Show selected content
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