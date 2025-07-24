"use client";

import ReactMarkdown from 'react-markdown';

interface SelectedContent {
  type: 'project' | 'concept' | 'subtopic' | 'task';
  title: string;
  description: string;
}

interface ContentDisplayProps {
  selectedContent: SelectedContent;
  onVerifyTask: (taskTitle: string) => void;
}

export default function ContentDisplay({ selectedContent, onVerifyTask }: ContentDisplayProps) {
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
      
      {/* Verify Task Button for tasks */}
      {selectedContent.type === 'task' && (
        <div className="mt-8 pt-6 border-t border-white/20">
          <button
            onClick={() => onVerifyTask(selectedContent.title)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verify Task
          </button>
        </div>
      )}
    </div>
  );
} 