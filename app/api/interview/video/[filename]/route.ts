import { NextRequest, NextResponse } from 'next/server';
import { getVideoPath } from '@/lib/file-storage';
import { validateSession, getSessionFromCookie } from '@/lib/auth';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
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

    const { filename } = params;
    
    // Security: Only allow alphanumeric, hyphens, and dots in filename
    if (!/^[a-zA-Z0-9\-_.]+$/.test(filename)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    const videoPath = getVideoPath(filename);
    
    if (!fs.existsSync(videoPath)) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const videoBuffer = fs.readFileSync(videoPath);
    const stats = fs.statSync(videoPath);

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/webm',
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('[v0] Video serving error:', error);
    return NextResponse.json(
      { error: 'Failed to serve video' },
      { status: 500 }
    );
  }
}

