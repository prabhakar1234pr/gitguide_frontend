"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getProjectConcepts, regenerateProjectOverview, regenerateWholePath, regenerateConcept, regenerateSubtopic, regenerateTask } from '../../services/api';
import RegenerateModal from './RegenerateModal';

interface ConceptsSidebarProps {
  projectId: string;
  onContentSelect: (content: SelectedContent) => void;
}

interface SelectedContent {
  type: 'project' | 'concept' | 'subtopic' | 'task';
  title: string;
  description: string;
  verification_type?: string;
  is_verified?: boolean;
  id?: string | number;
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
  verification_type?: string;
  is_verified?: boolean;
  task_id: number; // Changed from id to task_id
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
  onContentSelect
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
      description: task.description,
      verification_type: task.verification_type,
      is_verified: task.is_verified,
      id: task.task_id // Use integer DB id
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
                  <div key={`concept-${concept.id || conceptIndex}`} className="border border-white/10 rounded-lg relative">
                    {/* Lock overlay for locked concepts */}
                    {!concept.isUnlocked && (
                      <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center z-10">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className={`flex items-center ${!concept.isUnlocked ? 'opacity-50' : ''}`}>
                      <button
                        onClick={() => concept.isUnlocked ? handleConceptClick(concept, conceptIndex) : null}
                        disabled={!concept.isUnlocked}
                        className={`flex-1 p-3 text-left transition-colors rounded-l-lg ${
                          concept.isUnlocked 
                            ? 'hover:bg-white/5 cursor-pointer' 
                            : 'cursor-not-allowed'
                        }`}
                        title={concept.isUnlocked ? concept.description : 'Complete previous concepts to unlock'}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {concept.isUnlocked ? (
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            ) : (
                              <div className="w-3 h-3 bg-gray-400 rounded-full relative">
                                <svg className="w-3 h-3 absolute inset-0 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                              </div>
                            )}
                            {!concept.isUnlocked && (
                              <svg className="w-3 h-3 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            )}
                          </div>
                          <span className={`font-medium ${concept.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            {concept.name}
                          </span>
                          {!concept.isUnlocked && (
                            <span className="text-xs text-gray-500 bg-gray-700/30 px-2 py-1 rounded">
                              LOCKED
                            </span>
                          )}
                        </div>
                      </button>
                      
                      {/* Regenerate Concept Button - only show if unlocked */}
                      {concept.isUnlocked && (
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
                      )}
                      
                      {concept.subTopics && concept.subTopics.length > 0 && concept.isUnlocked && (
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
                      return isExpanded && concept.subTopics && concept.isUnlocked;
                    })() && (
                      <div className="ml-4 pb-2 border-l-2 border-white/10 pl-3">
                        {concept.subTopics.map((subtopic, subtopicIndex) => (
                          <div key={`subtopic-${subtopic.id || `${conceptIndex}-${subtopicIndex}`}`} className="mt-2 border border-white/10 rounded-lg relative">
                            {/* Lock overlay for locked subtopics */}
                            {!subtopic.isUnlocked && (
                              <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center z-10">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            )}
                            
                            <div className={`flex items-center ${!subtopic.isUnlocked ? 'opacity-50' : ''}`}>
                              <button
                                onClick={() => subtopic.isUnlocked ? handleSubtopicClick(subtopic, conceptIndex, subtopicIndex) : null}
                                disabled={!subtopic.isUnlocked}
                                className={`flex-1 p-2 text-left transition-colors rounded-l-lg ${
                                  subtopic.isUnlocked 
                                    ? 'hover:bg-white/5 cursor-pointer' 
                                    : 'cursor-not-allowed'
                                }`}
                                title={subtopic.isUnlocked ? subtopic.description : 'Complete previous subtopics to unlock'}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1">
                                  <div className={`w-2 h-2 rounded-full ${subtopic.isUnlocked ? 'bg-blue-400' : 'bg-gray-400'}`}></div>
                                    {!subtopic.isUnlocked && (
                                      <svg className="w-2 h-2 text-gray-500 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`text-sm ${subtopic.isUnlocked ? 'text-gray-300' : 'text-gray-500'}`}>
                                    {subtopic.name}
                                  </span>
                                  {!subtopic.isUnlocked && (
                                    <span className="text-xs text-gray-500 bg-gray-700/30 px-1 py-0.5 rounded">
                                      LOCKED
                                    </span>
                                  )}
                                </div>
                              </button>
                              
                              {/* Regenerate Subtopic Button - only show if unlocked */}
                              {subtopic.isUnlocked && (
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
                              )}
                              
                              {subtopic.tasks && subtopic.tasks.length > 0 && subtopic.isUnlocked && (
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
                            
                            {expandedSubtopics.includes(subtopic.id || `${conceptIndex}-${subtopicIndex}`) && subtopic.tasks && subtopic.isUnlocked && (
                              <div className="ml-3 pb-2 border-l-2 border-white/5 pl-2">
                                {subtopic.tasks.map((task, taskIndex) => (
                                  <div key={`task-${task.id || `${conceptIndex}-${subtopicIndex}-${taskIndex}`}`} className="flex items-center mt-1 relative">
                                    {/* Lock overlay for locked tasks */}
                                    {!task.isUnlocked && (
                                      <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center z-10">
                                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                      </div>
                                    )}
                                    
                                    <button
                                      onClick={() => task.isUnlocked ? handleTaskClick(task) : null}
                                      disabled={!task.isUnlocked}
                                      className={`flex-1 p-2 text-left transition-colors rounded-lg ${
                                        task.isUnlocked 
                                          ? 'hover:bg-white/5 cursor-pointer' 
                                          : 'cursor-not-allowed opacity-50'
                                      }`}
                                      title={task.isUnlocked ? task.description : 'Complete previous tasks to unlock'}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                          {task.is_verified ? (
                                            // Verified/Completed task
                                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                          ) : task.isUnlocked ? (
                                            // Unlocked but not completed
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                          ) : (
                                            // Locked task
                                            <svg className="w-2 h-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                          )}
                                        </div>
                                                                                <span className={`text-xs ${
                                          task.is_verified ? 'text-green-400 font-medium' : 
                                          task.isUnlocked ? 'text-gray-400' : 'text-gray-500'
                                        }`}>
                                          {task.name}
                                          {task.is_verified && (
                                            <span className="ml-1 text-green-300 text-[10px]">✓ Verified</span>
                                          )}
                                        </span>
                                        {task.difficulty && task.isUnlocked && (
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
                                    
                                    {/* Regenerate Task Button - only show if unlocked */}
                                    {task.isUnlocked && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRegenerateModal('task', task.name, task.description, concept.id.toString(), subtopic.id.toString(), task.task_id.toString());
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded transition-colors"
                                      title="Regenerate this task"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    </button>
                                    )}
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