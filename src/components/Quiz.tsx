import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaCheck, FaTimes, FaSpinner, FaRedo, FaFlag, FaPause, FaPlay } from 'react-icons/fa';
import { useQuiz } from '@/context/QuizContext';
import toast from 'react-hot-toast';

const Quiz: React.FC = () => {
  const { questions, setCurrentStep, setQuizResults } = useQuiz();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shortAnswer, setShortAnswer] = useState('');
  const [answers, setAnswers] = useState<Array<{ questionId: string; answer: string; isCorrect: boolean }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds per question
  const [isPaused, setIsPaused] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // Reset timer and selected answer when moving to a new question
    setTimeLeft(60);
    setSelectedAnswer(null);
    setShortAnswer('');
    setIsPaused(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft > 0 && !isPaused) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isPaused) {
      handleNextQuestion();
    }
  }, [timeLeft, isPaused, handleNextQuestion]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleShortAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShortAnswer(e.target.value);
  };

  const checkAnswer = () => {
    if (currentQuestion.type === 'multiple-choice') {
      if (!selectedAnswer) {
        toast.error('Please select an answer');
        return false;
      }
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      return {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
      };
    } else if (currentQuestion.type === 'true-false') {
      if (!selectedAnswer) {
        toast.error('Please select true or false');
        return false;
      }
      const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
      return {
        questionId: currentQuestion.id,
        answer: selectedAnswer,
        isCorrect,
      };
    } else if (currentQuestion.type === 'short-answer') {
      if (!shortAnswer.trim()) {
        toast.error('Please enter your answer');
        return false;
      }
      
      // For short answers, we'll do a simple check if the answer contains key terms
      // In a real app, this would use more sophisticated matching or AI evaluation
      const userAnswer = shortAnswer.toLowerCase().trim();
      const correctAnswer = currentQuestion.correctAnswer.toLowerCase();
      
      // Check if the user's answer contains the correct answer or vice versa
      const isCorrect = 
        userAnswer.includes(correctAnswer) || 
        correctAnswer.includes(userAnswer) ||
        // Simple fuzzy matching - if the answers are very similar
        (userAnswer.length > 3 && correctAnswer.includes(userAnswer.substring(0, Math.floor(userAnswer.length * 0.7))));
      
      return {
        questionId: currentQuestion.id,
        answer: shortAnswer,
        isCorrect,
      };
    }
    return false;
  };

  const handleNextQuestion = () => {
    const result = checkAnswer();
    if (!result) return;

    setAnswers([...answers, result]);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      handleQuizComplete([...answers, result]);
    }
  };

  const handleQuizComplete = (finalAnswers: Array<{ questionId: string; answer: string; isCorrect: boolean }>) => {
    setIsSubmitting(true);
    
    // Calculate results
    const correctAnswers = finalAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Set quiz results
    setQuizResults({
      score,
      correctAnswers,
      totalQuestions,
      answers: finalAnswers,
      questions,
    });
    
    // Move to results page
    setTimeout(() => {
      setCurrentStep('results');
      setIsSubmitting(false);
    }, 1000);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Remove the last answer
      const newAnswers = [...answers];
      newAnswers.pop();
      setAnswers(newAnswers);
      
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get the appropriate color for the timer based on time left
  const getTimerColor = () => {
    if (timeLeft > 30) return 'text-green-500';
    if (timeLeft > 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* Quiz Header */}
      <div className="card glass mb-6 p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-lg font-bold text-purple-600">Question {currentQuestionIndex + 1}/{questions.length}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={togglePause} 
              className="text-gray-600 hover:text-purple-600 transition-colors"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <div className={`font-mono font-bold ${getTimerColor()}`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
          <div 
            className="h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-in-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 text-right">
          {Math.round(progress)}% complete
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="card glass p-8"
        >
          <div className="mb-6">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-4">
              {currentQuestion.type === 'multiple-choice' ? 'Multiple Choice' : 
               currentQuestion.type === 'true-false' ? 'True/False' : 'Short Answer'}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{currentQuestion.question}</h3>
            {currentQuestion.context && (
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 border-l-4 border-purple-400">
                <p className="italic">{currentQuestion.context}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 mb-8">
            {currentQuestion.type === 'multiple-choice' && (
              <div className="grid gap-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center
                      ${selectedAnswer === option 
                        ? 'bg-purple-100 border-2 border-purple-500' 
                        : 'bg-white border-2 border-gray-200 hover:border-purple-300'}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 
                      ${selectedAnswer === option ? 'bg-purple-600 text-white' : 'border border-gray-300'}`}>
                      {selectedAnswer === option ? <FaCheck className="text-xs" /> : String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            )}

            {currentQuestion.type === 'true-false' && (
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleAnswerSelect('True')}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center
                    ${selectedAnswer === 'True' 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : 'bg-white border-2 border-gray-200 hover:border-green-300'}`}
                >
                  <FaCheck className={`mr-2 ${selectedAnswer === 'True' ? 'text-green-600' : 'text-gray-400'}`} />
                  <span className="font-medium">True</span>
                </div>
                <div
                  onClick={() => handleAnswerSelect('False')}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center
                    ${selectedAnswer === 'False' 
                      ? 'bg-red-100 border-2 border-red-500' 
                      : 'bg-white border-2 border-gray-200 hover:border-red-300'}`}
                >
                  <FaTimes className={`mr-2 ${selectedAnswer === 'False' ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className="font-medium">False</span>
                </div>
              </div>
            )}

            {currentQuestion.type === 'short-answer' && (
              <div>
                <input
                  type="text"
                  value={shortAnswer}
                  onChange={handleShortAnswerChange}
                  placeholder="Type your answer here..."
                  className="input w-full"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className={`btn-secondary ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaArrowLeft className="mr-2" /> Previous
            </button>
            <button
              onClick={handleNextQuestion}
              className="btn-primary"
            >
              {currentQuestionIndex < questions.length - 1 ? (
                <>Next <FaArrowRight className="ml-2" /></>
              ) : (
                <>Finish <FaFlag className="ml-2" /></>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Submitting Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-purple-600 mb-4" />
            <h3 className="text-xl font-bold">Calculating your results...</h3>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Quiz; 