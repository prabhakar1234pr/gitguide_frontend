"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import ReactMarkdown from 'react-markdown';
import { sendChatMessage, getChatContext, checkChatHealth } from '../../services/api';

interface FloatingChatWidgetProps {
  projectId: string;
  activeDayNumber?: number;
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
  project_name?: string;
}

export default function FloatingChatWidget({ projectId, activeDayNumber }: FloatingChatWidgetProps) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHealth, setChatHealth] = useState<ChatHealth | null>(null);
  const [contextInfo, setContextInfo] = useState<ContextInfo | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat on component mount
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Check chat service health
        const health = await checkChatHealth();
        setChatHealth(health);

        // Get context information
        const context = await getChatContext(parseInt(projectId), getToken);
        setContextInfo(context);

        const dayContextMessage = activeDayNumber !== undefined ? `You're currently on Day ${activeDayNumber}. ` : '';
        const welcomeMessage: Message = {
          id: '1',
          type: 'assistant',
          content: `Hi! I'm your AI learning assistant with full knowledge of the **${context.project_name || 'Prabhakar_Elavala_Portfolio'}** repository. ${dayContextMessage}I have access to ${context.repo_files_count} source files, ${context.concepts_count} learning concepts, and your current progress. Ask me anything about the code, concepts, or learning path!`,
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
  }, [projectId, getToken, activeDayNumber]);

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

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {messages.length > 1 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messages.length - 1}
            </div>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isExpanded ? 'w-96 h-[600px]' : 'w-80 h-96'
    }`}>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${chatHealth?.status === 'available' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-xs text-gray-300">
                  {chatHealth?.status === 'available' ? 'Ready' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-white transition-colors"
              title={isExpanded ? "Minimize" : "Expand"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isExpanded ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                )}
              </svg>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Context Info */}
        {contextInfo && (
          <div className="px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-4 text-xs text-gray-300">
              <div>📁 {contextInfo.repo_files_count} files analyzed</div>
              <div>🎯 {contextInfo.concepts_count} concepts generated</div>
              {activeDayNumber !== undefined && <div>📅 Active Day: {activeDayNumber}</div>}
              <div className={`w-2 h-2 rounded-full ${contextInfo.is_processed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span>{contextInfo.is_processed ? 'Ready' : 'Processing'}</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                message.type === 'user' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                  : 'bg-white/10 text-gray-200 border border-white/20'
              }`}>
                {message.type === 'assistant' ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      code: ({ children }) => <code className="bg-white/20 px-1 py-0.5 rounded text-sm">{children}</code>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your learning journey..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
