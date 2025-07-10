interface Task {
  task_id: number;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'done';
  order: number;
}

interface TaskCardProps {
  task: Task;
  onVerify: () => void;
  isLastTask: boolean;
}

export default function TaskCard({ task, onVerify, isLastTask }: TaskCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_started':
        return '⭕';
      case 'in_progress':
        return '🔄';
      case 'done':
        return '✅';
      default:
        return '⭕';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'text-gray-400';
      case 'in_progress':
        return 'text-blue-400';
      case 'done':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
      {/* Task Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">{task.order}</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{task.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl">{getStatusIcon(task.status)}</span>
              <span className={`font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Description */}
      <div className="mb-8">
        <p className="text-gray-200 leading-relaxed text-lg">
          {task.description}
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 font-medium">Progress</span>
          <span className="text-gray-300 font-medium">
            Task {task.order}
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : '0%' 
            }}
          ></div>
        </div>
      </div>

      {/* Verify Button - Bottom Right */}
      <div className="flex justify-end">
        <button
          onClick={onVerify}
          disabled={task.status === 'done'}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 ${
            task.status === 'done'
              ? 'bg-green-500/20 text-green-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
          }`}
        >
          {task.status === 'done' 
            ? '✅ Completed' 
            : isLastTask 
              ? '🎉 Complete Project' 
              : '✅ Verify Task'
          }
        </button>
      </div>
    </div>
  );
} 