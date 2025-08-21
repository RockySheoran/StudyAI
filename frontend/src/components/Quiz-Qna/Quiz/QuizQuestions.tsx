// frontend/src/app/quiz/components/QuizQuestions.tsx
import { QuizData } from '@/types/Qna-Quiz/quiz';
import { useState } from 'react';

interface QuizQuestionsProps {
  quizData: QuizData;
  onSubmit: (answers: Record<number, string>) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function QuizQuestions({ quizData, onSubmit, onCancel, loading }: QuizQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const question = quizData.questions[currentQuestion];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Question {currentQuestion + 1} of {quizData.questions.length}
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
                checked={answers[currentQuestion] === option}
                onChange={() => handleAnswerSelect(currentQuestion, option)}
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
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Cancel
        </button>
        
        <div className="space-x-2">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
          >
            Previous
          </button>
          
          {currentQuestion < quizData.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors duration-200"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length !== quizData.questions.length || loading}
              className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}