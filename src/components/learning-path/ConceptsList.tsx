"use client";

import { Concept, Subtopic, Task } from './types';
import ConceptCard from './ConceptCard';

interface ConceptsListProps {
  concepts: Concept[];
  loading: boolean;
  error: string;
  expandedConcepts: (number | string)[];
  expandedSubtopics: (number | string)[];
  onConceptClick: (concept: Concept, conceptIndex: number) => void;
  onToggleConceptExpansion: (conceptId: number | string) => void;
  onToggleSubtopicExpansion: (subtopicId: number | string) => void;
  onRegenerateConcept: (concept: Concept, conceptId: string) => void;
  onSubtopicClick: (subtopic: Subtopic, conceptIndex: number, subtopicIndex: number) => void;
  onRegenerateSubtopic: (subtopic: Subtopic, conceptId: string, subtopicId: string) => void;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subtopicId: string, taskId: string) => void;
}

export default function ConceptsList({ 
  concepts,
  loading,
  error,
  expandedConcepts,
  expandedSubtopics,
  onConceptClick,
  onToggleConceptExpansion,
  onToggleSubtopicExpansion,
  onRegenerateConcept,
  onSubtopicClick,
  onRegenerateSubtopic,
  onTaskClick,
  onRegenerateTask
}: ConceptsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">Concepts</h3>
      <p className="text-xs text-gray-400 mb-4">
        Click any item to view details. Concepts and subtopics auto-expand to show their content.
      </p>
      
      {error ? (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300 text-sm">
          {error}
        </div>
      ) : concepts.length > 0 ? (
        <div className="space-y-2">
          {concepts.map((concept, conceptIndex) => (
            <ConceptCard
              key={`concept-${concept.id || conceptIndex}`}
              concept={concept}
              conceptIndex={conceptIndex}
              isExpanded={expandedConcepts.includes(concept.id || conceptIndex)}
              expandedSubtopics={expandedSubtopics}
              onConceptClick={onConceptClick}
              onToggleConceptExpansion={onToggleConceptExpansion}
              onToggleSubtopicExpansion={onToggleSubtopicExpansion}
              onRegenerateConcept={onRegenerateConcept}
              onSubtopicClick={onSubtopicClick}
              onRegenerateSubtopic={onRegenerateSubtopic}
              onTaskClick={onTaskClick}
              onRegenerateTask={onRegenerateTask}
            />
          ))}
        </div>
      ) : (
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 text-yellow-300 text-sm">
          No learning concepts available yet. Generate a learning path to see your personalized curriculum.
        </div>
      )}
    </div>
  );
} 