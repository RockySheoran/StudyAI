// frontend/src/app/quiz/components/QuizForm.tsx
import { UseFormReturn } from 'react-hook-form';

interface QuizFormProps {
  form: UseFormReturn<{
    educationLevel: string;
    topic: string;
  }>;
  onSubmit: (data: { educationLevel: string; topic: string }) => void;
  loading: boolean;
}

export default function QuizForm({ form, onSubmit, loading }: QuizFormProps) {
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors duration-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
        Create Your Quiz
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Education Level
          </label>
          <select
            id="educationLevel"
            {...register('educationLevel')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Education Level</option>
            <option value="elementary">Elementary School</option>
            <option value="middle">Middle School</option>
            <option value="high">High School</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="graduate">Graduate</option>
          </select>
          {errors.educationLevel && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.educationLevel.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Topic
          </label>
          <input
            type="text"
            id="topic"
            {...register('topic')}
            placeholder="Enter a topic (e.g., Mathematics, History, Science)"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {errors.topic && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.topic.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
        >
          {loading ? 'Generating Quiz...' : 'Generate Quiz'}
        </button>
      </form>
    </div>
  );
}