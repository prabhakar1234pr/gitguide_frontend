import { useState, useEffect } from "react";
import { useAuth } from '@clerk/nextjs';
import NewProjectModal from "./NewProjectModal";
import ProjectCard from "./ProjectCard";
import { getUserProjects } from "../../services/api";

interface Project {
  project_id: string;
  repoUrl: string;
  skillLevel: string;
  domain: string;
  createdAt: string;
}

interface ProjectResponse {
  project_id: number;
  repo_url: string;
  skill_level: string;
  domain: string;
}

export default function Dashboard() {
  const { getToken, isLoaded, userId } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's projects on component mount
  useEffect(() => {
    const loadProjects = async () => {
      if (!isLoaded || !userId) return;
      
      try {
        setLoading(true);
        const response = await getUserProjects(getToken);
        const fetchedProjects = response.projects.map((p: ProjectResponse) => ({
          project_id: p.project_id.toString(),
          repoUrl: p.repo_url,
          skillLevel: p.skill_level,
          domain: p.domain,
          createdAt: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })
        }));
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [isLoaded, userId, getToken]);

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.project_id !== projectId));
  };

  const handleProjectSubmit = async (projectData: { repoUrl: string; skillLevel: string; domain: string }) => {
    try {
      const token = await getToken();
      const response = await fetch(`https://gitguide-backend.onrender.com/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          repo_url: projectData.repoUrl,
          skill_level: projectData.skillLevel,
          domain: projectData.domain,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const result = await response.json();
      
      // Add the new project with the real project_id from backend
      const newProject: Project = {
        project_id: result.project_id.toString(),
        repoUrl: projectData.repoUrl,
        skillLevel: projectData.skillLevel,
        domain: projectData.domain,
        createdAt: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })
      };
      
      setProjects(prev => [newProject, ...prev]);
    } catch (error) {
      console.error('Failed to create project:', error);
      // Show error to user - you might want to add a toast notification here
    }
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-transparent border-t-[#00f0ff] border-r-[#ff006e] rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-[#ffbe0b] border-l-[#39ff14] rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="neon-text text-2xl font-bold uppercase tracking-wider">
            Loading Projects...
          </div>
          <div className="text-[#94a3b8] text-sm uppercase tracking-widest">
            Initializing Neural Network
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10">
      {projects.length === 0 ? (
        // Hero Section - shown when no projects exist
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-12 max-w-4xl">
            {/* Glitch Title */}
            <div className="space-y-6">
              <div className="relative inline-block">
                <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tight">
                  <span className="neon-text neon-pulse">GIT</span>
                  <span className="neon-text-magenta">GUIDE</span>
                </h1>
                <div className="absolute -top-2 -left-2 text-7xl md:text-8xl font-black uppercase tracking-tight opacity-20 text-[#00f0ff]">
                  GITGUIDE
                </div>
              </div>
              
              <div className="relative">
                <p className="text-xl md:text-2xl text-[#94a3b8] max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
                  <span className="text-[#00f0ff]">// </span>
                  Transform GitHub repositories into 
                  <span className="text-[#ff006e] font-semibold"> neural learning paths</span>
                  <br />
                  <span className="text-[#00f0ff]">// </span>
                  Master code with 
                  <span className="text-[#ffbe0b] font-semibold"> AI-powered guidance</span>
                </p>
              </div>
            </div>
            
            {/* Cyber Button */}
            <div className="flex flex-col items-center gap-6">
              <button
                onClick={() => setShowModal(true)}
                className="cyber-button text-lg group relative"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">⚡</span>
                  <span>Initialize Project</span>
                  <span className="text-2xl">⚡</span>
                </span>
              </button>
              
              <div className="flex items-center gap-4 text-sm text-[#64748b] uppercase tracking-widest">
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#00f0ff]"></div>
                <span>Neural Network Ready</span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#ff006e]"></div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 text-left">
              <div className="cyber-card p-6 space-y-2">
                <div className="text-[#00f0ff] text-2xl">⚡</div>
                <h3 className="text-[#00f0ff] font-bold uppercase tracking-wide text-sm">14-Day Protocol</h3>
                <p className="text-[#94a3b8] text-xs leading-relaxed">Structured learning progression with AI-generated content</p>
              </div>
              <div className="cyber-card p-6 space-y-2">
                <div className="text-[#ff006e] text-2xl">🤖</div>
                <h3 className="text-[#ff006e] font-bold uppercase tracking-wide text-sm">AI Assistant</h3>
                <p className="text-[#94a3b8] text-xs leading-relaxed">Context-aware neural tutor for personalized guidance</p>
              </div>
              <div className="cyber-card p-6 space-y-2">
                <div className="text-[#ffbe0b] text-2xl">📊</div>
                <h3 className="text-[#ffbe0b] font-bold uppercase tracking-wide text-sm">Progress Tracking</h3>
                <p className="text-[#94a3b8] text-xs leading-relaxed">Real-time monitoring with GitHub verification</p>
              </div>
            </div>
          </div>
        </main>
      ) : (
        // Projects Grid - shown when projects exist
        <main className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-12 bg-gradient-to-b from-[#00f0ff] to-[#ff006e]"></div>
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
                      <span className="neon-text">Neural</span>
                      <span className="text-[#e0e7ff]"> Projects</span>
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 bg-[#39ff14] rounded-full animate-pulse"></div>
                      <p className="text-[#94a3b8] text-sm uppercase tracking-widest">
                        {projects.length} Active Protocol{projects.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="cyber-button"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>+</span>
                  <span>New Project</span>
                </span>
              </button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.project_id}
                  style={{
                    animation: `fade-in 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <ProjectCard
                    projectId={project.project_id}
                    repoUrl={project.repoUrl}
                    skillLevel={project.skillLevel}
                    domain={project.domain}
                    createdAt={project.createdAt}
                    onDelete={handleProjectDelete}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {showModal && (
        <NewProjectModal 
          onClose={() => setShowModal(false)} 
          onSubmit={handleProjectSubmit}
        />
      )}
    </div>
  );
} 