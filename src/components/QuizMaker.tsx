import React from 'react';
import { useQuiz } from '@/context/QuizContext';
import ApiKeyAuth from './ApiKeyAuth';
import PdfUpload from './PdfUpload';
import QuizSettings from './QuizSettings';
import Quiz from './Quiz';
import QuizResults from './QuizResults';
import { Toaster } from 'react-hot-toast';
import { FaBook, FaLightbulb, FaQuestion, FaRocket, FaKey, FaFilePdf, FaCog, FaTrophy } from 'react-icons/fa';

const QuizMaker: React.FC = () => {
  const { currentStep } = useQuiz();

  // Define the steps for the progress indicator
  const steps = [
    { id: 'auth', label: 'API Key', icon: <FaKey className="text-purple-600" /> },
    { id: 'upload', label: 'Upload PDF', icon: <FaFilePdf className="text-purple-600" /> },
    { id: 'settings', label: 'Settings', icon: <FaCog className="text-purple-600" /> },
    { id: 'quiz', label: 'Quiz', icon: <FaQuestion className="text-purple-600" /> },
    { id: 'results', label: 'Results', icon: <FaTrophy className="text-purple-600" /> },
  ];

  // Find the current step index
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Decorative elements - removed blur */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply opacity-10 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply opacity-5 animate-float" style={{ animationDelay: '1s' }}></div>
      
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            color: '#333',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '10px',
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
            <FaBook className="text-white text-3xl m-2" />
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
            PDF Quiz Maker
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-xl max-w-2xl mx-auto">
            Transform your PDF documents into interactive quizzes with AI
          </p>
        </header>

        {/* Progress indicator - only show after auth */}
        {currentStep !== 'auth' && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-2">
              {steps.map((step, index) => (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center ${index <= currentStepIndex ? 'text-purple-600' : 'text-gray-400'}`}
                >
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      index < currentStepIndex 
                        ? 'bg-purple-600 text-white' 
                        : index === currentStepIndex 
                          ? 'bg-white border-2 border-purple-600 text-purple-600' 
                          : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Feature highlights - only show on auth screen */}
        {currentStep === 'auth' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card bg-white border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-100 rounded-full mr-4">
                  <FaRocket className="text-purple-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold">AI-Powered</h3>
              </div>
              <p className="text-gray-600">Generate intelligent quiz questions from any PDF document using OpenAI.</p>
            </div>
            <div className="card bg-white border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-indigo-100 rounded-full mr-4">
                  <FaCog className="text-indigo-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold">Customizable</h3>
              </div>
              <p className="text-gray-600">Choose difficulty level, number of questions, and question types.</p>
            </div>
            <div className="card bg-white border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-pink-100 rounded-full mr-4">
                  <FaLightbulb className="text-pink-600 text-xl" />
                </div>
                <h3 className="text-lg font-semibold">Insightful</h3>
              </div>
              <p className="text-gray-600">Get detailed explanations and analytics for each question.</p>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className={`transition-all duration-500 ${currentStep !== 'auth' ? 'transform hover:scale-[1.01]' : ''}`}>
          {currentStep === 'auth' && <ApiKeyAuth />}
          {currentStep === 'upload' && <PdfUpload />}
          {currentStep === 'settings' && <QuizSettings />}
          {currentStep === 'quiz' && <Quiz />}
          {currentStep === 'results' && <QuizResults />}
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} PDF Quiz Maker. All rights reserved.</p>
          <p className="mt-1">Powered by OpenAI and Next.js</p>
        </footer>
      </div>
    </div>
  );
};

export default QuizMaker; 