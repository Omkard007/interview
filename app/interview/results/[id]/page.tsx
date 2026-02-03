'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, ArrowLeft, Loader } from 'lucide-react';

interface InterviewResult {
  hrScore: number;
  technicalScore: number;
  overallFeedback: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const interviewId = params.id as string;

  const [result, setResult] = useState<InterviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadResults = async () => {
      try {
        const response = await fetch(`/api/interview/results/${interviewId}`);

        if (!response.ok) {
          throw new Error('Failed to load results');
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error('[v0] Failed to load results:', error);
        toast({
          title: 'Error',
          description: 'Failed to load interview results',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [interviewId, toast]);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/interview/export/${interviewId}`);

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-report-${interviewId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Downloaded',
        description: 'Your interview report has been downloaded',
      });
    } catch (error) {
      console.error('[v0] Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download report',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8">
            <Loader className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-600">Processing your interview results...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 text-center">
            <p className="text-gray-600 mb-4">Results not available</p>
            <Button onClick={() => router.push('/interview/domain-selection')}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const overallScore = (result.hrScore + result.technicalScore) / 2;
  const scoreColor = overallScore >= 7 ? 'text-green-600' : overallScore >= 5 ? 'text-yellow-600' : 'text-red-600';
  const scoreBg = overallScore >= 7 ? 'bg-green-50' : overallScore >= 5 ? 'bg-yellow-50' : 'bg-red-50';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Button
          onClick={() => router.push('/interview/domain-selection')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-gray-600">Here are your detailed results</p>
        </div>

        {/* Overall Score */}
        <Card className={`mb-6 ${scoreBg}`}>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-6xl font-bold ${scoreColor} mb-2`}>
                {overallScore.toFixed(1)}/10
              </div>
              <p className="text-gray-600">
                {overallScore >= 8
                  ? 'Excellent performance!'
                  : overallScore >= 6
                  ? 'Good performance!'
                  : overallScore >= 4
                  ? 'Average performance'
                  : 'Needs improvement'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scores Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">HR Skills Score</CardTitle>
              <CardDescription>Communication, teamwork, soft skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {result.hrScore.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(result.hrScore / 10) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Score</CardTitle>
              <CardDescription>Domain knowledge and skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                {result.technicalScore.toFixed(1)}/10
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${(result.technicalScore / 10) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
            <CardDescription>Question-by-question analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg max-h-48 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.overallFeedback}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="flex-1"
          >
            {isDownloading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Report
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push('/interview/domain-selection')}
            variant="outline"
            className="flex-1"
          >
            New Interview
          </Button>
        </div>

        {/* Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Tips for Improvement</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <ul className="list-disc list-inside space-y-2">
              <li>Practice speaking clearly and maintaining a steady pace</li>
              <li>Prepare specific examples and use the STAR method</li>
              <li>Research the domain thoroughly before interviews</li>
              <li>Get comfortable with your camera and audio setup</li>
              <li>Take your time formulating thoughtful answers</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
