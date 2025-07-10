"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

interface ProjectOverviewSectionProps {
  projectId: string;
  projectDomain: string;
  skillLevel: string;
}

export default function ProjectOverviewSection({ projectId, projectDomain, skillLevel }: ProjectOverviewSectionProps) {
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
        const response = await fetch(`http://localhost:8000/projects/${projectIdNum}`, {
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
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {projectOverview}
                </p>
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