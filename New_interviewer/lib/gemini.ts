import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('[v0] GEMINI_API_KEY is not set');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface GeneratedQuestions {
  hr_questions: string[];
  technical_questions: string[];
}

export async function generateInterviewQuestions(
  domain: string,
  resumeText?: string
): Promise<GeneratedQuestions> {
  if (!genAI) {
    console.error('[v0] Gemini API not initialized');
    // Return default questions if API is not available
    return getDefaultQuestions(domain);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate interview questions for a ${domain} position. 
${resumeText ? `The candidate's resume: ${resumeText.substring(0, 1000)}` : ''}

Please provide:
1. 5 HR-level questions (about soft skills, communication, teamwork, etc.)
2. 5 technical questions (specific to ${domain})

Format the response as JSON with two arrays: "hr_questions" and "technical_questions".
Return ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        hr_questions: Array.isArray(parsed.hr_questions) ? parsed.hr_questions : [],
        technical_questions: Array.isArray(parsed.technical_questions)
          ? parsed.technical_questions
          : [],
      };
    } catch (parseError) {
      console.error('[v0] Failed to parse Gemini response:', text);
      return getDefaultQuestions(domain);
    }
  } catch (error) {
    console.error('[v0] Gemini API error:', error);
    return getDefaultQuestions(domain);
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  domain: string
): Promise<{ score: number; feedback: string }> {
  if (!genAI) {
    return { score: 5, feedback: 'Evaluation not available' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an expert ${domain} interviewer. Evaluate the following answer to an interview question.

Question: "${question}"
Answer: "${answer}"

Provide:
1. A score from 1-10
2. Brief feedback (2-3 sentences)

Format as JSON: {"score": number, "feedback": "string"}
Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      const parsed = JSON.parse(text);
      return {
        score: Math.min(10, Math.max(1, parsed.score || 5)),
        feedback: parsed.feedback || 'No feedback available',
      };
    } catch {
      return { score: 5, feedback: 'Evaluation completed' };
    }
  } catch (error) {
    console.error('[v0] Evaluation error:', error);
    return { score: 5, feedback: 'Evaluation not available' };
  }
}

function getDefaultQuestions(domain: string): GeneratedQuestions {
  const defaultQuestions: { [key: string]: GeneratedQuestions } = {
    frontend: {
      hr_questions: [
        'Tell us about your experience working in a team environment.',
        'How do you handle tight deadlines and pressure?',
        'Describe a situation where you had to learn a new technology quickly.',
        'How do you stay updated with latest web development trends?',
        'Tell us about a challenging project and how you overcame obstacles.',
      ],
      technical_questions: [
        'Explain the difference between state and props in React.',
        'What is the virtual DOM and how does it work?',
        'How would you optimize a slow-rendering React component?',
        'Explain CSS flexbox and when you would use it.',
        'What are React hooks and can you give an example?',
      ],
    },
    backend: {
      hr_questions: [
        'Tell us about your experience working in a team environment.',
        'How do you handle tight deadlines and pressure?',
        'Describe a situation where you had to learn a new technology quickly.',
        'How do you ensure code quality in your projects?',
        'Tell us about a challenging project and how you overcame obstacles.',
      ],
      technical_questions: [
        'Explain the difference between SQL and NoSQL databases.',
        'How would you design a scalable API?',
        'What is REST and how does it differ from GraphQL?',
        'Explain the concept of middleware in Express.js.',
        'How do you handle authentication and authorization in a web application?',
      ],
    },
    fullstack: {
      hr_questions: [
        'Tell us about your end-to-end project experience.',
        'How do you communicate between frontend and backend teams?',
        'Describe a situation where you had to debug an issue across the stack.',
        'How do you balance frontend and backend work?',
        'Tell us about a challenging full-stack project.',
      ],
      technical_questions: [
        'Explain your approach to architecting a full-stack application.',
        'How do you manage state between frontend and backend?',
        'What databases and frameworks do you prefer and why?',
        'How would you handle real-time data synchronization?',
        'Describe your deployment strategy for a full-stack app.',
      ],
    },
    'data-science': {
      hr_questions: [
        'Tell us about a data science project you are proud of.',
        'How do you communicate insights to non-technical stakeholders?',
        'Describe a situation where data told a different story than expected.',
        'How do you stay updated with ML trends?',
        'Tell us about a challenging data problem and how you solved it.',
      ],
      technical_questions: [
        'Explain the difference between supervised and unsupervised learning.',
        'What is overfitting and how do you prevent it?',
        'How would you handle imbalanced datasets?',
        'Explain the difference between correlation and causation.',
        'What is cross-validation and why is it important?',
      ],
    },
    devops: {
      hr_questions: [
        'Tell us about your experience with infrastructure as code.',
        'How do you approach system reliability and uptime?',
        'Describe a situation where you improved deployment efficiency.',
        'How do you handle incidents and outages?',
        'Tell us about a challenging DevOps problem you solved.',
      ],
      technical_questions: [
        'Explain containerization and the benefits of Docker.',
        'What is Kubernetes and how does it manage containers?',
        'How would you design a CI/CD pipeline?',
        'Explain infrastructure as code and its benefits.',
        'How do you monitor and log applications in production?',
      ],
    },
    qa: {
      hr_questions: [
        'Tell us about your experience with quality assurance.',
        'How do you approach testing strategy?',
        'Describe a bug you found that had significant impact.',
        'How do you keep up with testing tools and frameworks?',
        'Tell us about a challenging QA problem you solved.',
      ],
      technical_questions: [
        'Explain the difference between unit, integration, and e2e testing.',
        'What is test-driven development (TDD)?',
        'How do you approach testing a complex feature?',
        'Explain the concept of test coverage.',
        'What tools do you use for automated testing?',
      ],
    },
  };

  return defaultQuestions[domain] || defaultQuestions.fullstack;
}
