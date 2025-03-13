import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaRedo, FaHome, FaChevronDown, FaChevronUp, FaDownload, FaShare, FaTrophy } from 'react-icons/fa';
import { useQuiz } from '@/context/QuizContext';
import confetti from 'canvas-confetti';

const QuizResults: React.FC = () => {
  const { quizResults, setCurrentStep, resetQuiz } = useQuiz();
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([]);

  if (!quizResults) {
    return (
      <div className="text-center p-8">
        <p>No quiz results available.</p>
        <button
          onClick={() => setCurrentStep('settings')}
          className="btn-primary mt-4"
        >
          Start a Quiz
        </button>
      </div>
    );
  }

  const { score, correctAnswers, totalQuestions, answers, questions } = quizResults;

  // Trigger confetti if score is above 70%
  React.useEffect(() => {
    if (score >= 70) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
      
      return () => clearInterval(interval);
    }
  }, [score]);

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = () => {
    if (score >= 90) return "Excellent! You've mastered this material!";
    if (score >= 80) return "Great job! You have a strong understanding!";
    if (score >= 70) return "Good work! You're on the right track!";
    if (score >= 60) return "Not bad! Keep studying to improve!";
    if (score >= 50) return "You're making progress, but need more practice.";
    return "Keep studying! You'll improve with more practice.";
  };

  const handleRetakeQuiz = () => {
    setCurrentStep('settings');
  };

  const handleNewQuiz = () => {
    resetQuiz();
    setCurrentStep('upload');
  };

  const handleDownloadResults = () => {
    // Create a text representation of the results
    let resultsText = `Quiz Results\n\n`;
    resultsText += `Score: ${score}%\n`;
    resultsText += `Correct Answers: ${correctAnswers} out of ${totalQuestions}\n\n`;
    
    // Add each question and answer
    questions.forEach((question, index) => {
      const answer = answers.find(a => a.questionId === question.id);
      resultsText += `Question ${index + 1}: ${question.question}\n`;
      resultsText += `Your Answer: ${answer?.answer || 'Not answered'}\n`;
      resultsText += `Correct Answer: ${question.correctAnswer}\n`;
      resultsText += `Result: ${answer?.isCorrect ? 'Correct' : 'Incorrect'}\n\n`;
    });
    
    // Create a blob and download it
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto"
    >
      {/* Results Summary Card */}
      <div className="card glass mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quiz Results</h2>
            <div className="relative">
              <div className="relative bg-white bg-opacity-20 p-3 rounded-full">
                <FaTrophy className="text-yellow-300 text-2xl" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm uppercase tracking-wider opacity-80">Final Score</p>
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">{score}%</span>
                <span className="ml-2 text-sm opacity-80">({correctAnswers}/{totalQuestions} correct)</span>
              </div>
              <p className="mt-2 text-sm md:text-base opacity-90">{getScoreMessage()}</p>
            </div>
            
            <div className="relative w-32 h-32">
              {/* Circular progress indicator */}
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-white opacity-10" 
                  strokeWidth="10"
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
                <circle 
                  className="text-white" 
                  strokeWidth="10" 
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * score / 100)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{score}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 flex flex-wrap gap-4 justify-center">
          <button 
            onClick={handleRetakeQuiz} 
            className="btn-secondary flex items-center"
          >
            <FaRedo className="mr-2" /> Retake Quiz
          </button>
          <button 
            onClick={handleNewQuiz} 
            className="btn-primary flex items-center"
          >
            <FaHome className="mr-2" /> New Quiz
          </button>
          <button 
            onClick={handleDownloadResults} 
            className="btn-outline flex items-center"
          >
            <FaDownload className="mr-2" /> Download Results
          </button>
        </div>
      </div>

      {/* Questions Review */}
      <div className="card glass p-6">
        <h3 className="text-xl font-bold mb-6">Question Review</h3>
        
        <div className="space-y-4">
          {questions.map((question, index) => {
            const answer = answers.find(a => a.questionId === question.id);
            const isExpanded = expandedQuestions.includes(question.id);
            
            return (
              <div 
                key={question.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
              >
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleQuestion(question.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      answer?.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {answer?.isCorrect ? <FaCheck /> : <FaTimes />}
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Question {index + 1}</div>
                      <div className="font-medium">{question.question}</div>
                    </div>
                  </div>
                  <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <FaChevronDown />
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid gap-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500">Your Answer:</div>
                        <div className={`mt-1 ${answer?.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer?.answer || 'Not answered'}
                        </div>
                      </div>
                      
                      {!answer?.isCorrect && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Correct Answer:</div>
                          <div className="mt-1 text-green-600">{question.correctAnswer}</div>
                        </div>
                      )}
                      
                      {question.explanation && (
                        <div>
                          <div className="text-sm font-medium text-gray-500">Explanation:</div>
                          <div className="mt-1 text-gray-700 bg-gray-100 p-3 rounded-md text-sm">
                            {question.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default QuizResults; 