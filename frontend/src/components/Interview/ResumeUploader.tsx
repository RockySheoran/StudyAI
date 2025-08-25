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
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit.');
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
      className="max-w-md mx-auto mb-5"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <FileText className="text-indigo-600 dark:text-indigo-400 text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
            Upload Your Resume
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your resume to personalize your interview experience (optional)
          </p>
        </div>
        
        <div className="px-8 pb-8">
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 mb-6 ${
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
            <UploadCloud className={`h-12 w-12 mb-4 ${
              isDragging ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
            }`} />
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-2">
              {isDragging ? 'Drop your resume here' : 'Drag & drop your resume here or click to browse'}
            </p>
            <Button 
              variant="outline" 
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                triggerFileInput();
              }}
              className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                'Select File'
              )}
            </Button>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              PDF, DOC, or DOCX (max 5MB)
            </p>
          </div>

          {resume && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/30 mb-6"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-800 dark:text-gray-200 truncate max-w-xs">
                  {resume.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 text-white font-semibold py-3 rounded-xl transition duration-300"
              onClick={handleUpload}
              disabled={(!resume || isLoading)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Starting Interview...
                </>
              ) : (
                'Start Interview with Resume'
              )}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-full border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 rounded-xl transition duration-300"
              onClick={handleSkip}
              disabled={isLoading}
            >
              Skip Resume and Start
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
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