"use client";

interface Project {
  project_id: string;
  repo_url: string;
  skill_level: string;
  domain: string;
  is_processed?: boolean;
  project_overview?: string;
  repo_name?: string;
  tech_stack?: string;
}

interface ProjectDetailHeaderProps {
  project: Project;
  completionPercentage: number;
  processingStatus: string;
}

export default function ProjectDetailHeader({ project, completionPercentage, processingStatus }: ProjectDetailHeaderProps) {
  const getRepositoryName = () => {
    if (project.repo_name) {
      return project.repo_name;
    }
    // Extract repo name from URL as fallback
    const urlParts = project.repo_url.split('/');
    return urlParts[urlParts.length - 1] || 'Repository';
  };

  const getRepositoryOwner = () => {
    // Extract owner from GitHub URL
    const urlParts = project.repo_url.split('/');
    if (urlParts.length >= 2) {
      return urlParts[urlParts.length - 2];
    }
    return '';
  };

  const getTechStack = () => {
    if (!project.tech_stack) return [];
    try {
      const parsed = JSON.parse(project.tech_stack);
      return Array.isArray(parsed) ? parsed : Object.keys(parsed);
    } catch {
      return [];
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{getRepositoryName()}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>by</span>
              <span className="text-purple-400">{getRepositoryOwner()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <a 
                href={project.repo_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Repository
              </a>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Skill Level:</span>
              <span className="text-white font-medium">{project.skill_level}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Domain:</span>
              <span className="text-white font-medium">{project.domain}</span>
            </div>
          </div>

          {/* Tech Stack */}
          {getTechStack().length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gray-400 text-sm">Tech Stack:</span>
              <div className="flex flex-wrap gap-2">
                {getTechStack().slice(0, 5).map((tech, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-white/10 text-white text-xs rounded-md"
                  >
                    {tech}
                  </span>
                ))}
                {getTechStack().length > 5 && (
                  <span className="text-gray-400 text-xs">+{getTechStack().length - 5} more</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Processing Status */}
        <div className="text-right">
          {project.is_processed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Learning Path Ready</span>
              </div>
              
              {completionPercentage > 0 && (
                <div className="text-sm text-gray-400">
                  Progress: {completionPercentage}% complete
                </div>
              )}
              
              {processingStatus && (
                <div className="text-xs text-gray-500">
                  {processingStatus}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Ready for Processing</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 