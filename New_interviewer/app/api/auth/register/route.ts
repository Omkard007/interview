import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/file-storage';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    // Check if user already exists
    if (getUserByEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = createUser(normalizedEmail, normalizedName, hashedPassword);
    const sessionToken = createSession(user.id);

    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );

    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
