import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaSpinner, FaSlidersH, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useQuiz } from '@/context/QuizContext';
import { generateQuizFromPdfContent } from '@/services/openai';
import toast from 'react-hot-toast';

const QuizSettings: React.FC = () => {
  const {
    quizSettings,
    setQuizSettings,
    pdfContent,
    setQuestions,
    setCurrentStep,
    setIsLoading,
    isLoading,
  } = useQuiz();

  const [localSettings, setLocalSettings] = useState({
    difficulty: quizSettings.difficulty,
    numberOfQuestions: quizSettings.numberOfQuestions,
    questionTypes: [...quizSettings.questionTypes],
  });

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalSettings({
      ...localSettings,
      difficulty: e.target.value as 'easy' | 'medium' | 'hard',
    });
  };

  const handleNumberOfQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value >= 1 && value <= 20) {
      setLocalSettings({
        ...localSettings,
        numberOfQuestions: value,
      });
    }
  };

  const handleQuestionTypeChange = (type: 'multiple-choice' | 'true-false' | 'short-answer') => {
    const currentTypes = [...localSettings.questionTypes];
    const typeIndex = currentTypes.indexOf(type);

    if (typeIndex === -1) {
      // Add the type if it doesn't exist
      currentTypes.push(type);
    } else if (currentTypes.length > 1) {
      // Remove the type if it exists and there's more than one type selected
      currentTypes.splice(typeIndex, 1);
    } else {
      // Don't allow removing the last type
      toast.error('At least one question type must be selected');
      return;
    }

    setLocalSettings({
      ...localSettings,
      questionTypes: currentTypes,
    });
  };

  const handleGenerateQuiz = async () => {
    setQuizSettings(localSettings);
    setIsLoading(true);

    try {
      const questions = await generateQuizFromPdfContent(
        pdfContent,
        localSettings.difficulty,
        localSettings.numberOfQuestions,
        localSettings.questionTypes
      );

      if (questions.length === 0) {
        throw new Error('No questions were generated');
      }

      setQuestions(questions);
      setCurrentStep('quiz');
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get difficulty color
  const getDifficultyColor = () => {
    switch (localSettings.difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card glass bg-white border border-gray-100 rounded-2xl shadow-xl p-8 max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full inline-flex items-center justify-center mb-4">
            <FaSlidersH className="text-white text-2xl" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Quiz Settings</h2>
        <p className="text-gray-600 mt-2">
          Customize your quiz options
        </p>
      </div>

      <div className="space-y-8">
        <div className="bg-gray-50 p-6 rounded-xl">
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="relative">
            <select
              id="difficulty"
              value={localSettings.difficulty}
              onChange={handleDifficultyChange}
              className="input pr-10 appearance-none"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <div className={`w-3 h-3 rounded-full ${getDifficultyColor()}`}></div>
            </div>
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Beginner-friendly</span>
            <span>Challenging</span>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <label htmlFor="numberOfQuestions" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Questions: <span className="text-purple-600 font-bold">{localSettings.numberOfQuestions}</span>
          </label>
          <input
            id="numberOfQuestions"
            type="range"
            min="1"
            max="20"
            value={localSettings.numberOfQuestions}
            onChange={handleNumberOfQuestionsChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>1</span>
            <span>10</span>
            <span>20</span>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl">
          <p className="block text-sm font-medium text-gray-700 mb-4">
            Question Types
          </p>
          <div className="space-y-4">
            <div 
              onClick={() => handleQuestionTypeChange('multiple-choice')}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                localSettings.questionTypes.includes('multiple-choice') 
                  ? 'bg-purple-100 border-2 border-purple-500' 
                  : 'bg-white border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                localSettings.questionTypes.includes('multiple-choice') 
                  ? 'bg-purple-600' 
                  : 'border border-gray-300'
              }`}>
                {localSettings.questionTypes.includes('multiple-choice') && (
                  <FaCheck className="text-white text-xs" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">Multiple Choice</div>
                <div className="text-xs text-gray-500">Select one answer from multiple options</div>
              </div>
            </div>
            
            <div 
              onClick={() => handleQuestionTypeChange('true-false')}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                localSettings.questionTypes.includes('true-false') 
                  ? 'bg-purple-100 border-2 border-purple-500' 
                  : 'bg-white border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                localSettings.questionTypes.includes('true-false') 
                  ? 'bg-purple-600' 
                  : 'border border-gray-300'
              }`}>
                {localSettings.questionTypes.includes('true-false') && (
                  <FaCheck className="text-white text-xs" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">True/False</div>
                <div className="text-xs text-gray-500">Determine if a statement is true or false</div>
              </div>
            </div>
            
            <div 
              onClick={() => handleQuestionTypeChange('short-answer')}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                localSettings.questionTypes.includes('short-answer') 
                  ? 'bg-purple-100 border-2 border-purple-500' 
                  : 'bg-white border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                localSettings.questionTypes.includes('short-answer') 
                  ? 'bg-purple-600' 
                  : 'border border-gray-300'
              }`}>
                {localSettings.questionTypes.includes('short-answer') && (
                  <FaCheck className="text-white text-xs" />
                )}
              </div>
              <div>
                <div className="font-medium text-gray-800">Short Answer</div>
                <div className="text-xs text-gray-500">Type a brief answer to the question</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Generating Quiz...
              </>
            ) : (
              <>
                Generate Quiz
                <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuizSettings; 