"use client";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { FaUpload, FaFile, FaTimes } from "react-icons/fa";
import { useSummaryStore } from "@/lib/Store/Summary/summaryStore";
import { toast } from "sonner";

const FileUploadComponent: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selectedFile, status, error, setSelectedFile, resetSession } =
    useSummaryStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file) return;
      validateAndSetFile(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) validateAndSetFile(file);
    }
  };
  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream", // Google Drive files
      "application/x-pdf", // Alternative PDF MIME type
      "text/plain" // Fallback for some browsers
    ];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const maxSize = 10 * 1024 * 1024; // 10MB for Google Drive compatibility

    // Check file extension first (more reliable for Google Drive files)
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    const isValidExtension = validExtensions.includes(fileExtension);
    const isValidType = validTypes.includes(file.type);

    if (!isValidExtension && !isValidType) {
      toast.error("Invalid file type. Please upload a PDF, DOC, or DOCX file.");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const isDisabled = status === "uploading" || status === "processing";

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Document to summarize
      </label>

      {!selectedFile ? (
        <motion.div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDisabled
              ? "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed"
              : "border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700/50"
          }`}
          onClick={() => !isDisabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          whileHover={!isDisabled ? { scale: 1.01 } : {}}
          whileTap={!isDisabled ? { scale: 0.99 } : {}}
        >
          <FaUpload
            className={`mx-auto h-12 w-12 mb-4 ${
              isDisabled
                ? "text-gray-300 dark:text-gray-600"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <p
            className={`text-lg font-medium mb-2 ${
              isDisabled
                ? "text-gray-400 dark:text-gray-600"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {isDisabled
              ? "Processing..."
              : "Drop your PDF here or click to browse"}
          </p>
          <p
            className={`text-sm ${
              isDisabled
                ? "text-gray-400 dark:text-gray-600"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            Supports PDF and Docx files up to 10MB (Google Drive not supported)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            disabled={isDisabled}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 sm:p-4"
        >
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col sm:hidden space-y-3">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <FaFile className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900 dark:text-white break-all"
                  title={selectedFile.name}
                >
                  {selectedFile.name.length > 30
                    ? `${selectedFile.name.substring(
                        0,
                        25
                      )}...${selectedFile.name.substring(
                        selectedFile.name.lastIndexOf(".")
                      )}`
                    : selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {!isDisabled && (
              <div className="flex justify-end">
                <motion.button
                  onClick={handleRemoveFile}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaTimes className="h-3 w-3" />
                  Remove
                </motion.button>
              </div>
            )}
          </div>

          {/* Desktop Layout - Horizontal */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                <FaFile className="h-8 w-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium text-gray-900 dark:text-white truncate"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {!isDisabled && (
              <motion.button
                onClick={handleRemoveFile}
                className="flex-shrink-0 ml-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="h-5 w-5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-red-600 dark:text-red-400 flex-1">
              {error}
            </p>
            <motion.button
              onClick={resetSession}
              className="ml-3 px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUploadComponent;
