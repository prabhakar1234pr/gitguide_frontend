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
        const fetchedProjects = response.projects.map((p: any) => ({
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

  const handleProjectSubmit = (projectData: { repoUrl: string; skillLevel: string; domain: string }) => {
    const newProject: Project = {
      project_id: Date.now().toString(),
      ...projectData,
      createdAt: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    };
    
    setProjects(prev => [newProject, ...prev]);
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading your projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {projects.length === 0 ? (
        // Hero Section - shown when no projects exist
        <main className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                Welcome to GitGuide
              </h1>
              <p className="text-xl text-gray-200 max-w-2xl mx-auto">
                Transform any GitHub repository into a personalized learning journey. 
                Master new technologies with guided, interactive tutorials.
              </p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-white text-purple-700 px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border border-white/20"
            >
              ✨ Create New Learning Project
            </button>
          </div>
        </main>
      ) : (
        // Projects Grid - shown when projects exist
        <main className="px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200">
                  My Learning Projects
                </h1>
                <p className="text-gray-300 mt-2">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-white to-gray-100 hover:from-gray-50 hover:to-white text-purple-700 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                + Create New Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.project_id}
                  repoUrl={project.repoUrl}
                  skillLevel={project.skillLevel}
                  domain={project.domain}
                  createdAt={project.createdAt}
                />
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