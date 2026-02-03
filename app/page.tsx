'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Mic, BarChart3, Smartphone } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600">AI Interviewer</div>
          <Button onClick={() => router.push('/auth')} variant="default">
            Get Started
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Practice Interviews with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {' '}
              AI
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-balance">
            Get interview ready with realistic questions, instant feedback, and detailed performance analytics.
            Interview in multiple domains with AI-powered evaluation.
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/auth')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Start Your Interview Now
          </Button>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          <Card>
            <CardHeader>
              <Zap className="text-indigo-600 mb-2" size={24} />
              <CardTitle>AI Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get domain-specific HR and technical questions powered by advanced AI
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mic className="text-blue-600 mb-2" size={24} />
              <CardTitle>Voice Response</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Record your answers and get automatic transcription with speech recognition
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="text-purple-600 mb-2" size={24} />
              <CardTitle>Camera Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Practice with video preview to perfect your eye contact and presentation
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="text-indigo-600 mb-2" size={24} />
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get comprehensive scoring on HR skills and technical knowledge
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 mb-20">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">6+</div>
              <p className="text-gray-600">Interview Domains</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">10</div>
              <p className="text-gray-600">Questions per Interview</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600 mb-2">AI</div>
              <p className="text-gray-600">Powered Evaluation</p>
            </div>
          </div>
        </div>

        {/* Domains Preview */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Supported Domains</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Frontend Development', emoji: '⚛️' },
              { name: 'Backend Development', emoji: '🔧' },
              { name: 'Full Stack', emoji: '🌐' },
              { name: 'Data Science', emoji: '📊' },
              { name: 'DevOps', emoji: '🚀' },
              { name: 'QA Engineering', emoji: '✅' },
            ].map((domain, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{domain.emoji}</div>
                  <p className="font-medium">{domain.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto text-center bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 md:p-12 text-white mb-20">
          <h2 className="text-3xl font-bold mb-4">Ready to Practice?</h2>
          <p className="text-lg opacity-90 mb-6">
            Join thousands of candidates preparing for their next interview
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/auth')}
            className="bg-white text-indigo-600 hover:bg-gray-100"
          >
            Get Started for Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>AI Interviewer - Practice, Learn, and Master Your Interviews</p>
          <p className="text-sm mt-2">Made with care for interview preparation</p>
        </div>
      </div>
    </div>
  );
}
