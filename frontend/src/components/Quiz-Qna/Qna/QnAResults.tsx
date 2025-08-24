// frontend/src/components/Quiz-Qna/Qna/QnAResults.tsx
import { useQnAStore } from "@/lib/Store/Quiz-Qna/qnaStore";
import { QnAResult } from "@/types/Qna-Quiz/qna";


interface QnAResultsProps {
  onRestart: () => void;
}

export default function QnAResults({ onRestart }: QnAResultsProps) {
  const { recentResults } = useQnAStore();
  const result = recentResults[0]; // Get the most recent result

  if (!result) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          No Results Found
        </h2>
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Try Another QnA
        </button>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        QnA Results
      </h2>
      
      <div className="text-center mb-8">
        <div className={`text-5xl font-bold ${getScoreColor(result.percentage)} mb-2`}>
          {result.percentage}%
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          You scored {result.totalScore} out of {result.maxPossibleScore} points
        </p>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Detailed Feedback</h3>
        <div className="space-y-6">
          {result.evaluations.map((evaluation, index) => (
            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
              <h4 className="font-medium mb-2 text-gray-800 dark:text-white">
                Question {index + 1}: {evaluation.question}
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mb-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">{evaluation.answer}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {evaluation.score}/{evaluation.maxMarks}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{evaluation.feedback}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Try Another QnA
        </button>
      </div>
    </div>
  );
}