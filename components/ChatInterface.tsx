import React, { useState, useRef, useEffect } from 'react';
import { ClassicButton } from './ClassicButton';
import { PixelUserIcon } from './icons/PixelUserIcon';
import { PixelBotIcon } from './icons/PixelBotIcon';
import { PixelSendIcon } from './icons/PixelSendIcon';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  context?: string;
  onGenerateFlashcards?: () => void;
  onGenerateQuiz?: () => void;
  renderInputArea?: (props: {
    input: string;
    setInput: (value: string) => void;
    handleSend: () => void;
  }) => React.ReactNode;
}

export function ChatInterface({ context, onGenerateFlashcards, onGenerateQuiz, renderInputArea }: ChatInterfaceProps) {
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
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    // Check for special commands
    if (input.toLowerCase().includes('flashcard')) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'll generate flashcards for you! Click the 'Generate Flashcards' button in the Quick Actions section to view them.",
        timestamp: new Date()
      };
      setMessages([...messages, userMessage, assistantMessage]);
      if (onGenerateFlashcards) {
        setTimeout(() => onGenerateFlashcards(), 500);
      }
    } else if (input.toLowerCase().includes('quiz')) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'll create a quiz for you! Click the 'Generate Quiz' button in the Quick Actions section to start.",
        timestamp: new Date()
      };
      setMessages([...messages, userMessage, assistantMessage]);
      if (onGenerateQuiz) {
        setTimeout(() => onGenerateQuiz(), 500);
      }
    } else {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm a demo assistant. In a full implementation, I would provide intelligent responses based on your notes, documents, or video content. Try asking me to create flashcards or a quiz!",
        timestamp: new Date()
      };
      setMessages([...messages, userMessage, assistantMessage]);
    }

    setInput('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f5f5f5]" style={{ minHeight: 0 }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 mb-1">
                <PixelBotIcon size={32} />
              </div>
            )}
            <div className={message.role === 'user' ? 'chat-message-user' : 'chat-message-assistant'}>
              <p className="text-lg whitespace-pre-wrap" style={{ fontFamily: 'VT323, monospace' }}>
                {message.content}
              </p>
              <p className="text-sm opacity-60 mt-1" style={{ fontFamily: 'VT323, monospace' }}>
                {formatTime(message.timestamp)}
              </p>
            </div>
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
        renderInputArea({ input, setInput, handleSend })
      ) : (
        <div className="p-4 bg-[#ffffff] border-t-2 border-black">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="mac-input flex-1"
            />
            <ClassicButton onClick={handleSend}>
              <div className="flex items-center gap-2">
                <span>Send</span>
                <PixelSendIcon size={16} />
              </div>
            </ClassicButton>
          </div>
        </div>
      )}
    </div>
  );
}
