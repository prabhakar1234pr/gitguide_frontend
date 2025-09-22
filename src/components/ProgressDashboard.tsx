"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getDaysProgress, getProjectConcepts } from '../services/api';

interface ProgressStats {
  overall: {
    totalDays: number;
    completedDays: number;
    totalTasks: number;
    completedTasks: number;
    overallProgress: number;
  };
  days: Array<{
    dayNumber: number;
    name: string;
    isUnlocked: boolean;
    isCompleted: boolean;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }>;
  concepts: Array<{
    id: string;
    name: string;
    dayNumber: number;
    isCompleted: boolean;
    totalTasks: number;
    completedTasks: number;
    progress: number;
  }>;
}

interface ProgressDashboardProps {
  projectId: string;
  className?: string;
}

export default function ProgressDashboard({ projectId, className = "" }: ProgressDashboardProps) {
  const { getToken, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<ProgressStats | null>(null);

  useEffect(() => {
    const loadProgressData = async () => {
      if (!isLoaded || !projectId) return;

      try {
        setLoading(true);
        setError('');
        
        const projectIdNum = parseInt(projectId);
        if (isNaN(projectIdNum)) {
          setError('Invalid project ID');
          return;
        }

        // Load days progress and concepts data in parallel
        const [daysData, conceptsData] = await Promise.all([
          getDaysProgress(projectIdNum, getToken),
          getProjectConcepts(projectIdNum, getToken, { includePast: true })
        ]);

        // Calculate overall statistics
        let totalTasks = 0;
        let completedTasks = 0;
        let totalDays = 0;
        let completedDays = 0;

        // Process days data
        const daysStats = (daysData.days || []).map((day: any) => {
          const dayTotalTasks = day.total_tasks || 0;
          const dayCompletedTasks = day.completed_tasks || 0;
          const dayProgress = dayTotalTasks > 0 ? (dayCompletedTasks / dayTotalTasks) * 100 : 0;
          
          totalTasks += dayTotalTasks;
          completedTasks += dayCompletedTasks;
          totalDays++;
          if (day.is_completed) completedDays++;

          return {
            dayNumber: day.day_number,
            name: day.name,
            isUnlocked: day.is_unlocked,
            isCompleted: day.is_completed,
            totalTasks: dayTotalTasks,
            completedTasks: dayCompletedTasks,
            progress: Math.round(dayProgress)
          };
        });

        // Process concepts data
        const conceptsStats = (conceptsData.concepts || []).map((concept: any) => {
          let conceptTotalTasks = 0;
          let conceptCompletedTasks = 0;

          // Count tasks in subconcepts (new structure) or subtopics (legacy)
          if (concept.subconcepts && concept.subconcepts.length > 0) {
            concept.subconcepts.forEach((subconcept: any) => {
              if (subconcept.task) {
                conceptTotalTasks++;
                if (subconcept.task.status === 'completed') {
                  conceptCompletedTasks++;
                }
              }
            });
          } else if (concept.subTopics && concept.subTopics.length > 0) {
            concept.subTopics.forEach((subtopic: any) => {
              if (subtopic.tasks) {
                conceptTotalTasks += subtopic.tasks.length;
                conceptCompletedTasks += subtopic.tasks.filter((task: any) => task.status === 'completed').length;
              }
            });
          }

          const conceptProgress = conceptTotalTasks > 0 ? (conceptCompletedTasks / conceptTotalTasks) * 100 : 0;

          return {
            id: concept.id,
            name: concept.name,
            dayNumber: concept.day_number || 0,
            isCompleted: conceptProgress === 100,
            totalTasks: conceptTotalTasks,
            completedTasks: conceptCompletedTasks,
            progress: Math.round(conceptProgress)
          };
        });

        const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        setStats({
          overall: {
            totalDays,
            completedDays,
            totalTasks,
            completedTasks,
            overallProgress: Math.round(overallProgress)
          },
          days: daysStats,
          concepts: conceptsStats
        });

      } catch (error) {
        console.error("Failed to load progress data:", error);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    loadProgressData();
  }, [isLoaded, projectId, getToken]);

  if (loading) {
    return (
      <div className={`${className} animate-pulse`}>
        <div className="space-y-4">
          <div className="h-32 bg-white/10 rounded-2xl"></div>
          <div className="h-48 bg-white/10 rounded-2xl"></div>
          <div className="h-64 bg-white/10 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`${className} bg-red-500/20 border border-red-500/50 rounded-2xl p-6`}>
        <div className="text-red-400 text-center">
          {error || 'No progress data available'}
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} space-y-6`}>
      {/* Overall Progress Card */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📊 Overall Progress</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.overall.completedDays}</div>
            <div className="text-sm text-gray-300">Days Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.overall.totalDays}</div>
            <div className="text-sm text-gray-300">Total Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.overall.completedTasks}</div>
            <div className="text-sm text-gray-300">Tasks Done</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.overall.totalTasks}</div>
            <div className="text-sm text-gray-300">Total Tasks</div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white font-medium">Overall Completion</span>
            <span className="text-white font-bold">{stats.overall.overallProgress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-400 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats.overall.overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Days Progress */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📅 Days Progress</h3>
        
        <div className="space-y-3">
          {stats.days.map((day) => (
            <div key={day.dayNumber} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  day.isCompleted 
                    ? 'bg-green-500 text-white' 
                    : day.isUnlocked 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-600 text-gray-300'
                }`}>
                  {day.dayNumber}
                </div>
                <div>
                  <div className="text-white font-medium">{day.name}</div>
                  <div className="text-sm text-gray-400">
                    {day.completedTasks}/{day.totalTasks} tasks completed
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-bold">{day.progress}%</div>
                <div className="w-20 bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      day.isCompleted ? 'bg-green-400' : 'bg-blue-400'
                    }`}
                    style={{ width: `${day.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concepts Progress */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">🧩 Concepts Progress</h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {stats.concepts.map((concept) => (
            <div key={concept.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  concept.isCompleted ? 'bg-green-400' : concept.progress > 0 ? 'bg-yellow-400' : 'bg-gray-500'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{concept.name}</div>
                  <div className="text-sm text-gray-400">
                    Day {concept.dayNumber} • {concept.completedTasks}/{concept.totalTasks} tasks
                  </div>
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-white font-bold">{concept.progress}%</div>
                <div className="w-16 bg-white/10 rounded-full h-2 mt-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      concept.isCompleted ? 'bg-green-400' : 'bg-purple-400'
                    }`}
                    style={{ width: `${concept.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
