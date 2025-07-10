"use client";

import { useState } from 'react';
import ConceptItem from './ConceptItem';

interface Task {
  id: string;
  name: string;
  isUnlocked: boolean;
}

interface SubTopic {
  id: string;
  name: string;
  tasks: Task[];
  isUnlocked: boolean;
}

interface Concept {
  id: string;
  name: string;
  subTopics: SubTopic[];
  isUnlocked: boolean;
}

interface ConceptsSectionProps {
  concepts: Concept[];
  onTaskClick?: (taskId: string) => void;
}

export default function ConceptsSection({ concepts, onTaskClick }: ConceptsSectionProps) {
  const [isConceptsOpen, setIsConceptsOpen] = useState(true);
  const [openConcepts, setOpenConcepts] = useState<Set<string>>(new Set(['concept-0']));
  const [openSubTopics, setOpenSubTopics] = useState<Set<string>>(new Set(['subtopic-0-0']));

  const toggleConcept = (conceptId: string) => {
    const newOpenConcepts = new Set(openConcepts);
    if (newOpenConcepts.has(conceptId)) {
      newOpenConcepts.delete(conceptId);
    } else {
      newOpenConcepts.add(conceptId);
    }
    setOpenConcepts(newOpenConcepts);
  };

  const toggleSubTopic = (subTopicId: string) => {
    const newOpenSubTopics = new Set(openSubTopics);
    if (newOpenSubTopics.has(subTopicId)) {
      newOpenSubTopics.delete(subTopicId);
    } else {
      newOpenSubTopics.add(subTopicId);
    }
    setOpenSubTopics(newOpenSubTopics);
  };

  return (
    <div>
      <button
        onClick={() => setIsConceptsOpen(!isConceptsOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-white/10 transition-colors text-left"
      >
        <span className="font-semibold text-white">Concepts</span>
        <svg 
          className={`w-5 h-5 text-gray-300 transition-transform ${isConceptsOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isConceptsOpen && (
        <div className="ml-4 mt-2 space-y-2">
          {concepts.map((concept) => (
            <ConceptItem
              key={concept.id}
              concept={concept}
              isOpen={openConcepts.has(concept.id)}
              openSubTopics={openSubTopics}
              onToggle={toggleConcept}
              onSubTopicToggle={toggleSubTopic}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
} 