import React, { useState, useRef, useEffect } from 'react';
import { ClassicButton } from './ClassicButton';
import { ChatInterface } from './ChatInterface';
import { PixelMicIcon } from './icons/PixelMicIcon';
import { PixelStopIcon } from './icons/PixelStopIcon';
import { PixelChatIcon } from './icons/PixelChatIcon';
import { PixelFlashcardIcon } from './icons/PixelFlashcardIcon';
import { PixelQuizIcon } from './icons/PixelQuizIcon';
import { PixelUploadIcon } from './icons/PixelUploadIcon';
import { FlashcardViewer } from './FlashcardViewer';
import { QuizViewer } from './QuizViewer';

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/lectures`;

interface LectureRecordingProps {
  onBack?: () => void;
}

interface LectureJob {
  jobId: string;
  status: 'pending' | 'splitting_audio' | 'transcribing' | 'generating_notes' | 'completed' | 'failed';
  progress: number;
  stage: string;
  error?: string;
  data?: {
    transcript: string;
    notes: {
      summary: string;
      keyPoints: string[];
      detailedNotes: string;
      topics: string[];
      actionItems?: string[];
    };
  };
}

export function LectureRecording(_props: LectureRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [jobId, setJobId] = useState<string | null>(() => {
    return sessionStorage.getItem('lecture_jobId');
  });
  const [jobStatus, setJobStatus] = useState<LectureJob | null>(() => {
    const saved = sessionStorage.getItem('lecture_jobStatus');
    return saved ? JSON.parse(saved) : null;
  });
  const [showChat, setShowChat] = useState(() => {
    return sessionStorage.getItem('lecture_showChat') === 'true';
  });
  const [showFlashcards, setShowFlashcards] = useState(() => {
    return sessionStorage.getItem('lecture_showFlashcards') === 'true';
  });
  const [showQuiz, setShowQuiz] = useState(() => {
    return sessionStorage.getItem('lecture_showQuiz') === 'true';
  });
  const [flashcards, setFlashcards] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('lecture_flashcards');
    return saved ? JSON.parse(saved) : [];
  });
  const [quiz, setQuiz] = useState<any[]>(() => {
    const saved = sessionStorage.getItem('lecture_quiz');
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    if (jobId) {
      sessionStorage.setItem('lecture_jobId', jobId);
    } else {
      sessionStorage.removeItem('lecture_jobId');
    }
  }, [jobId]);

  useEffect(() => {
    if (jobStatus) {
      sessionStorage.setItem('lecture_jobStatus', JSON.stringify(jobStatus));
    } else {
      sessionStorage.removeItem('lecture_jobStatus');
    }
  }, [jobStatus]);

  useEffect(() => {
    sessionStorage.setItem('lecture_showChat', showChat.toString());
  }, [showChat]);

  useEffect(() => {
    sessionStorage.setItem('lecture_showFlashcards', showFlashcards.toString());
  }, [showFlashcards]);

  useEffect(() => {
    sessionStorage.setItem('lecture_showQuiz', showQuiz.toString());
  }, [showQuiz]);

  useEffect(() => {
    sessionStorage.setItem('lecture_flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  useEffect(() => {
    sessionStorage.setItem('lecture_quiz', JSON.stringify(quiz));
  }, [quiz]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Resume polling if there's an active job that's not completed
  useEffect(() => {
    if (jobId && jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed') {
      startPolling(jobId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Start browser recording
  const startRecording = async () => {
    try {
      setError('');
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      
      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await uploadRecording(blob);
        
        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(1000); // Collect data every second
      
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setError(`Failed to access microphone: ${err.message}`);
    }
  };

  // Stop browser recording
  const stopRecording = (shouldUpload = true) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      if (!shouldUpload) {
        // Cleanup without uploading
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    }
  };

  // Upload recorded audio
  const uploadRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('lecture', blob, 'lecture-recording.webm');
      formData.append('fileName', 'Lecture Recording');

      const res = await fetch(`${API_BASE}/record`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload recording');
      }

      const data = await res.json();
      setJobId(data.jobId);
      startPolling(data.jobId);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError('');
      const formData = new FormData();
      formData.append('lecture', file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await res.json();
      setJobId(data.jobId);
      startPolling(data.jobId);
    } catch (err: any) {
      setError(`Upload failed: ${err.message}`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Poll for job status
  const startPolling = (id: string) => {
    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${id}`);
        const data: LectureJob = await res.json();
        
        setJobStatus(data);

        if (data.status === 'completed' || data.status === 'failed') {
          // Stop polling
          return;
        }

        // Continue polling
        setTimeout(() => poll(), 2000);
      } catch (err) {
        console.error('Polling error:', err);
        setTimeout(() => poll(), 2000);
      }
    };

    poll();
  };

  // Generate flashcards
  const handleGenerateFlashcards = async () => {
    if (!jobId) return;

    try {
      const res = await fetch(`${API_BASE}/${jobId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 15 }),
      });

      const data = await res.json();
      setFlashcards(data.flashcards || []);
      setShowFlashcards(true);
      setShowChat(false);
      setShowQuiz(false);
    } catch (err) {
      console.error('Failed to generate flashcards:', err);
    }
  };

  // Generate quiz
  const handleGenerateQuiz = async () => {
    if (!jobId) return;

    try {
      const res = await fetch(`${API_BASE}/${jobId}/quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10 }),
      });

      const data = await res.json();
      setQuiz(data.questions || []);
      setShowQuiz(true);
      setShowChat(false);
      setShowFlashcards(false);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isProcessing = jobStatus && jobStatus.status !== 'completed' && jobStatus.status !== 'failed';
  const isCompleted = jobStatus?.status === 'completed';
  const hasFailed = jobStatus?.status === 'failed';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Error</div>
          <div className="mac-card bg-red-50 border-red-300 p-4">
            <p className="text-xl text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Recording Control */}
      {!jobId && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Lecture Input</div>
          <div className="text-center py-8">
            <div className="flex justify-center mb-6">
              {isRecording ? <PixelStopIcon size={96} /> : <PixelMicIcon size={96} />}
            </div>
            
            {isRecording ? (
              <>
                <p className="text-3xl mb-2">Recording in Progress...</p>
                <p className="text-2xl opacity-70 mb-2">{formatTime(recordingTime)}</p>
                <p className="text-xl opacity-70 mb-6">Capturing your lecture</p>
                <ClassicButton onClick={() => stopRecording(true)}>
                  Stop Recording
                </ClassicButton>
              </>
            ) : (
              <>
                <p className="text-3xl mb-2">Record or Upload Lecture</p>
                <p className="text-xl opacity-70 mb-6">Start recording or upload an audio/video file</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <ClassicButton onClick={startRecording}>
                    <div className="flex items-center gap-2">
                      <PixelMicIcon size={24} />
                      <span>Start Recording</span>
                    </div>
                  </ClassicButton>
                  
                  <ClassicButton onClick={() => fileInputRef.current?.click()}>
                    <div className="flex items-center gap-2">
                      <PixelUploadIcon size={24} />
                      <span>Upload File</span>
                    </div>
                  </ClassicButton>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <p className="text-sm opacity-60 mt-4">
                  Supports audio and video files up to 500MB and 2.5 hours
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && jobStatus && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Processing Lecture</div>
          <div className="mac-card p-8">
            <div className="text-center mb-6">
              <p className="text-3xl mb-4">{jobStatus.stage}</p>
              <div className="max-w-md mx-auto bg-[#f5f5f5] border-2 border-black h-8">
                <div 
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${jobStatus.progress}%` }}
                />
              </div>
              <p className="text-2xl mt-3">{jobStatus.progress}%</p>
              <p className="text-lg opacity-70 mt-2">
                This may take a few minutes for long lectures
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Status */}
      {hasFailed && jobStatus && (
        <div className="mac-fieldset">
          <div className="mac-fieldset-legend">Processing Failed</div>
          <div className="mac-card bg-red-50 border-red-300 p-8 text-center">
            <p className="text-2xl mb-2">An error occurred</p>
            <p className="text-lg opacity-70">{jobStatus.error}</p>
            <ClassicButton 
              onClick={() => {
                setJobId(null);
                setJobStatus(null);
                setError('');
              }}
              className="mt-4"
            >
              Try Again
            </ClassicButton>
          </div>
        </div>
      )}

      {/* Completed - Show Results */}
      {isCompleted && (
        <>
          {/* Check if data is available, show error if not */}
          {!jobStatus?.data || !jobStatus?.data?.notes || !jobStatus?.data?.transcript ? (
            <div className="mac-fieldset">
              <div className="mac-fieldset-legend">Processing Incomplete</div>
              <div className="mac-card bg-yellow-50 border-yellow-300 p-8 text-center">
                <p className="text-2xl mb-2">Lecture data is incomplete</p>
                <p className="text-lg opacity-70 mb-4">
                  The lecture processing completed but some data is missing. This might be a temporary issue.
                </p>
                <ClassicButton 
                  onClick={() => {
                    setJobId(null);
                    setJobStatus(null);
                    setError('');
                  }}
                  className="mt-4"
                >
                  Try Again
                </ClassicButton>
              </div>
            </div>
          ) : (
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
                  <ClassicButton onClick={handleGenerateFlashcards}>
                    <div className="flex items-center justify-center gap-2">
                      <PixelFlashcardIcon size={24} />
                      <span>Create Flashcards</span>
                    </div>
                  </ClassicButton>
                  <ClassicButton onClick={handleGenerateQuiz}>
                    <div className="flex items-center justify-center gap-2">
                      <PixelQuizIcon size={24} />
                      <span>Generate Quiz</span>
                    </div>
                  </ClassicButton>
                </div>
              </div>

              {/* Two-column layout for desktop, stacked for mobile */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Main Content Column */}
                <div className="flex-1 space-y-6">
                  {/* Lecture Summary */}
                  <div className="mac-fieldset">
                    <div className="mac-fieldset-legend">Lecture Summary</div>
                    <div className="mac-card p-6">
                      <p className="text-xl mb-4">{jobStatus.data.notes.summary}</p>
                      
                      <div className="mt-6">
                        <p className="text-2xl mb-3">Key Points:</p>
                        <ul className="list-disc list-inside space-y-2">
                          {jobStatus.data.notes.keyPoints.map((point, i) => (
                            <li key={i} className="text-lg">{point}</li>
                          ))}
                        </ul>
                      </div>

                      {jobStatus.data.notes.topics.length > 0 && (
                        <div className="mt-6">
                          <p className="text-2xl mb-3">Topics Covered:</p>
                          <div className="flex flex-wrap gap-2">
                            {jobStatus.data.notes.topics.map((topic, i) => (
                              <span key={i} className="mac-button px-3 py-1 text-lg">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {jobStatus.data.notes.actionItems && jobStatus.data.notes.actionItems.length > 0 && (
                        <div className="mt-6">
                          <p className="text-2xl mb-3">Action Items:</p>
                          <ul className="list-disc list-inside space-y-2">
                            {jobStatus.data.notes.actionItems.map((item, i) => (
                              <li key={i} className="text-lg">{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Notes */}
                  <div className="mac-fieldset">
                    <div className="mac-fieldset-legend">Detailed Notes</div>
                    <div className="mac-card">
                      <pre className="whitespace-pre-wrap text-xl" style={{ fontFamily: 'VT323, monospace' }}>
                        {jobStatus.data.notes.detailedNotes}
                      </pre>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div className="mac-fieldset">
                    <div className="mac-fieldset-legend">Full Transcript</div>
                    <div className="mac-card">
                      <p className="text-lg leading-relaxed">{jobStatus.data.transcript}</p>
                    </div>
                  </div>

                  {/* New Lecture Button */}
                  <div className="text-center">
                    <ClassicButton 
                      onClick={() => {
                        setJobId(null);
                        setJobStatus(null);
                        setFlashcards([]);
                        setQuiz([]);
                        setShowChat(false);
                        setShowFlashcards(false);
                        setShowQuiz(false);
                        // Clear session storage for lecture
                        sessionStorage.removeItem('lecture_jobId');
                        sessionStorage.removeItem('lecture_jobStatus');
                        sessionStorage.removeItem('lecture_flashcards');
                        sessionStorage.removeItem('lecture_quiz');
                        sessionStorage.removeItem('lecture_showChat');
                        sessionStorage.removeItem('lecture_showFlashcards');
                        sessionStorage.removeItem('lecture_showQuiz');
                      }}
                    >
                      Process Another Lecture
                    </ClassicButton>
                  </div>
                </div>

                {/* Sidebar Column - only on desktop when any feature is active */}
                {(showChat || showFlashcards || showQuiz) && (
                  <div className="w-full md:w-[400px] md:sticky md:top-4 md:self-start space-y-6" style={{ maxHeight: 'calc(100vh - 2rem)' }}>
                    {/* Chat Interface */}
                    {showChat && (
                      <div className="mac-fieldset">
                        <div className="mac-fieldset-legend">Chat with Your Notes</div>
                        <div className="h-[500px]">
                          <ChatInterface 
                            context={jobStatus.data.transcript}
                            onGenerateFlashcards={handleGenerateFlashcards}
                            onGenerateQuiz={handleGenerateQuiz}
                          />
                        </div>
                      </div>
                    )}

                    {/* Flashcards */}
                    {showFlashcards && flashcards.length > 0 && (
                      <div className="mac-fieldset">
                        <div className="mac-fieldset-legend">Flashcards</div>
                        <div className="overflow-y-auto" style={{ maxHeight: showChat ? '400px' : '800px' }}>
                          <FlashcardViewer flashcards={flashcards} />
                        </div>
                      </div>
                    )}

                    {/* Quiz */}
                    {showQuiz && quiz.length > 0 && (
                      <div className="mac-fieldset">
                        <div className="mac-fieldset-legend">Quiz</div>
                        <div className="overflow-y-auto" style={{ maxHeight: showChat ? '400px' : '800px' }}>
                          <QuizViewer questions={quiz} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
