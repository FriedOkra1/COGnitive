import React, { useState, useRef, useMemo } from 'react';
import { ChatInterface, Message } from './ChatInterface';
import { ClassicButton } from './ClassicButton';
import { PixelPlusIcon } from './icons/PixelPlusIcon';
import { PixelUploadIcon } from './icons/PixelUploadIcon';
import { PixelMicIcon } from './icons/PixelMicIcon';
import { PixelSendIcon } from './icons/PixelSendIcon';
import { PixelStopIcon } from './icons/PixelStopIcon';
import { PixelVideoIcon } from './icons/PixelVideoIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';
import { FlashcardViewer } from './FlashcardViewer';
import { QuizViewer } from './QuizViewer';
import { 
  uploadDocument, 
  uploadAudio, 
  sendChatMessage,
  analyzeYouTubeVideo,
  generateFlashcards,
  generateQuiz,
  Flashcard,
  QuizQuestion
} from '../services/api';

interface SimpleChatbotProps {
  onBack?: () => void;
}

interface UploadedItem {
  id: string;
  type: 'document' | 'voice' | 'image' | 'youtube';
  fileName: string;
  content: string;
  imageData?: string; // base64 data URL for images
  timestamp: Date;
  active: boolean;
}

interface ChatTab {
  id: string;
  name: string;
  uploadedItems: UploadedItem[];
  systemMessages: Message[];
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  showFlashcards: boolean;
  showQuiz: boolean;
}

export function SimpleChatbot(_props: SimpleChatbotProps) {
  // Tab state management
  const [tabs, setTabs] = useState<ChatTab[]>([{
    id: 'tab-1',
    name: 'Chat 1',
    uploadedItems: [],
    systemMessages: [],
    flashcards: [],
    quizQuestions: [],
    showFlashcards: false,
    showQuiz: false,
  }]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // YouTube modal state
  const [showYouTubeModal, setShowYouTubeModal] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isAnalyzingYoutube, setIsAnalyzingYoutube] = useState(false);
  
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get current active tab
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  
  // Helper to update active tab
  const updateActiveTab = (updates: Partial<ChatTab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    ));
  };
  
  // Tab management functions
  const createNewTab = () => {
    const newTabNumber = tabs.length + 1;
    const newTab: ChatTab = {
      id: `tab-${Date.now()}`,
      name: `Chat ${newTabNumber}`,
      uploadedItems: [],
      systemMessages: [],
      flashcards: [],
      quizQuestions: [],
      showFlashcards: false,
      showQuiz: false,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };
  
  const closeTab = (tabId: string) => {
    if (tabs.length === 1) return; // Don't close last tab
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    setTabs(newTabs);
    
    // If closing active tab, switch to adjacent tab
    if (tabId === activeTabId) {
      const newActiveIndex = Math.min(tabIndex, newTabs.length - 1);
      setActiveTabId(newTabs[newActiveIndex].id);
    }
  };
  
  const clearCurrentTab = () => {
    updateActiveTab({
      uploadedItems: [],
      systemMessages: [],
      flashcards: [],
      quizQuestions: [],
      showFlashcards: false,
      showQuiz: false,
    });
  };

  // Build context from all active items
  const buildContext = useMemo(() => {
    const activeItems = activeTab.uploadedItems.filter(item => item.active);
    if (activeItems.length === 0) return '';
    
    const contexts = activeItems.map(item => {
      if (item.type === 'document') {
        return `Document "${item.fileName}":\n${item.content}`;
      } else if (item.type === 'voice') {
        return `Voice note "${item.fileName}":\n${item.content}`;
      } else if (item.type === 'youtube') {
        return `YouTube video "${item.fileName}":\n${item.content}`;
      } else {
        return `Image "${item.fileName}": [Image content will be sent with message]`;
      }
    });
    
    return contexts.join('\n\n---\n\n');
  }, [activeTab.uploadedItems]);

  // Extract active image data URLs
  const activeImages = useMemo(() => {
    return activeTab.uploadedItems
      .filter(item => item.active && item.type === 'image' && item.imageData)
      .map(item => item.imageData!);
  }, [activeTab.uploadedItems]);

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
    updateActiveTab({
      systemMessages: [...activeTab.systemMessages, newMessage]
    });
  };

  const addAssistantMessage = async (content: string, context?: string, includeImages: boolean = true) => {
    try {
      // Get current active images if includeImages is true
      const imagesToSend = includeImages 
        ? activeTab.uploadedItems
            .filter(item => item.active && item.type === 'image' && item.imageData)
            .map(item => item.imageData!)
        : undefined;
      
      const response = await sendChatMessage([
        { role: 'user', content: content }
      ], context, imagesToSend);
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      updateActiveTab({
        systemMessages: [...activeTab.systemMessages, assistantMessage]
      });
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I encountered an error processing your request: ${error.message}`,
        timestamp: new Date()
      };
      updateActiveTab({
        systemMessages: [...activeTab.systemMessages, errorMessage]
      });
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
      updateActiveTab({
        uploadedItems: [...activeTab.uploadedItems, newItem]
      });
      
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
          updateActiveTab({
            uploadedItems: [...activeTab.uploadedItems, newItem]
          });
          
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

  const handleYouTubeAnalyze = async () => {
    if (!youtubeUrl.trim()) return;

    setShowYouTubeModal(false);
    setShowPlusMenu(false);
    setIsAnalyzingYoutube(true);
    addSystemMessage('Analyzing YouTube video...');

    try {
      const result = await analyzeYouTubeVideo(youtubeUrl);
      
      // Add to uploaded items
      const newItem: UploadedItem = {
        id: Date.now().toString(),
        type: 'youtube',
        fileName: result.title || 'YouTube Video',
        content: result.transcript,
        timestamp: new Date(),
        active: true
      };
      updateActiveTab({
        uploadedItems: [...activeTab.uploadedItems, newItem]
      });
      
      // Add success message
      addSystemMessage(`YouTube video analyzed: ${result.title}`);
      
      // Auto-generate AI response with summary
      await addAssistantMessage(
        `I've analyzed the YouTube video "${result.title}". Here's a summary:\n\n${result.summary}\n\nFeel free to ask me any questions about the video!`,
        result.transcript,
        false
      );
      
      setYoutubeUrl('');
    } catch (error: any) {
      addSystemMessage(`YouTube analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzingYoutube(false);
    }
  };

  // Generate flashcards from all active context
  const handleGenerateFlashcards = async () => {
    const activeContext = buildContext;
    if (!activeContext) {
      addSystemMessage('Please upload a document, voice note, or YouTube video first.');
      return;
    }

    setIsGeneratingFlashcards(true);
    updateActiveTab({ showFlashcards: true, showQuiz: false });
    addSystemMessage('Generating flashcards from your content...');

    try {
      const cards = await generateFlashcards(activeContext, 15);
      updateActiveTab({ flashcards: cards });
      addSystemMessage('Flashcards generated successfully!');
    } catch (error: any) {
      addSystemMessage(`Failed to generate flashcards: ${error.message}`);
      updateActiveTab({ showFlashcards: false });
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Generate quiz from all active context
  const handleGenerateQuiz = async () => {
    const activeContext = buildContext;
    if (!activeContext) {
      addSystemMessage('Please upload a document, voice note, or YouTube video first.');
      return;
    }

    setIsGeneratingQuiz(true);
    updateActiveTab({ showQuiz: true, showFlashcards: false });
    addSystemMessage('Generating quiz from your content...');

    try {
      const questions = await generateQuiz(activeContext, 10);
      updateActiveTab({ quizQuestions: questions });
      addSystemMessage('Quiz generated successfully!');
    } catch (error: any) {
      addSystemMessage(`Failed to generate quiz: ${error.message}`);
      updateActiveTab({ showQuiz: false });
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleUpdateFlashcard = (id: string, front: string, back: string) => {
    updateActiveTab({
      flashcards: activeTab.flashcards.map(card =>
        card.id === id ? { ...card, front, back } : card
      )
    });
  };

  const handleUpdateQuestion = (
    id: string,
    question: string,
    options?: string[],
    correctAnswer?: string | number
  ) => {
    updateActiveTab({
      quizQuestions: activeTab.quizQuestions.map(q =>
        q.id === id
          ? { ...q, question, options, correctAnswer: correctAnswer ?? q.correctAnswer }
          : q
      )
    });
  };

  const toggleItemActive = (id: string) => {
    updateActiveTab({
      uploadedItems: activeTab.uploadedItems.map(item =>
        item.id === id ? { ...item, active: !item.active } : item
      )
    });
  };

  const removeItem = (id: string) => {
    updateActiveTab({
      uploadedItems: activeTab.uploadedItems.filter(item => item.id !== id)
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      {/* Tab Bar */}
      <div className="mac-fieldset">
        <div className="mac-fieldset-legend">Chat Tabs</div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap flex-1">
            {tabs.map(tab => (
              <div
                key={tab.id}
                className={`flex items-center gap-2 ${tab.id === activeTabId ? 'mac-button active' : 'mac-button'}`}
              >
                <button
                  onClick={() => setActiveTabId(tab.id)}
                  className="text-lg px-2"
                >
                  {tab.name}
                </button>
                {tabs.length > 1 && (
                  <button
                    onClick={() => closeTab(tab.id)}
                    className="text-sm opacity-70 hover:opacity-100 px-1"
                    aria-label="Close tab"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <ClassicButton onClick={createNewTab}>
            <div className="flex items-center gap-2">
              <PixelPlusIcon size={16} />
              <span>New Tab</span>
            </div>
          </ClassicButton>
          <ClassicButton onClick={clearCurrentTab}>
            <span>Clear Chat</span>
          </ClassicButton>
        </div>
      </div>

      {/* YouTube Modal */}
      {showYouTubeModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={() => setShowYouTubeModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="mac-card max-w-2xl w-full p-6">
              <div className="mac-fieldset">
                <div className="mac-fieldset-legend">Analyze YouTube Video</div>
                <div className="space-y-4">
                  <p className="text-lg">Enter a YouTube URL to analyze the video content:</p>
                  <input
                    type="text"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleYouTubeAnalyze()}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mac-input w-full"
                    autoFocus
                  />
                  <div className="flex gap-3 justify-end">
                    <ClassicButton onClick={() => {
                      setShowYouTubeModal(false);
                      setYoutubeUrl('');
                    }}>
                      Cancel
                    </ClassicButton>
                    <ClassicButton onClick={handleYouTubeAnalyze} disabled={!youtubeUrl.trim()}>
                      Analyze
                    </ClassicButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Uploaded Items Section */}
      {activeTab.uploadedItems.length > 0 && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Uploaded Context ({activeTab.uploadedItems.filter(i => i.active).length} active)</div>
          <div className="flex flex-wrap gap-2">
            {activeTab.uploadedItems.map(item => (
              <div
                key={item.id}
                className={`mac-button px-3 py-2 flex items-center gap-2 ${item.active ? 'active' : 'opacity-50'}`}
              >
                <button
                  onClick={() => toggleItemActive(item.id)}
                  className="flex items-center gap-2"
                >
                  <span className="text-base">
                    {item.type === 'document' ? 'DOC' : 
                     item.type === 'voice' ? 'VOICE' : 
                     item.type === 'youtube' ? 'VIDEO' : 'IMG'}
                  </span>
                  <span className="text-base">{item.fileName}</span>
                  {item.active && <span className="text-sm">✓</span>}
                </button>
                {item.type === 'image' && item.imageData && (
                  <img 
                    src={item.imageData} 
                    alt={item.fileName}
                    className="h-8 w-8 object-cover border border-black ml-2"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )}
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
          images={activeImages}
          externalMessages={activeTab.systemMessages}
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

                          {/* YouTube Analyzer */}
                          <button
                            onClick={() => {
                              setShowYouTubeModal(true);
                              setShowPlusMenu(false);
                            }}
                            className="plus-menu-item text-left px-4 py-4 flex items-center gap-3 whitespace-nowrap"
                            disabled={isAnalyzingYoutube}
                          >
                            <PixelVideoIcon size={20} />
                            <span className="text-lg">Analyze YouTube</span>
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

      {/* Quick Actions - Quiz and Flashcards */}
      {activeTab.uploadedItems.filter(i => i.active).length > 0 && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Study Tools</div>
          <div className="flex gap-4 flex-wrap">
            <ClassicButton
              onClick={handleGenerateFlashcards}
              disabled={isGeneratingFlashcards}
            >
              <div className="flex items-center gap-2">
                <PixelFlashcardIcon size={20} />
                <span>{isGeneratingFlashcards ? 'Generating...' : 'Generate Flashcards'}</span>
              </div>
            </ClassicButton>
            <ClassicButton
              onClick={handleGenerateQuiz}
              disabled={isGeneratingQuiz}
            >
              <div className="flex items-center gap-2">
                <PixelQuizIcon size={20} />
                <span>{isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}</span>
              </div>
            </ClassicButton>
          </div>
        </div>
      )}

      {/* Flashcards Section */}
      {activeTab.showFlashcards && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Flashcards</div>
          {isGeneratingFlashcards ? (
            <div className="mac-card p-8 text-center">
              <div className="flex justify-center mb-4">
                <PixelFlashcardIcon size={64} />
              </div>
              <p className="text-2xl mb-2">Generating Flashcards...</p>
              <p className="text-lg opacity-70">This may take a moment</p>
            </div>
          ) : activeTab.flashcards.length > 0 ? (
            <FlashcardViewer
              flashcards={activeTab.flashcards}
              onUpdateFlashcard={handleUpdateFlashcard}
            />
          ) : (
            <div className="mac-card p-8 text-center">
              <p className="text-xl">No flashcards generated yet</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Section */}
      {activeTab.showQuiz && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Quiz</div>
          {isGeneratingQuiz ? (
            <div className="mac-card p-8 text-center">
              <div className="flex justify-center mb-4">
                <PixelQuizIcon size={64} />
              </div>
              <p className="text-2xl mb-2">Generating Quiz...</p>
              <p className="text-lg opacity-70">Creating questions from your content</p>
            </div>
          ) : activeTab.quizQuestions.length > 0 ? (
            <QuizViewer
              questions={activeTab.quizQuestions}
              onUpdateQuestion={handleUpdateQuestion}
            />
          ) : (
            <div className="mac-card p-8 text-center">
              <p className="text-xl">No quiz questions generated yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
