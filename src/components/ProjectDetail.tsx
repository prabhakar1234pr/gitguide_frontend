"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import ConceptsSidebar from './ConceptsSidebar';
import ChatAssistant from './ChatAssistant';
import { triggerAgentProcessing, getAgentStatus } from '../../services/api';

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

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { getToken, isLoaded } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [agentError, setAgentError] = useState<string>('');

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

        // If project is processed, check agent status for detailed info
        if (projectData.is_processed) {
          try {
            const statusResponse = await getAgentStatus(projectIdNum, getToken);
            setProcessingStatus(`Completed: ${statusResponse.message}`);
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

  const getProjectName = (repoUrl: string) => {
    try {
      const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      return match ? match[2] : 'Unknown Project';
    } catch {
      return 'Unknown Project';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="flex h-screen">
        {/* Left Sidebar - Hierarchical Learning Path */}
        <ConceptsSidebar 
          projectId={projectId}
          projectDomain={project.domain}
          skillLevel={project.skill_level}
        />

        {/* Middle Section - Project Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-8">
            {displayName}
          </h1>
          
          {/* Project Info Card */}
          <div className="max-w-2xl w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            
            {/* Show project overview if processed */}
            {project.is_processed && project.project_overview ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">Learning Path Ready! 🎉</h2>
                  <div className="text-gray-300 leading-relaxed text-left bg-white/5 rounded-lg p-4">
                    {project.project_overview}
                  </div>
                  
                  <div className="text-green-300 font-medium">
                    ✅ {processingStatus || 'Your personalized learning journey is ready!'}
                  </div>
                </div>
              </div>
            ) : (
              /* Show generate button if not processed */
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-2xl flex items-center justify-center mx-auto">
                  {isProcessing ? (
                    <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                </div>
                
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white">
                    {isProcessing ? 'Generating Learning Path...' : 'Ready to Learn?'}
                  </h2>
                  
                  {isProcessing ? (
                    <div className="space-y-3">
                      <p className="text-blue-300 leading-relaxed">
                        {processingStatus}
                      </p>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full animate-pulse" 
                             style={{width: '60%'}}></div>
                      </div>
                      <p className="text-gray-400 text-sm">
                        This may take 1-3 minutes depending on repository size...
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-gray-300 leading-relaxed">
                        Generate your personalized learning path. Our AI will analyze this repository and create:
                      </p>
                      
                      <div className="space-y-3 text-left">
                        <div className="flex items-center gap-3 text-gray-200">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Project overview and analysis</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-200">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Sequential learning concepts</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-200">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full"></div>
                          <span>Interactive tasks and exercises</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-200">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Skill-level appropriate content ({project.skill_level})</span>
                        </div>
                      </div>

                      <button
                        onClick={handleGenerateLearningPath}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        🚀 Generate Learning Path
                      </button>

                      {agentError && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                          {agentError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 mt-6 border-t border-white/20">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>Domain: {project.domain}</span>
                <span>Repository: {project.repo_url.split('/').pop()}</span>
              </div>
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