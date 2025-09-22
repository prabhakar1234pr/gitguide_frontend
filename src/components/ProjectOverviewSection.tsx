"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';

interface ProjectOverviewSectionProps {
  projectId: string;
}

export default function ProjectOverviewSection({ projectId }: ProjectOverviewSectionProps) {
  const { getToken, isLoaded } = useAuth();
  const [isProjectOverviewOpen, setIsProjectOverviewOpen] = useState(false);
  const [selectedOverview, setSelectedOverview] = useState<string | null>(null);
  const [projectOverview, setProjectOverview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadProjectOverview = async () => {
      if (!isLoaded || !projectId) return;
      
      try {
        setLoading(true);
        setError('');
        
        const projectIdNum = parseInt(projectId);
        if (isNaN(projectIdNum)) {
          setError('Invalid project ID');
          return;
        }

        const token = await getToken();
        if (!token) {
          setError('No authentication token');
          return;
        }

        console.log(`📋 Fetching project overview for project ${projectId}`);
        const response = await fetch(`https://gitguide-backend.onrender.com/projects/${projectIdNum}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load project: ${response.status}`);
        }

        const projectData = await response.json();
        console.log(`✅ Project overview loaded: ${projectData.project_overview ? 'Available' : 'Not available'}`);
        setProjectOverview(projectData.project_overview || '');

      } catch (error) {
        console.error('❌ Failed to load project overview:', error);
        setError('Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    loadProjectOverview();
  }, [isLoaded, projectId, getToken]);

  const handleOverviewClick = (id: string) => {
    setSelectedOverview(selectedOverview === id ? null : id);
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsProjectOverviewOpen(!isProjectOverviewOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
      >
        <span className="font-semibold text-white">Project Overview</span>
        <svg 
          className={`w-5 h-5 text-gray-300 transition-transform ${isProjectOverviewOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isProjectOverviewOpen && (
        <div className="ml-4 mt-2 space-y-2">
          <button
            onClick={() => handleOverviewClick('project-overview')}
            className="block w-full p-3 text-left text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            View Project Overview
          </button>
          
          {selectedOverview === 'project-overview' && (
            <div className="ml-4 p-4 bg-white/5 rounded-lg border border-white/10">
              {loading ? (
                <div className="flex items-center text-gray-400 text-sm">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Loading overview...
                </div>
              ) : error ? (
                <p className="text-red-300 text-sm">{error}</p>
              ) : projectOverview ? (
                <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      // Custom styling for markdown elements in project overview
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-gray-300">{children}</p>,
                      h1: ({ children }) => <h1 className="text-base font-bold mb-2 text-white">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold mb-2 text-white">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-white">{children}</h3>,
                      code: ({ children, className }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-700 text-purple-300 px-1 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-gray-700 text-green-300 p-2 rounded text-xs font-mono overflow-x-auto">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-gray-700 p-2 rounded overflow-x-auto mb-2">
                          {children}
                        </pre>
                      ),
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="text-gray-300">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-purple-400 pl-2 italic text-gray-300 mb-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ children, href }) => (
                        <a href={href} className="text-blue-400 hover:text-blue-300 underline text-xs" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {projectOverview}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-yellow-300 text-sm">
                  Project overview not available yet. Generate a learning path to see the AI analysis.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 