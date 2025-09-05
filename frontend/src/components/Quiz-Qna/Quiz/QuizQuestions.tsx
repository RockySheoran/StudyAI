// frontend/src/components/Quiz-Qna/Quiz/QuizQuestions.tsx
import { QuizData } from '@/types/Qna-Quiz/quiz';

interface QuizQuestionsProps {
  quizData: QuizData;
  currentQuestionIndex: number;
  userAnswers: Record<number, string>;
  onAnswerSelect: (questionIndex: number, option: string) => void;
  onQuestionNavigate: (index: number) => void;
  onSubmit: (answers: Record<number, string>) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function QuizQuestions({ 
  quizData, 
  currentQuestionIndex, 
  userAnswers, 
  onAnswerSelect, 
  onQuestionNavigate,
  onSubmit, 
  onCancel, 
  loading 
}: QuizQuestionsProps) {
  const handleNext = () => {
    if (currentQuestionIndex < quizData.questions.length - 1) {
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

  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;
  const question = quizData.questions[currentQuestionIndex];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Question {currentQuestionIndex + 1} of {quizData.questions.length}
          </h2>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            question.difficulty === 'easy' 
              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
              : question.difficulty === 'medium'
              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
          }`}>
            {question.difficulty}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">
          {question.question}
        </h3>
        <div className="space-y-3">
          {question?.options?.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${index}`}
                name="answer"
                checked={userAnswers[currentQuestionIndex] === option}
                onChange={() => onAnswerSelect(currentQuestionIndex, option)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
              <label 
                htmlFor={`option-${index}`} 
                className="ml-3 block text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
        >
          Cancel
        </button>
        
        <div className="space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
          >
            Previous
          </button>
          
          {currentQuestionIndex < quizData.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!userAnswers[currentQuestionIndex]}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || Object.keys(userAnswers).length !== quizData.questions.length}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="mt-6 flex justify-center space-x-2">
        {quizData.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => onQuestionNavigate(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 cursor-pointer ${
              index === currentQuestionIndex
                ? 'bg-blue-600 dark:bg-blue-500'
                : userAnswers[index]
                ? 'bg-green-500 dark:bg-green-400'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`Go to question ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}