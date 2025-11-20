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
    <div className="ml-2 border-l-2 border-[#ff006e]/30 pl-3 mt-2">
      {/* Subconcept Header */}
      <div 
        className={`
          cursor-pointer p-3 transition-all duration-300 border relative group
          ${subconcept.isUnlocked 
            ? 'bg-[#ff006e]/5 border-[#ff006e]/30 hover:bg-[#ff006e]/10 hover:border-[#ff006e] hover:shadow-[0_0_15px_rgba(255,0,110,0.2)]' 
            : 'bg-[#0a0e27]/50 border-[#64748b]/30 opacity-50'
          }
        `}
        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
        onClick={handleSubconceptClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`w-2 h-2 ${
              subconcept.isCompleted 
                ? 'bg-[#39ff14] animate-pulse shadow-[0_0_8px_rgba(57,255,20,0.5)]' 
                : subconcept.isUnlocked 
                  ? 'bg-[#ff006e] animate-pulse shadow-[0_0_8px_rgba(255,0,110,0.5)]' 
                  : 'bg-[#64748b]'
            }`} />
            
            <div>
              <h4 className={`font-bold uppercase tracking-wide text-xs ${
                subconcept.isUnlocked ? 'text-[#e0e7ff]' : 'text-[#64748b]'
              }`}>
                {subconcept.name}
              </h4>
              <p className="text-[#94a3b8] text-[10px] mt-0.5 leading-relaxed">{subconcept.description}</p>
            </div>
          </div>
          
          {/* Lock Icon for locked subconcepts */}
          {!subconcept.isUnlocked && (
            <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
      </div>

      {/* Task - Only show if subconcept is unlocked */}
      {subconcept.isUnlocked && subconcept.task && (
        <div className="ml-4 mt-2">
          <div 
            className={`
              p-3 border transition-all duration-300 cursor-pointer group relative
              ${subconcept.task.isUnlocked 
                ? 'bg-[#ffbe0b]/5 border-[#ffbe0b]/30 hover:bg-[#ffbe0b]/10 hover:border-[#ffbe0b] hover:shadow-[0_0_15px_rgba(255,190,11,0.2)]' 
                : 'bg-[#0a0e27]/30 border-[#64748b]/20 opacity-40'
              }
            `}
            style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
            onClick={handleTaskClick}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                {/* Task Status Icon */}
                <div className="flex-shrink-0">
                  {subconcept.task.status === 'completed' ? (
                    <svg className="w-4 h-4 text-[#39ff14] drop-shadow-[0_0_6px_rgba(57,255,20,0.8)]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  ) : subconcept.task.status === 'in_progress' ? (
                    <svg className="w-4 h-4 text-[#ffbe0b] drop-shadow-[0_0_6px_rgba(255,190,11,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <div className={`w-4 h-4 border-2 ${
                      subconcept.task.isUnlocked ? 'border-[#ffbe0b]' : 'border-[#64748b]'
                    }`} style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold uppercase tracking-wide text-xs truncate ${
                      subconcept.task.isUnlocked ? 'text-[#e0e7ff]' : 'text-[#64748b]'
                    }`}>
                      {subconcept.task.name}
                    </span>
                    
                    {/* Difficulty Badge */}
                    <span className={`
                      px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border
                      ${subconcept.task.difficulty === 'easy' ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30' :
                        subconcept.task.difficulty === 'medium' ? 'bg-[#ffbe0b]/10 text-[#ffbe0b] border-[#ffbe0b]/30' :
                        'bg-[#ff006e]/10 text-[#ff006e] border-[#ff006e]/30'
                      }
                    `}>
                      {subconcept.task.difficulty}
                    </span>
                    
                    {/* Verification Status */}
                    {subconcept.task.verification_type && (
                      <span className={`
                        px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border
                        ${subconcept.task.is_verified 
                          ? 'bg-[#39ff14]/10 text-[#39ff14] border-[#39ff14]/30' 
                          : 'bg-[#ffbe0b]/10 text-[#ffbe0b] border-[#ffbe0b]/30'
                        }
                      `}>
                        {subconcept.task.is_verified ? '✓ Verified' : 'Verify'}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[#94a3b8] text-[10px] mt-1 line-clamp-2 leading-relaxed">
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
                className="ml-2 p-1.5 hover:bg-[#ffbe0b]/10 transition-all duration-300 border border-transparent hover:border-[#ffbe0b]/30 group/regen"
                style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
                title="Regenerate this task"
              >
                <svg className="w-3.5 h-3.5 text-[#64748b] group-hover/regen:text-[#ffbe0b] group-hover/regen:rotate-180 transition-all duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
