"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getProjectConcepts } from '../../services/api';

interface ConceptsSidebarProps {
  projectId: string;
  projectDomain: string;
  skillLevel: string;
  onContentSelect: (content: SelectedContent) => void;
  currentTaskPath?: {
    conceptIndex: number;
    subTopicIndex: number;
    taskIndex: number;
  };
}

interface SelectedContent {
  type: 'project' | 'concept' | 'subtopic' | 'task';
  title: string;
  description: string;
}

interface Concept {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  subTopics: Subtopic[];
}

interface Subtopic {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  tasks: Task[];
}

interface Task {
  id: number;
  name: string;
  description: string;
  difficulty: string;
  isUnlocked: boolean;
  status: string;
}

export default function ConceptsSidebar({ 
  projectId,
  projectDomain, 
  skillLevel,
  onContentSelect,
  currentTaskPath = { conceptIndex: 0, subTopicIndex: 0, taskIndex: 0 }
}: ConceptsSidebarProps) {
  const { getToken, isLoaded } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedConcepts, setExpandedConcepts] = useState<(number | string)[]>([]);
  const [expandedSubtopics, setExpandedSubtopics] = useState<(number | string)[]>([]);
  const [projectOverview, setProjectOverview] = useState<string>('');

  useEffect(() => {
    const loadConcepts = async () => {
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

        // Load concepts
        const conceptsData = await getProjectConcepts(projectIdNum, getToken);
        console.log('🔍 Loaded concepts data:', conceptsData);
        console.log('🔍 Number of concepts:', conceptsData.concepts?.length || 0);
        if (conceptsData.concepts && conceptsData.concepts.length > 0) {
          console.log('🔍 First concept structure:', conceptsData.concepts[0]);
        }
        setConcepts(conceptsData.concepts || []);

        // Load project overview
        const projectResponse = await fetch(`http://localhost:8000/projects/${projectIdNum}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          setProjectOverview(projectData.project_overview || '');
        }

      } catch (error) {
        console.error('❌ Failed to load concepts:', error);
        setError('Failed to load concepts');
      } finally {
        setLoading(false);
      }
    };

    loadConcepts();
  }, [isLoaded, projectId, getToken]);

  const toggleConceptExpansion = (conceptId: number | string) => {
    setExpandedConcepts(prev => 
      prev.includes(conceptId) 
        ? prev.filter(id => id !== conceptId)
        : [...prev, conceptId]
    );
  };

  const toggleSubtopicExpansion = (subtopicId: number | string) => {
    setExpandedSubtopics(prev => 
      prev.includes(subtopicId) 
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId]
    );
  };

  const handleProjectOverviewClick = () => {
    onContentSelect({
      type: 'project',
      title: 'Project Overview',
      description: projectOverview || 'No project overview available yet.'
    });
  };

  const handleConceptClick = (concept: Concept, conceptIndex: number) => {
    // Show description in center
    onContentSelect({
      type: 'concept',
      title: concept.name,
      description: concept.description || 'No description available for this concept.'
    });
    
    // Auto-expand the concept to show subtopics
    const conceptId = concept.id || conceptIndex;
    console.log('🔍 Concept clicked:', concept.name, 'ID:', conceptId, 'Has subtopics:', concept.subTopics?.length || 0);
    console.log('🔍 Current expanded concepts:', expandedConcepts);
    
    if (concept.subTopics && concept.subTopics.length > 0) {
      if (!expandedConcepts.includes(conceptId)) {
        console.log('✅ Expanding concept:', conceptId);
        setExpandedConcepts(prev => [...prev, conceptId]);
      } else {
        console.log('ℹ️ Concept already expanded:', conceptId);
      }
    } else {
      console.log('⚠️ No subtopics found for concept:', concept.name);
    }
  };

  const handleSubtopicClick = (subtopic: Subtopic, conceptIndex: number, subtopicIndex: number) => {
    // Show description in center
    onContentSelect({
      type: 'subtopic',
      title: subtopic.name,
      description: subtopic.description || 'No description available for this subtopic.'
    });
    
    // Auto-expand the subtopic to show tasks
    const subtopicId = subtopic.id || `${conceptIndex}-${subtopicIndex}`;
    console.log('🔍 Subtopic clicked:', subtopic.name, 'ID:', subtopicId, 'Has tasks:', subtopic.tasks?.length || 0);
    
    if (subtopic.tasks && subtopic.tasks.length > 0) {
      if (!expandedSubtopics.includes(subtopicId)) {
        console.log('✅ Expanding subtopic:', subtopicId);
        setExpandedSubtopics(prev => [...prev, subtopicId]);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    onContentSelect({
      type: 'task',
      title: task.name,
      description: task.description || 'No description available for this task.'
    });
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
        
        {/* Project Overview Section */}
        <div className="mb-6">
          <button
            onClick={handleProjectOverviewClick}
            className="w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/20 hover:border-white/30"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-semibold text-white">Project Overview</span>
            </div>
          </button>
        </div>

        {/* Concepts Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Concepts</h3>
          <p className="text-xs text-gray-400 mb-4">Click any item to view details. Concepts and subtopics auto-expand to show their content.</p>
          
          {error ? (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
              {error}
            </div>
          ) : concepts.length > 0 ? (
            <div className="space-y-2">
              {concepts.map((concept, conceptIndex) => (
                <div key={`concept-${concept.id || conceptIndex}`} className="border border-white/10 rounded-lg">
                  <div className="flex items-center">
                    <button
                      onClick={() => handleConceptClick(concept, conceptIndex)}
                      className="flex-1 p-3 text-left hover:bg-white/5 transition-colors rounded-l-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${concept.isUnlocked ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        <span className="font-medium text-white">{concept.name}</span>
                      </div>
                    </button>
                    
                    {concept.subTopics && concept.subTopics.length > 0 && (
                      <button
                        onClick={() => toggleConceptExpansion(concept.id || conceptIndex)}
                        className="p-3 hover:bg-white/5 transition-colors rounded-r-lg group"
                        title={expandedConcepts.includes(concept.id || conceptIndex) ? "Collapse subtopics" : `Show ${concept.subTopics.length} subtopics`}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400 group-hover:text-gray-300">
                            {concept.subTopics.length}
                          </span>
                          <svg 
                            className={`w-4 h-4 text-gray-300 group-hover:text-white transition-all ${
                              expandedConcepts.includes(concept.id || conceptIndex) ? 'rotate-180' : ''
                            }`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                    )}
                  </div>
                  
                  {(() => {
                    const conceptId = concept.id || conceptIndex;
                    const isExpanded = expandedConcepts.includes(conceptId);
                    console.log(`🔍 Rendering concept "${concept.name}": ID=${conceptId}, expanded=${isExpanded}, has_subtopics=${!!concept.subTopics}, subtopics_count=${concept.subTopics?.length || 0}`);
                    return isExpanded && concept.subTopics;
                  })() && (
                    <div className="ml-4 pb-2 border-l-2 border-white/10 pl-3">
                      {concept.subTopics.map((subtopic, subtopicIndex) => (
                        <div key={`subtopic-${subtopic.id || `${conceptIndex}-${subtopicIndex}`}`} className="mt-2 border border-white/10 rounded-lg">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleSubtopicClick(subtopic, conceptIndex, subtopicIndex)}
                              className="flex-1 p-2 text-left hover:bg-white/5 transition-colors rounded-l-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${subtopic.isUnlocked ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                                <span className="text-sm text-gray-300">{subtopic.name}</span>
                              </div>
                            </button>
                            
                                                         {subtopic.tasks && subtopic.tasks.length > 0 && (
                               <button
                                 onClick={() => toggleSubtopicExpansion(subtopic.id || `${conceptIndex}-${subtopicIndex}`)}
                                 className="p-2 hover:bg-white/5 transition-colors rounded-r-lg group"
                                 title={expandedSubtopics.includes(subtopic.id || `${conceptIndex}-${subtopicIndex}`) ? "Collapse tasks" : `Show ${subtopic.tasks.length} tasks`}
                               >
                                 <div className="flex items-center gap-1">
                                   <span className="text-xs text-gray-400 group-hover:text-gray-300">
                                     {subtopic.tasks.length}
                                   </span>
                                   <svg 
                                     className={`w-3 h-3 text-gray-300 group-hover:text-white transition-all ${
                                       expandedSubtopics.includes(subtopic.id || `${conceptIndex}-${subtopicIndex}`) ? 'rotate-180' : ''
                                     }`}
                                     fill="none" 
                                     stroke="currentColor" 
                                     viewBox="0 0 24 24"
                                   >
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                   </svg>
                                 </div>
                              </button>
                            )}
                          </div>
                          
                          {expandedSubtopics.includes(subtopic.id || `${conceptIndex}-${subtopicIndex}`) && subtopic.tasks && (
                            <div className="ml-3 pb-2 border-l-2 border-white/5 pl-2">
                              {subtopic.tasks.map((task, taskIndex) => (
                                <button
                                  key={`task-${task.id || `${conceptIndex}-${subtopicIndex}-${taskIndex}`}`}
                                  onClick={() => handleTaskClick(task)}
                                  className="w-full p-2 mt-1 text-left hover:bg-white/5 transition-colors rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${task.isUnlocked ? 'bg-yellow-400' : 'bg-gray-400'}`}></div>
                                    <span className="text-xs text-gray-400">{task.name}</span>
                                    {task.difficulty && (
                                      <span className={`text-xs px-2 py-1 rounded ${
                                        task.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                                        task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                        'bg-red-500/20 text-red-300'
                                      }`}>
                                        {task.difficulty}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300 text-sm">
              No learning concepts available yet. Generate a learning path to see your personalized curriculum.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 