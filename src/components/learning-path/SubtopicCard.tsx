"use client";

import { Subtopic, Task } from './types';
import TaskCard from './TaskCard';

interface SubtopicCardProps {
  subtopic: Subtopic;
  conceptIndex: number;
  subtopicIndex: number;
  conceptId: string;
  isExpanded: boolean;
  onSubtopicClick: (subtopic: Subtopic, conceptIndex: number, subtopicIndex: number) => void;
  onToggleExpansion: (subtopicId: number | string) => void;
  onRegenerateSubtopic: (subtopic: Subtopic, conceptId: string, subtopicId: string) => void;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subtopicId: string, taskId: string) => void;
}

export default function SubtopicCard({ 
  subtopic, 
  conceptIndex, 
  subtopicIndex, 
  conceptId,
  isExpanded,
  onSubtopicClick, 
  onToggleExpansion,
  onRegenerateSubtopic,
  onTaskClick,
  onRegenerateTask
}: SubtopicCardProps) {
  const subtopicId = subtopic.id || `${conceptIndex}-${subtopicIndex}`;

  return (
    <div key={`subtopic-${subtopicId}`} className="mt-2 border border-white/10 rounded-lg">
      <div className="flex items-center">
        <button
          onClick={() => onSubtopicClick(subtopic, conceptIndex, subtopicIndex)}
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
            onRegenerateSubtopic(subtopic, conceptId, subtopic.id.toString());
          }}
          className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-white/10 rounded transition-colors mr-1"
          title="Regenerate this subtopic"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Expand/Collapse Button */}
        {subtopic.tasks && subtopic.tasks.length > 0 && (
          <button
            onClick={() => onToggleExpansion(subtopicId)}
            className="p-2 hover:bg-white/5 transition-colors rounded-r-lg group"
            title={isExpanded ? "Collapse tasks" : `Show ${subtopic.tasks.length} tasks`}
          >
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 group-hover:text-gray-300">
                {subtopic.tasks.length}
              </span>
              <svg 
                className={`w-3 h-3 text-gray-300 group-hover:text-white transition-all ${
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
      
      {/* Tasks List */}
      {isExpanded && subtopic.tasks && (
        <div className="ml-3 pb-2 border-l-2 border-white/5 pl-2">
          {subtopic.tasks.map((task, taskIndex) => (
            <TaskCard
              key={`task-${task.id || `${conceptIndex}-${subtopicIndex}-${taskIndex}`}`}
              task={task}
              conceptIndex={conceptIndex}
              subtopicIndex={subtopicIndex}
              taskIndex={taskIndex}
              onTaskClick={onTaskClick}
              onRegenerateTask={onRegenerateTask}
              conceptId={conceptId}
              subtopicId={subtopic.id.toString()}
            />
          ))}
        </div>
      )}
    </div>
  );
} 