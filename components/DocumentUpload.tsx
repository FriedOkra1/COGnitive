import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { ChatInterface } from './ChatInterface';
import { PixelDocIcon } from './icons/PixelDocIcon';
import { PixelChatIcon } from './icons/PixelChatIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';

interface DocumentUploadProps {
  onBack: () => void;
}

export function DocumentUpload({ onBack }: DocumentUploadProps) {
  const [hasDocument, setHasDocument] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [summary, setSummary] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setHasDocument(true);
      setSummary(`DOCUMENT SUMMARY: ${file.name}\n\nOVERVIEW:\nThis is an automatically generated summary of your uploaded document.\n\nKEY POINTS:\n- Main topic 1 from the document\n- Important finding 2\n- Critical information 3\n\nDETAILED NOTES:\nYour document has been processed and key information has been extracted for easy reference.`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Upload Section */}
      {!hasDocument ? (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Upload Document</div>
          <div className="text-center py-12">
            <div className="flex justify-center mb-6">
              <PixelDocIcon size={96} />
            </div>
            <p className="text-2xl mb-2">Upload Your Document</p>
            <p className="text-lg opacity-70 mb-6">PDF, DOCX, TXT files supported</p>
            
            <label className="inline-block">
              <input
                type="file"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <span className="mac-button cursor-pointer inline-block">
                Choose File
              </span>
            </label>
          </div>
        </div>
      ) : (
        <>
          {/* Uploaded Document Info */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Uploaded Document</div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <PixelDocIcon size={48} />
                <div>
                  <p className="text-xl mb-1">Document Loaded</p>
                  <p className="text-lg opacity-70">{fileName}</p>
                </div>
              </div>
              <label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                />
                <span className="mac-button cursor-pointer inline-block">
                  Change File
                </span>
              </label>
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
                  <span>Chat with Document</span>
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

          {/* Document Summary */}
          <div className="mac-fieldset">
            <div className="mac-fieldset-legend">Document Summary</div>
            <div className="mac-card">
              <pre className="whitespace-pre-wrap text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                {summary}
              </pre>
            </div>
          </div>

          {/* Chat Interface */}
          {showChat && (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Chat with Your Document</div>
              <div className="h-[500px]">
                <ChatInterface 
                  context="your document"
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
                <p className="text-lg opacity-70 mb-6">12 flashcards created from your document</p>
                
                <div className="max-w-md mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-4">Sample Flashcard 1</p>
                  <div className="h-[2px] bg-black mb-4" />
                  <p className="text-lg">Front: What is the document about?</p>
                  <p className="text-lg mt-3 opacity-70">Back: Summary of key topics</p>
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
                  <p className="text-lg opacity-70">8 questions created from your document</p>
                </div>
                
                <div className="max-w-2xl mx-auto mac-card bg-[#f5f5f5] p-6">
                  <p className="text-xl mb-3">Question 1:</p>
                  <p className="text-lg mb-4">What is the main topic of the document?</p>
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
