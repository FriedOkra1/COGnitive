import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { Flashcard } from '../services/api';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onUpdateFlashcard?: (id: string, front: string, back: string) => void;
}

export function FlashcardViewer({ flashcards, onUpdateFlashcard }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="mac-card p-8 text-center">
        <p className="text-2xl">No flashcards available</p>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setIsEditing(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setIsEditing(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleEdit = () => {
    setEditFront(currentCard.front);
    setEditBack(currentCard.back);
    setIsEditing(true);
    setIsFlipped(false);
  };

  const handleSaveEdit = () => {
    if (onUpdateFlashcard) {
      onUpdateFlashcard(currentCard.id, editFront, editBack);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFront('');
    setEditBack('');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'basic':
        return 'Term / Definition';
      case 'concept':
        return 'Concept / Explanation';
      case 'qa':
        return 'Q & A';
      default:
        return 'Flashcard';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'basic':
        return 'bg-blue-500';
      case 'concept':
        return 'bg-green-500';
      case 'qa':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress and Stats */}
      <div className="flex justify-between items-center">
        <div className="text-xl">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className={`px-4 py-1 text-white text-lg ${getTypeBadgeColor(currentCard.type)}`}>
          {getTypeLabel(currentCard.type)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-[#f5f5f5] border-2 border-black">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative" style={{ minHeight: '400px' }}>
        {isEditing ? (
          // Edit Mode
          <div className="mac-card p-8 space-y-6">
            <div className="text-2xl mb-4">Edit Flashcard</div>
            
            <div>
              <label className="text-xl mb-2 block">
                Front {currentCard.type === 'basic' ? '(Term)' : currentCard.type === 'concept' ? '(Concept)' : '(Question)'}:
              </label>
              <textarea
                value={editFront}
                onChange={(e) => setEditFront(e.target.value)}
                className="mac-input w-full min-h-[100px]"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>

            <div>
              <label className="text-xl mb-2 block">
                Back {currentCard.type === 'basic' ? '(Definition)' : currentCard.type === 'concept' ? '(Explanation)' : '(Answer)'}:
              </label>
              <textarea
                value={editBack}
                onChange={(e) => setEditBack(e.target.value)}
                className="mac-input w-full min-h-[100px]"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>

            <div className="flex gap-3">
              <ClassicButton onClick={handleSaveEdit}>
                Save Changes
              </ClassicButton>
              <ClassicButton onClick={handleCancelEdit}>
                Cancel
              </ClassicButton>
            </div>
          </div>
        ) : (
          // View Mode with Flip Animation
          <div
            className="flashcard-container"
            onClick={handleFlip}
            style={{
              perspective: '1000px',
              cursor: 'pointer',
              minHeight: '400px',
            }}
          >
            <div
              className="flashcard-inner"
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '400px',
                transition: 'transform 0.6s',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* Front */}
              <div
                className="flashcard-face flashcard-front"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <div className="mac-card p-8 h-full flex flex-col justify-center items-center">
                  <div className="text-center w-full">
                    <p className="text-sm opacity-70 mb-4">FRONT</p>
                    <p className="text-3xl whitespace-pre-wrap" style={{ fontFamily: 'VT323, monospace' }}>
                      {currentCard.front}
                    </p>
                    <p className="text-lg opacity-50 mt-8">Click to flip</p>
                  </div>
                </div>
              </div>

              {/* Back */}
              <div
                className="flashcard-face flashcard-back"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div className="mac-card p-8 h-full flex flex-col justify-center items-center bg-[#e8f4f8]">
                  <div className="text-center w-full">
                    <p className="text-sm opacity-70 mb-4">BACK</p>
                    <p className="text-3xl whitespace-pre-wrap" style={{ fontFamily: 'VT323, monospace' }}>
                      {currentCard.back}
                    </p>
                    <p className="text-lg opacity-50 mt-8">Click to flip</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation and Actions */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <ClassicButton onClick={handlePrevious} disabled={flashcards.length <= 1}>
          ← Previous
        </ClassicButton>
        
        <div className="flex gap-3">
          <ClassicButton onClick={handleEdit}>
            Edit Card
          </ClassicButton>
          <ClassicButton onClick={handleFlip}>
            {isFlipped ? 'Show Front' : 'Show Back'}
          </ClassicButton>
        </div>
        
        <ClassicButton onClick={handleNext} disabled={flashcards.length <= 1}>
          Next →
        </ClassicButton>
      </div>

      {/* Study Tips */}
      <div className="mac-card p-6 bg-[#fffef0]">
        <p className="text-xl mb-2">Study Tip:</p>
        <p className="text-lg opacity-80">
          Try to recall the answer before flipping. Active recall helps strengthen memory!
        </p>
      </div>
    </div>
  );
}

