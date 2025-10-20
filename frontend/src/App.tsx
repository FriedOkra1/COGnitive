import { useState, useEffect } from 'react';
import { LectureRecording } from './components/LectureRecording';
import { SimpleChatbot } from './components/SimpleChatbot';
import { PageTitleBanner } from './components/PageTitleBanner';
import { PixelChatIcon } from './components/icons/PixelChatIcon';
import { PixelMicIcon } from './components/icons/PixelMicIcon';

type Page = 'recording' | 'chatbot';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    // Restore page from sessionStorage
    const saved = sessionStorage.getItem('currentPage');
    return (saved === 'chatbot' || saved === 'recording') ? saved : 'recording';
  });

  // Save page to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  if (currentPage === 'recording') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <PageTitleBanner title="COGNitive" />
        <div className="bg-white border-b-2 border-black flex items-center justify-center gap-4 px-6 py-3">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('recording')}
            disabled={true}
            style={{ opacity: 0.5, cursor: 'default' }}
          >
            <PixelMicIcon size={20} />
            <span className="text-xl hidden md:inline">Recording</span>
          </button>
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('chatbot')}
          >
            <PixelChatIcon size={20} />
            <span className="text-xl hidden md:inline">Chatbot</span>
          </button>
        </div>
        <div className="p-8 overflow-auto flex-1">
          <LectureRecording onBack={() => {}} />
        </div>
      </div>
    );
  }

  if (currentPage === 'chatbot') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <PageTitleBanner title="COGNitive" />
        <div className="bg-white border-b-2 border-black flex items-center justify-center gap-4 px-6 py-3">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('recording')}
          >
            <PixelMicIcon size={20} />
            <span className="text-xl hidden md:inline">Recording</span>
          </button>
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('chatbot')}
            disabled={true}
            style={{ opacity: 0.5, cursor: 'default' }}
          >
            <PixelChatIcon size={20} />
            <span className="text-xl hidden md:inline">Chatbot</span>
          </button>
        </div>
        <div className="p-8 overflow-auto flex-1">
          <SimpleChatbot onBack={() => {}} />
        </div>
      </div>
    );
  }

  // This should never be reached, but just in case
  return null;
}
