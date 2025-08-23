// frontend/src/components/Quiz-Qna/Qna/QnAQuestions.tsx
import { QnAData } from '@/types/Qna-Quiz/qna';

interface QnAQuestionsProps {
  qnaData: QnAData;
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  onAnswerChange: (questionIndex: number, answer: string) => void;
  onQuestionNavigate: (index: number) => void;
  onSubmit: (answers: Record<number, string>) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function QnAQuestions({ 
  qnaData, 
  currentQuestionIndex, 
  userAnswers, 
  onAnswerChange, 
  onQuestionNavigate,
  onSubmit, 
  onCancel, 
  loading 
}: QnAQuestionsProps) {
  const handleNext = () => {
    if (currentQuestionIndex < qnaData.questions.length - 1) {
      onQuestionNavigate(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      onQuestionNavigate(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(userAnswers);
  };

  const progress = ((currentQuestionIndex + 1) / qnaData.questions.length) * 100;
  const question = qnaData.questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Question {currentQuestionIndex + 1} of {qnaData.questions.length}
          </h2>
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium transition-colors duration-200">
            {question.maxMarks} marks
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
          {question.question}
        </h3>
        <div>
          <textarea
            value={userAnswers[currentQuestionIndex] || ''}
            onChange={(e) => onAnswerChange(currentQuestionIndex, e.target.value)}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
            placeholder="Type your answer here..."
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        
        <div className="space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
          >
            Previous
          </button>
          
          {currentQuestionIndex < qnaData.questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
          )}
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="mt-6 flex justify-center space-x-2">
        {qnaData.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionNavigate(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              index === currentQuestionIndex
                ? 'bg-green-600 dark:bg-green-500'
                : userAnswers[index]
                ? 'bg-blue-500 dark:bg-blue-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}