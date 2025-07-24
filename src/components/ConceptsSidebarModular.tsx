"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getProjectConcepts, regenerateProjectOverview, regenerateWholePath, regenerateConcept, regenerateSubtopic, regenerateTask } from '../../services/api';
import RegenerateModal from './RegenerateModal';
import LearningPathHeader from './learning-path/LearningPathHeader';
import ProjectOverviewCard from './learning-path/ProjectOverviewCard';
import ConceptsList from './learning-path/ConceptsList';
import { Concept, Subtopic, Task, SelectedContent, RegenerateState } from './learning-path/types';

interface ConceptsSidebarProps {
  projectId: string;
  onContentSelect: (content: SelectedContent) => void;
}

export default function ConceptsSidebarModular({ 
  projectId,
  onContentSelect
}: ConceptsSidebarProps) {
  const { getToken, isLoaded } = useAuth();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedConcepts, setExpandedConcepts] = useState<(number | string)[]>([]);
  const [expandedSubtopics, setExpandedSubtopics] = useState<(number | string)[]>([]);
  const [projectOverview] = useState<string>('');
  const [regenerateState, setRegenerateState] = useState<RegenerateState>({
    isOpen: false,
    type: 'project-overview',
    itemName: '',
    description: ''
  });

  // Load concepts on component mount
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

        const data = await getProjectConcepts(projectIdNum, getToken);
        
        if (data.concepts && Array.isArray(data.concepts)) {
          setConcepts(data.concepts);
          
          // Auto-expand first concept if it exists
          if (data.concepts.length > 0) {
            const firstConceptId = data.concepts[0].id || 0;
            setExpandedConcepts([firstConceptId]);
            
            // Auto-expand first subtopic
            if (data.concepts[0].subTopics && data.concepts[0].subTopics.length > 0) {
              const firstSubtopicId = data.concepts[0].subTopics[0].id || '0-0';
              setExpandedSubtopics([firstSubtopicId]);
            }
          }
        } else {
          setConcepts([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load concepts');
        setConcepts([]);
      } finally {
        setLoading(false);
      }
    };

    loadConcepts();
  }, [isLoaded, projectId, getToken]);

  // Event handlers
  const handleProjectOverviewClick = () => {
    onContentSelect({
      type: 'project',
      title: 'Project Overview',
      description: projectOverview || 'Loading project overview...'
    });
  };

  const handleConceptClick = (concept: Concept) => {
    onContentSelect({
      type: 'concept',
      title: concept.name,
      description: concept.description
    });
  };

  const handleSubtopicClick = (subtopic: Subtopic) => {
    onContentSelect({
      type: 'subtopic', 
      title: subtopic.name,
      description: subtopic.description
    });
  };

  const handleTaskClick = (task: Task) => {
    onContentSelect({
      type: 'task',
      title: task.name,
      description: task.description
    });
  };

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

  const handleRegenerate = async (userPrompt: string) => {
    try {
      const projectIdNum = parseInt(projectId);
      
      switch (regenerateState.type) {
        case 'project-overview':
          await regenerateProjectOverview(projectIdNum, userPrompt, getToken);
          break;
        case 'whole-path':
          await regenerateWholePath(projectIdNum, userPrompt, getToken);
          break;
        case 'concept':
          if (regenerateState.conceptId) {
            await regenerateConcept(projectIdNum, regenerateState.conceptId, userPrompt, getToken);
          }
          break;
        case 'subtopic':
          if (regenerateState.conceptId && regenerateState.subtopicId) {
            await regenerateSubtopic(projectIdNum, regenerateState.conceptId, regenerateState.subtopicId, userPrompt, getToken);
          }
          break;
        case 'task':
          if (regenerateState.conceptId && regenerateState.subtopicId && regenerateState.taskId) {
            await regenerateTask(projectIdNum, regenerateState.conceptId, regenerateState.subtopicId, regenerateState.taskId, userPrompt, getToken);
          }
          break;
      }
      
      // Reload concepts after regeneration
      const data = await getProjectConcepts(projectIdNum, getToken);
      if (data.concepts) {
        setConcepts(data.concepts);
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
    }
  };

  const handleRegenerateWholePath = () => {
    openRegenerateModal('whole-path', 'Entire Learning Path', 'Complete learning path structure');
  };

  const handleRegenerateProjectOverview = () => {
    openRegenerateModal('project-overview', 'Project Overview', projectOverview);
  };

  const handleRegenerateConcept = (concept: Concept, conceptId: string) => {
    openRegenerateModal('concept', concept.name, concept.description, conceptId);
  };

  const handleRegenerateSubtopic = (subtopic: Subtopic, conceptId: string, subtopicId: string) => {
    openRegenerateModal('subtopic', subtopic.name, subtopic.description, conceptId, subtopicId);
  };

  const handleRegenerateTask = (task: Task, conceptId: string, subtopicId: string, taskId: string) => {
    openRegenerateModal('task', task.name, task.description, conceptId, subtopicId, taskId);
  };

  return (
    <>
      <div className="w-1/3 bg-black/40 backdrop-blur-sm border-r border-white/10 flex flex-col h-screen">
        <LearningPathHeader
          projectDomain={''} // projectDomain is no longer a prop
          skillLevel={''} // skillLevel is no longer a prop
          hasContent={concepts.length > 0}
          onRegenerateWholePath={handleRegenerateWholePath}
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <ProjectOverviewCard
            projectOverview={projectOverview}
            onOverviewClick={handleProjectOverviewClick}
            onRegenerateOverview={handleRegenerateProjectOverview}
          />
          
          <ConceptsList
            concepts={concepts}
            loading={loading}
            error={error}
            expandedConcepts={expandedConcepts}
            expandedSubtopics={expandedSubtopics}
            onConceptClick={handleConceptClick}
            onToggleConceptExpansion={toggleConceptExpansion}
            onToggleSubtopicExpansion={toggleSubtopicExpansion}
            onRegenerateConcept={handleRegenerateConcept}
            onSubtopicClick={handleSubtopicClick}
            onRegenerateSubtopic={handleRegenerateSubtopic}
            onTaskClick={handleTaskClick}
            onRegenerateTask={handleRegenerateTask}
          />
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