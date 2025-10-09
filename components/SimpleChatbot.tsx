import React, { useState } from 'react';
import { ChatInterface } from './ChatInterface';
import { ClassicButton } from './ClassicButton';
import { PixelPlusIcon } from './icons/PixelPlusIcon';
import { PixelUploadIcon } from './icons/PixelUploadIcon';
import { PixelMicIcon } from './icons/PixelMicIcon';
import { PixelNoteIcon } from './icons/PixelNoteIcon';
import { PixelSendIcon } from './icons/PixelSendIcon';

interface SimpleChatbotProps {
  onBack: () => void;
}

export function SimpleChatbot({ onBack }: SimpleChatbotProps) {
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handlePlusClick = () => {
    setShowPlusMenu(!showPlusMenu);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAction('upload');
      setShowPlusMenu(false);
      // Show success message
      setTimeout(() => setSelectedAction(null), 3000);
    }
  };

  const handleVoiceInput = () => {
    setSelectedAction('voice');
    setIsRecording(true);
    setShowPlusMenu(false);
    // Simulate recording
    setTimeout(() => {
      setIsRecording(false);
      setSelectedAction(null);
    }, 3000);
  };

  const handleCreateNote = () => {
    setSelectedAction('note');
    setShowPlusMenu(false);
    // Create a new note
    setTimeout(() => setSelectedAction(null), 3000);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Status Messages */}
      {selectedAction && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 mac-card p-4 bg-white shadow-lg">
          {selectedAction === 'upload' && (
            <p className="text-lg">Document uploaded successfully!</p>
          )}
          {selectedAction === 'voice' && (
            <div className="flex items-center gap-3">
              <PixelMicIcon size={24} />
              <p className="text-lg">{isRecording ? 'Recording...' : 'Voice input complete!'}</p>
            </div>
          )}
          {selectedAction === 'note' && (
            <p className="text-lg">Creating new note...</p>
          )}
        </div>
      )}

      {/* Chat Interface */}
      <ChatInterface 
        renderInputArea={({ input, setInput, handleSend }) => (
          <div className="p-4 bg-[#ffffff] border-t-2 border-black">
            <div className="flex gap-2">
              {/* Plus Button with Menu */}
              <div className="relative">
                <button
                  onClick={handlePlusClick}
                  className="mac-button px-3 py-2 h-full"
                  aria-label="Additional actions"
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
                    
                    <div className="absolute bottom-full left-0 mb-2 mac-card bg-white shadow-lg border-2 border-black min-w-[200px] z-50">
                      <div className="flex flex-col">
                        {/* Upload Document */}
                        <label className="mac-button text-left px-4 py-3 cursor-pointer hover:bg-[#f5f5f5] border-b border-black flex items-center gap-3">
                          <PixelUploadIcon size={20} />
                          <span className="text-lg">Upload Document</span>
                          <input
                            type="file"
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                          />
                        </label>
                        
                        {/* Voice Input */}
                        <button
                          onClick={handleVoiceInput}
                          className="mac-button text-left px-4 py-3 hover:bg-[#f5f5f5] border-b border-black flex items-center gap-3"
                        >
                          <PixelMicIcon size={20} />
                          <span className="text-lg">Voice Input</span>
                        </button>
                        
                        {/* Create Note */}
                        <button
                          onClick={handleCreateNote}
                          className="mac-button text-left px-4 py-3 hover:bg-[#f5f5f5] flex items-center gap-3"
                        >
                          <PixelNoteIcon size={20} />
                          <span className="text-lg">Create Note</span>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
                className="mac-input flex-1"
              />
              
              {/* Send Button */}
              <ClassicButton onClick={handleSend}>
                <div className="flex items-center gap-2">
                  <span>Send</span>
                  <PixelSendIcon size={16} />
                </div>
              </ClassicButton>
            </div>
          </div>
        )}
      />
    </div>
  );
}
