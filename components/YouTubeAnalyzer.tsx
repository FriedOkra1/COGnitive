import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { ChatInterface } from './ChatInterface';
import { PixelVideoIcon } from './icons/PixelVideoIcon';
import { PixelChatIcon } from './icons/PixelChatIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';

interface YouTubeAnalyzerProps {
  onBack: () => void;
}

export function YouTubeAnalyzer({ onBack }: YouTubeAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [hasVideo, setHasVideo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [summary, setSummary] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  const handleAnalyze = () => {
    if (!url.trim()) return;
    
    setHasVideo(true);
    setVideoTitle('Sample Educational Video');
    setSummary('VIDEO SUMMARY\n\nOVERVIEW:\nThis is an automatically generated summary of the YouTube video content.\n\nKEY POINTS:\n- Main concept 1 discussed in the video\n- Important topic 2 covered\n- Critical information 3 explained\n\nTIMESTAMPS:\n- 0:00 - Introduction\n- 2:30 - Main topic begins\n- 5:45 - Key explanation\n- 8:20 - Conclusion\n\nDETAILED NOTES:\nThe video content has been transcribed and organized into structured notes for your study.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* URL Input */}
      <div className="mac-fieldset">
        <div className="mac-fieldset-legend">Enter YouTube URL</div>
        <div className="flex gap-3 flex-wrap">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            placeholder="https://youtube.com/watch?v=..."
            className="mac-input flex-1 min-w-[200px]"
          />
          <ClassicButton onClick={handleAnalyze}>
            Analyze
          </ClassicButton>
        </div>
      </div>

      {hasVideo && (
        <>
          {/* Video Info */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Video Information</div>
            <div className="flex items-center gap-4">
              <PixelVideoIcon size={48} />
              <div>
                <p className="text-xl mb-1">Video Analyzed</p>
                <p className="text-lg opacity-70">{videoTitle}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Quick Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClassicButton onClick={() => {
                setShowChat(!showChat);
                setShowFlashcards(false);
                setShowQuiz(false);
              }}>
                <div className="flex items-center justify-center gap-2">
                  <PixelChatIcon size={24} />
                  <span>Chat about Video</span>
                </div>
              </ClassicButton>
              <ClassicButton onClick={() => {
                setShowFlashcards(!showFlashcards);
                setShowChat(false);
                setShowQuiz(false);
              }}>
                <div className="flex items-center justify-center gap-2">
                  <PixelFlashcardIcon size={24} />
                  <span>Create Flashcards</span>
                </div>
              </ClassicButton>
              <ClassicButton onClick={() => {
                setShowQuiz(!showQuiz);
                setShowChat(false);
                setShowFlashcards(false);
              }}>
                <div className="flex items-center justify-center gap-2">
                  <PixelQuizIcon size={24} />
                  <span>Generate Quiz</span>
                </div>
              </ClassicButton>
            </div>
          </div>

          {/* Video Summary */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Video Summary & Transcript</div>
            <div className="mac-card">
              <pre className="whitespace-pre-wrap text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                {summary}
              </pre>
            </div>
          </div>

          {/* Chat Interface */}
          {showChat && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Chat about the Video</div>
              <div className="h-[500px]">
                <ChatInterface 
                  context="the YouTube video"
                  onGenerateFlashcards={() => {
                    setShowFlashcards(true);
                    setShowChat(false);
                  }}
                  onGenerateQuiz={() => {
                    setShowQuiz(true);
                    setShowChat(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Flashcards */}
          {showFlashcards && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Flashcards</div>
              <div className="mac-card p-8 text-center">
                <div className="flex justify-center mb-4">
                  <PixelFlashcardIcon size={64} />
                </div>
                <p className="text-2xl mb-2">Flashcard Set Generated</p>
                <p className="text-lg opacity-70 mb-6">15 flashcards created from the video content</p>
                
                <div className="max-w-md mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-4">Sample Flashcard 1</p>
                  <div className="h-[2px] bg-black mb-4" />
                  <p className="text-lg">Front: What is the video about?</p>
                  <p className="text-lg mt-3 opacity-70">Back: Overview of key topics</p>
                </div>
              </div>
            </div>
          )}

          {/* Quiz */}
          {showQuiz && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Quiz</div>
              <div className="mac-card p-8">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <PixelQuizIcon size={64} />
                  </div>
                  <p className="text-2xl mb-2">Quiz Generated</p>
                  <p className="text-lg opacity-70">10 questions created from the video</p>
                </div>
                
                <div className="max-w-2xl mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-3">Question 1:</p>
                  <p className="text-lg mb-4">What is the main topic covered in the video?</p>
                  <div className="space-y-2">
                    <div className="mac-button w-full text-left px-4 py-2">A) Option 1</div>
                    <div className="mac-button w-full text-left px-4 py-2">B) Option 2</div>
                    <div className="mac-button w-full text-left px-4 py-2">C) Option 3</div>
                    <div className="mac-button w-full text-left px-4 py-2">D) Option 4</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
