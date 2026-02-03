import { NextRequest, NextResponse } from 'next/server';
import { getInterview, getUserById } from '@/lib/file-storage';
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

    const { id: interviewId } = params;

    const interview = await getInterview(interviewId);
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

    const user = await getUserById(userId);
    const allQuestions = [...interview.hrQuestions, ...interview.technicalQuestions];
    const answers = interview.answers;
    const result = interview.score; // Assuming score is an object containing hr_score and technical_score
    const questions = allQuestions; // Using allQuestions as the source for questions

    // Create HTML report
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interview Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: linear-gradient(to right, #4f46e5, #2563eb);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .candidate-info {
      background: white;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
      border-left: 4px solid #4f46e5;
    }
    .scores {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    .score-card {
      background: white;
      padding: 20px;
      border-radius: 4px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .score-hr { color: #2563eb; }
    .score-tech { color: #4f46e5; }
    .overall-score {
      background: #f0f9ff;
      border: 2px solid #0284c7;
      padding: 20px;
      border-radius: 4px;
      text-align: center;
      margin-bottom: 30px;
    }
    .overall-score .value {
      font-size: 64px;
      font-weight: bold;
      color: #0284c7;
      margin: 10px 0;
    }
    .questions-section {
      background: white;
      padding: 20px;
      border-radius: 4px;
      margin-top: 30px;
    }
    .question-item {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .question-item:last-child {
      border-bottom: none;
    }
    .question-text {
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .question-type {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: bold;
      margin-bottom: 10px;
      background: #e0e7ff;
      color: #4f46e5;
    }
    .answer-text {
      background: #f9fafb;
      padding: 10px;
      border-radius: 3px;
      color: #374151;
      font-size: 14px;
      line-height: 1.5;
    }
    .feedback-section {
      background: #fffbeb;
      padding: 15px;
      border-left: 4px solid #f59e0b;
      margin-top: 30px;
      border-radius: 4px;
    }
    .feedback-section h3 {
      margin-top: 0;
      color: #92400e;
    }
    .feedback-section p {
      margin: 0;
      color: #78350f;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
    }
    .page-break { page-break-after: always; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Interview Report</h1>
    <p>AI-Powered Interview Assessment</p>
  </div>

  <div class="candidate-info">
    <strong>Candidate:</strong> ${user?.name || 'N/A'}<br>
    <strong>Domain:</strong> ${interview.domain}<br>
    <strong>Date:</strong> ${new Date(interview.startedAt).toLocaleDateString()}<br>
    <strong>Time:</strong> ${new Date(interview.startedAt).toLocaleTimeString()}
  </div>

  <div class="overall-score">
    <div>Overall Performance Score</div>
    <div class="value">${interview.score?.toFixed(1) || 'N/A'}/10</div>
    <div style="color: #666; font-size: 14px;">
      ${(interview.score || 0) >= 8 ? 'Excellent' : (interview.score || 0) >= 6 ? 'Good' : 'Average'}
    </div>
  </div>

  <div class="scores">
    <div class="score-card">
      <div>Performance Metrics</div>
      <div class="score-value score-hr">${interview.score?.toFixed(1) || 'N/A'}</div>
      <small>Overall Score</small>
    </div>
    <div class="score-card">
      <div>Total Questions</div>
      <div class="score-value score-tech">${allQuestions.length}</div>
      <small>Completed Questions</small>
    </div>
  </div>

  <div class="questions-section">
    <h2>Question-by-Question Analysis</h2>
    ${allQuestions
      .map((q, i) => {
        const answer = answers[i];
        const isHR = i < interview.hrQuestions.length;
        return `
      <div class="question-item">
        <span class="question-type">${isHR ? 'HR Question' : 'Technical Question'}</span>
        <div class="question-text">Q${i + 1}: ${q}</div>
        <div class="answer-text"><strong>Answer:</strong> ${answer || 'Not answered'}</div>
      </div>
    `;
      })
      .join('')}
  </div>

  <div class="feedback-section">
    <h3>Detailed Feedback</h3>
    <p>${(interview.feedback || []).join('\n\n')}</p>
  </div>

  <div class="footer">
    <p>This report was generated by the AI Interview System. For more details, visit the platform.</p>
    <p>Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
  </div>
</body>
</html>
    `;

    // Return HTML as downloadable file (browsers will handle PDF conversion via print)
    return new NextResponse(htmlReport, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="interview-report-${interviewId}.html"`,
      },
    });
  } catch (error) {
    console.error('[v0] Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}
