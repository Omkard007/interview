# AI Interviewer Application

A comprehensive AI-powered interview practice platform built with Next.js. Get prepared for real interviews with domain-specific questions, real-time feedback, and detailed performance analytics.

## Features

- **User Authentication**: Secure registration and login system
- **Domain Selection**: Practice for 6 different tech domains (Frontend, Backend, Full Stack, Data Science, DevOps, QA)
- **Resume Upload**: Optional resume upload for your records
- **Smart Question Generation**: 
  - Tries Google Gemini API first for AI-generated personalized questions (if GEMINI_API_KEY is set)
  - Automatically falls back to 60+ hardcoded domain-specific questions if API fails
  - 5 HR-level questions per domain (soft skills, communication)
  - 5 Technical questions per domain (domain-specific knowledge)
- **Interview Interface**:
  - Live camera preview
  - Voice recording with automatic transcription (Web Speech API)
  - Text-based answer input
  - Question navigation
- **AI Evaluation**: Get scored on HR skills and technical knowledge
- **Results Dashboard**: Detailed performance analytics and feedback
- **Report Export**: Download PDF reports of your interview

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Storage**: File-based JSON storage (no database required)
- **Authentication**: Custom session-based with crypto hashing
- **AI Integration**: Google Gemini API (optional) with automatic fallback to hardcoded questions
- **Evaluation**: Tries Gemini first, falls back to local intelligent evaluation (word count, content analysis)
- **Voice**: Web Speech API (built-in browser API)
- **File Storage**: Local file system in `db/` folder

## Prerequisites

- Node.js 18+ and npm/yarn
- Optional: Google Gemini API key for AI-powered question generation (free tier available at https://ai.google.dev/)
- Works fully offline with hardcoded questions if no API key provided

## Installation & Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd ai-interviewer

# Install dependencies
npm install
```

### 2. Optional: Set Up Gemini API (for AI-powered questions)

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key from https://ai.google.dev/

If you skip this step, the app will use hardcoded questions automatically.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

### First Time Users

1. Visit `http://localhost:3000`
2. Click "Get Started"
3. Create an account or sign in
4. Select your interview domain
5. (Optional) Upload your resume
6. Start the interview

### During Interview

1. Read the question carefully
2. Either type your answer or use voice recording
3. Click "Save Answer" to record your response
4. Navigate through questions using Previous/Next buttons
5. Click "Finish Interview" when done

### View Results

- See your overall score (0-10)
- Check HR skills vs Technical scores
- Read detailed feedback for each question
- Download PDF report

## Project Structure

```
├── app/
│   ├── api/
│   │   └── interview/          # All interview-related APIs
│   │       ├── create/
│   │       ├── generate-questions/
│   │       ├── save-answer/
│   │       ├── submit/
│   │       ├── results/
│   │       └── export/
│   ├── auth/                   # Authentication pages
│   ├── interview/
│   │   ├── domain-selection/   # Domain selection page
│   │   ├── [id]/              # Main interview page
│   │   └── results/[id]/      # Results dashboard
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn/ui components
│   └── interview/
│       ├── interview-question.tsx
│       └── voice-recorder.tsx
├── lib/
│   ├── file-storage.ts         # File-based storage utilities
│   ├── auth.ts                 # Authentication utilities
│   ├── gemini.ts               # AI integration
│   └── utils.ts                # Utility functions
├── db/                         # File-based storage (created automatically)
│   ├── users/                  # User data (JSON files)
│   ├── interviews/             # Interview sessions (JSON files)
│   └── resumes/                # Uploaded resume files
└── public/
    └── uploads/                # Static assets
```

## Available Domains

1. **Frontend Development** - React, Vue, Angular
2. **Backend Development** - Node.js, Python, Java
3. **Full Stack** - Both Frontend & Backend
4. **Data Science** - ML, Analytics, AI
5. **DevOps** - Cloud, Docker, Kubernetes
6. **QA Engineering** - Testing, Automation

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/logout` - Sign out

### Interview
- `POST /api/interview/create` - Create new interview
- `POST /api/interview/upload-resume` - Upload resume
- `POST /api/interview/generate-questions` - Generate questions
- `POST /api/interview/save-answer` - Save answer to question
- `POST /api/interview/submit` - Submit interview for evaluation
- `GET /api/interview/results/[id]` - Get interview results
- `GET /api/interview/export/[id]` - Export interview report

## Troubleshooting

### Camera Not Working
- Check browser permissions for camera access
- Try a different browser (Chrome, Edge, Safari recommended)
- Ensure no other app is using the camera

### Voice Recording Not Working
- Check browser microphone permissions
- Voice recording works best in Chrome, Edge, or Safari
- Make sure microphone is connected and working

### Questions Not Loading
- Verify Gemini API key is set correctly
- Check internet connection
- API call may be slow first time (initializing model)

### Data Issues
- Delete the `db/` folder and restart the app to reset all data
- Check file permissions in the `db/` folder
- Interviews and user data are stored as JSON files - you can manually inspect or edit them

## Local Development Tips

### Testing Without Gemini API
The app includes fallback questions if Gemini API fails. Set `GEMINI_API_KEY=test` to use defaults.

### Debug Mode
Add debug statements using:
```javascript
console.log("[v0] Your debug message:", variable);
```

These will appear in terminal during development.

### Reset Everything
```bash
# Remove all stored data
rm -rf db/

# Reinstall dependencies
rm -rf node_modules
npm install

# Restart server
npm run dev
```

## Performance Notes

- First interview generation may take 10-15 seconds while initializing the Gemini model
- Voice transcription is real-time (no lag for most sentences)
- Database operations are instant (SQLite)
- Reports generate in < 1 second

## Browser Support

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: Limited support (camera/microphone work, but typing/voice recording works best on desktop)

## Known Limitations

- Requires internet for Gemini API calls (question generation and evaluation)
- Voice recording only works in browsers with Web Speech API support
- PDF export is HTML-based (users print/save as PDF using browser)
- Single-user at a time on local development

## Future Enhancements

- [ ] PostgreSQL support for production deployment
- [ ] Groq API for faster transcription
- [ ] Advanced analytics dashboard
- [ ] Interview scheduling and reminders
- [ ] Question difficulty levels
- [ ] Real PDF generation (not HTML)
- [ ] Mobile app
- [ ] Multi-language support

## Security Considerations

- Passwords are hashed with PBKDF2 (100,000 iterations)
- Sessions stored in memory (use Redis for production)
- User data stored in JSON files in `db/` folder
- Resumes stored locally in `db/resumes/` (use S3 for production)
- No sensitive data in client-side storage

## Support

For issues or feature requests, please create an issue in the repository.

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Happy Interviewing!** 🚀
