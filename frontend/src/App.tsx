import React, { useState } from 'react';
import { ClassicButton } from './components/ClassicButton';
import { LectureRecording } from './components/LectureRecording';
import { DocumentUpload } from './components/DocumentUpload';
import { YouTubeAnalyzer } from './components/YouTubeAnalyzer';
import { SimpleChatbot } from './components/SimpleChatbot';
import { PageTitleBanner } from './components/PageTitleBanner';
import { PixelMicIcon } from './components/icons/PixelMicIcon';
import { PixelDocIcon } from './components/icons/PixelDocIcon';
import { PixelVideoIcon } from './components/icons/PixelVideoIcon';
import { PixelChatIcon } from './components/icons/PixelChatIcon';
import { PixelBackIcon } from './components/icons/PixelBackIcon';

type Page = 'home' | 'recording' | 'document' | 'youtube' | 'chatbot';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  if (currentPage === 'recording') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <div className="bg-white border-b-3 border-black flex items-center gap-4 px-6 py-4">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('home')}
          >
            <PixelBackIcon size={20} />
            <span className="text-xl hidden md:inline">Back</span>
          </button>
          <h1 className="text-5xl flex-1 text-center">Lecture Recording</h1>
          <div className="w-[52px] md:w-[120px]" /> {/* Spacer for centering */}
        </div>
        <div className="p-8 overflow-auto flex-1">
          <LectureRecording onBack={() => setCurrentPage('home')} />
        </div>
      </div>
    );
  }

  if (currentPage === 'document') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <div className="bg-white border-b-3 border-black flex items-center gap-4 px-6 py-4">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('home')}
          >
            <PixelBackIcon size={20} />
            <span className="text-xl hidden md:inline">Back</span>
          </button>
          <h1 className="text-5xl flex-1 text-center">Document Upload</h1>
          <div className="w-[52px] md:w-[120px]" /> {/* Spacer for centering */}
        </div>
        <div className="p-8 overflow-auto flex-1">
          <DocumentUpload onBack={() => setCurrentPage('home')} />
        </div>
      </div>
    );
  }

  if (currentPage === 'youtube') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <div className="bg-white border-b-3 border-black flex items-center gap-4 px-6 py-4">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('home')}
          >
            <PixelBackIcon size={20} />
            <span className="text-xl hidden md:inline">Back</span>
          </button>
          <h1 className="text-5xl flex-1 text-center">YouTube Analyzer</h1>
          <div className="w-[52px] md:w-[120px]" /> {/* Spacer for centering */}
        </div>
        <div className="p-8 overflow-auto flex-1">
          <YouTubeAnalyzer onBack={() => setCurrentPage('home')} />
        </div>
      </div>
    );
  }

  if (currentPage === 'chatbot') {
    return (
      <div className="min-h-screen bg-[#c0c0c0] flex flex-col">
        <div className="bg-white border-b-3 border-black flex items-center gap-4 px-6 py-4">
          <button 
            className="mac-button flex items-center gap-2 px-3 md:px-6 py-2"
            onClick={() => setCurrentPage('home')}
          >
            <PixelBackIcon size={20} />
            <span className="text-xl hidden md:inline">Back</span>
          </button>
          <h1 className="text-5xl flex-1 text-center">AI Chatbot</h1>
          <div className="w-[52px] md:w-[120px]" /> {/* Spacer for centering */}
        </div>
        <div className="p-8 overflow-auto flex-1">
          <SimpleChatbot onBack={() => setCurrentPage('home')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-[#c0c0c0]">
      <div className="max-w-6xl w-full">
        {/* Welcome Header */}
        <div className="flex justify-center mb-12">
          <div className="w-full max-w-3xl">
            <PageTitleBanner title="COGnitive" />
          </div>
        </div>

        {/* Feature Grid - 2x2 on desktop, 1 column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Lecture Recording */}
          <div 
            className="feature-box"
            onClick={() => setCurrentPage('recording')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <PixelMicIcon size={80} />
              <p className="text-3xl">Lecture Recording</p>
              <p className="text-xl opacity-70">Record & Transcribe</p>
            </div>
          </div>

          {/* Document Upload */}
          <div 
            className="feature-box"
            onClick={() => setCurrentPage('document')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <PixelDocIcon size={80} />
              <p className="text-3xl">Document Upload</p>
              <p className="text-xl opacity-70">Upload & Analyze</p>
            </div>
          </div>

          {/* YouTube Analyzer */}
          <div 
            className="feature-box"
            onClick={() => setCurrentPage('youtube')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <PixelVideoIcon size={80} />
              <p className="text-3xl">YouTube Analyzer</p>
              <p className="text-xl opacity-70">Analyze Videos</p>
            </div>
          </div>

          {/* AI Chatbot */}
          <div 
            className="feature-box"
            onClick={() => setCurrentPage('chatbot')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <PixelChatIcon size={80} />
              <p className="text-3xl">AI Chatbot</p>
              <p className="text-xl opacity-70">Ask Questions</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="mac-card inline-block px-6 py-3">
            <p className="text-lg">Classic Macintosh • System 6 Inspired</p>
            <p className="text-base opacity-70">AI-Powered Study Companion</p>
          </div>
        </div>
      </div>
    </div>
  );
}
