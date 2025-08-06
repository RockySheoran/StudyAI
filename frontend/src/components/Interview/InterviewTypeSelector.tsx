import { useState } from 'react';
import { Button } from '../ui/button';

interface InterviewTypeSelectorProps {
  onSelect: (type: 'personal' | 'technical') => void;
  loading: boolean;
}

const InterviewTypeSelector = ({ onSelect, loading }: InterviewTypeSelectorProps) => {
  const [selectedType, setSelectedType] = useState<'personal' | 'technical'>();

  return (
    <div className="flex flex-col items-center gap-6 p-6 rounded-lg bg-white shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800">Select Interview Type</h2>
      <div className="flex gap-4 w-full">
        <Button
          variant={selectedType === 'personal' ? 'default' : 'outline'}
          onClick={() => setSelectedType('personal')}
          className="flex-1 py-6 text-lg"
        >
          Personal Interview
        </Button>
        <Button
          variant={selectedType === 'technical' ? 'default' : 'outline'}
          onClick={() => setSelectedType('technical')}
          className="flex-1 py-6 text-lg"
        >
          Technical Interview
        </Button>
      </div>
      {selectedType && (
        <Button
          onClick={() => onSelect(selectedType)}
          className="w-full py-6 text-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Starting...
            </span>
          ) : (
            'Start Interview'
          )}
        </Button>
      )}
    </div>
  );
};

export default InterviewTypeSelector;