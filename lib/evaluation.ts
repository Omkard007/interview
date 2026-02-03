export interface EvaluationResult {
  score: number;
  feedback: string;
}

export function evaluateAnswer(question: string, answer: string): EvaluationResult {
  // Scoring based on answer length and quality indicators
  const answerLength = answer.trim().length;
  const wordCount = answer.trim().split(/\s+/).length;
  
  let score = 5; // Base score

  // Length-based scoring
  if (wordCount < 10) {
    score = 3; // Too short
  } else if (wordCount < 30) {
    score = 5; // Minimal response
  } else if (wordCount < 100) {
    score = 6.5; // Good response
  } else if (wordCount < 200) {
    score = 8; // Excellent response
  } else {
    score = 9; // Very comprehensive
  }

  // Quality indicators
  const qualityIndicators = [
    { keyword: /example|demonstrate|show|illustrate/i, boost: 0.5 },
    { keyword: /specific|particular|concrete/i, boost: 0.3 },
    { keyword: /challenge|problem|issue/i, boost: 0.4 },
    { keyword: /solution|approach|method|strategy/i, boost: 0.5 },
    { keyword: /learn|experience|gained|understand/i, boost: 0.3 },
    { keyword: /team|collaborate|communication|work/i, boost: 0.4 },
    { keyword: /improve|optimize|enhance|better/i, boost: 0.3 },
  ];

  for (const indicator of qualityIndicators) {
    if (indicator.keyword.test(answer)) {
      score += indicator.boost;
    }
  }

  // Cap score at 10
  score = Math.min(10, Math.max(1, score));

  // Generate feedback
  const feedback = generateFeedback(answer, wordCount, score);

  return {
    score: Math.round(score * 10) / 10,
    feedback,
  };
}

function generateFeedback(answer: string, wordCount: number, score: number): string {
  let feedback = '';

  if (wordCount < 10) {
    feedback = `Answer is too brief. Please provide more details and context.`;
  } else if (wordCount < 30) {
    feedback = `Answer lacks depth. Try to include specific examples or more context.`;
  } else if (score < 5) {
    feedback = `Answer shows some understanding but could be improved with more concrete examples and specific details.`;
  } else if (score < 7) {
    feedback = `Good answer with relevant content. Consider adding more specific examples or elaborating on key points.`;
  } else if (score < 9) {
    feedback = `Excellent answer with good structure and relevant examples. Shows strong understanding of the topic.`;
  } else {
    feedback = `Outstanding answer. Very detailed, well-structured, and demonstrates excellent understanding of the concept with concrete examples.`;
  }

  // Add specific observations
  if (/example/i.test(answer)) {
    feedback += ` You provided good examples which strengthens your response.`;
  }
  if (/challenge|difficult/i.test(answer)) {
    feedback += ` Your response shows you can reflect on challenges and growth.`;
  }
  if (/team|collaborate/i.test(answer)) {
    feedback += ` Good emphasis on teamwork and collaboration.`;
  }

  return feedback;
}
