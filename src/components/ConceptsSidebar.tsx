"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import ProjectOverviewSection from './ProjectOverviewSection';
import ConceptsSection from './ConceptsSection';
import { getProjectConcepts } from '../../services/api';

interface ConceptsSidebarProps {
  projectId: string;
  projectDomain: string;
  skillLevel: string;
  currentTaskPath?: {
    conceptIndex: number;
    subTopicIndex: number;
    taskIndex: number;
  };
}

interface Task {
  id: string;
  name: string;
  isUnlocked: boolean;
  description?: string;
  status?: string;
  difficulty?: string;
}

interface SubTopic {
  id: string;
  name: string;
  tasks: Task[];
  isUnlocked: boolean;
  description?: string;
}

interface Concept {
  id: string;
  name: string;
  subTopics: SubTopic[];
  isUnlocked: boolean;
  description?: string;
}

export default function ConceptsSidebar({ 
  projectId,
  projectDomain, 
  skillLevel, 
  currentTaskPath = { conceptIndex: 0, subTopicIndex: 0, taskIndex: 0 }
}: ConceptsSidebarProps) {
  const { getToken, isLoaded } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadConcepts = async () => {
      if (!isLoaded || !projectId) return;

      try {
        console.log(`🔄 Loading concepts for project ${projectId}`);
        setLoading(true);
        setError('');

        const projectIdNum = parseInt(projectId);
        if (isNaN(projectIdNum)) {
          console.error('❌ Invalid project ID:', projectId);
          setError('Invalid project ID');
          return;
        }

        const response = await getProjectConcepts(projectIdNum, getToken);
        const conceptsData = response.concepts || [];
        
        console.log(`✅ Loaded ${conceptsData.length} concepts:`, conceptsData);
        setConcepts(conceptsData);

      } catch (error) {
        console.error('❌ Failed to load concepts:', error);
        setError('Failed to load learning path');
        // Set empty array on error so we don't show placeholders
        setConcepts([]);
      } finally {
        setLoading(false);
      }
    };

    loadConcepts();
  }, [isLoaded, projectId, getToken]);

  const handleTaskClick = (taskId: string) => {
    console.log('📝 Task clicked:', taskId);
    // Handle task navigation here
  };

  if (loading) {
    return (
      <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-6">Learning Path</h2>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-300">Loading concepts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white mb-6">Learning Path</h2>
        
        <ProjectOverviewSection 
          projectId={projectId}
          projectDomain={projectDomain}
          skillLevel={skillLevel}
        />

        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
            {error}
          </div>
        ) : concepts.length > 0 ? (
          <ConceptsSection 
            concepts={concepts}
            onTaskClick={handleTaskClick}
          />
        ) : (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300 text-sm">
            No learning concepts available yet. Generate a learning path to see your personalized curriculum.
          </div>
        )}
      </div>
    </div>
  );
} 