"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getProjectDays, verifyDay0Repository, refreshProjectProgress } from '../../services/api';

interface Day {
  day_id: number;
  project_id: number;
  day_number: number;
  day_external_id: string;
  name: string;
  description: string;
  is_unlocked: boolean;
  is_completed: boolean;
  order: number;
  requires_verification?: boolean;
  verification_repo_url?: string;
  is_verified?: boolean;
}

interface DaysProgressBarProps {
  projectId: string;
  onActiveDayChange?: (dayNumber: number) => void;
}

export default function DaysProgressBar({ projectId, onActiveDayChange }: DaysProgressBarProps) {
  const { getToken, isLoaded } = useAuth();
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentDay, setCurrentDay] = useState<Day | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  const loadDays = useCallback(async () => {
    if (!isLoaded || !projectId) return;

    try {
      setLoading(true);
      setError('');
      
      const projectIdNum = parseInt(projectId);
      if (isNaN(projectIdNum)) {
        setError('Invalid project ID');
        return;
      }

      const daysData = await getProjectDays(projectIdNum, getToken);
      setDays(daysData.days || []);
      setCurrentDay(daysData.current_day || null);
      if (onActiveDayChange && daysData?.current_day?.day_number !== undefined) {
        onActiveDayChange(daysData.current_day.day_number);
      }
      
      console.log(`📅 Days loaded: ${daysData.completed_days}/${daysData.total_days} completed`);
      
    } catch (error) {
      console.error("Failed to load days:", error);
      setError('Failed to load days');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, projectId, getToken, onActiveDayChange]);

  useEffect(() => {
    loadDays();
  }, [loadDays]);

  // Function to refresh days data (can be called after task completion)
  const refreshDaysData = async () => {
    console.log('🔄 Refreshing days progress...');
    await loadDays();
  };

  const handleDayClick = async (day: Day) => {
    if (!day.is_unlocked) {
      return; // Can't interact with locked days
    }

    // Day 0: open verification modal if needed
    if (day.day_number === 0 && day.requires_verification && !day.is_verified) {
      setShowVerification(true);
      return;
    }

    // Switch active day locally and notify parent (sidebar will refetch for this day)
    setCurrentDay(day);
    if (onActiveDayChange) {
      onActiveDayChange(day.day_number);
    }
    return;
  };

  const handleVerifyRepository = async () => {
    if (!repoUrl.trim()) {
      setVerificationError('Please enter a repository URL');
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError('');
      
      const projectIdNum = parseInt(projectId);
      const result = await verifyDay0Repository(projectIdNum, repoUrl, getToken);
      
      if (result.success) {
        // Force refresh all progress data after verification
        try {
          await refreshProjectProgress(projectIdNum, getToken);
        } catch (progressError) {
          console.warn('Failed to refresh progress data:', progressError);
        }
        
        // Reload days data to get updated state
        await refreshDaysData();
        
        setShowVerification(false);
        setRepoUrl('');
        
        console.log('✅ Day 0 verification completed and progress refreshed');
      } else {
        setVerificationError(result.error || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Failed to verify repository:', error);
      setVerificationError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const getDayIcon = (day: Day) => {
    if (day.is_completed) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      );
    } else if (day.is_unlocked) {
      if (day.day_number === 0 && day.requires_verification && !day.is_verified) {
        // Day 0 needs verification
        return (
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      }
      return (
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      // For locked days, no icon here since we have the overlay
      return null;
    }
  };

  const getDayStyle = (day: Day) => {
    const baseStyle = "relative flex flex-col items-center p-2 rounded-lg border transition-all duration-200 cursor-pointer min-w-[80px]";
    
    if (day.is_completed) {
      return `${baseStyle} bg-green-500/20 border-green-400/50 hover:bg-green-500/30`;
    } else if (day.is_unlocked) {
      if (day.day_number === 0 && day.requires_verification && !day.is_verified) {
        return `${baseStyle} bg-orange-500/20 border-orange-400/50 hover:bg-orange-500/30 ring-2 ring-orange-400/30`;
      }
      return `${baseStyle} bg-blue-500/20 border-blue-400/50 hover:bg-blue-500/30 ring-2 ring-blue-400/30`;
    } else {
      return `${baseStyle} bg-gray-700/30 border-gray-600/50 cursor-not-allowed opacity-60`;
    }
  };

  const getProjectName = () => {
    // Extract project name from current day's description or use generic name
    const day0 = days.find(d => d.day_number === 0);
    if (day0?.description) {
      const match = day0.description.match(/"([^"]+)-gitguide"/);
      return match ? match[1] : 'your-project';
    }
    return 'your-project';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex gap-2 overflow-x-auto py-2">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-20 h-16 bg-white/10 rounded-lg flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || days.length === 0) {
    return (
      <div className="text-gray-400 text-sm">
        {error || 'No days available'}
      </div>
    );
  }

  const completedCount = days.filter(d => d.is_completed).length;
  const unlockedCount = days.filter(d => d.is_unlocked).length;
  const day0 = days.find(d => d.day_number === 0);

  return (
    <>
      <div className="space-y-3">
        {/* Progress Summary */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">15-Day Learning Journey</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-green-400">{completedCount} Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400">{unlockedCount} Unlocked</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span className="text-gray-400">{15 - unlockedCount} Locked</span>
              </div>
            </div>
          </div>
          
          {currentDay && (
            <div className="flex items-center gap-2 text-blue-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Current: {currentDay.name}</span>
            </div>
          )}
        </div>

        {/* Days Grid */}
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {days.map((day) => (
            <div
              key={day.day_id}
              className={getDayStyle(day)}
              onClick={() => handleDayClick(day)}
              title={
                day.day_number === 0 && day.requires_verification && !day.is_verified 
                  ? 'Click to setup your practice repository'
                  : day.is_unlocked 
                    ? day.description 
                    : 'Complete previous days to unlock'
              }
            >
              {/* Lock overlay for locked days */}
              {!day.is_unlocked && (
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}
              
              {/* Day content */}
              <div className={`flex flex-col items-center gap-1 relative z-10 ${!day.is_unlocked ? 'pt-6' : ''}`}>
                {getDayIcon(day)}
                <span className="text-xs font-medium text-white">
                  Day {day.day_number}
                </span>
                <span className="text-xs text-gray-300 text-center leading-tight">
                  {day.day_number === 0 ? 'Setup' : day.name.split(':')[1]?.trim() || 'Day ' + day.day_number}
                </span>
                {day.day_number === 0 && day.requires_verification && !day.is_verified && (
                  <span className="text-xs text-orange-300 font-medium">
                    Verify
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / 15) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Day 0 Verification Modal */}
      {showVerification && day0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <h3 className="text-xl font-bold text-white">{day0.name}</h3>
            </div>
            
            <div className="text-gray-300 mb-6">
              <p className="mb-4">{day0.description}</p>
              <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-300 mb-2">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to GitHub and create a new repository</li>
                  <li>Name it: <code className="bg-gray-800 px-2 py-1 rounded text-blue-300">{getProjectName()}-gitguide</code></li>
                  <li>Make it public or private (your choice)</li>
                  <li>Copy the repository URL and paste it below</li>
                </ol>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/yourusername/project-gitguide"
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              {verificationError && (
                <div className="text-red-400 text-sm bg-red-500/20 border border-red-500/50 rounded-lg p-3">
                  {verificationError}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={handleVerifyRepository}
                  disabled={verificationLoading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  {verificationLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Repository'
                  )}
                </button>
                <button
                  onClick={() => setShowVerification(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 