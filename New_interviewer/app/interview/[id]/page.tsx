'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, Loader } from 'lucide-react';
import InterviewQuestion from '@/components/interview/interview-question';

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

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const interviewId = params.id as string;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());

  useEffect(() => {
    const loadQuestions = async () => {
      if (!interviewId) {
        console.error('[v0] No interviewId provided');
        setIsLoading(false);
        return;
      }

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error('[v0] Request timeout - taking too long');
        setIsLoading(false);
        toast({
          title: 'Timeout',
          description: 'Request is taking too long. Please try again.',
          variant: 'destructive',
        });
      }, 10000); // 10 second timeout

      try {
        console.log('[v0] Loading questions for interview:', interviewId);
        const response = await fetch('/api/interview/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ interviewId }),
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[v0] Failed to load questions - response not ok:', response.status, errorData);
          
          let errorMessage = errorData.error || 'Failed to load questions';
          if (response.status === 401) {
            errorMessage = 'Please log in to continue';
            setTimeout(() => router.push('/auth'), 2000);
          } else if (response.status === 404) {
            errorMessage = 'Interview not found. Please start a new interview.';
            setTimeout(() => router.push('/interview/domain-selection'), 2000);
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('[v0] Questions response:', data);
        
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          console.log('[v0] Setting questions:', data.questions.length, 'questions');
          setQuestions(data.questions);
          setIsLoading(false);
        } else {
          console.error('[v0] Invalid questions format:', data);
          throw new Error('No questions received from server');
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('[v0] Failed to load questions:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to load interview questions',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [interviewId, router, toast]);

  const handleAnswerSaved = (questionId: string, answer: Answer) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (questions && currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinish = async () => {
    try {
      const response = await fetch('/api/interview/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interviewId }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, use status text
        throw new Error(response.statusText || 'Failed to submit interview');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit interview');
      }

      console.log('[v0] Interview submitted successfully:', data);

      toast({
        title: 'Success',
        description: data.message || 'Interview submitted successfully!',
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (error: any) {
      console.error('[v0] Failed to submit interview:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit interview. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8">
            <Loader className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-600">Loading interview questions...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600">No questions available</p>
            <Button onClick={() => router.push('/interview/domain-selection')} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600">Question not found</p>
            <Button onClick={() => router.push('/interview/domain-selection')} className="mt-4">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasAnswered = answers.has(currentQuestion.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">Interview in Progress</h1>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <InterviewQuestion
          question={currentQuestion}
          onAnswerSaved={handleAnswerSaved}
          hasAnswered={hasAnswered}
        />

        {/* Navigation */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentQuestionIndex === 0}
            className="flex-1 bg-transparent"
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            variant="outline"
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex-1 bg-transparent"
          >
            Next
          </Button>

          {currentQuestionIndex === questions.length - 1 && (
            <Button
              onClick={handleFinish}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Finish Interview
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
