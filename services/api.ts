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
  
// ==================== DAY 0 VERIFICATION API FUNCTIONS ====================

// Verify Day 0 GitHub repository
export const verifyDay0Repository = async (
  projectId: number,
  repoUrl: string,
  getToken: () => Promise<string | null>
) => {
  try {
    console.log(`🔍 Verifying Day 0 repository for project ${projectId}`);
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days/0/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ repo_url: repoUrl }),
    });

    console.log(`📋 Day 0 verification response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Failed to verify Day 0 repository:`, errorData);
      throw new Error(`Failed to verify repository: ${errorData}`);
    }
    
    const data = await response.json();
    console.log(`✅ Day 0 verification result:`, data);
    return data;
  } catch (error) {
    console.error("❌ Error verifying Day 0 repository:", error);
    throw error;
  }
};

// Get Day 0 verification status
export const getDay0VerificationStatus = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days/0/verification-status`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get Day 0 verification status: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting Day 0 verification status:", error);
    throw error;
  }
};

// ==================== DAYS API FUNCTIONS ====================

// Get all days for a project
export const getProjectDays = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    console.log(`📅 Fetching days for project ${projectId}`);
    const token = await getToken();
    
    if (!token) {
      console.error("❌ No authentication token available");
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log(`📋 Days response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Failed to fetch days for project ${projectId}:`, errorData);
      throw new Error(`Failed to get project days: ${errorData}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.total_days || 0} days for project ${projectId}`);
    return data;
  } catch (error) {
    console.error("❌ Error getting project days:", error);
    throw error;
  }
};

// Get current active day for a project
export const getCurrentDay = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days/current`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get current day: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting current day:", error);
    throw error;
  }
};

// Mark a day as completed
export const markDayCompleted = async (
  projectId: number,
  dayNumber: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days/${dayNumber}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to mark day completed: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error marking day completed:", error);
    throw error;
  }
};

// Get days progress statistics
export const getDaysProgress = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/projects/${projectId}/days/progress`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get days progress: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting days progress:", error);
    throw error;
  }
};

// ==================== AGENT API FUNCTIONS ====================
  
// Agent API functions
export const triggerAgentProcessing = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch("http://localhost:8000/agent/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ project_id: projectId }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to trigger agent processing: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error triggering agent processing:", error);
    throw error;
  }
};

export const getAgentStatus = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/agent/status/${projectId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get agent status: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting agent status:", error);
    throw error;
  }
};

export const checkAgentHealth = async () => {
  try {
    const response = await fetch("http://localhost:8000/agent/health", {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to check agent health: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking agent health:", error);
    throw error;
  }
};

// ==================== CHAT API FUNCTIONS ====================

// Chat API functions
export const sendChatMessage = async (
  projectId: number,
  message: string,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/chat/project/${projectId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to send chat message: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw error;
  }
};

export const getChatContext = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    const token = await getToken();
    
    if (!token) {
      throw new Error("No authentication token available");
    }

    const response = await fetch(`http://localhost:8000/chat/project/${projectId}/context`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get chat context: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error getting chat context:", error);
    throw error;
  }
};

export const checkChatHealth = async () => {
  try {
    const response = await fetch("http://localhost:8000/chat/health", {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to check chat health: ${errorData}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error checking chat health:", error);
    throw error;
  }
};

// ==================== PROJECT LEARNING PATH API FUNCTIONS ====================

// Project Learning Path API functions
export const getProjectConcepts = async (
  projectId: number,
  getToken: () => Promise<string | null>
) => {
  try {
    console.log(`🎯 Fetching concepts for project ${projectId}`);
    const token = await getToken();
    
    if (!token) {
      console.error("❌ No authentication token available");
      throw new Error("No authentication token available");
    }

    console.log(`🔑 Using token: ${token.substring(0, 20)}...`);
    console.log(`📡 Making request to: http://localhost:8000/projects/${projectId}/concepts`);

    const response = await fetch(`http://localhost:8000/projects/${projectId}/concepts`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log(`📋 Response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Failed to fetch concepts for project ${projectId}:`, errorData);
      console.error(`❌ Response headers:`, [...response.headers.entries()]);
      throw new Error(`Failed to get project concepts: ${errorData}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.concepts?.length || 0} concepts for project ${projectId}`);
    return data;
  } catch (error) {
    console.error("❌ Error getting project concepts:", error);
    throw error;
  }
};
  
// ==================== REGENERATION API FUNCTIONS ====================

export const regenerateProjectOverview = async (projectId: number, userPrompt: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:8000/agent/regenerate/project-overview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      user_prompt: userPrompt
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate project overview: ${errorText}`);
  }

  return response.json();
};

export const regenerateWholePath = async (projectId: number, userPrompt: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:8000/agent/regenerate/whole-path`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      user_prompt: userPrompt
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate learning path: ${errorText}`);
  }

  return response.json();
};

export const regenerateConcept = async (projectId: number, conceptId: string, userPrompt: string, getToken: () => Promise<string | null>) => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:8000/agent/regenerate/concept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      concept_id: conceptId,
      user_prompt: userPrompt
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate concept: ${errorText}`);
  }

  return response.json();
};

export const regenerateSubtopic = async (
  projectId: number, 
  conceptId: string, 
  subtopicId: string, 
  userPrompt: string, 
  getToken: () => Promise<string | null>
) => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:8000/agent/regenerate/subtopic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      concept_id: conceptId,
      subtopic_id: subtopicId,
      user_prompt: userPrompt
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate subtopic: ${errorText}`);
  }

  return response.json();
};

export const regenerateTask = async (
  projectId: number, 
  conceptId: string, 
  subtopicId: string, 
  taskId: string, 
  userPrompt: string, 
  getToken: () => Promise<string | null>
) => {
  const token = await getToken();
  
  const response = await fetch(`http://localhost:8000/agent/regenerate/task`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      project_id: projectId,
      concept_id: conceptId,
      subtopic_id: subtopicId,
      task_id: taskId,
      user_prompt: userPrompt
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate task: ${errorText}`);
  }

  return response.json();
};

// Verify Day 0 task 
export const verifyTask = async (
  projectId: number, 
  taskId: number | string, 
  verificationUrl: string,
  getToken: () => Promise<string | null>
) => {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token available");
  }

  const response = await fetch(`http://localhost:8000/projects/${projectId}/tasks/${taskId.toString()}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      verification_data: verificationUrl
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to verify task: ${errorText}`);
  }

  return response.json();
};
  