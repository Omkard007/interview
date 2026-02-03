import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';
import { evaluateAnswer as evaluateAnswerLocal } from '@/lib/evaluation';
import { evaluateAnswer as evaluateAnswerGemini } from '@/lib/gemini';

function evaluateAnswer(question: any, answerText: any) {
  // Placeholder for actual implementation
  return { feedback: '', score: 0 };
}

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') || '';
    const sessionToken = getSessionFromCookie(cookie);
    const userId = validateSession(sessionToken || '');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const interview = getInterview(interviewId);
    if (!interview || interview.userId !== userId) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const allQuestions = [...interview.hrQuestions, ...interview.technicalQuestions];
    const answers = interview.answers || [];

    console.log('[v0] Submitting interview:', interviewId);
    console.log('[v0] Total questions:', allQuestions.length);
    console.log('[v0] Total answers:', answers.length);

    if (!answers || answers.length === 0) {
      console.error('[v0] No answers found in interview');
      return NextResponse.json(
        { error: 'No answers to evaluate. Please answer at least one question before submitting.' },
        { status: 400 }
      );
    }

    // Filter out empty answers
    const validAnswers = answers.filter((answer: string) => answer && answer.trim().length > 0);
    
    if (validAnswers.length === 0) {
      console.error('[v0] No valid answers found');
      return NextResponse.json(
        { error: 'No valid answers to evaluate. Please provide answers before submitting.' },
        { status: 400 }
      );
    }

    // Evaluate each answer
    let hrScore = 0;
    let technicalScore = 0;
    let hrCount = 0;
    let technicalCount = 0;
    const feedback: string[] = [];
    let useGemini = true;

    for (let i = 0; i < allQuestions.length; i++) {
      const question = allQuestions[i];
      const answerText = answers[i];

      if (!answerText || answerText.trim().length === 0) {
        console.log(`[v0] Skipping question ${i + 1} - no answer provided`);
        continue;
      }

      let evaluation;

      // Try Gemini evaluation first
      if (useGemini) {
        try {
          console.log('[v0] Attempting Gemini evaluation for Q' + (i + 1));
          evaluation = await evaluateAnswerGemini(question, answerText, interview.domain);
        } catch (geminiError) {
          console.warn('[v0] Gemini evaluation failed, switching to local evaluation:', geminiError);
          useGemini = false;
          evaluation = evaluateAnswerLocal(question, answerText);
        }
      } else {
        // Use local evaluation for remaining answers
        evaluation = evaluateAnswerLocal(question, answerText);
      }

      const questionType = i < interview.hrQuestions.length ? 'HR' : 'Technical';
      feedback.push(`Q${i + 1} (${questionType}): ${evaluation.feedback}`);

      if (i < interview.hrQuestions.length) {
        hrScore += evaluation.score;
        hrCount++;
      } else {
        technicalScore += evaluation.score;
        technicalCount++;
      }
    }

    // Calculate averages
    const avgHrScore = hrCount > 0 ? hrScore / hrCount : 0;
    const avgTechnicalScore = technicalCount > 0 ? technicalScore / technicalCount : 0;
    const overallScore = (avgHrScore + avgTechnicalScore) / 2;

    console.log('[v0] Evaluation complete - HR Score:', avgHrScore, 'Technical Score:', avgTechnicalScore, 'Overall:', overallScore);

    // Update interview with results
    const updatedInterview = updateInterview(interviewId, {
      score: Math.round(overallScore * 10) / 10,
      feedback,
      status: 'completed',
      completedAt: new Date().toISOString()
    });

    if (!updatedInterview) {
      console.error('[v0] Failed to update interview');
      return NextResponse.json(
        { error: 'Failed to save interview results' },
        { status: 500 }
      );
    }

    console.log('[v0] Interview saved successfully');

    return NextResponse.json(
      {
        hrScore: Math.round(avgHrScore * 10) / 10,
        technicalScore: Math.round(avgTechnicalScore * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
        feedback,
        message: 'Interview submitted successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[v0] Interview submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit interview' },
      { status: 500 }
    );
  }
}
