"use client";

import { useState } from 'react';

interface RegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: (prompt: string) => Promise<void>;
  type: 'project-overview' | 'whole-path' | 'concept' | 'subtopic' | 'task';
  itemName: string;
  description?: string;
}

export default function RegenerateModal({
  isOpen,
  onClose,
  onRegenerate,
  type,
  itemName,
  description
}: RegenerateModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please provide a prompt for regeneration');
      return;
    }

    try {
      setIsRegenerating(true);
      setError(null);
      await onRegenerate(prompt.trim());
      setPrompt('');
      onClose();
    } catch (error) {
      console.error('Regeneration failed:', error);
      setError(`Failed to regenerate: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClose = () => {
    if (!isRegenerating) {
      setPrompt('');
      setError(null);
      onClose();
    }
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'project-overview':
        return {
          title: 'Regenerate Project Overview',
          placeholder: 'e.g., "Make it more focused on advanced concepts" or "Add more details about the architecture patterns"',
          icon: (
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        };
      case 'whole-path':
        return {
          title: 'Regenerate Entire Learning Path',
          placeholder: 'e.g., "Focus more on testing and deployment" or "Make it beginner-friendly" or "Add performance optimization concepts"',
          icon: (
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )
        };
      case 'concept':
        return {
          title: 'Regenerate Concept',
          placeholder: 'e.g., "Add more practical examples" or "Focus on modern best practices" or "Include security considerations"',
          icon: (
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          )
        };
      case 'subtopic':
        return {
          title: 'Regenerate Subtopic',
          placeholder: 'e.g., "Make tasks more hands-on" or "Add debugging exercises" or "Include real-world scenarios"',
          icon: (
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          )
        };
      case 'task':
        return {
          title: 'Regenerate Task',
          placeholder: 'e.g., "Make it more challenging" or "Add step-by-step instructions" or "Focus on specific files"',
          icon: (
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          )
        };
    }
  };

  const typeInfo = getTypeInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {typeInfo.icon}
              <h2 className="text-2xl font-bold text-white">
                {typeInfo.title}
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isRegenerating}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Item Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">
              {itemName}
            </h3>
            {description && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {description.length > 200 ? `${description.slice(0, 200)}...` : description}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="regenerate-prompt" className="block text-sm font-medium text-gray-300 mb-3">
                What would you like to improve or change?
              </label>
              <textarea
                id="regenerate-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={typeInfo.placeholder}
                rows={4}
                disabled={isRegenerating}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Be specific about what you want to change. The AI will use your feedback to regenerate the content.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isRegenerating}
                className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegenerating || !prompt.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Regenerating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate with AI
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Warning Note */}
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.19 2.5 1.732 2.5z" />
              </svg>
              <div className="text-sm text-yellow-300">
                <p className="font-medium mb-1">Important:</p>
                <p>
                  Regenerating will {type === 'whole-path' ? 'completely replace your entire learning path' : 
                  type === 'concept' ? 'replace this concept and all its subtopics/tasks' :
                  type === 'subtopic' ? 'replace this subtopic and all its tasks' :
                  type === 'task' ? 'replace this specific task' :
                  'replace the project overview'}. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 