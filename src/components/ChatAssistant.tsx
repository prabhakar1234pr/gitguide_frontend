"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { sendChatMessage, getChatContext, checkChatHealth } from '../../services/api';

interface ChatAssistantProps {
  projectId: string;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextUsed?: {
    has_repo_files: boolean;
    has_learning_path: boolean;
    current_task: string | null;
    project_processed: boolean;
  };
}

interface ChatHealth {
  status: string;
}

interface ContextInfo {
  is_processed: boolean;
  repo_files_count: number;
  concepts_count: number;
  current_task: string | null;
}

export default function ChatAssistant({ projectId }: ChatAssistantProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHealth, setChatHealth] = useState<ChatHealth | null>(null);
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);

  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check chat service health
        const health = await checkChatHealth();
        setChatHealth(health);

        // Get project context
        const context = await getChatContext(parseInt(projectId), getToken);
        setContextInfo(context);

        // Set initial welcome message
        const welcomeMessage: Message = {
          id: '1',
          type: 'assistant',
          content: context.is_processed 
            ? `Hi! I'm your AI learning assistant with full knowledge of the **${context.project_name}** repository. I have access to ${context.repo_files_count} source files, ${context.concepts_count} learning concepts, and your current progress. ${context.current_task ? `You're working on: "${context.current_task}". ` : ''}Ask me anything about the code, concepts, or learning path!`
            : `Hi! I'm your AI learning assistant. I see you haven't generated a learning path for **${context.project_name}** yet. Once you process the repository, I'll have full access to the codebase and can provide detailed, context-aware guidance. For now, I can help with general questions!`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);

      } catch (error) {
        console.error('Failed to initialize chat:', error);
        const errorMessage: Message = {
          id: '1',
          type: 'assistant',
          content: 'Hi! I\'m your learning assistant, but I\'m having trouble connecting to my knowledge base right now. I can still try to help with general questions!',
          timestamp: new Date()
        };
        setMessages([errorMessage]);
      }
    };

    initializeChat();
  }, [projectId, getToken]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Call real AI API
      const response = await sendChatMessage(parseInt(projectId), messageToSend, getToken);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        contextUsed: response.context_used
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I\'m having trouble processing your message right now. Please try again in a moment.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-96 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-200 mb-2">
          AI Assistant
        </h2>
        <p className="text-gray-300 text-sm mb-3">
          Your learning companion
        </p>
        
        {/* Context Status */}
        {contextInfo && (
          <div className="bg-white/10 border border-white/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-300">Context Available:</span>
              <div className={`w-2 h-2 rounded-full ${contextInfo.is_processed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
            </div>
            
            {contextInfo.is_processed ? (
              <div className="text-xs text-gray-400 space-y-1">
                <div>📁 {contextInfo.repo_files_count} files analyzed</div>
                <div>🎯 {contextInfo.concepts_count} concepts generated</div>
                {contextInfo.current_task && <div>📝 Current: {contextInfo.current_task}</div>}
              </div>
            ) : (
              <div className="text-xs text-gray-400">
                Repository not processed yet
              </div>
            )}
          </div>
        )}
        
        {/* Health Status */}
        {chatHealth && (
          <div className="mt-2 text-xs text-gray-400">
            Status: {chatHealth.status === 'available' ? '🟢 Ready' : '🟡 Limited'}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'bg-white/10 text-gray-200 border border-white/20'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
              
              {/* Show context info for AI responses */}
              {message.type === 'assistant' && message.contextUsed && (
                <div className="mt-2 pt-2 border-t border-white/20">
                  <p className="text-xs opacity-60 mb-1">Context used:</p>
                  <div className="flex flex-wrap gap-1">
                    {message.contextUsed.has_repo_files && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        📁 Repo Files
                      </span>
                    )}
                    {message.contextUsed.has_learning_path && (
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                        🎯 Learning Path
                      </span>
                    )}
                    {message.contextUsed.current_task && (
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                        📝 Current Task
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 text-gray-200 border border-white/20 p-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your learning journey..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 text-white p-3 rounded-xl transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 