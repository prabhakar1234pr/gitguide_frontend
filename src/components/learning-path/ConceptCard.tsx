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
    <div key={`concept-${conceptId}`} className="cyber-card mb-3 overflow-hidden group">
      <div className="flex items-center relative">
        {/* Status Indicator Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          concept.isUnlocked ? 'bg-gradient-to-b from-[#39ff14] to-[#00f0ff]' : 'bg-[#64748b]'
        }`}></div>
        
        <button
          onClick={() => onConceptClick(concept, conceptIndex)}
          className="flex-1 p-4 text-left hover:bg-[#00f0ff]/5 transition-all duration-300 pl-5"
        >
          <div className="flex items-center gap-3">
            {/* Status Dot */}
            <div className={`w-2 h-2 rounded-full ${
              concept.isUnlocked 
                ? 'bg-[#39ff14] animate-pulse shadow-[0_0_10px_rgba(57,255,20,0.5)]' 
                : 'bg-[#64748b]'
            }`}></div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-bold uppercase tracking-wide text-sm ${
                  concept.isUnlocked ? 'text-[#e0e7ff]' : 'text-[#64748b]'
                }`}>
                  {concept.name}
                </span>
                {concept.day_number !== undefined && (
                  <span className="px-2 py-0.5 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] text-[10px] font-bold uppercase tracking-widest">
                    Day {concept.day_number}
                  </span>
                )}
              </div>
            </div>
          </div>
        </button>
        
        {/* Regenerate Concept Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRegenerateConcept(concept, concept.id.toString());
          }}
          className="p-3 text-[#64748b] hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 transition-all duration-300 mr-1 group/regen"
          title="Regenerate this concept"
        >
          <svg className="w-4 h-4 group-hover/regen:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Expand/Collapse Button */}
        {hasContent && (
          <button
            onClick={() => onToggleConceptExpansion(conceptId)}
            className="p-3 hover:bg-[#00f0ff]/10 transition-all duration-300 group/expand border-l border-[#00f0ff]/20"
            title={isExpanded ? `Collapse ${hasSubconcepts ? 'subconcepts' : 'subtopics'}` : `Show ${contentCount} ${hasSubconcepts ? 'subconcepts' : 'subtopics'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2 py-1 border border-[#00f0ff]/30">
                {contentCount}
              </span>
              <svg 
                className={`w-4 h-4 text-[#00f0ff] transition-all duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>
        )}
      </div>
      
      {/* Content List - Subconcepts or Subtopics */}
      {isExpanded && hasContent && (
        <div className="ml-6 pb-3 border-l-2 border-[#00f0ff]/30 pl-4 mt-2">
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