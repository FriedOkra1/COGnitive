import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { ChatInterface } from './ChatInterface';
import { FlashcardViewer } from './FlashcardViewer';
import { QuizViewer } from './QuizViewer';
import { PixelVideoIcon } from './icons/PixelVideoIcon';
import { PixelChatIcon } from './icons/PixelChatIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';
import {
  analyzeYouTubeVideo,
  generateFlashcards as apiGenerateFlashcards,
  generateQuiz as apiGenerateQuiz,
  Flashcard,
  QuizQuestion,
} from '../services/api';

interface YouTubeAnalyzerProps {
  onBack: () => void;
}

export function YouTubeAnalyzer({ onBack }: YouTubeAnalyzerProps) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [summary, setSummary] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualTranscript, setManualTranscript] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  
  // Flashcards and quiz state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    setHasVideo(false);
    
    try {
      const result = await analyzeYouTubeVideo(url);
      
      setVideoId(result.videoId);
      setVideoTitle(result.title || 'YouTube Video');
      setTranscript(result.transcript);
      setSummary(result.summary);
      setHasVideo(true);
      setShowChat(false);
      setShowFlashcards(false);
      setShowQuiz(false);
      setFlashcards([]);
      setQuizQuestions([]);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze video. Please try again.';
      
      // Check if error suggests manual input
      if (errorMessage.includes('does not have captions') || errorMessage.includes('restrictions')) {
        setError(errorMessage);
        setShowManualInput(true);
      } else {
        setError(errorMessage);
        setHasVideo(false);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSubmit = async () => {
    if (!manualTranscript.trim()) {
      setError('Please enter a transcript');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      // Use the manual transcript as if it came from the video
      setVideoId('manual');
      setVideoTitle(manualTitle || 'YouTube Video');
      setTranscript(manualTranscript);
      
      // Generate summary from manual transcript
      const summaryResponse = await fetch('/api/youtube/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: manualTranscript })
      });
      
      if (summaryResponse.ok) {
        const { summary } = await summaryResponse.json();
        setSummary(summary);
      } else {
        setSummary('Manual transcript provided. Summary generation failed.');
      }
      
      setHasVideo(true);
      setShowChat(false);
      setShowFlashcards(false);
      setShowQuiz(false);
      setFlashcards([]);
      setQuizQuestions([]);
      setShowManualInput(false);
    } catch (err: any) {
      setError(err.message || 'Failed to process manual transcript');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!transcript) return;
    
    setIsGeneratingFlashcards(true);
    setShowFlashcards(true);
    setShowChat(false);
    setShowQuiz(false);
    
    try {
      const cards = await apiGenerateFlashcards(transcript, 15);
      setFlashcards(cards);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards');
      setShowFlashcards(false);
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!transcript) return;
    
    setIsGeneratingQuiz(true);
    setShowQuiz(true);
    setShowChat(false);
    setShowFlashcards(false);
    
    try {
      const questions = await apiGenerateQuiz(transcript, 10);
      setQuizQuestions(questions);
    } catch (err: any) {
      setError(err.message || 'Failed to generate quiz');
      setShowQuiz(false);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleUpdateFlashcard = (id: string, front: string, back: string) => {
    setFlashcards(cards =>
      cards.map(card =>
        card.id === id ? { ...card, front, back } : card
      )
    );
  };

  const handleUpdateQuestion = (
    id: string,
    question: string,
    options?: string[],
    correctAnswer?: string | number
  ) => {
    setQuizQuestions(questions =>
      questions.map(q =>
        q.id === id
          ? { ...q, question, options, correctAnswer: correctAnswer ?? q.correctAnswer }
          : q
      )
    );
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
            onKeyPress={(e) => e.key === 'Enter' && !isAnalyzing && handleAnalyze()}
            placeholder="https://youtube.com/watch?v=..."
            className="mac-input flex-1 min-w-[200px]"
            disabled={isAnalyzing}
          />
          <ClassicButton onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? 'Processing...' : 'Analyze'}
          </ClassicButton>
        </div>
        {isAnalyzing && (
          <div className="mt-3 p-4 bg-blue-100 border-2 border-blue-500">
            <p className="text-lg text-blue-700 mb-2">Downloading audio and transcribing with AI...</p>
            <p className="text-md text-blue-600">This may take 30-90 seconds depending on video length.</p>
          </div>
        )}
        {error && (
          <div className="mt-3 p-4 bg-red-100 border-2 border-red-500">
            <p className="text-lg text-red-700 whitespace-pre-line">{error}</p>
            {showManualInput && (
              <div className="mt-4">
                <p className="text-lg mb-3">Or manually enter the transcript:</p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Video title (optional)"
                    className="mac-input w-full"
                  />
                  <textarea
                    value={manualTranscript}
                    onChange={(e) => setManualTranscript(e.target.value)}
                    placeholder="Paste the video transcript here..."
                    className="mac-input w-full min-h-[200px]"
                    style={{ fontFamily: 'VT323, monospace' }}
                  />
                  <div className="flex gap-3">
                    <ClassicButton onClick={handleManualSubmit} disabled={isAnalyzing}>
                      {isAnalyzing ? 'Processing...' : 'Submit Transcript'}
                    </ClassicButton>
                    <ClassicButton onClick={() => {
                      setShowManualInput(false);
                      setError('');
                      setManualTranscript('');
                      setManualTitle('');
                    }}>
                      Cancel
                    </ClassicButton>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {hasVideo && (
        <>
          {/* Video Info */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Video Information</div>
            <div className="flex items-center gap-4 flex-wrap">
              <PixelVideoIcon size={48} />
              <div className="flex-1">
                <p className="text-xl mb-1">Video Analyzed Successfully</p>
                <p className="text-lg opacity-70">{videoTitle}</p>
                {videoId && (
                  <div className="mt-3">
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-2 border-black"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Quick Actions</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ClassicButton
                onClick={() => {
                  setShowChat(!showChat);
                  setShowFlashcards(false);
                  setShowQuiz(false);
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <PixelChatIcon size={24} />
                  <span>Chat about Video</span>
                </div>
              </ClassicButton>
              <ClassicButton
                onClick={handleGenerateFlashcards}
                disabled={isGeneratingFlashcards}
              >
                <div className="flex items-center justify-center gap-2">
                  <PixelFlashcardIcon size={24} />
                  <span>{isGeneratingFlashcards ? 'Generating...' : 'Create Flashcards'}</span>
                </div>
              </ClassicButton>
              <ClassicButton
                onClick={handleGenerateQuiz}
                disabled={isGeneratingQuiz}
              >
                <div className="flex items-center justify-center gap-2">
                  <PixelQuizIcon size={24} />
                  <span>{isGeneratingQuiz ? 'Generating...' : 'Generate Quiz'}</span>
                </div>
              </ClassicButton>
            </div>
          </div>

          {/* Video Summary */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Video Summary & Key Points</div>
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
                  context={`the YouTube video "${videoTitle}". Here is the full transcript for context: ${transcript.substring(0, 8000)}${transcript.length > 8000 ? '...(truncated for brevity, but you have the context)' : ''}`}
                  onGenerateFlashcards={() => {
                    handleGenerateFlashcards();
                  }}
                  onGenerateQuiz={() => {
                    handleGenerateQuiz();
                  }}
                />
              </div>
            </div>
          )}

          {/* Flashcards */}
          {showFlashcards && (
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
              ) : flashcards.length > 0 ? (
                <FlashcardViewer
                  flashcards={flashcards}
                  onUpdateFlashcard={handleUpdateFlashcard}
                />
              ) : (
                <div className="mac-card p-8 text-center">
                  <p className="text-xl">No flashcards generated yet</p>
                </div>
              )}
            </div>
          )}

          {/* Quiz */}
          {showQuiz && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Quiz</div>
              {isGeneratingQuiz ? (
                <div className="mac-card p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <PixelQuizIcon size={64} />
                  </div>
                  <p className="text-2xl mb-2">Generating Quiz...</p>
                  <p className="text-lg opacity-70">Creating questions from the video content</p>
                </div>
              ) : quizQuestions.length > 0 ? (
                <QuizViewer
                  questions={quizQuestions}
                  onUpdateQuestion={handleUpdateQuestion}
                />
              ) : (
                <div className="mac-card p-8 text-center">
                  <p className="text-xl">No quiz questions generated yet</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
