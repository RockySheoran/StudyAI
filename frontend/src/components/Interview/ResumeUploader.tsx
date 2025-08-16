'use client';

import { useCallback, useState, useRef } from 'react';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    <div className="max-w-md mx-auto py-8">
      <div className="border-0 shadow-sm rounded-lg bg-card text-card-foreground">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Upload Your Resume</h2>
          <p className="text-muted-foreground">
            Upload your resume to personalize your interview experience (optional)
          </p>
        </div>
        
        <div className="px-6 pb-6">
          <div
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 mb-6 ${
              isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-muted-foreground/30'
            } bg-muted/50 dark:bg-muted/20 transition-colors`}
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
            <UploadCloud className={`h-12 w-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-muted-foreground'}`} />
            <p className="text-sm text-muted-foreground text-center mb-2">
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
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                'Select File'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-2">
              PDF, DOC, or DOCX (max 5MB)
            </p>
          </div>

          {resume && (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm truncate max-w-xs">{resume.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={removeFile}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex flex-col gap-3">
          <Button
            size="lg"
            className="w-full"
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
            className="w-full"
            onClick={handleSkip}
            disabled={isLoading}
          >
            Skip Resume and Start
          </Button>
          
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isLoading}
          >
            Back to Interview Type
          </Button>
        </div>
      </div>
    </div>
  );
}