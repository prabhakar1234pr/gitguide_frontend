"use client";

import { Concept, Subconcept, Subtopic, Task } from './types';
import SubtopicCard from './SubtopicCard';
import SubconceptCard from './SubconceptCard';

interface ConceptCardProps {
  concept: Concept;
  conceptIndex: number;
  isExpanded: boolean;
  expandedSubtopics: (number | string)[];
  onConceptClick: (concept: Concept, conceptIndex: number) => void;
  onToggleConceptExpansion: (conceptId: number | string) => void;
  onToggleSubtopicExpansion: (subtopicId: number | string) => void;
  onRegenerateConcept: (concept: Concept, conceptId: string) => void;
  onSubconceptClick?: (subconcept: Subconcept, subconceptIndex: number) => void;
  onSubtopicClick: (subtopic: Subtopic, conceptIndex: number, subtopicIndex: number) => void;
  onRegenerateSubtopic: (subtopic: Subtopic, conceptId: string, subtopicId: string) => void;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subtopicId: string, taskId: string) => void;
}

export default function ConceptCard({ 
  concept, 
  conceptIndex,
  isExpanded,
  expandedSubtopics,
  onConceptClick,
  onToggleConceptExpansion,
  onToggleSubtopicExpansion,
  onRegenerateConcept,
  onSubconceptClick,
  onSubtopicClick,
  onRegenerateSubtopic,
  onTaskClick,
  onRegenerateTask
}: ConceptCardProps) {
  const conceptId = concept.id || conceptIndex;
  
  // Determine whether to use subconcepts or subtopics
  const hasSubconcepts = concept.subconcepts && concept.subconcepts.length > 0;
  const hasSubtopics = concept.subTopics && concept.subTopics.length > 0;
  const hasContent = hasSubconcepts || hasSubtopics;
  const contentCount = hasSubconcepts ? concept.subconcepts!.length : (hasSubtopics ? concept.subTopics!.length : 0);

  return (
    <div key={`concept-${conceptId}`} className="border border-white/10 rounded-lg">
      <div className="flex items-center">
        <button
          onClick={() => onConceptClick(concept, conceptIndex)}
          className="flex-1 p-3 text-left hover:bg-white/5 transition-colors rounded-l-lg"
        >
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${concept.isUnlocked ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <div>
              <span className="font-medium text-white">{concept.name}</span>
              {concept.day_number !== undefined && (
                <span className="ml-2 text-xs text-gray-400">Day {concept.day_number}</span>
              )}
            </div>
          </div>
        </button>
        
        {/* Regenerate Concept Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerateConcept(concept, concept.id.toString());
          }}
          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded transition-colors mr-1"
          title="Regenerate this concept"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Expand/Collapse Button */}
        {hasContent && (
          <button
            onClick={() => onToggleConceptExpansion(conceptId)}
            className="p-3 hover:bg-white/5 transition-colors rounded-r-lg group"
            title={isExpanded ? `Collapse ${hasSubconcepts ? 'subconcepts' : 'subtopics'}` : `Show ${contentCount} ${hasSubconcepts ? 'subconcepts' : 'subtopics'}`}
          >
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 group-hover:text-gray-300">
                {contentCount}
              </span>
              <svg 
                className={`w-4 h-4 text-gray-300 group-hover:text-white transition-all ${
                  isExpanded ? 'rotate-180' : ''
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
      
      {/* Content List - Subconcepts or Subtopics */}
      {isExpanded && hasContent && (
        <div className="ml-4 pb-2 border-l-2 border-white/10 pl-3">
          {hasSubconcepts ? (
            // Render subconcepts (new structure)
            concept.subconcepts!.map((subconcept, subconceptIndex) => (
              <SubconceptCard
                key={`subconcept-${subconcept.id || `${conceptIndex}-${subconceptIndex}`}`}
                subconcept={subconcept}
                conceptId={concept.id.toString()}
                subconceptIndex={subconceptIndex}
                onSubconceptClick={onSubconceptClick || (() => {})}
                onTaskClick={onTaskClick}
                onRegenerateTask={onRegenerateTask}
              />
            ))
          ) : (
            // Render subtopics (legacy structure)
            concept.subTopics!.map((subtopic, subtopicIndex) => (
              <SubtopicCard
                key={`subtopic-${subtopic.id || `${conceptIndex}-${subtopicIndex}`}`}
                subtopic={subtopic}
                conceptIndex={conceptIndex}
                subtopicIndex={subtopicIndex}
                conceptId={concept.id.toString()}
                isExpanded={expandedSubtopics.includes(subtopic.id || `${conceptIndex}-${subtopicIndex}`)}
                onSubtopicClick={onSubtopicClick}
                onToggleExpansion={onToggleSubtopicExpansion}
                onRegenerateSubtopic={onRegenerateSubtopic}
                onTaskClick={onTaskClick}
                onRegenerateTask={onRegenerateTask}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
} 