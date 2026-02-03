import { NextRequest, NextResponse } from 'next/server';
import { getInterview } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id: interviewId } = await params;

    const interview = getInterview(interviewId);
    if (!interview || interview.userId !== userId) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (interview.status !== 'completed' || interview.score === null) {
      return NextResponse.json(
        { error: 'Results not available' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        overallScore: interview.score,
        feedback: interview.feedback,
        domain: interview.domain,
        completedAt: interview.completedAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get results error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve results' },
      { status: 500 }
    );
  }
}
