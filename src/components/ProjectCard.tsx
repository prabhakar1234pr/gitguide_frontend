"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';

interface ProjectCardProps {
  projectId: string;
  repoUrl: string;
  skillLevel: string;
  domain: string;
  createdAt: string;
  onDelete?: (projectId: string) => void;
}

export default function ProjectCard({ projectId, repoUrl, skillLevel, domain, createdAt, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  
  const handleCardClick = () => {
    router.push(`/project/${projectId}`);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const token = await getToken();
      
      const response = await fetch(`https://gitguide-backend.onrender.com/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Call the parent's delete callback
      if (onDelete) {
        onDelete(projectId);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };
  // Extract just the repository name from URL
  const getRepoName = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      return match ? match[2] : 'Unknown Repository'; // Return just the repo name (match[2])
    } catch {
      return 'Unknown Repository';
    }
  };

  const repoName = getRepoName(repoUrl);

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        {/* Project Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate group-hover:text-gray-100 transition-colors">
            {repoName}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              {skillLevel}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              {domain}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Created {createdAt}
          </p>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={handleMenuClick}
            disabled={isDeleting}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 rounded-lg border border-gray-700 shadow-xl z-10">
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
              >
                {isDeleting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Project
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 