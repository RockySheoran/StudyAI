import { useState } from 'react';
import { Button } from '../ui/button';


interface InterviewTypeSelectorProps {
  onSelect: (type: 'personal' | 'technical') => void;
  loading: boolean;
}

export const InterviewTypeSelector = ({ 
  onSelect, 
  loading 
}: InterviewTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Select Interview Type</h2>
        <p className="text-gray-600 mt-2">
          Choose the type of interview you want to practice
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-6">
        <button
          onClick={() => setSelectedType('personal')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedType === 'personal'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-left">
            <h3 className="font-semibold text-lg">Personal Interview</h3>
            <p className="text-gray-600 mt-1">
              Practice behavioral and situational questions
            </p>
          </div>
        </button>

        <button
          onClick={() => setSelectedType('technical')}
          className={`p-6 rounded-lg border-2 transition-all ${
            selectedType === 'technical'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300'
          }`}
        >
          <div className="text-left">
            <h3 className="font-semibold text-lg">Technical Interview</h3>
            <p className="text-gray-600 mt-1">
              Practice coding and technical questions
            </p>
          </div>
        </button>
      </div>

      <Button
        onClick={() => selectedType && onSelect(selectedType)}
        className="w-full py-3"
        disabled={!selectedType || loading}
    
      >
        {loading ? 'Starting...' : 'Continue'}
      </Button>
    </div>
  );
};