"use client";

interface ProjectOverviewCardProps {
  projectOverview: string;
  onOverviewClick: () => void;
  onRegenerateOverview: () => void;
}

export default function ProjectOverviewCard({ 
  projectOverview, 
  onOverviewClick, 
  onRegenerateOverview 
}: ProjectOverviewCardProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2">
        <button
          onClick={onOverviewClick}
          className="flex-1 p-3 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/20 hover:border-white/30"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-semibold text-white">Project Overview</span>
          </div>
        </button>
        
        {/* Regenerate Project Overview Button */}
        {projectOverview && (
          <button
            onClick={onRegenerateOverview}
            className="p-3 text-gray-400 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors"
            title="Regenerate project overview"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 