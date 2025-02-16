import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateQuestion(role: string, questionNumber: number): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  // First question is always "Tell me about yourself"
  if (questionNumber === 0) {
    return "Tell me about yourself";
  }

  const prompt = `Generate a relevant technical interview question for a ${role} position. 
The question should:
- Be specific to the role's technical requirements
- Be clear and concise
- Be challenging but answerable in 2-3 minutes
- Not be a yes/no question
- Focus on practical knowledge and experience

Previous question number: ${questionNumber}

Return only the question text, without any additional formatting or numbering.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating question:', error);
    // Fallback to default questions if Gemini fails
    return `What are your strengths and weaknesses as a ${role}?`;
  }
}
