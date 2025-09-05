// frontend/src/components/Quiz-Qna/Quiz/QuizResults.tsx
import { QuizResult } from "@/types/Qna-Quiz/quiz";

interface QuizResultsProps {
  result: QuizResult;
  onRestart: () => void;
  showRestartButton?: boolean;
  title?: string;
}

export default function QuizResults({ result, onRestart, showRestartButton = true, title = 'Quiz Results' }: QuizResultsProps) {
  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200';
    if (percentage >= 60) return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
    return 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        {title}
      </h2>
      
      <div className="text-center mb-8">
        <div className={`text-5xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
          {result.percentage}%
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          You scored {result.score} out of {result.totalQuestions} questions correctly
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.score}</div>
          <div className="text-sm text-green-800 dark:text-green-200">Correct</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 py-4 sm:p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.totalQuestions - result.score}</div>
          <div className="text-sm text-red-800 dark:text-red-200">Incorrect</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.totalQuestions}</div>
          <div className="text-sm text-blue-800 dark:text-blue-200">Total</div>
        </div>
      </div>

      {/* Detailed Results */}
      {result.results && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Detailed Results</h3>
          <div className="space-y-4">
            {result.results.map((item, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    Q{index + 1}: {item.question}
                  </p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.isCorrect 
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {item.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Your answer: {item.userAnswer || 'Not answered'}</p>
                  <p>Correct answer: {item.correctAnswer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showRestartButton && (
        <div className="text-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 cursor-pointer"
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}