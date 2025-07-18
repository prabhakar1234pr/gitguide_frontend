"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getProjectConcepts, regenerateProjectOverview, regenerateWholePath, regenerateConcept, regenerateSubtopic, regenerateTask } from '../../services/api';
import RegenerateModal from './RegenerateModal';

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

interface RegenerateState {
  isOpen: boolean;
  type: 'project-overview' | 'whole-path' | 'concept' | 'subtopic' | 'task';
  itemName: string;
  description?: string;
  conceptId?: string;
  subtopicId?: string;
  taskId?: string;
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
  const [regenerateState, setRegenerateState] = useState<RegenerateState>({
    isOpen: false,
    type: 'project-overview',
    itemName: '',
    description: ''
  });

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
        console.error('Failed to load concepts:', error);
        setError(`Failed to load concepts: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setLoading(false);
      }
    };

    loadConcepts();
  }, [isLoaded, projectId, getToken]);

  const toggleConceptExpansion = (id: number | string) => {
    setExpandedConcepts(prev => 
      prev.includes(id) 
        ? prev.filter(conceptId => conceptId !== id)
        : [...prev, id]
    );
  };

  const toggleSubtopicExpansion = (id: number | string) => {
    setExpandedSubtopics(prev => 
      prev.includes(id) 
        ? prev.filter(subtopicId => subtopicId !== id)
        : [...prev, id]
    );
  };

  const handleProjectOverviewClick = () => {
    onContentSelect({
      type: 'project',
      title: 'Project Overview',
      description: projectOverview
    });
  };

  const handleConceptClick = (concept: Concept, conceptIndex: number) => {
    // Show the concept description
    onContentSelect({
      type: 'concept',
      title: concept.name,
      description: concept.description
    });

    // Auto-expand to show subtopics
    const conceptId = concept.id || conceptIndex;
    if (!expandedConcepts.includes(conceptId)) {
      setExpandedConcepts(prev => [...prev, conceptId]);
    }
  };

  const handleSubtopicClick = (subtopic: Subtopic, conceptIndex: number, subtopicIndex: number) => {
    // Show the subtopic description
    onContentSelect({
      type: 'subtopic',
      title: subtopic.name,
      description: subtopic.description
    });

    // Auto-expand to show tasks
    const subtopicId = subtopic.id || `${conceptIndex}-${subtopicIndex}`;
    if (!expandedSubtopics.includes(subtopicId)) {
      setExpandedSubtopics(prev => [...prev, subtopicId]);
    }
  };

  const handleTaskClick = (task: Task) => {
    onContentSelect({
      type: 'task',
      title: task.name,
      description: task.description
    });
  };

  // Regeneration handlers
  const openRegenerateModal = (
    type: RegenerateState['type'],
    itemName: string,
    description?: string,
    conceptId?: string,
    subtopicId?: string,
    taskId?: string
  ) => {
    setRegenerateState({
      isOpen: true,
      type,
      itemName,
      description,
      conceptId,
      subtopicId,
      taskId
    });
  };

  const closeRegenerateModal = () => {
    setRegenerateState(prev => ({ ...prev, isOpen: false }));
  };

  const handleRegenerate = async (prompt: string) => {
    const projectIdNum = parseInt(projectId);
    
    try {
      switch (regenerateState.type) {
        case 'project-overview':
          const overviewResult = await regenerateProjectOverview(projectIdNum, prompt, getToken);
          setProjectOverview(overviewResult.project_overview);
          // Update the displayed content if project overview is currently selected
          onContentSelect({
            type: 'project',
            title: 'Project Overview',
            description: overviewResult.project_overview
          });
          break;

        case 'whole-path':
          await regenerateWholePath(projectIdNum, prompt, getToken);
          // Reload the concepts after regeneration
          const conceptsData = await getProjectConcepts(projectIdNum, getToken);
          setConcepts(conceptsData.concepts || []);
          break;

        case 'concept':
          if (regenerateState.conceptId) {
            await regenerateConcept(projectIdNum, regenerateState.conceptId, prompt, getToken);
            // Reload the concepts after regeneration
            const conceptsData = await getProjectConcepts(projectIdNum, getToken);
            setConcepts(conceptsData.concepts || []);
          }
          break;

        case 'subtopic':
          if (regenerateState.conceptId && regenerateState.subtopicId) {
            await regenerateSubtopic(projectIdNum, regenerateState.conceptId, regenerateState.subtopicId, prompt, getToken);
            // Reload the concepts after regeneration
            const conceptsData = await getProjectConcepts(projectIdNum, getToken);
            setConcepts(conceptsData.concepts || []);
          }
          break;

        case 'task':
          if (regenerateState.conceptId && regenerateState.subtopicId && regenerateState.taskId) {
            await regenerateTask(projectIdNum, regenerateState.conceptId, regenerateState.subtopicId, regenerateState.taskId, prompt, getToken);
            // Reload the concepts after regeneration
            const conceptsData = await getProjectConcepts(projectIdNum, getToken);
            setConcepts(conceptsData.concepts || []);
          }
          break;
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="flex items-center">
            <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-300">Loading concepts...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-80 bg-white/10 backdrop-blur-sm border-r border-white/20 h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Learning Path</h2>
            {/* Regenerate Whole Path Button */}
            {concepts.length > 0 && (
              <button
                onClick={() => openRegenerateModal('whole-path', 'Entire Learning Path', 'Regenerate the complete learning structure with all concepts, subtopics, and tasks')}
                className="p-2 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors"
                title="Regenerate entire learning path"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Project Overview Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={handleProjectOverviewClick}
                className="flex-1 p-3 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/20 hover:border-white/30"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-white">Project Overview</span>
                </div>
              </button>
              {/* Regenerate Project Overview Button */}
              {projectOverview && (
                <button
                  onClick={() => openRegenerateModal('project-overview', 'Project Overview', projectOverview)}
                  className="p-3 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors"
                  title="Regenerate project overview"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
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
                      
                      {/* Regenerate Concept Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openRegenerateModal('concept', concept.name, concept.description, concept.id.toString());
                        }}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded transition-colors mr-1"
                        title="Regenerate this concept"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
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
                              
                              {/* Regenerate Subtopic Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRegenerateModal('subtopic', subtopic.name, subtopic.description, concept.id.toString(), subtopic.id.toString());
                                }}
                                className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/10 rounded transition-colors mr-1"
                                title="Regenerate this subtopic"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
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
                                  <div key={`task-${task.id || `${conceptIndex}-${subtopicIndex}-${taskIndex}`}`} className="flex items-center mt-1">
                                    <button
                                      onClick={() => handleTaskClick(task)}
                                      className="flex-1 p-2 text-left hover:bg-white/5 transition-colors rounded-lg"
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
                                    
                                    {/* Regenerate Task Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRegenerateModal('task', task.name, task.description, concept.id.toString(), subtopic.id.toString(), task.id.toString());
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded transition-colors"
                                      title="Regenerate this task"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    </button>
                                  </div>
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

      {/* Regenerate Modal */}
      <RegenerateModal
        isOpen={regenerateState.isOpen}
        onClose={closeRegenerateModal}
        onRegenerate={handleRegenerate}
        type={regenerateState.type}
        itemName={regenerateState.itemName}
        description={regenerateState.description}
      />
    </>
  );
} 