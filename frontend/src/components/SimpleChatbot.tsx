import React, { useState, useRef, useMemo } from 'react';
import { ChatInterface, Message } from './ChatInterface';
import { ClassicButton } from './ClassicButton';
import { PixelPlusIcon } from './icons/PixelPlusIcon';
import { PixelUploadIcon } from './icons/PixelUploadIcon';
import { PixelMicIcon } from './icons/PixelMicIcon';
import { PixelSendIcon } from './icons/PixelSendIcon';
import { PixelStopIcon } from './icons/PixelStopIcon';
import { uploadDocument, uploadAudio, sendChatMessage } from '../services/api';

interface SimpleChatbotProps {
  onBack: () => void;
}

interface UploadedItem {
  id: string;
  type: 'document' | 'voice';
  fileName: string;
  content: string;
  timestamp: Date;
  active: boolean;
}

export function SimpleChatbot({ onBack }: SimpleChatbotProps) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([]);
  const [systemMessages, setSystemMessages] = useState<Message[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Build context from all active items
  const buildContext = useMemo(() => {
    const activeItems = uploadedItems.filter(item => item.active);
    if (activeItems.length === 0) return '';
    
    const contexts = activeItems.map(item => {
      if (item.type === 'document') {
        return `Document "${item.fileName}":\n${item.content}`;
      } else {
        return `Voice note "${item.fileName}":\n${item.content}`;
      }
    });
    
    return contexts.join('\n\n---\n\n');
  }, [uploadedItems]);

  const handlePlusClick = () => {
    setShowPlusMenu(!showPlusMenu);
  };

  const addSystemMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content,
      timestamp: new Date()
    };
    setSystemMessages(prev => [...prev, newMessage]);
  };

  const addAssistantMessage = async (content: string, context?: string) => {
    try {
      const response = await sendChatMessage([
        { role: 'user', content: content }
      ], context);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setSystemMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I encountered an error processing your request: ${error.message}`,
        timestamp: new Date()
      };
      setSystemMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setShowPlusMenu(false);
    setIsUploading(true);
    addSystemMessage('Uploading document...');

    try {
      const result = await uploadDocument(file);
      
      // Add to uploaded items
      const newItem: UploadedItem = {
        id: Date.now().toString(),
        type: 'document',
        fileName: result.fileName,
        content: result.text,
        timestamp: new Date(),
        active: true
      };
      setUploadedItems(prev => [...prev, newItem]);
      
      // Add success message
      addSystemMessage(`Document uploaded: ${result.fileName}`);
      
      // Auto-generate AI response about the document
      await addAssistantMessage(
        `Please analyze and summarize the document "${result.fileName}" that I just uploaded. Highlight the key points and main topics.`,
        result.text
      );
    } catch (error: any) {
      addSystemMessage(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        addSystemMessage('Transcribing audio...');
        
        try {
          const transcription = await uploadAudio(audioBlob);
          
          // Add to uploaded items
          const newItem: UploadedItem = {
            id: Date.now().toString(),
            type: 'voice',
            fileName: `Voice note ${new Date().toLocaleTimeString()}`,
            content: transcription,
            timestamp: new Date(),
            active: true
          };
          setUploadedItems(prev => [...prev, newItem]);
          
          // Add success message
          addSystemMessage(`Voice note transcribed: "${transcription.substring(0, 50)}..."`);
          
          // Auto-generate AI response about the voice note
          await addAssistantMessage(
            `I've transcribed a voice note. Please analyze and summarize the key points from this audio content.`,
            transcription
          );
        } catch (error: any) {
          addSystemMessage(`Transcription failed: ${error.message}`);
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      addSystemMessage('Recording started... Click Voice Input again to stop');
    } catch (error: any) {
      addSystemMessage(`Microphone access denied: ${error.message}`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = () => {
    setShowPlusMenu(false);
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleItemActive = (id: string) => {
    setUploadedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setUploadedItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      {/* Uploaded Items Section */}
      {uploadedItems.length > 0 && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Uploaded Context ({uploadedItems.filter(i => i.active).length} active)</div>
          <div className="flex flex-wrap gap-2">
            {uploadedItems.map(item => (
              <div
                key={item.id}
                className={`mac-button px-3 py-2 flex items-center gap-2 ${item.active ? 'active' : 'opacity-50'}`}
              >
                <button
                  onClick={() => toggleItemActive(item.id)}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">{item.type === 'document' ? 'DOC' : 'VOICE'}</span>
                  <span className="text-base">{item.fileName}</span>
                  {item.active && <span className="text-sm">✓</span>}
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-sm opacity-70 hover:opacity-100 ml-1"
                  aria-label="Remove"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chat Interface */}
      <div className="mac-fieldset flex-1 flex flex-col" style={{ minHeight: 0 }}>
        <div className="mac-fieldset-legend">Chat</div>
        <ChatInterface 
          context={buildContext}
          externalMessages={systemMessages}
          renderInputArea={({ input, setInput, handleSend, isLoading }) => (
            <div className="p-4 bg-[#ffffff] border-t-2 border-black">
              <div className="flex gap-2">
                {/* Plus Button with Menu */}
                <div className="relative">
                  <button
                    onClick={handlePlusClick}
                    className="plus-button px-3 py-2 h-full"
                    aria-label="Additional actions"
                    disabled={isUploading}
                  >
                    <PixelPlusIcon size={20} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showPlusMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPlusMenu(false)}
                      />
                      
                      <div className="absolute bottom-full left-0 mb-2 bg-white border-2 border-black min-w-[220px] z-50 p-2">
                        <div className="flex flex-col gap-3">
                          {/* Upload Document */}
                          <label className="plus-menu-item text-left px-4 py-4 cursor-pointer flex items-center gap-3 whitespace-nowrap">
                            <PixelUploadIcon size={20} />
                            <span className="text-lg">Upload Document</span>
                            <input
                              type="file"
                              onChange={handleFileUpload}
                              accept=".pdf,.doc,.docx,.txt"
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                          
                          {/* Voice Input */}
                          <button
                            onClick={handleVoiceInput}
                            className="plus-menu-item text-left px-4 py-4 flex items-center gap-3 whitespace-nowrap"
                          >
                            {isRecording ? <PixelStopIcon size={20} /> : <PixelMicIcon size={20} />}
                            <span className="text-lg">{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                
                {/* Input */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && !isUploading && handleSend()}
                  placeholder={isUploading ? "Uploading..." : isLoading ? "AI is thinking..." : "Type your message..."}
                  disabled={isLoading || isUploading}
                  className="mac-input flex-1"
                />
                
                {/* Send Button */}
                <ClassicButton onClick={handleSend} disabled={isLoading || isUploading}>
                  <div className="flex items-center gap-2">
                    <span>{isLoading ? 'Sending...' : 'Send'}</span>
                    <PixelSendIcon size={16} />
                  </div>
                </ClassicButton>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
