'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Calendar, TrendingUp, Loader, ArrowLeft, Home, Video } from 'lucide-react';

interface Interview {
  id: string;
  domain: string;
  status: 'started' | 'in-progress' | 'completed';
  score: number | null;
  startedAt: string;
  completedAt: string | null;
  hrQuestions: string[];
  technicalQuestions: string[];
  answers: string[];
  answerVideos: string[];
  feedback: string[] | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedInterview, setExpandedInterview] = useState<string | null>(null);
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  useEffect(() => {
    const loadInterviews = async () => {
      try {
        const response = await fetch('/api/interview/list');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/auth');
            return;
          }
          throw new Error('Failed to load interviews');
        }

        const data = await response.json();
        setInterviews(data.interviews || []);
      } catch (error) {
        console.error('[v0] Failed to load interviews:', error);
        toast({
          title: 'Error',
          description: 'Failed to load interviews',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadInterviews();
  }, [router, toast]);

  const handleDownload = async (interviewId: string) => {
    try {
      const response = await fetch(`/api/interview/export/${interviewId}`);
      
      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-report-${interviewId}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
      });
    } catch (error) {
      console.error('[v0] Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download report',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDomainDisplayName = (domain: string) => {
    const domainMap: Record<string, string> = {
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      fullstack: 'Full Stack',
      'data-science': 'Data Science',
      devops: 'DevOps',
      qa: 'QA Engineering',
    };
    return domainMap[domain] || domain;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 pt-8">
            <Loader className="animate-spin text-blue-600" size={32} />
            <p className="text-gray-600">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Interview Dashboard</h1>
              <p className="text-gray-600">View all your interview sessions and transcriptions</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => router.push('/')}
                variant="outline"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button
                onClick={() => router.push('/interview/domain-selection')}
              >
                New Interview
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Interviews</p>
                  <p className="text-3xl font-bold">{interviews.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold">
                    {interviews.filter(i => i.status === 'completed').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-3xl font-bold">
                    {interviews.filter(i => i.score !== null).length > 0
                      ? (
                          interviews
                            .filter(i => i.score !== null)
                            .reduce((sum, i) => sum + (i.score || 0), 0) /
                          interviews.filter(i => i.score !== null).length
                        ).toFixed(1)
                      : 'N/A'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interviews List */}
        {interviews.length === 0 ? (
          <Card>
            <CardContent className="pt-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No interviews yet</p>
              <Button onClick={() => router.push('/interview/domain-selection')}>
                Start Your First Interview
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {interviews.map((interview) => {
              const allQuestions = [...interview.hrQuestions, ...interview.technicalQuestions];
              const isExpanded = expandedInterview === interview.id;

              return (
                <Card key={interview.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {getDomainDisplayName(interview.domain)}
                          </CardTitle>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              interview.status
                            )}`}
                          >
                            {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                          </span>
                          {interview.score !== null && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                              Score: {interview.score}/10
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(interview.startedAt)}
                          </div>
                          {interview.completedAt && (
                            <div className="flex items-center gap-1">
                              Completed: {formatDate(interview.completedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {interview.status === 'completed' && (
                          <Button
                            onClick={() => handleDownload(interview.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                        <Button
                          onClick={() =>
                            setExpandedInterview(isExpanded ? null : interview.id)
                          }
                          variant="outline"
                          size="sm"
                        >
                          {isExpanded ? 'Hide' : 'View'} Transcriptions
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-6 mt-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Questions & Answers</h3>
                          <div className="space-y-4">
                            {allQuestions.map((question, index) => {
                              const answer = interview.answers[index] || 'No answer provided';
                              const isHR = index < interview.hrQuestions.length;
                              const questionType = isHR ? 'HR' : 'Technical';

                              return (
                                <div
                                  key={index}
                                  className="border rounded-lg p-4 bg-white"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                      {questionType} Question {index + 1}
                                    </span>
                                  </div>
                                  <p className="font-semibold text-gray-900 mb-2">
                                    {question}
                                  </p>
                                  <div className="mt-3 space-y-2">
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                                      {answer}
                                    </p>
                                    {interview.answerVideos && interview.answerVideos[index] && (
                                      <div className="mt-2">
                                        <button
                                          onClick={() => setExpandedVideo(expandedVideo === `${interview.id}-${index}` ? null : `${interview.id}-${index}`)}
                                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                        >
                                          <Video className="h-4 w-4" />
                                          {expandedVideo === `${interview.id}-${index}` ? 'Hide' : 'View'} Video Response
                                        </button>
                                        {expandedVideo === `${interview.id}-${index}` && (
                                          <div className="mt-2 rounded-lg overflow-hidden bg-black">
                                            <video
                                              src={`/api/interview/video/${interview.answerVideos[index]}`}
                                              controls
                                              className="w-full max-h-96"
                                            >
                                              Your browser does not support the video tag.
                                            </video>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {interview.feedback && interview.feedback.length > 0 && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Feedback</h3>
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                              {interview.feedback.map((fb, index) => (
                                <p key={index} className="text-sm text-gray-700 mb-2">
                                  {fb}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

