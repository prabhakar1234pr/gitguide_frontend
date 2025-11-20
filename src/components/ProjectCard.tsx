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
      className="cyber-card p-6 cursor-pointer group relative overflow-hidden"
    >
      {/* Corner Accent */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#00f0ff]/20 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-[#ff006e]/20 to-transparent"></div>
      
      <div className="flex items-start gap-4 relative z-10">
        {/* Project Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-[#00f0ff]/20 to-[#ff006e]/20 border border-[#00f0ff]/30 flex items-center justify-center flex-shrink-0 relative group-hover:border-[#00f0ff] transition-all duration-300"
          style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
        >
          <svg className="w-7 h-7 text-[#00f0ff] group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all duration-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[#e0e7ff] truncate group-hover:text-[#00f0ff] transition-colors uppercase tracking-wide">
            {repoName}
          </h3>
          
          <div className="flex items-center gap-3 mt-3 text-xs uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <div className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse"></div>
              <span className="text-[#00f0ff]">{skillLevel}</span>
            </span>
            <span className="text-[#64748b]">|</span>
            <span className="flex items-center gap-1.5 text-[#94a3b8]">
              <div className="w-1.5 h-1.5 bg-[#ff006e] rounded-full animate-pulse"></div>
              <span className="text-[#ff006e]">{domain}</span>
            </span>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-[#00f0ff]/30 to-transparent"></div>
            <p className="text-[10px] text-[#64748b] uppercase tracking-widest">
              Init: {createdAt}
            </p>
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={handleMenuClick}
            disabled={isDeleting}
            className="w-9 h-9 border border-[#00f0ff]/30 hover:border-[#00f0ff] hover:bg-[#00f0ff]/10 flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-50"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            <svg className="w-4 h-4 text-[#00f0ff]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#0f1729]/95 backdrop-blur-sm border border-[#ff006e]/50 shadow-[0_0_20px_rgba(255,0,110,0.3)] z-10"
              style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
            >
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="w-full px-4 py-3 text-left text-[#ff006e] hover:bg-[#ff006e]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 font-semibold uppercase tracking-wider text-sm"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00f0ff] via-[#ff006e] to-[#ffbe0b] opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  );
} 