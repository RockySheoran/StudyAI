'use client';
import Link from 'next/link';
import { FaQuestionCircle, FaHistory } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 transition-colors duration-200">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">
            Quiz & QnA Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Test your knowledge and track your progress with our AI-powered assessment system
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Link href="/quiz_qna/quiz" className="block p-8 text-center">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <FaQuestionCircle className="text-green-600 dark:text-green-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Take a Quiz
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Test your knowledge with AI-generated quizzes on various topics
              </p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Link href="/quiz_qna/qna" className="block p-8 text-center">
              <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <FaQuestionCircle className="text-purple-600 dark:text-purple-400 text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Answer QnA
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice with comprehensive question and answer sessions
              </p>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Link 
            href="/quiz_qna/history" 
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-4 px-8 rounded-lg transition duration-300 transition-colors duration-200"
          >
            <FaHistory className="mr-3" />
            View History
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>Powered by AI • Comprehensive assessment system</p>
        </motion.div>
      </div>
    </div>
  );
}