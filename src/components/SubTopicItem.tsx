"use client";

import TaskItem from './TaskItem';

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

interface SubTopicItemProps {
  subTopic: SubTopic;
  isOpen: boolean;
  onToggle: (subTopicId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export default function SubTopicItem({ 
  subTopic, 
  isOpen, 
  onToggle, 
  onTaskClick 
}: SubTopicItemProps) {
  const handleToggle = () => {
    if (subTopic.isUnlocked) {
      onToggle(subTopic.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleToggle}
        disabled={!subTopic.isUnlocked}
        className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors text-left ${
          subTopic.isUnlocked 
            ? 'hover:bg-white/5 text-gray-400 hover:text-gray-300' 
            : 'text-gray-600 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center gap-2">
          {subTopic.isUnlocked ? (
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
          ) : (
            <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
            </svg>
          )}
          <span className="text-xs">{subTopic.name}</span>
        </div>
        {subTopic.isUnlocked && (
          <svg 
            className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {isOpen && subTopic.isUnlocked && (
        <div className="ml-4 mt-1 space-y-1">
          {subTopic.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      )}
    </div>
  );
} 