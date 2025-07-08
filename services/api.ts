// gitguide-frontend/src/services/api.ts
import { auth } from '@clerk/nextjs/server';

// For client-side API calls
export const createProject = async (
  projectData: {
    repo_url: string;
    skill_level: string;
    domain: string;
  },
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch("http://localhost:8000/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to save project: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error saving project:", error);
    throw error;
  }
};

// Get user's projects
export const getUserProjects = async (getToken: () => Promise<string | null>) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch("http://localhost:8000/projects", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get projects: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting projects:", error);
    throw error;
  }
};
  