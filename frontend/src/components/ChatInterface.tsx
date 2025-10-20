import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ClassicButton } from './ClassicButton';
import { PixelUserIcon } from './icons/PixelUserIcon';
import { PixelBotIcon } from './icons/PixelBotIcon';
import { PixelSendIcon } from './icons/PixelSendIcon';
import { sendChatMessage, ChatMessage as ApiChatMessage } from '../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  context?: string;
  images?: string[];
  onGenerateFlashcards?: () => void;
  onGenerateQuiz?: () => void;
  externalMessages?: Message[];
  onAddMessage?: (message: Message) => void;
  renderInputArea?: (props: {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
    isLoading: boolean;
  }) => React.ReactNode;
}

export type { Message };

export function ChatInterface({ context, images, onGenerateFlashcards, onGenerateQuiz, externalMessages, onAddMessage, renderInputArea }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: context 
        ? `Hello! I'm ready to help you with ${context}. What would you like to know?`
        : "Hello! I'm your AI assistant. Ask me anything or request flashcards and quizzes!",
      timestamp: new Date()
    }
  ]);

  // Merge external messages from parent component
  useEffect(() => {
    if (externalMessages && externalMessages.length > 0) {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMessages = externalMessages.filter(m => !existingIds.has(m.id));
        return newMessages.length > 0 ? [...prev, ...newMessages] : prev;
      });
    }
  }, [externalMessages]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Check for special commands
      if (input.toLowerCase().includes('flashcard')) {
        const specialResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'll generate flashcards for you! Click the 'Generate Flashcards' button in the Quick Actions section to view them.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, specialResponse]);
        if (onGenerateFlashcards) {
          setTimeout(() => onGenerateFlashcards(), 500);
        }
        setIsLoading(false);
        return;
      }
      
      if (input.toLowerCase().includes('quiz')) {
        const specialResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'll create a quiz for you! Click the 'Generate Quiz' button in the Quick Actions section to start.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, specialResponse]);
        if (onGenerateQuiz) {
          setTimeout(() => onGenerateQuiz(), 500);
        }
        setIsLoading(false);
        return;
      }

      // Prepare messages for API (convert to API format, excluding initial greeting)
      const apiMessages: ApiChatMessage[] = messages
        .slice(1) // Skip the initial greeting
        .concat([userMessage])
        .map(msg => ({
          role: msg.role,
          content: msg.content,
        }));

      // Call the actual API with images if provided
      const responseText = await sendChatMessage(apiMessages, context, images);

      // Validate response is not empty
      if (!responseText || responseText.trim().length === 0) {
        throw new Error('Received an empty response from the server.');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f5f5f5]" style={{ minHeight: 0 }}>
        {messages.map((message) => (
          <div key={message.id} className={
            message.role === 'system' 
              ? 'flex justify-center' 
              : `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`
          }>
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mb-1">
                <PixelBotIcon size={32} />
              </div>
            )}
            {message.role === 'system' ? (
              <div className="chat-message-system">
                <div className="markdown-content text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p className="text-sm opacity-60 mt-1" style={{ fontFamily: 'VT323, monospace' }}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            ) : (
              <div className={message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}>
                <div className="markdown-content text-lg" style={{ fontFamily: 'VT323, monospace' }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
                <p className="text-sm opacity-60 mt-1" style={{ fontFamily: 'VT323, monospace' }}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            )}
            {message.role === 'user' && (
              <div className="flex-shrink-0 mb-1">
                <PixelUserIcon size={32} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      {renderInputArea ? (
        renderInputArea({ input, setInput, handleSend, isLoading })
      ) : (
        <div className="p-4 bg-[#ffffff] border-t-2 border-black">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
              disabled={isLoading}
              className="mac-input flex-1"
            />
            <ClassicButton onClick={handleSend} disabled={isLoading}>
              <div className="flex items-center gap-2">
                <span>{isLoading ? 'Sending...' : 'Send'}</span>
                <PixelSendIcon size={16} />
              </div>
            </ClassicButton>
          </div>
        </div>
      )}
    </div>
  );
}
