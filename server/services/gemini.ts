import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuestion(role: string, questionNumber: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // First question is always "Tell me about yourself"
  if (questionNumber === 0) {
    return "Tell me about yourself and your experience in " + role;
  }

  const prompt = `Generate a relevant technical interview question for a ${role} position. 
The question should:
- Be specific to the role's technical requirements
- Be clear and concise
- Be challenging but answerable in 2-3 minutes
- Not be a yes/no question
- Focus on practical knowledge and experience
- If appropriate, include a small coding challenge (e.g., "Write a function that...")
- Avoid questions that are too theoretical or academic
- Be appropriate for a real interview setting

Question number: ${questionNumber} (out of 10)

For coding questions, keep them simple enough to be implemented in 2-3 minutes.
For non-coding questions, focus on real-world scenarios and problem-solving.

Return only the question text, without any additional formatting or numbering.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to predefined questions if Gemini fails
    const fallbackQuestions = {
      "Full Stack Developer": "Explain how you would design and implement a real-time chat application.",
      "Data Analyst": "How would you clean and prepare a dataset with missing values?",
      "Data Scientist": "Explain your approach to feature selection in a machine learning project.",
      "Web Developer": "How would you optimize a slow-loading web page?",
      "Java Developer": "Explain how you would implement a thread-safe singleton pattern.",
      "Python Developer": "Write a function to find the most frequent element in a list.",
      "Frontend Developer": "How would you manage state in a complex React application?",
      "Backend Developer": "Design a rate limiting system for an API."
    };
    return fallbackQuestions[role as keyof typeof fallbackQuestions] || 
           `What are your strengths and weaknesses as a ${role}?`;
  }
}