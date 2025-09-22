"use client";

import { Subconcept, Task } from './types';

interface SubconceptCardProps {
  subconcept: Subconcept;
  conceptId: string;
  subconceptIndex: number;
  onSubconceptClick: (subconcept: Subconcept, subconceptIndex: number) => void;
  onTaskClick: (task: Task) => void;
  onRegenerateTask: (task: Task, conceptId: string, subconceptId: string, taskId: string) => void;
}

export default function SubconceptCard({
  subconcept,
  conceptId,
  subconceptIndex,
  onSubconceptClick,
  onTaskClick,
  onRegenerateTask
}: SubconceptCardProps) {
  
  const handleSubconceptClick = () => {
    onSubconceptClick(subconcept, subconceptIndex);
  };

  const handleTaskClick = () => {
    onTaskClick(subconcept.task);
  };

  const handleRegenerateTask = () => {
    onRegenerateTask(
      subconcept.task,
      conceptId,
      subconcept.id.toString(),
      subconcept.task.id
    );
  };

  return (
    <div className="ml-4 border-l border-gray-600 pl-4 mt-2">
      {/* Subconcept Header */}
      <div 
        className={`
          cursor-pointer p-3 rounded-lg transition-all duration-200 border
          ${subconcept.isUnlocked 
            ? 'bg-blue-500/10 border-blue-400/30 hover:bg-blue-500/20' 
            : 'bg-gray-700/30 border-gray-600/50 opacity-60'
          }
        `}
        onClick={handleSubconceptClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`w-3 h-3 rounded-full ${
              subconcept.isCompleted 
                ? 'bg-green-400' 
                : subconcept.isUnlocked 
                  ? 'bg-blue-400' 
                  : 'bg-gray-500'
            }`} />
            
            <div>
              <h4 className="text-white font-medium">{subconcept.name}</h4>
              <p className="text-gray-300 text-sm">{subconcept.description}</p>
            </div>
          </div>
          
          {/* Lock Icon for locked subconcepts */}
          {!subconcept.isUnlocked && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
      </div>

      {/* Task - Only show if subconcept is unlocked */}
      {subconcept.isUnlocked && subconcept.task && (
        <div className="ml-6 mt-2">
          <div 
            className={`
              p-3 rounded-lg border transition-all duration-200 cursor-pointer
              ${subconcept.task.isUnlocked 
                ? 'bg-purple-500/10 border-purple-400/30 hover:bg-purple-500/20' 
                : 'bg-gray-700/20 border-gray-600/30 opacity-50'
              }
            `}
            onClick={handleTaskClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Task Status Icon */}
                <div className="flex-shrink-0">
                  {subconcept.task.status === 'completed' ? (
                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  ) : subconcept.task.status === 'in_progress' ? (
                    <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      subconcept.task.isUnlocked ? 'border-purple-400' : 'border-gray-500'
                    }`} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium truncate">{subconcept.task.name}</span>
                    
                    {/* Difficulty Badge */}
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${subconcept.task.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                        subconcept.task.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }
                    `}>
                      {subconcept.task.difficulty}
                    </span>
                    
                    {/* Verification Status */}
                    {subconcept.task.verification_type && (
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${subconcept.task.is_verified 
                          ? 'bg-green-500/20 text-green-300' 
                          : 'bg-orange-500/20 text-orange-300'
                        }
                      `}>
                        {subconcept.task.is_verified ? 'Verified' : 'Needs Verification'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {subconcept.task.description}
                  </p>
                </div>
              </div>
              
              {/* Regenerate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRegenerateTask();
                }}
                className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                title="Regenerate this task"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
