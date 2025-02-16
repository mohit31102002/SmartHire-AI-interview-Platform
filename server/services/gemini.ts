import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuestion(role: string, questionNumber: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // First question is always behavioral
  if (questionNumber === 0) {
    return "Tell me about yourself and your experience in " + role;
  }

  // Second question is also behavioral
  if (questionNumber === 1) {
    const behavioralPrompt = `Generate a behavioral interview question for a ${role} position.
    Focus on:
    - Past experiences
    - Problem-solving abilities
    - Team collaboration
    - Conflict resolution
    Make it specific to the ${role} role but keep it simple and conversational.`;

    const result = await model.generateContent(behavioralPrompt);
    return result.response.text().trim();
  }

  const prompt = `Generate a simple technical interview question for a ${role} position. 
The question should:
- Be easy to understand and answer in 2-3 minutes
- Focus on fundamental concepts of the role
- Be practical rather than theoretical
- If including code, make it very simple (e.g., "Write a function to add two numbers")
- Avoid complex terminology
- Be suitable for entry to mid-level candidates

Question number: ${questionNumber} (out of 10)

Return only the question text, without any additional formatting or numbering.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to predefined simple questions
    const fallbackQuestions = {
      "Full Stack Developer": "What is the difference between GET and POST requests?",
      "Data Analyst": "How would you explain what a database is to a non-technical person?",
      "Data Scientist": "What is the difference between mean and median?",
      "Web Developer": "Explain what HTML stands for and its basic purpose.",
      "Java Developer": "What is a variable in Java and how do you declare one?",
      "Python Developer": "Write a function to calculate the average of three numbers.",
      "Frontend Developer": "What is CSS and what is it used for?",
      "Backend Developer": "What is an API in simple terms?"
    };
    return fallbackQuestions[role as keyof typeof fallbackQuestions] || 
           `Tell me about a challenging project you worked on as a ${role}.`;
  }
}

export async function generateFeedback(role: string, answers: {question: string, answer: string}[], score: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `As an AI interviewer, analyze these interview answers for a ${role} position and provide constructive feedback.

Score: ${score}/10

Questions and Answers:
${answers.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Provide feedback that:
1. Highlights 2-3 specific strengths demonstrated in the answers
2. Identifies 2-3 areas for improvement
3. Gives actionable advice for future interviews
4. Keeps the tone constructive and encouraging
5. Is concise and clear (200-300 words)

Focus on both technical knowledge and communication skills.`;

  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating feedback:', error);
    return `Thank you for completing the interview. You scored ${score}/10. Keep practicing and focusing on clear, detailed answers that demonstrate your technical knowledge and experience.`;
  }
}