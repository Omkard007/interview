import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview, saveAnswerVideo } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';

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

    // Handle FormData (for video upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    let interviewId: string;
    let questionId: string;
    let answerText: string;
    let videoFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      interviewId = formData.get('interviewId') as string;
      questionId = formData.get('questionId') as string;
      answerText = formData.get('answerText') as string;
      videoFile = formData.get('video') as File | null;
    } else {
      const body = await request.json();
      interviewId = body.interviewId;
      questionId = body.questionId;
      answerText = body.answerText;
    }

    if (!interviewId || !questionId || !answerText) {
      return NextResponse.json(
        { error: 'Missing required fields: interviewId, questionId, and answerText are required' },
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

    // Find question index by questionId
    // Questions are stored as: 5 HR questions + 5 Technical questions
    const allQuestions = [...interview.hrQuestions, ...interview.technicalQuestions];
    let questionIndex = -1;
    
    // Try to find question by ID (format: hr-1, tech-1, etc.)
    if (questionId.startsWith('hr-')) {
      const index = parseInt(questionId.split('-')[1]) - 1;
      if (index >= 0 && index < interview.hrQuestions.length) {
        questionIndex = index;
      }
    } else if (questionId.startsWith('tech-')) {
      const index = parseInt(questionId.split('-')[1]) - 1;
      if (index >= 0 && index < interview.technicalQuestions.length) {
        questionIndex = interview.hrQuestions.length + index;
      }
    }

    if (questionIndex === -1) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Initialize answers array if it doesn't exist or is too short
    const updatedAnswers = interview.answers || [];
    while (updatedAnswers.length <= questionIndex) {
      updatedAnswers.push('');
    }
    updatedAnswers[questionIndex] = answerText;

    // Initialize answerVideos array if it doesn't exist or is too short
    const updatedAnswerVideos = interview.answerVideos || [];
    while (updatedAnswerVideos.length <= questionIndex) {
      updatedAnswerVideos.push('');
    }

    // Save video if provided
    let videoPath = '';
    if (videoFile && videoFile.size > 0) {
      try {
        const arrayBuffer = await videoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        videoPath = saveAnswerVideo(interviewId, questionId, buffer, videoFile.name);
        updatedAnswerVideos[questionIndex] = videoPath;
        console.log('[v0] Video saved:', videoPath);
      } catch (videoError) {
        console.error('[v0] Failed to save video:', videoError);
        // Continue without video if save fails
      }
    }

    // Update interview status to 'in-progress' if it's still 'started'
    const statusUpdate = interview.status === 'started' ? 'in-progress' : interview.status;

    const updated = updateInterview(interviewId, {
      answers: updatedAnswers,
      answerVideos: updatedAnswerVideos,
      status: statusUpdate
    });

    if (!updated) {
      console.error('[v0] Failed to update interview with answer');
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    console.log('[v0] Answer saved successfully for question', questionId, 'at index', questionIndex);

    return NextResponse.json(
      { 
        message: 'Answer saved successfully',
        answerId: questionId,
        questionIndex 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Save answer error:', error);
    return NextResponse.json(
      { error: 'Failed to save answer' },
      { status: 500 }
    );
  }
}
