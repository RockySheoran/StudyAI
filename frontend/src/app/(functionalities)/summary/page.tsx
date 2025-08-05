'use client'
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { api_file_upload_url } from '@/lib/apiEnd_Point_Call';

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'failed'>('idle');
  const [summaryContent, setSummaryContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [click, setClick] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setStatus('idle');
    }
  };

  const uploadFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setStatus('uploading');
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setClick(true);
      const response = await axios.post(`${api_file_upload_url}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(progress);
          }
        },
      });
    

      setFileId(response.data.fileId);
      setSummaryId(response.data.summaryId);
      setStatus('processing');
      setProgress(50);
      startPolling(response.data.fileId);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload file. Please try again.');
      setStatus('failed');
    } finally {
      setUploading(false);
    }
  };

  const startPolling = (fileId: string) => {
    
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      try {
       
        const response = await axios.get(`${api_file_upload_url}/file/${fileId}/status`);
        const { status, content } = response.data;

        if (status === 'completed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setClick(false);
          setSummaryContent(content);
          setStatus('completed');
          setProgress(100);
         
        } else if (status === 'failed') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          setClick(false);
         
          setError('Failed to generate summary. Please try again.');
          setStatus('failed');
        }
      } catch (err) {
        console.error('Polling error:', err);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        setError('Error checking summary status.');
        setStatus('failed');
      } 
    }, 7000);

  };

  const resetForm = () => {
    setFile(null);
    setFileId(null);
    setSummaryId(null);
    setSummaryContent(null);
    setStatus('idle');
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
            PDF Summary Generator
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload your document and get an AI-powered summary
          </p>
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            {/* File upload area */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document to summarize
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FaUpload className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOCX, or TXT (MAX. 10MB)
                    </p>
                  </div>
                  <input 
                    ref={fileInputRef}
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                    disabled={uploading}
                  />
                </label>
              </div>
              
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-300 text-sm font-medium">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    disabled={uploading}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </motion.div>
              )}
            </div>

            {/* Progress indicator */}
            {status !== 'idle' && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>
                    {status === 'uploading' && 'Uploading...'}
                    {status === 'processing' && 'Generating summary...'}
                    {status === 'completed' && 'Completed!'}
                    {status === 'failed' && 'Failed'}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${status === 'failed' ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3">
              <button
                onClick={resetForm}
                disabled={!file || uploading}
                className={`flex-1 py-3 px-4 cursor-pointer rounded-lg font-medium transition-colors duration-200 ${!file || uploading ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
              >
                Cancel
              </button>
              <button
                onClick={uploadFile}
                disabled={!file || uploading || click == true}
                className={`flex-1 py-3 px-4 rounded-lg font-medium  text-white transition-colors duration-200 flex items-center justify-center ${!file || uploading || click == true ? 'bg-indigo-400 dark:bg-indigo-800 cursor-not-allowed disabled' : 'bg-indigo-600 dark:bg-indigo-700 hover:bg-indigo-700 cursor-pointer dark:hover:bg-indigo-800'}`}
              >
                { click == true ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    {status === 'uploading' ? 'Uploading' : 'Processing'}
                  </>
                ) : (
                  'Generate Summary'
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start"
            >
              <FaTimesCircle className="flex-shrink-0 mt-0.5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary result */}
        <AnimatePresence>
          {status === 'completed' && summaryContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Summary</h2>
                  <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                    <FaCheckCircle className="flex-shrink-0" />
                    <span>Ready</span>
                  </div>
                </div>
                <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                  <p className="whitespace-pre-line">{summaryContent}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FileUploader;