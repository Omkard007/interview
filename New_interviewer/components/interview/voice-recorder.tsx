'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  questionId: string;
  interviewId: string;
  onTranscription: (text: string) => void;
}

export default function VoiceRecorder({
  questionId,
  interviewId,
  onTranscription,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript((prev) => prev + transcript + ' ');
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[v0] Speech recognition error:', event.error);
        toast({
          title: 'Recording error',
          description: `${event.error}`,
          variant: 'destructive',
        });
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [toast]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);

      // Wait a moment for final transcription
      setTimeout(() => {
        if (transcript.trim()) {
          onTranscription(transcript);
          toast({
            title: 'Transcription complete',
            description: 'Your answer has been transcribed and added to the text field',
          });
        }
      }, 500);
    }
  };

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Voice Response
        </CardTitle>
        <CardDescription>Click to record and auto-transcribe your answer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {transcript && (
          <div className="p-3 bg-white rounded border border-blue-200">
            <p className="text-sm text-gray-700">{transcript}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isRecording ? (
            <Button
              onClick={startRecording}
              variant="outline"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2 bg-transparent"
            >
              <Mic className="h-4 w-4" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              size="sm"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop Recording
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" />
            Recording in progress...
          </div>
        )}

        <p className="text-xs text-gray-500">
          Supported in Chrome, Edge, and Safari. Make sure microphone access is allowed.
        </p>
      </CardContent>
    </Card>
  );
}
