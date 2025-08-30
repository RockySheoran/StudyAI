import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateQuizQuestions(educationLevel: string, topic: string, numberOfQuestions: number = 20) {
    const prompt = `
      Generate a quiz with ${numberOfQuestions} questions on the topic of "${topic}" for ${educationLevel} education level.
      The questions should range from easy to hard difficulty.
      Format the response as a JSON array where each object has:
      - question: string
      - options: array of 4 strings
      - correctAnswer: string (the exact text of the correct option)
      - difficulty: string (easy, medium, or hard)
      
      Example format:
      [
        {
          "question": "What is the capital of France?",
          "options": ["London", "Berlin", "Paris", "Madrid"],
          "correctAnswer": "Paris",
          "difficulty": "easy"
        }
      ]
      
      Return only the JSON array, no additional text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw new Error('Failed to generate quiz questions');
    }
  }

  async evaluateQnAAnswers(questions: string[], answers: string[],perQuestionMarks:number) {
    const prompt = `
      Evaluate the following questions and answers. For each question-answer pair, provide a score from 0 to the maximum marks (2-5 as specified) based on accuracy and completeness.
      perQuestionMarks:${perQuestionMarks}
      Format the response as a JSON object with:
      - totalScore: number (sum of all scores)
      - maxPossibleScore: number (sum of all maximum marks) ${perQuestionMarks * questions.length}
      - evaluations: array of objects with:
        - question: string
        - answer: string
        - score: number
        - maxMarks: number
        - feedback: string (brief explanation of the score)
      
      Questions and answers:
      ${questions.map((q, i) => `Q${i+1}: ${q}\nA${i+1}: ${answers[i] || 'No answer provided'}`).join('\n\n')}
      
      Return only the JSON object, no additional text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error evaluating QnA answers:', error);
      throw new Error('Failed to evaluate answers');
    }
  }
}

export default new GeminiService();