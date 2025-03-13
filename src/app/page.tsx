'use client';

import { QuizProvider } from '@/context/QuizContext';
import QuizMaker from '@/components/QuizMaker';

export default function Home() {
  return (
    <QuizProvider>
      <QuizMaker />
    </QuizProvider>
  );
}
