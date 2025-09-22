"use client";

import ReactMarkdown from 'react-markdown';
import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { verifyTask } from '../../../services/api';

interface SelectedContent {
  type: 'project' | 'concept' | 'subconcept' | 'subtopic' | 'task';
  title: string;
  description: string;
  verification_type?: string;
  is_verified?: boolean;
  id?: string | number;
}

interface ContentDisplayProps {
  selectedContent: SelectedContent;
  onVerifyTask: (taskTitle: string, taskId?: string | number) => void;
  projectId: string;
}

export default function ContentDisplay({ selectedContent, onVerifyTask, projectId }: ContentDisplayProps) {
  const { getToken } = useAuth();
  const [verificationInput, setVerificationInput] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleVerification = async () => {
    if (!verificationInput.trim()) {
      setVerificationError('Please enter a URL');
      return;
    }

    if (selectedContent.id === undefined || selectedContent.id === null) {
      setVerificationError('Task ID not found');
      return;
    }

    let taskId: number;
    if (typeof selectedContent.id === 'string') {
      taskId = parseInt(selectedContent.id, 10);
    } else {
      taskId = selectedContent.id;
    }
    if (isNaN(taskId)) {
      setVerificationError('Task ID is not a valid integer');
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationError('');
      setVerificationSuccess(false);

      console.log('Verifying task:', selectedContent.verification_type, verificationInput);
      
      const result = await verifyTask(
        parseInt(projectId), 
        taskId, 
        verificationInput.trim(),
        getToken
      );
      
      if (result.success) {
        setVerificationSuccess(true);
        setVerificationInput('');
        
        // Update the selected content to show as verified
        selectedContent.is_verified = true;
      } else {
        setVerificationError(result.message || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  if (!selectedContent) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl text-center">
        <div className="text-gray-400 text-lg">
          Select an item from the learning path to view details
        </div>
      </div>
    );
  }

  const getIcon = () => {
    switch (selectedContent.type) {
      case 'project':
        return (
          <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'concept':
        return (
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'subconcept':
        return (
          <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'subtopic':
        return (
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'task':
        return (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
      <div className="flex items-center gap-3 mb-6">
        {getIcon()}
        <h2 className="text-2xl font-bold text-white">{selectedContent.title}</h2>
      </div>
      
      <div className="text-gray-300 leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown
          components={{
            // Custom styling for markdown elements in content display
            p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-300">{children}</p>,
            h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>,
            h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>,
            h4: ({ children }) => <h4 className="text-base font-bold mb-2 text-white">{children}</h4>,
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-gray-800 text-purple-300 px-2 py-1 rounded font-mono text-sm">
                  {children}
                </code>
              ) : (
                <code className="block bg-gray-800 text-green-300 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <pre className="bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4 border border-gray-700">
                {children}
              </pre>
            ),
            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
            em: ({ children }) => <em className="text-gray-200 italic">{children}</em>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">{children}</ol>,
            li: ({ children }) => <li className="text-gray-300">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-purple-400 pl-4 italic text-gray-300 mb-4 bg-white/5 py-2 rounded-r">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a href={href} className="text-blue-400 hover:text-blue-300 underline transition-colors" target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full border border-gray-600 rounded-lg">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-gray-800">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
            th: ({ children }) => <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>,
            td: ({ children }) => <td className="px-4 py-2 text-gray-300">{children}</td>,
          }}
        >
          {selectedContent.description}
        </ReactMarkdown>
      </div>
      
      {/* Task Verification Section */}
      {selectedContent.type === 'task' && selectedContent.verification_type && (
        <div className="mt-8 pt-6 border-t border-white/20">
          {selectedContent.is_verified ? (
            // Already verified - show persistent verification status
            <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-6 text-green-300">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span className="font-bold text-lg">✅ Task Verified Successfully!</span>
              </div>
              <p className="text-green-200">
                Congratulations! You have successfully completed this task. Your work has been verified and you can now proceed to the next task.
              </p>
              <div className="mt-4 p-3 bg-green-600/20 rounded-md">
                <span className="text-sm text-green-100">🎉 Well done! Keep up the great work on your learning journey.</span>
              </div>
            </div>
          ) : (
            // Verification form
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                {selectedContent.verification_type === 'github_profile' && 'Verify GitHub Profile'}
                {selectedContent.verification_type === 'repository_creation' && 'Verify Repository Creation'}
                {selectedContent.verification_type === 'commit_verification' && 'Verify Your Commit'}
              </h3>
              
              {/* Verification Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {selectedContent.verification_type === 'github_profile' && 'GitHub Profile URL'}
                  {selectedContent.verification_type === 'repository_creation' && 'Repository URL'}
                  {selectedContent.verification_type === 'commit_verification' && 'Repository URL (to check commits)'}
                </label>
                <input
                  type="url"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder={
                    selectedContent.verification_type === 'github_profile' 
                      ? 'https://github.com/yourusername'
                      : selectedContent.verification_type === 'repository_creation'
                      ? 'https://github.com/yourusername/project-gitguide'
                      : 'https://github.com/yourusername/project-gitguide'
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              
              {/* Enhanced Error Message */}
              {verificationError && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-red-300 font-semibold mb-2">❌ Verification Failed</h4>
                      <p className="text-red-200 text-sm mb-3">{verificationError}</p>
                      
                      {/* Helpful suggestions based on verification type */}
                      <div className="bg-red-600/20 rounded-md p-3">
                        <p className="text-red-100 text-sm font-medium mb-2">💡 Common Issues & Solutions:</p>
                        <ul className="text-red-100 text-xs space-y-1">
                          {selectedContent.verification_type === 'github_profile' && (
                            <>
                              <li>• Make sure your profile URL is public and accessible</li>
                              <li>• Verify the URL format: https://github.com/yourusername</li>
                              <li>• Check if your GitHub profile has recent activity</li>
                            </>
                          )}
                          {selectedContent.verification_type === 'repository_creation' && (
                            <>
                              <li>• Ensure the repository exists and is public</li>
                              <li>• Check the URL format: https://github.com/username/repo-name</li>
                              <li>• Verify the repository name matches the task requirements</li>
                            </>
                          )}
                          {selectedContent.verification_type === 'commit_verification' && (
                            <>
                              <li>• Make sure you have at least one commit in the repository</li>
                              <li>• Check if the repository is public or accessible</li>
                              <li>• Ensure your commits are pushed to the main/master branch</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Success Message */}
              {verificationSuccess && (
                <div className="text-green-400 text-sm bg-green-500/20 border border-green-500/50 rounded-lg p-3">
                  ✅ Verification successful! Great job!
                </div>
              )}
              
              {/* Verify Button */}
              <button
                onClick={() => handleVerification()}
                disabled={verificationLoading || !verificationInput.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {verificationLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Verify Task
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Regular task verify button for non-verification tasks */}
      {selectedContent.type === 'task' && !selectedContent.verification_type && (
        <div className="mt-8 pt-6 border-t border-white/20">
          <button
            onClick={() => onVerifyTask(selectedContent.title, selectedContent.id)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
} 