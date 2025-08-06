import { useState } from 'react';
import { Button } from '../ui/button';
import { Loading } from '../ui/Loading';

interface ResumeUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const ResumeUploader = ({ onUpload, isLoading }: ResumeUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!selectedFile.type.includes('pdf') && !selectedFile.name.endsWith('.pdf')) {
        setError('Please upload a PDF file');
        return;
      }

      // Validate file size (5MB max)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setError(null);
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      await onUpload(file);
      setFile(null);
    } catch (err) {
      setError('Failed to upload resume');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Upload Your Resume</h2>
      <p className="text-gray-600 mb-6">Please upload your resume to start the interview process</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="file"
            id="resume-upload"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={isLoading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <label 
            htmlFor="resume-upload"
            className={`block w-full px-4 py-12 border-2 border-dashed rounded-lg text-center ${
              file 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 hover:border-gray-400 text-gray-500'
            } transition-colors cursor-pointer`}
          >
            {file ? (
              <span className="font-medium">{file.name}</span>
            ) : (
              <>
                <span className="block text-sm font-medium">Choose a PDF file</span>
                <span className="block text-xs mt-1">or drag and drop here</span>
              </>
            )}
          </label>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        
        <Button
          type="submit"
          disabled={!file || isLoading}
          className="w-full py-6 text-lg"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loading size="sm" className="text-white" />
              Uploading...
            </span>
          ) : (
            'Upload Resume'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ResumeUploader;