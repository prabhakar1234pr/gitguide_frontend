"use client";

import SubTopicItem from './SubTopicItem';

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

interface ConceptItemProps {
  concept: Concept;
  isOpen: boolean;
  openSubTopics: Set<string>;
  onToggle: (conceptId: string) => void;
  onSubTopicToggle: (subTopicId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export default function ConceptItem({ 
  concept, 
  isOpen, 
  openSubTopics,
  onToggle, 
  onSubTopicToggle,
  onTaskClick 
}: ConceptItemProps) {
  const handleToggle = () => {
    if (concept.isUnlocked) {
      onToggle(concept.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={!concept.isUnlocked}
        className={`flex items-center justify-between w-full p-3 rounded-lg transition-colors text-left ${
          concept.isUnlocked 
            ? 'hover:bg-white/10 text-gray-300 hover:text-white' 
            : 'text-gray-500 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          {concept.isUnlocked ? (
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          ) : (
            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
            </svg>
          )}
          <span className="text-sm">{concept.name}</span>
        </div>
        {concept.isUnlocked && (
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && concept.isUnlocked && (
        <div className="ml-4 mt-2 space-y-2">
          {concept.subTopics.map((subTopic) => (
            <SubTopicItem
              key={subTopic.id}
              subTopic={subTopic}
              isOpen={openSubTopics.has(subTopic.id)}
              onToggle={onSubTopicToggle}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
} 