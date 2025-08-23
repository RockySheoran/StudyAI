// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full transition-colors duration-200">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-2">
          Quiz & QnA Platform
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-8">
          Test your knowledge with our AI-powered assessment system
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/quiz_qna/quiz" 
            className="block w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 text-center transition-colors duration-200"
          >
            Take a Quiz
          </Link>
          
          <Link 
            href="/quiz_qna/qna" 
            className="block w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 text-center transition-colors duration-200"
          >
            Answer QnA
          </Link>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Powered by Gemini AI • Comprehensive assessment system</p>
        </div>
      </div>
    </div>
  );
}