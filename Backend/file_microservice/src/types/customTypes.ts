import { Request } from 'express';
import { Document } from 'mongoose';
//import { UserDocument } from '../models/user.model'; // Assuming you have a User model
import { IFile } from '../models/file.model';
import { ISummary } from '../models/summary.model';

// Extended Request type for authenticated routes
export interface IUserRequest extends Request {
  user?: any; // Replace 'any' with your actual User type if available
}

// Type for file upload responses
export interface IFileUploadResponse {
  message: string;
  fileId: string;
  url: string;
  pages: number;
  size: number;
}

// Type for file listing responses
export interface IFileListResponse {
  success: boolean;
  count: number;
  files: IFile[];
}

// Type for error responses
export interface IErrorResponse {
  error: string;
  details?: string;
  stack?: string;
}

// Type for pagination parameters
export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
}

// Type for successful operation responses
export interface ISuccessResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Type for RAG processing results
export interface IRAGResult {
  content: string;
  metadata: Record<string, any>;
  score?: number;
}

// Type for PDF processing options
export interface IPDFProcessingOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  includePageContent?: boolean;
}

// Type for authenticated file requests
export interface IFileRequest extends IUserRequest {
  file?: Express.Multer.File;
  body: {
    query?: string;
    options?: IPDFProcessingOptions;
  };
  params: {
    fileId?: string;
  };
}

// Type for summary responses
export interface ISummaryResponse extends ISuccessResponse<ISummary> {
  fromCache?: boolean;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;