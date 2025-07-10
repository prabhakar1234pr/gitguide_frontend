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

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.project_id !== projectId));
  };

  const handleProjectSubmit = async (projectData: { repoUrl: string; skillLevel: string; domain: string }) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8000/projects', {
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
                  projectId={project.project_id}
                  repoUrl={project.repoUrl}
                  skillLevel={project.skillLevel}
                  domain={project.domain}
                  createdAt={project.createdAt}
                  onDelete={handleProjectDelete}
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