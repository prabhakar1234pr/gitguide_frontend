"use client";

interface ProgressIndicatorProps {
  completedTasks: number;
  totalTasks: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function ProgressIndicator({ 
  completedTasks, 
  totalTasks, 
  className = "", 
  size = 'md',
  showText = true 
}: ProgressIndicatorProps) {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Circular Progress */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 36 36">
          {/* Background circle */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />
          {/* Progress circle */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            strokeDasharray={`${percentage}, 100`}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Percentage text in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-white ${textSizeClasses[size]}`}>
            {percentage}%
          </span>
        </div>
      </div>
      
      {/* Progress text */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-white font-medium">{percentage}% Complete</span>
          <span className="text-gray-400 text-sm">
            {completedTasks} of {totalTasks} tasks
          </span>
        </div>
      )}
    </div>
  );
}
