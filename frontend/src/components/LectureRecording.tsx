import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { ChatInterface } from './ChatInterface';
import { PixelMicIcon } from './icons/PixelMicIcon';
import { PixelStopIcon } from './icons/PixelStopIcon';
import { PixelChatIcon } from './icons/PixelChatIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';

interface LectureRecordingProps {
  onBack: () => void;
}

export function LectureRecording({ onBack }: LectureRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [notes, setNotes] = useState('');

  const handleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setHasRecording(true);
        setNotes('LECTURE NOTES\n\nKEY POINTS:\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\nSUMMARY:\nYour lecture has been transcribed and organized into structured notes.');
      }, 3000);
    }
  };

  const handleStop = () => {
    setIsRecording(false);
    setHasRecording(true);
    setNotes('LECTURE NOTES\n\nKEY POINTS:\n- Important concept 1\n- Important concept 2\n- Important concept 3\n\nSUMMARY:\nYour lecture has been transcribed and organized into structured notes.');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Recording Control */}
      <div className="mac-fieldset">
        <div className="mac-fieldset-legend">Recording Control</div>
        <div className="text-center py-8">
          <div className="flex justify-center mb-6">
            {isRecording ? <PixelStopIcon size={96} /> : <PixelMicIcon size={96} />}
          </div>
          
          {isRecording ? (
            <>
              <p className="text-3xl mb-2">Recording in Progress...</p>
              <p className="text-xl opacity-70 mb-6">Capturing your lecture</p>
              <ClassicButton onClick={handleStop}>
                Stop Recording
              </ClassicButton>
            </>
          ) : hasRecording ? (
            <>
              <p className="text-3xl mb-2">Recording Complete!</p>
              <p className="text-xl opacity-70">Your notes are ready</p>
            </>
          ) : (
            <>
              <p className="text-3xl mb-2">Ready to Record</p>
              <p className="text-xl opacity-70 mb-6">Click to start recording your lecture</p>
              <ClassicButton onClick={handleRecord}>
                Start Recording
              </ClassicButton>
            </>
          )}
        </div>
      </div>

      {hasRecording && (
        <>
          {/* Actions */}
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
                  <span>Chat with Notes</span>
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

          {/* Generated Notes */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Generated Notes</div>
            <div className="mac-card">
              <pre className="whitespace-pre-wrap text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                {notes}
              </pre>
            </div>
          </div>

          {/* Chat Interface */}
          {showChat && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Chat with Your Notes</div>
              <div className="h-[500px]">
                <ChatInterface 
                  context="your lecture notes"
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
                <p className="text-lg opacity-70 mb-6">10 flashcards created from your lecture notes</p>
                
                <div className="max-w-md mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-4">Sample Flashcard 1</p>
                  <div className="h-[2px] bg-black mb-4" />
                  <p className="text-lg">Front: What is the main topic?</p>
                  <p className="text-lg mt-3 opacity-70">Back: Key concept explanation</p>
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
                  <p className="text-lg opacity-70">5 questions created from your lecture content</p>
                </div>
                
                <div className="max-w-2xl mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-3">Question 1:</p>
                  <p className="text-lg mb-4">What is the primary concept discussed in the lecture?</p>
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
