import OpenAI from 'openai';
import { QuizQuestion } from '@/types/quiz';

let openaiInstance: OpenAI | null = null;

export const initializeOpenAI = (apiKey: string): OpenAI => {
  openaiInstance = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side usage
  });
  return openaiInstance;
};

export const getOpenAIInstance = (): OpenAI => {
  if (!openaiInstance) {
    throw new Error('OpenAI has not been initialized. Call initializeOpenAI first.');
  }
  return openaiInstance;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    
    // Make a simple API call to validate the key
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('API key validation failed:', error);
    return false;
  }
};

export const generateQuizFromPdfContent = async (
  pdfContent: string,
  difficulty: 'easy' | 'medium' | 'hard',
  numberOfQuestions: number,
  questionTypes: string[]
): Promise<QuizQuestion[]> => {
  if (!openaiInstance) {
    throw new Error('OpenAI has not been initialized');
  }

  try {
    console.log('Generating quiz with settings:', { difficulty, numberOfQuestions, questionTypes });
    console.log('PDF content length:', pdfContent.length);
    
    // Limit content to avoid token limits but ensure enough context
    const maxContentLength = 12000;
    const truncatedContent = pdfContent.length > maxContentLength 
      ? pdfContent.substring(0, maxContentLength) + "... (content truncated for token limit)"
      : pdfContent;
    
    const prompt = `
      Generate a quiz based on the following PDF content. 
      Difficulty level: ${difficulty}
      Number of questions: ${numberOfQuestions}
      Question types: ${questionTypes.join(', ')}
      
      PDF Content:
      ${truncatedContent}
      
      Create exactly ${numberOfQuestions} questions based on the content above.
      Each question must have a unique ID, question text, correct answer, and explanation.
      For multiple-choice questions, include 4 options with one correct answer.
      
      Format your response as a valid JSON object with this structure:
      {
        "questions": [
          {
            "id": "q1",
            "question": "Question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A",
            "explanation": "Explanation why Option A is correct",
            "type": "multiple-choice"
          },
          ...more questions...
        ]
      }
    `;

    console.log('Sending request to OpenAI...');
    
    const response = await openaiInstance.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that generates quiz questions based on provided content. Always return a valid JSON object with a "questions" array.' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    console.log('Received response from OpenAI');
    
    try {
      const parsedContent = JSON.parse(content);
      
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions) || parsedContent.questions.length === 0) {
        console.error('Invalid response format:', parsedContent);
        throw new Error('Invalid response format from OpenAI');
      }
      
      // Add IDs to questions if they don't have them
      const questionsWithIds = parsedContent.questions.map((q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        ...q
      }));
      
      console.log(`Successfully generated ${questionsWithIds.length} questions`);
      return questionsWithIds;
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response:', content);
      throw new Error('Failed to parse quiz questions from OpenAI response');
    }
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
}; 