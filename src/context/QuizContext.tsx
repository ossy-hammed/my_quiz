import React, { createContext, useContext, useState, ReactNode } from 'react';
import { QuizQuestion, QuizSettings, UserAnswer, QuizResult } from '@/types/quiz';

interface QuizContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  pdfFile: File | null;
  setPdfFile: (file: File | null) => void;
  pdfContent: string;
  setPdfContent: (content: string) => void;
  quizSettings: QuizSettings;
  setQuizSettings: (settings: QuizSettings) => void;
  questions: QuizQuestion[];
  setQuestions: (questions: QuizQuestion[]) => void;
  userAnswers: UserAnswer[];
  setUserAnswers: (answers: UserAnswer[]) => void;
  currentStep: 'auth' | 'upload' | 'settings' | 'quiz' | 'results';
  setCurrentStep: (step: 'auth' | 'upload' | 'settings' | 'quiz' | 'results') => void;
  quizResults: QuizResult | null;
  setQuizResults: (results: QuizResult | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    difficulty: 'medium',
    numberOfQuestions: 5,
    questionTypes: ['multiple-choice'],
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [currentStep, setCurrentStep] = useState<'auth' | 'upload' | 'settings' | 'quiz' | 'results'>('auth');
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetQuiz = () => {
    setPdfFile(null);
    setPdfContent('');
    setQuestions([]);
    setUserAnswers([]);
    setQuizResults(null);
    setCurrentStep('upload');
  };

  return (
    <QuizContext.Provider
      value={{
        apiKey,
        setApiKey,
        isAuthenticated,
        setIsAuthenticated,
        pdfFile,
        setPdfFile,
        pdfContent,
        setPdfContent,
        quizSettings,
        setQuizSettings,
        questions,
        setQuestions,
        userAnswers,
        setUserAnswers,
        currentStep,
        setCurrentStep,
        quizResults,
        setQuizResults,
        isLoading,
        setIsLoading,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}; 