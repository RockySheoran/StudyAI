'use client';

import { useCallback, useState, useRef } from 'react';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ResumeUploadProps {
  onUpload: (file: File) => Promise<void> | void;
  onSkip: () => Promise<void> | void;
  onBack: () => void;
  isLoading: boolean;
}

export function ResumeUpload({ onUpload, onSkip, onBack, isLoading }: ResumeUploadProps) {
  const [resume, setResume] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream', // Google Drive files
      'application/x-pdf', // Alternative PDF MIME type
      'text/plain' // Fallback for some browsers
    ];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const maxSize = 10 * 1024 * 1024; // 10MB for Google Drive compatibility

    // Check file extension first (more reliable for Google Drive files)
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidType = validTypes.includes(file.type);

    if (!isValidExtension && !isValidType) {
      toast.error('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setResume(file);
  };

  const removeFile = () => {
    setResume(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (resume) {
      await onUpload(resume);
    }
  };

  const handleSkip = async () => {
    await onSkip();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 sm:p-6 text-center">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 sm:p-3 rounded-full w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 flex items-center justify-center">
            <FileText className="text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-3">
            Upload Your Resume
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
            Upload your resume to personalize your interview experience (optional)
          </p>
        </div>
        
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-gray-300 dark:border-gray-600'
            } bg-gray-50 dark:bg-gray-700/30 transition-colors cursor-pointer`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <UploadCloud className={`h-8 w-8 sm:h-10 sm:w-10 mb-3 sm:mb-4 ${
              isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center mb-2 px-2">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume here or click to browse'}
            </p>
            <Button 
              variant="outline" 
              type="button"
              size="sm"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="mt-1 sm:mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs sm:text-sm"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
              ) : (
                'Select File'
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 sm:mt-3">
              PDF, DOC, or DOCX (max 10MB) (Google Drive not supported)
            </p>
          </div>

          {resume && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-700/30 mb-4 sm:mb-6"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 truncate" title={resume.name}>
                  {resume.name.length > 25 
                    ? `${resume.name.substring(0, 20)}...${resume.name.substring(resume.name.lastIndexOf('.'))}`
                    : resume.name
                  }
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 sm:h-8 sm:w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0 ml-2"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </motion.div>
          )}

          <div className="flex flex-col gap-3 sm:gap-4">
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-medium py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition duration-300 text-sm sm:text-base"
              onClick={handleUpload}
              disabled={(!resume || isLoading)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-2" />
                  <span className="text-xs sm:text-sm">Starting Interview...</span>
                </>
              ) : (
                'Start Interview with Resume'
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition duration-300 text-sm sm:text-base"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip Resume and Start
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 py-2 sm:py-2.5 text-sm sm:text-base"
              onClick={onBack}
              disabled={isLoading}
            >
              Back to Interview Type
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}