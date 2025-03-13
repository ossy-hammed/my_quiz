import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUpload, FaFilePdf, FaSpinner, FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa';
import { useQuiz } from '@/context/QuizContext';
import { parsePdf } from '@/services/pdfParser';
import toast from 'react-hot-toast';

// Increase file size limit to 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes
const MAX_FILE_SIZE_DISPLAY = '50MB';

const PdfUpload: React.FC = () => {
  const { setPdfContent, setCurrentStep } = useQuiz();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Reset error message
    setErrorMessage('');
    
    // Check if file is a PDF
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      setErrorMessage('Invalid file type. Please upload a PDF file.');
      return;
    }
    
    // Check file size (limit to 50MB)
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds ${MAX_FILE_SIZE_DISPLAY} limit`);
      setErrorMessage(`File size exceeds ${MAX_FILE_SIZE_DISPLAY} limit. Please upload a smaller file.`);
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    setUploadStatus('idle');
    
    try {
      console.log(`Processing PDF: ${selectedFile.name}, size: ${(selectedFile.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Add more detailed logging
      console.log('Starting PDF parsing process...');
      
      // Parse the PDF directly without the timeout
      const content = await parsePdf(selectedFile);
      
      if (!content || content.trim() === '') {
        console.error('PDF parsing returned empty content');
        throw new Error('Could not extract text from PDF. The file may be empty or protected.');
      }
      
      console.log(`PDF parsed successfully. Extracted ${content.length} characters.`);
      console.log('Sample content:', content.substring(0, 100) + '...');
      
      setPdfContent(content);
      setUploadStatus('success');
      toast.success('PDF uploaded successfully!');
      
      // Automatically proceed to next step after a short delay
      setTimeout(() => {
        setCurrentStep('settings');
      }, 1500);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      setUploadStatus('error');
      let errorMsg = 'Failed to parse PDF. Please try another file.';
      
      if (error instanceof Error) {
        // Clean up the error message for display
        errorMsg = error.message.replace(/^Failed to parse PDF file: /, '');
        
        // Add more helpful suggestions based on the error
        if (errorMsg.includes('password') || errorMsg.includes('protected')) {
          errorMsg += ' Please upload a PDF that is not password protected.';
        } else if (errorMsg.includes('corrupt') || errorMsg.includes('invalid')) {
          errorMsg += ' The PDF file appears to be corrupted. Please try another file.';
        } else if (errorMsg.includes('Buffer')) {
          errorMsg = 'Error processing PDF. Please try another file or a different format.';
        }
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto"
    >
      <div className="card glass p-8">
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-full inline-flex items-center justify-center mb-4">
              <FaFilePdf className="text-white text-2xl" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-4">Upload PDF</h2>
          <p className="text-gray-600 mt-2">
            Upload a PDF document to generate quiz questions
          </p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center ${
            dragActive 
              ? 'border-purple-500 bg-purple-50' 
              : uploadStatus === 'success'
                ? 'border-green-500 bg-green-50'
                : uploadStatus === 'error'
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-purple-400 bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleInputChange}
            className="hidden"
          />
          
          {!file && !isLoading && (
            <div className="py-4">
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                Drag & drop your PDF here, or
              </p>
              <button
                onClick={handleButtonClick}
                className="btn-secondary"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Maximum file size: 50MB
              </p>
            </div>
          )}
          
          {file && !isLoading && (
            <div className="py-4">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                uploadStatus === 'success' 
                  ? 'bg-green-100' 
                  : uploadStatus === 'error'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
              }`}>
                {uploadStatus === 'success' ? (
                  <FaCheck className="text-2xl text-green-600" />
                ) : uploadStatus === 'error' ? (
                  <FaTimes className="text-2xl text-red-600" />
                ) : (
                  <FaFilePdf className="text-2xl text-gray-600" />
                )}
              </div>
              <p className="font-medium text-gray-800 mb-1">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              {uploadStatus === 'success' ? (
                <p className="text-green-600 flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  PDF uploaded successfully!
                </p>
              ) : uploadStatus === 'error' ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-4">
                  <div className="flex items-start">
                    <FaTimes className="text-red-600 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-red-700 font-medium">PDF Processing Error</p>
                      <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                      <div className="mt-3 flex space-x-3">
                        <button
                          onClick={handleButtonClick}
                          className="btn-secondary text-sm py-1.5"
                        >
                          Try Another File
                        </button>
                        <button
                          onClick={() => handleFileChange(file!)}
                          className="btn-outline text-sm py-1.5"
                          disabled={!file}
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleButtonClick}
                  className="btn-secondary"
                >
                  Change File
                </button>
              )}
            </div>
          )}
          
          {isLoading && (
            <div className="py-8">
              <FaSpinner className="mx-auto text-3xl text-purple-600 animate-spin mb-4" />
              <p className="text-gray-600">Processing PDF...</p>
            </div>
          )}
        </div>
        
        {uploadStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => setCurrentStep('settings')}
              className="btn-primary w-full flex items-center justify-center"
            >
              Continue to Quiz Settings
              <FaArrowRight className="ml-2" />
            </button>
          </motion.div>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your PDF will be processed securely and used only to generate quiz questions.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PdfUpload; 