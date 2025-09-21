"use client";

import { Task } from './types';

interface TaskCardProps {
  task: Task;
  conceptIndex: number;
  subtopicIndex: number;
  taskIndex: number;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subtopicId: string, taskId: string) => void;
  conceptId: string;
  subtopicId: string;
}

export default function TaskCard({ 
  task, 
  conceptIndex, 
  subtopicIndex, 
  taskIndex, 
  onTaskClick, 
  onRegenerateTask,
  conceptId,
  subtopicId 
}: TaskCardProps) {
  const isCompleted = task.status === 'completed';

  return (
    <div key={`task-${task.id || `${conceptIndex}-${subtopicIndex}-${taskIndex}`}`} className="flex items-center mt-1">
      <button
        onClick={() => onTaskClick(task)}
        className="flex-1 p-2 text-left hover:bg-white/5 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          <div className={`w-1.5 h-1.5 rounded-full ${
            isCompleted ? 'bg-green-400' : 
            task.isUnlocked ? 'bg-yellow-400' : 'bg-gray-400'
          }`}></div>
          <span className={`text-xs ${isCompleted ? 'text-green-400' : 'text-gray-400'}`}>{task.name}</span>
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
          onRegenerateTask(task, conceptId, subtopicId, task.task_id.toString());
        }}
        className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-white/10 rounded transition-colors"
        title="Regenerate this task"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
} 