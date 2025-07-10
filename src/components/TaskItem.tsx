"use client";

interface Task {
  id: string;
  name: string;
  isUnlocked: boolean;
}

interface TaskItemProps {
  task: Task;
  onTaskClick?: (taskId: string) => void;
}

export default function TaskItem({ task, onTaskClick }: TaskItemProps) {
  const handleClick = () => {
    if (task.isUnlocked && onTaskClick) {
      onTaskClick(task.id);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!task.isUnlocked}
      className={`flex items-center gap-2 w-full p-2 rounded-lg transition-colors text-left ${
        task.isUnlocked 
          ? 'hover:bg-white/5 text-gray-400 hover:text-gray-300' 
          : 'text-gray-600 cursor-not-allowed'
      }`}
    >
      {task.isUnlocked ? (
        <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
      ) : (
        <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
        </svg>
      )}
      <span className="text-xs">{task.name}</span>
    </button>
  );
} 