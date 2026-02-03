import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

const DB_DIR = path.join(process.cwd(), 'db');
const USERS_DIR = path.join(DB_DIR, 'users');
const INTERVIEWS_DIR = path.join(DB_DIR, 'interviews');
const RESUMES_DIR = path.join(DB_DIR, 'resumes');
const VIDEOS_DIR = path.join(DB_DIR, 'videos');

// Ensure directories exist
function ensureDirsExist() {
  [DB_DIR, USERS_DIR, INTERVIEWS_DIR, RESUMES_DIR, VIDEOS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

// User Management
export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export function getUserByEmail(email: string): User | null {
  ensureDirsExist();
  // Normalize email to lowercase for consistent lookup
  const normalizedEmail = email.toLowerCase().trim();
  const userFile = path.join(USERS_DIR, `${normalizedEmail}.json`);
  
  try {
    if (fs.existsSync(userFile)) {
      const data = fs.readFileSync(userFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading user file for ${normalizedEmail}:`, error);
  }
  
  return null;
}

export function getUserById(id: string): User | null {
  ensureDirsExist();
  try {
    const files = fs.readdirSync(USERS_DIR);
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(USERS_DIR, file), 'utf-8'));
      if (data.id === id) {
        return data;
      }
    }
  } catch (error) {
    console.error(`Error reading user ${id}:`, error);
  }
  
  return null;
}

export function createUser(email: string, name: string, passwordHash: string): User {
  ensureDirsExist();
  
  // Normalize email to lowercase for consistent storage
  const normalizedEmail = email.toLowerCase().trim();
  
  const user: User = {
    id: randomUUID(),
    email: normalizedEmail,
    name: name.trim(),
    passwordHash,
    createdAt: new Date().toISOString()
  };
  
  const userFile = path.join(USERS_DIR, `${normalizedEmail}.json`);
  fs.writeFileSync(userFile, JSON.stringify(user, null, 2));
  
  return user;
}

// Interview Management
export interface InterviewData {
  id: string;
  userId: string;
  domain: string;
  resumePath: string;
  hrQuestions: string[];
  technicalQuestions: string[];
  answers: string[];
  answerVideos: string[];
  answerAudio: string[];
  score: number | null;
  feedback: string[] | null;
  startedAt: string;
  completedAt: string | null;
  status: 'started' | 'in-progress' | 'completed';
}

export function createInterview(userId: string, domain: string, resumePath: string, questions: { hr: string[]; technical: string[] }): InterviewData {
  ensureDirsExist();
  
  const interview: InterviewData = {
    id: randomUUID(),
    userId,
    domain,
    resumePath,
    hrQuestions: questions.hr,
    technicalQuestions: questions.technical,
    answers: [],
    answerVideos: [],
    answerAudio: [],
    score: null,
    feedback: null,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: 'started'
  };
  
  const interviewFile = path.join(INTERVIEWS_DIR, `${interview.id}.json`);
  fs.writeFileSync(interviewFile, JSON.stringify(interview, null, 2));
  
  return interview;
}

export function getInterview(interviewId: string): InterviewData | null {
  ensureDirsExist();
  const interviewFile = path.join(INTERVIEWS_DIR, `${interviewId}.json`);
  
  try {
    if (fs.existsSync(interviewFile)) {
      const data = fs.readFileSync(interviewFile, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading interview ${interviewId}:`, error);
  }
  
  return null;
}

export function updateInterview(interviewId: string, updates: Partial<InterviewData>): InterviewData | null {
  ensureDirsExist();
  const interview = getInterview(interviewId);
  
  if (!interview) {
    return null;
  }
  
  const updated = { ...interview, ...updates };
  const interviewFile = path.join(INTERVIEWS_DIR, `${interviewId}.json`);
  fs.writeFileSync(interviewFile, JSON.stringify(updated, null, 2));
  
  return updated;
}

export function getUserInterviews(userId: string): InterviewData[] {
  ensureDirsExist();
  const interviews: InterviewData[] = [];
  
  try {
    const files = fs.readdirSync(INTERVIEWS_DIR);
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(INTERVIEWS_DIR, file), 'utf-8'));
      if (data.userId === userId) {
        interviews.push(data);
      }
    }
  } catch (error) {
    console.error('Error reading interviews:', error);
  }
  
  return interviews;
}

// Resume Management
export function saveResume(userId: string, filename: string, buffer: Buffer): string {
  ensureDirsExist();
  
  const resumeName = `${userId}-${Date.now()}-${filename}`;
  const resumePath = path.join(RESUMES_DIR, resumeName);
  fs.writeFileSync(resumePath, buffer);
  
  return resumeName;
}

export function getResumePath(resumeName: string): string {
  return path.join(RESUMES_DIR, resumeName);
}

export function readResumeText(resumePath: string): string {
  try {
    // For PDF, you would need pdf-parse library
    // For now, return filename as identifier
    return `Resume: ${path.basename(resumePath)}`;
  } catch (error) {
    console.error('Error reading resume:', error);
    return '';
  }
}

// Answer Video Management
export function saveAnswerVideo(interviewId: string, questionId: string, buffer: Buffer, originalFilename: string): string {
  ensureDirsExist();
  
  // Create videos directory if it doesn't exist
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
  
  const videoName = `${interviewId}-${questionId}-${Date.now()}.webm`;
  const videoPath = path.join(VIDEOS_DIR, videoName);
  fs.writeFileSync(videoPath, buffer);
  
  return videoName; // Return just the filename for storage
}

export function getVideoPath(videoName: string): string {
  return path.join(VIDEOS_DIR, videoName);
}
