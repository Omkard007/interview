import { NextRequest, NextResponse } from 'next/server';
import { getInterview, updateInterview, saveResume } from '@/lib/file-storage';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const interviewId = formData.get('interviewId') as string;

    if (!file || !interviewId) {
      return NextResponse.json(
        { error: 'File and interview ID required' },
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

    // Save resume file
    const buffer = await file.arrayBuffer();
    const resumePath = saveResume(userId, file.name, Buffer.from(buffer));

    // Update interview with resume info
    updateInterview(interviewId, {
      resumePath,
      status: 'in-progress'
    });

    return NextResponse.json(
      { message: 'Resume uploaded successfully', resumePath },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}
