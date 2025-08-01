'use client';
import { useState } from 'react';
import { FaSun, FaMoon, FaUpload, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

export default function SummaryPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [summaryLevel, setSummaryLevel] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock response - replace with actual API call
    setSummary(`This is a ${summaryLevel} level summary of your document "${file.name}". 
    In a real implementation, this would be the response from your backend API. 
    The summary would contain the key points extracted from the uploaded document.`);
    
    setIsLoading(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header with theme toggle */}
        <header className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
          >
            Document Summarizer
          </motion.h1>
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
          >
            {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
          </motion.button>
        </header>

        {/* Upload form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Document
              </label>
              <div className="flex items-center">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-8 h-8 mb-3 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOCX, or TXT (MAX. 10MB)
                    </p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                  />
                </label>
              </div>
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  Selected: {file.name}
                </motion.div>
              )}
            </div>

            <div className="mb-6 relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Summary Detail Level
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center"
                >
                  <span className="capitalize">{summaryLevel}</span>
                  <svg 
                    className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'transform rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 shadow-lg rounded-md overflow-hidden"
                    >
                      {['high', 'medium', 'low'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            setSummaryLevel(level);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 capitalize ${summaryLevel === level ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={!file || isLoading}
              whileHover={{ scale: !file || isLoading ? 1 : 1.05 }}
              whileTap={{ scale: !file || isLoading ? 1 : 0.95 }}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors duration-300 flex items-center justify-center ${!file || isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Generate Summary'
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Summary result */}
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Summary Result
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {summary}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}