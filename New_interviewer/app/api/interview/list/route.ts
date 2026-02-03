import { NextRequest, NextResponse } from 'next/server';
import { getUserInterviews } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const interviews = getUserInterviews(userId);
    
    // Sort by most recent first
    const sortedInterviews = interviews.sort((a, b) => {
      const dateA = new Date(a.startedAt).getTime();
      const dateB = new Date(b.startedAt).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(
      { interviews: sortedInterviews },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  }
}

