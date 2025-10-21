import React, { useState } from 'react';
import { ClassicButton } from './ClassicButton';
import { QuizQuestion } from '../services/api';

interface QuizViewerProps {
  questions: QuizQuestion[];
  onUpdateQuestion?: (id: string, question: string, options?: string[], correctAnswer?: string | number) => void;
}

interface UserAnswer {
  questionId: string;
  answer: string | number;
}

export function QuizViewer({ questions, onUpdateQuestion }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editQuestion, setEditQuestion] = useState('');
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<string | number>('');

  if (!questions || questions.length === 0) {
    return (
      <div className="mac-card p-8 text-center">
        <p className="text-2xl">No quiz questions available</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (answer: string | number) => {
    const existingIndex = userAnswers.findIndex(a => a.questionId === currentQuestion.id);
    const newAnswers = [...userAnswers];
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex] = { questionId: currentQuestion.id, answer };
    } else {
      newAnswers.push({ questionId: currentQuestion.id, answer });
    }
    
    setUserAnswers(newAnswers);
  };

  const getCurrentAnswer = () => {
    return userAnswers.find(a => a.questionId === currentQuestion.id)?.answer;
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsEditing(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsEditing(false);
    }
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => {
      const userAnswer = userAnswers.find(a => a.questionId === q.id);
      if (userAnswer) {
        if (q.type === 'multiple_choice') {
          if (userAnswer.answer === q.correctAnswer) correct++;
        } else if (q.type === 'true_false') {
          if (userAnswer.answer === q.correctAnswer) correct++;
        } else if (q.type === 'short_answer') {
          // For short answer, we'll mark as correct if they provided an answer
          // In a real app, this would need AI grading
          if (userAnswer.answer && String(userAnswer.answer).trim().length > 0) {
            correct++;
          }
        }
      }
    });
    return correct;
  };

  const handleRestart = () => {
    setUserAnswers([]);
    setShowResults(false);
    setCurrentIndex(0);
  };

  const handleEdit = () => {
    setEditQuestion(currentQuestion.question);
    setEditOptions(currentQuestion.options || []);
    setEditCorrectAnswer(currentQuestion.correctAnswer);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onUpdateQuestion) {
      onUpdateQuestion(
        currentQuestion.id,
        editQuestion,
        editOptions.length > 0 ? editOptions : undefined,
        editCorrectAnswer
      );
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const isQuestionAnswered = (questionId: string) => {
    return userAnswers.some(a => a.questionId === questionId);
  };

  const isCorrect = (questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers.find(a => a.questionId === questionId);
    
    if (!question || !userAnswer) return false;
    
    if (question.type === 'short_answer') {
      return true; // Consider answered short answers as correct
    }
    
    return userAnswer.answer === question.correctAnswer;
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="space-y-6">
        <div className="mac-card p-8 text-center">
          <div className="text-4xl mb-4">Quiz Complete!</div>
          <div className="text-6xl mb-4">{score} / {questions.length}</div>
          <div className="text-3xl mb-6">{percentage}%</div>
          
          <div className="mb-6">
            {percentage >= 90 && <p className="text-2xl">Excellent work!</p>}
            {percentage >= 70 && percentage < 90 && <p className="text-2xl">Great job!</p>}
            {percentage >= 50 && percentage < 70 && <p className="text-2xl">Good effort!</p>}
            {percentage < 50 && <p className="text-2xl">Keep studying!</p>}
          </div>

          <ClassicButton onClick={handleRestart}>
            Retake Quiz
          </ClassicButton>
        </div>

        {/* Review Answers */}
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Review Your Answers</div>
          <div className="space-y-4">
            {questions.map((q, index) => {
              const correct = isCorrect(q.id);
              const answered = isQuestionAnswered(q.id);
              const userAnswer = userAnswers.find(a => a.questionId === q.id);

              return (
                <div key={q.id} className={`mac-card p-6 ${correct ? 'bg-green-50' : answered ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{correct ? 'Correct' : answered ? 'Incorrect' : 'Not answered'}</span>
                    <div className="flex-1">
                      <p className="text-xl mb-2">Question {index + 1}: {q.question}</p>
                      
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-2 mt-3">
                          {q.options.map((option, i) => (
                            <div
                              key={i}
                              className={`p-2 border-2 ${
                                i === q.correctAnswer
                                  ? 'border-green-500 bg-green-100'
                                  : i === userAnswer?.answer
                                  ? 'border-red-500 bg-red-100'
                                  : 'border-gray-300'
                              }`}
                            >
                              {String.fromCharCode(65 + i)}) {option}
                              {i === q.correctAnswer && <span className="ml-2">Correct</span>}
                              {i === userAnswer?.answer && i !== q.correctAnswer && <span className="ml-2">Your answer</span>}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.type === 'true_false' && (
                        <div className="mt-3">
                          <p className="text-lg">Your answer: {userAnswer?.answer || 'Not answered'}</p>
                          <p className="text-lg text-green-600">Correct answer: {q.correctAnswer}</p>
                        </div>
                      )}

                      {q.type === 'short_answer' && (
                        <div className="mt-3">
                          <p className="text-lg mb-2">Your answer: {userAnswer?.answer || 'Not answered'}</p>
                          <p className="text-lg text-green-600">Expected answer: {q.correctAnswer}</p>
                        </div>
                      )}

                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-300">
                          <p className="text-lg"><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex justify-between items-center">
        <div className="text-xl">
          Question {currentIndex + 1} of {questions.length}
        </div>
        <div className="text-lg opacity-70">
          Answered: {userAnswers.length} / {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-[#f5f5f5] border-2 border-black">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      {isEditing ? (
        // Edit Mode
        <div className="mac-card p-8 space-y-6">
          <div className="text-2xl mb-4">Edit Question</div>
          
          <div>
            <label className="text-xl mb-2 block">Question:</label>
            <textarea
              value={editQuestion}
              onChange={(e) => setEditQuestion(e.target.value)}
              className="mac-input w-full min-h-[100px]"
              style={{ fontFamily: 'VT323, monospace' }}
            />
          </div>

          {currentQuestion.type === 'multiple_choice' && (
            <div>
              <label className="text-xl mb-2 block">Options:</label>
              {editOptions.map((option, index) => (
                <div key={index} className="mb-2">
                  <input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...editOptions];
                      newOptions[index] = e.target.value;
                      setEditOptions(newOptions);
                    }}
                    className="mac-input w-full"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  />
                </div>
              ))}
              <div className="mt-2">
                <label className="text-lg mb-1 block">Correct Answer (index 0-3):</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={editCorrectAnswer}
                  onChange={(e) => setEditCorrectAnswer(parseInt(e.target.value))}
                  className="mac-input w-32"
                />
              </div>
            </div>
          )}

          {currentQuestion.type === 'true_false' && (
            <div>
              <label className="text-xl mb-2 block">Correct Answer:</label>
              <select
                value={editCorrectAnswer as string}
                onChange={(e) => setEditCorrectAnswer(e.target.value)}
                className="mac-input"
              >
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          )}

          {currentQuestion.type === 'short_answer' && (
            <div>
              <label className="text-xl mb-2 block">Expected Answer:</label>
              <textarea
                value={editCorrectAnswer as string}
                onChange={(e) => setEditCorrectAnswer(e.target.value)}
                className="mac-input w-full min-h-[100px]"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>
          )}

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
        // View Mode
        <div className="mac-card p-8">
          <div className="mb-6">
            <div className="text-sm opacity-70 mb-2">
              {currentQuestion.type === 'multiple_choice' && 'MULTIPLE CHOICE'}
              {currentQuestion.type === 'true_false' && 'TRUE / FALSE'}
              {currentQuestion.type === 'short_answer' && 'SHORT ANSWER'}
            </div>
            <p className="text-3xl mb-6" style={{ fontFamily: 'VT323, monospace' }}>
              {currentQuestion.question}
            </p>
          </div>

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className={`mac-button w-full text-left px-6 py-4 cursor-pointer text-xl ${
                    getCurrentAnswer() === index ? 'bg-blue-200 border-blue-500' : ''
                  }`}
                  onClick={() => handleAnswer(index)}
                >
                  {String.fromCharCode(65 + index)}) {option}
                </div>
              ))}
            </div>
          )}

          {/* True/False */}
          {currentQuestion.type === 'true_false' && (
            <div className="flex gap-4 justify-center">
              <ClassicButton
                onClick={() => handleAnswer('True')}
                className={getCurrentAnswer() === 'True' ? 'ring-4 ring-blue-500' : ''}
              >
                <span className="text-2xl px-8">TRUE</span>
              </ClassicButton>
              <ClassicButton
                onClick={() => handleAnswer('False')}
                className={getCurrentAnswer() === 'False' ? 'ring-4 ring-blue-500' : ''}
              >
                <span className="text-2xl px-8">FALSE</span>
              </ClassicButton>
            </div>
          )}

          {/* Short Answer */}
          {currentQuestion.type === 'short_answer' && (
            <div>
              <textarea
                value={getCurrentAnswer() as string || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="mac-input w-full min-h-[150px] text-xl"
                style={{ fontFamily: 'VT323, monospace' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <ClassicButton onClick={handlePrevious} disabled={currentIndex === 0}>
          ← Previous
        </ClassicButton>

        <ClassicButton onClick={handleEdit}>
          Edit Question
        </ClassicButton>

        {currentIndex < questions.length - 1 ? (
          <ClassicButton onClick={handleNext}>
            Next →
          </ClassicButton>
        ) : (
          <ClassicButton
            onClick={handleSubmit}
            disabled={userAnswers.length === 0}
          >
            Submit Quiz
          </ClassicButton>
        )}
      </div>

      {/* Answer Status */}
      <div className="mac-card p-6 bg-[#f5f5f5]">
        <p className="text-lg mb-3">Question Status:</p>
        <div className="flex gap-2 flex-wrap">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className={`w-12 h-12 flex items-center justify-center text-xl border-2 border-black cursor-pointer ${
                index === currentIndex
                  ? 'bg-blue-500 text-white'
                  : isQuestionAnswered(q.id)
                  ? 'bg-green-200'
                  : 'bg-white'
              }`}
              onClick={() => {
                setCurrentIndex(index);
                setIsEditing(false);
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

