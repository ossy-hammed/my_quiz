export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
}

export interface QuizSettings {
  difficulty: 'easy' | 'medium' | 'hard';
  numberOfQuestions: number;
  questionTypes: ('multiple-choice' | 'true-false' | 'short-answer')[];
}

export interface UserAnswer {
  questionIndex: number;
  answer: string;
}

export interface QuizResult {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  answers: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
} 