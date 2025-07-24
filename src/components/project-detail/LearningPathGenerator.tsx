"use client";

interface LearningPathGeneratorProps {
  isProcessing: boolean;
  processingStatus: string;
  agentError: string;
  onGenerateClick: () => void;
}

export default function LearningPathGenerator({ 
  isProcessing, 
  processingStatus, 
  agentError, 
  onGenerateClick 
}: LearningPathGeneratorProps) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-400 rounded-3xl flex items-center justify-center mx-auto">
          {isProcessing ? (
            <div className="animate-spin w-10 h-10 border-4 border-white border-t-transparent rounded-full"></div>
          ) : (
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold text-white">
            {isProcessing ? 'Generating Your Learning Path...' : 'Ready to Start Learning?'}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {isProcessing 
              ? 'Our AI is analyzing your repository and creating a personalized learning experience.' 
              : 'Let our AI analyze this repository and create a customized learning journey just for you.'
            }
          </p>
        </div>
      </div>

      {isProcessing ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="text-blue-300 text-lg">
              {processingStatus}
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 h-3 rounded-full animate-pulse transition-all duration-1000" 
                   style={{width: '60%'}}></div>
            </div>
            <p className="text-gray-400">
              This may take 1-3 minutes depending on repository size...
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={onGenerateClick}
            disabled={isProcessing}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-2xl hover:shadow-3xl text-lg"
          >
            🚀 Generate My Learning Path
          </button>
          
          {agentError && (
            <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {agentError}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 