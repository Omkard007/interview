'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, LayoutDashboard } from 'lucide-react';

const DOMAINS = [
  { id: 'frontend', name: 'Frontend Development', icon: '⚛️', description: 'React, Vue, Angular' },
  { id: 'backend', name: 'Backend Development', icon: '🔧', description: 'Node.js, Python, Java' },
  { id: 'fullstack', name: 'Full Stack', icon: '🌐', description: 'Both Frontend & Backend' },
  { id: 'data-science', name: 'Data Science', icon: '📊', description: 'ML, Analytics, AI' },
  { id: 'devops', name: 'DevOps', icon: '🚀', description: 'Cloud, Docker, Kubernetes' },
  { id: 'qa', name: 'QA Engineering', icon: '✅', description: 'Testing, Automation' },
];

export default function DomainSelectionPage() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleContinue = async () => {
    if (!selectedDomain) {
      toast({
        title: 'Please select a domain',
        description: 'Choose a domain to continue with the interview',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create interview in database
      const response = await fetch('/api/interview/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: selectedDomain }),
      });

      if (!response.ok) {
        throw new Error('Failed to create interview');
      }

      const data = await response.json();
      const interviewId = data.interviewId;

      // Upload resume if provided
      if (resumeFile) {
        const formData = new FormData();
        formData.append('file', resumeFile);
        formData.append('interviewId', interviewId);

        const uploadResponse = await fetch('/api/interview/upload-resume', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          toast({
            title: 'Resume upload failed',
            description: 'Continuing without resume',
          });
        }
      }

      // Redirect to interview page
      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error('[v0] Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start interview',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold mb-2">Select Your Interview Domain</h1>
              <p className="text-gray-600">Choose the domain you want to be interviewed for</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DOMAINS.map((domain) => (
            <Card
              key={domain.id}
              className={`cursor-pointer transition-all ${
                selectedDomain === domain.id
                  ? 'ring-2 ring-blue-600 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedDomain(domain.id)}
            >
              <CardHeader>
                <div className="text-4xl mb-2">{domain.icon}</div>
                <CardTitle>{domain.name}</CardTitle>
                <CardDescription>{domain.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upload Resume (Optional)</CardTitle>
            <CardDescription>
              Upload your resume to help us generate relevant questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <label className="flex-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition">
                <div className="flex flex-col items-center gap-2">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {resumeFile ? resumeFile.name : 'Click to upload resume (PDF or TXT)'}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
              {resumeFile && (
                <button
                  onClick={() => setResumeFile(null)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/interview/domain-selection')}
            variant="outline"
            className="flex-1"
            disabled={isLoading}
          >
            Back
          </Button>
          <Button
            onClick={handleContinue}
            className="flex-1"
            disabled={!selectedDomain || isLoading}
          >
            {isLoading ? 'Starting...' : 'Start Interview'}
          </Button>
        </div>
      </div>
    </div>
  );
}
