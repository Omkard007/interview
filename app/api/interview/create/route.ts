import { NextRequest, NextResponse } from 'next/server';
import { createInterview } from '@/lib/file-storage';
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

    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const interview = createInterview(userId, domain, '', { hr: [], technical: [] });

    return NextResponse.json(
      { interviewId: interview.id, message: 'Interview created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Interview creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  }
}
