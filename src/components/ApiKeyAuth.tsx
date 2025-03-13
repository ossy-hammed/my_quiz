import React, { useState } from 'react';
import { useQuiz } from '@/context/QuizContext';
import { validateApiKey, initializeOpenAI } from '@/services/openai';
import { motion } from 'framer-motion';
import { FaKey, FaSpinner, FaLock, FaShieldAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ApiKeyAuth: React.FC = () => {
  const { apiKey, setApiKey, setIsAuthenticated, setCurrentStep } = useQuiz();
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }

    setIsValidating(true);
    
    try {
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        initializeOpenAI(apiKey);
        setIsAuthenticated(true);
        setCurrentStep('upload');
        toast.success('API key validated successfully!');
      } else {
        toast.error('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      toast.error('Error validating API key. Please try again.');
      console.error('Error validating API key:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card glass bg-white border border-gray-100 rounded-2xl shadow-xl p-8 max-w-md mx-auto"
    >
      <div className="text-center mb-8">
        <div className="relative inline-block">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full inline-flex items-center justify-center mb-4">
            <FaKey className="text-white text-2xl" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">Welcome to QuizMaker</h2>
        <p className="text-gray-600 mt-2">
          Enter your OpenAI API key to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="input pl-10 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <div className="mt-2 flex items-start">
            <FaShieldAlt className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-500">
              Your API key is only used in your browser and never stored on our servers.
              We use it to generate quiz questions through the OpenAI API.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isValidating}
          className="btn-primary w-full flex items-center justify-center"
        >
          {isValidating ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              Validating...
            </>
          ) : (
            'Continue'
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Don't have an API key?</h3>
        <a 
          href="https://platform.openai.com/api-keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center justify-center"
        >
          Get an OpenAI API key
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
};

export default ApiKeyAuth; 