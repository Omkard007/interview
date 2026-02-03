'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Save, Loader, Volume2, VolumeX, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from './voice-recorder';

interface Question {
  id: string;
  interview_id: string;
  question_text: string;
  question_type: string;
  order_num: number;
}

interface Answer {
  id: string;
  answer_text: string;
}

interface InterviewQuestionProps {
  question: Question;
  onAnswerSaved: (questionId: string, answer: Answer) => void;
  hasAnswered: boolean;
}

export default function InterviewQuestion({
  question,
  onAnswerSaved,
  hasAnswered,
}: InterviewQuestionProps) {
  const [answerText, setAnswerText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;

    const voices = synthRef.current.getVoices();
    
    // Prefer human-like English voices (prioritize natural-sounding voices)
    const preferredVoices = [
      'Google UK English Female',
      'Google UK English Male',
      'Google US English Female',
      'Google US English Male',
      'Microsoft Zira - English (United States)',
      'Microsoft David - English (United States)',
      'Samantha', // macOS
      'Alex', // macOS
      'Karen', // macOS
      'Moira', // macOS
    ];

    // Try to find a preferred voice
    for (const preferredName of preferredVoices) {
      const voice = voices.find(v => v.name.includes(preferredName));
      if (voice && voice.lang.startsWith('en')) {
        return voice;
      }
    }

    // Fallback: find any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) return englishVoice;

    // Last resort: use default voice
    return voices.find(v => v.default) || voices[0] || null;
  };

  const speakQuestion = (text: string) => {
    if (!synthRef.current || !text) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang || 'en-US';
    } else {
      utterance.lang = 'en-US';
    }

    // Configure for natural speech
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = (error) => {
      console.error('[v0] Speech synthesis error:', error);
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  // Initialize speech synthesis and find best English voice
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      // Load voices (they might not be available immediately)
      const loadVoices = () => {
        if (synthRef.current) {
          const voices = synthRef.current.getVoices();
          console.log('[v0] Available voices:', voices.length);
        }
      };

      // Voices might be loaded immediately or asynchronously
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Speak question when it changes
  useEffect(() => {
    if (question?.question_text && synthRef.current) {
      // Stop any ongoing speech
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }

      // Small delay to ensure component is ready
      const timer = setTimeout(() => {
        speakQuestion(question.question_text);
      }, 500);

      return () => {
        clearTimeout(timer);
        if (synthRef.current) {
          synthRef.current.cancel();
        }
      };
    }
  }, [question?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  const pauseSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeSpeaking = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const replayQuestion = () => {
    if (question?.question_text) {
      speakQuestion(question.question_text);
    }
  };

  useEffect(() => {
    // Request camera access with audio for recording
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true, // Enable audio for video recording
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('[v0] Camera error:', error);
        toast({
          title: 'Camera access denied',
          description: 'Please allow camera and microphone access to continue',
          variant: 'destructive',
        });
      }
    };

    startCamera();

    return () => {
      // Stop recording and camera on unmount
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  // Start recording when question loads (if not already answered)
  useEffect(() => {
    if (streamRef.current && !isRecording && !hasAnswered) {
      // Small delay to ensure camera is ready
      const timer = setTimeout(() => {
        startRecording();
      }, 1000);
      return () => clearTimeout(timer);
    }

    return () => {
      // Stop recording when component unmounts or question changes
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        stopRecording();
      }
    };
  }, [question.id, hasAnswered]);

  const startRecording = () => {
    if (!streamRef.current) return;

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus',
      });

      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[v0] Recording stopped, chunks:', recordedChunksRef.current.length);
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      console.log('[v0] Started recording video');
    } catch (error) {
      console.error('[v0] Failed to start recording:', error);
      toast({
        title: 'Recording error',
        description: 'Failed to start video recording',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('[v0] Stopped recording video');
    }
  };

  const handleSaveAnswer = async () => {
    if (!answerText.trim()) {
      toast({
        title: 'Answer required',
        description: 'Please provide an answer before saving',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    // Stop recording first
    stopRecording();

    try {
      // Wait a bit for recording to finalize
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create FormData to send both answer and video
      const formData = new FormData();
      formData.append('questionId', question.id);
      formData.append('interviewId', question.interview_id);
      formData.append('answerText', answerText);

      // Add video if available
      if (recordedChunksRef.current.length > 0) {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        formData.append('video', videoBlob, `answer-${question.id}.webm`);
        console.log('[v0] Uploading video, size:', videoBlob.size, 'bytes');
      }

      const response = await fetch('/api/interview/save-answer', {
        method: 'POST',
        body: formData, // Don't set Content-Type header, browser will set it with boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save answer');
      }

      const data = await response.json();
      onAnswerSaved(question.id, {
        id: data.answerId,
        answer_text: answerText,
      });

      // Clear recorded chunks after successful save
      recordedChunksRef.current = [];

      toast({
        title: 'Answer saved',
        description: 'Your answer and video have been saved',
      });
    } catch (error: any) {
      console.error('[v0] Save answer error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save answer',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Question and Answer */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {question.question_type === 'hr' ? 'HR Question' : 'Technical Question'}
              </span>
              <div className="flex items-center gap-2">
                {isSpeaking ? (
                  <>
                    {isPaused ? (
                      <Button
                        onClick={resumeSpeaking}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Resume
                      </Button>
                    ) : (
                      <Button
                        onClick={pauseSpeaking}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <VolumeX className="h-4 w-4" />
                        Pause
                      </Button>
                    )}
                    <Button
                      onClick={stopSpeaking}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <VolumeX className="h-4 w-4" />
                      Stop
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={replayQuestion}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Volume2 className="h-4 w-4" />
                    Listen Again
                  </Button>
                )}
              </div>
            </div>
            <CardTitle className="text-xl">{question.question_text}</CardTitle>
            <CardDescription>
              {isSpeaking ? (
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                  Question is being read aloud...
                </span>
              ) : (
                'Take your time to formulate a thoughtful answer. You can also record your voice response.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Answer</label>
              <Textarea
                placeholder="Type your answer here..."
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                className="min-h-32"
              />
              <p className="text-xs text-gray-500 mt-1">
                {answerText.length} characters
              </p>
            </div>

            <VoiceRecorder
              questionId={question.id}
              interviewId={question.interview_id}
              onTranscription={(text) => setAnswerText(text)}
            />

            <Button
              onClick={handleSaveAnswer}
              disabled={isSaving || !answerText.trim()}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Answer
                </>
              )}
            </Button>

            {hasAnswered && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                ✓ Answer saved
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Camera Preview */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Camera Preview</CardTitle>
            <CardDescription>Ensure good lighting and eye contact</CardDescription>
          </CardHeader>
          <CardContent>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black"
            />
            <div className="mt-2 flex items-center justify-center gap-2">
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
                  Recording...
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isRecording 
                ? 'Camera is recording your response' 
                : 'Camera feed is visible only to you'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
