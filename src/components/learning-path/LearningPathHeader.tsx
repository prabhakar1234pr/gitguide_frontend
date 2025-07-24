"use client";

interface LearningPathHeaderProps {
  projectDomain: string;
  skillLevel: string;
  hasContent: boolean;
  onRegenerateWholePath: () => void;
}

export default function LearningPathHeader({ 
  projectDomain, 
  skillLevel, 
  hasContent, 
  onRegenerateWholePath 
}: LearningPathHeaderProps) {
  return (
    <div className="sticky top-0 bg-black/80 backdrop-blur-sm border-b border-white/10 p-6 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Learning Path</h2>
          <p className="text-gray-400 text-sm mt-1">
            {skillLevel} • {projectDomain}
          </p>
        </div>
        
        {/* Regenerate Whole Path Button */}
        {hasContent && (
          <button
            onClick={onRegenerateWholePath}
            className="p-3 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors"
            title="Regenerate entire learning path"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 