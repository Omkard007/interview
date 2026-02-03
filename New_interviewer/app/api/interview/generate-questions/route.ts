import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';
import { getQuestionsByDomain } from '@/lib/questions-db';

export async function POST(request: NextRequest) {
  let interviewId: string | undefined;
  
  try {
    const cookie = request.headers.get('cookie') || '';
    const sessionToken = getSessionFromCookie(cookie);
    const userId = validateSession(sessionToken || '');

    if (!userId) {
      console.error('[v0] No valid session found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    interviewId = body.interviewId;

    if (!interviewId) {
      console.error('[v0] No interviewId provided');
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log('[v0] Getting interview:', interviewId, 'for user:', userId);
    const interview = getInterview(interviewId);
    
    if (!interview) {
      console.error('[v0] Interview not found:', interviewId);
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.userId !== userId) {
      console.error('[v0] User mismatch. Interview userId:', interview.userId, 'Current userId:', userId);
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    console.log('[v0] Interview found. Domain:', interview.domain, 'HR Questions:', interview.hrQuestions?.length || 0, 'Tech Questions:', interview.technicalQuestions?.length || 0);

    // Check if questions already exist
    if (interview.hrQuestions && interview.hrQuestions.length > 0 && 
        interview.technicalQuestions && interview.technicalQuestions.length > 0) {
      console.log('[v0] Using existing questions from interview');
      // Format existing questions for frontend
      const formattedQuestions = [
        ...interview.hrQuestions.map((q, index) => ({
          id: `hr-${index + 1}`,
          interview_id: interviewId,
          question_text: q,
          question_type: 'hr',
          order_num: index + 1,
        })),
        ...interview.technicalQuestions.map((q, index) => ({
          id: `tech-${index + 1}`,
          interview_id: interviewId,
          question_text: q,
          question_type: 'technical',
          order_num: interview.hrQuestions.length + index + 1,
        })),
      ];
      
      console.log('[v0] Returning', formattedQuestions.length, 'existing questions');
      return NextResponse.json(
        { questions: formattedQuestions, hrQuestions: interview.hrQuestions, technicalQuestions: interview.technicalQuestions },
        { status: 200 }
      );
    }

    console.log('[v0] No existing questions found, generating new ones');

    // Use hardcoded questions directly
    console.log('[v0] Using hardcoded questions for domain:', interview.domain);
    const hardcodedQuestions = getQuestionsByDomain(interview.domain);
    
    if (!hardcodedQuestions || !hardcodedQuestions.hr || !hardcodedQuestions.technical) {
      console.error('[v0] Failed to get questions for domain:', interview.domain);
      return NextResponse.json(
        { error: `No questions available for domain: ${interview.domain}` },
        { status: 500 }
      );
    }

    const hrQuestions = hardcodedQuestions.hr;
    const technicalQuestions = hardcodedQuestions.technical;

    console.log('[v0] Got questions - HR:', hrQuestions.length, 'Technical:', technicalQuestions.length);

    // Update interview with questions
    updateInterview(interviewId, {
      hrQuestions,
      technicalQuestions
    });

    // Format questions for frontend: combine HR and technical questions with proper structure
    const formattedQuestions = [
      ...hrQuestions.map((q, index) => ({
        id: `hr-${index + 1}`,
        interview_id: interviewId,
        question_text: q,
        question_type: 'hr',
        order_num: index + 1,
      })),
      ...technicalQuestions.map((q, index) => ({
        id: `tech-${index + 1}`,
        interview_id: interviewId,
        question_text: q,
        question_type: 'technical',
        order_num: hrQuestions.length + index + 1,
      })),
    ];

    return NextResponse.json(
      { questions: formattedQuestions, hrQuestions, technicalQuestions },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Question loading error:', error);
    
    // Final fallback: ensure we always have questions
    try {
      if (interviewId) {
        const fallbackInterview = getInterview(interviewId);
        if (fallbackInterview) {
          const fallbackQuestions = getQuestionsByDomain(fallbackInterview.domain);
          updateInterview(fallbackInterview.id, {
            hrQuestions: fallbackQuestions.hr,
            technicalQuestions: fallbackQuestions.technical
          });
          
          // Format questions for frontend
          const formattedQuestions = [
            ...fallbackQuestions.hr.map((q, index) => ({
              id: `hr-${index + 1}`,
              interview_id: fallbackInterview.id,
              question_text: q,
              question_type: 'hr',
              order_num: index + 1,
            })),
            ...fallbackQuestions.technical.map((q, index) => ({
              id: `tech-${index + 1}`,
              interview_id: fallbackInterview.id,
              question_text: q,
              question_type: 'technical',
              order_num: fallbackQuestions.hr.length + index + 1,
            })),
          ];
          
          return NextResponse.json(
            { questions: formattedQuestions, hrQuestions: fallbackQuestions.hr, technicalQuestions: fallbackQuestions.technical },
            { status: 201 }
          );
        }
      }
    } catch {
      // Ignore fallback errors
    }

    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
