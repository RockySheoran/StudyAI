// backend/src/utils/validation.ts
import { z } from 'zod';

export const quizValidationSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
});

export const qnaValidationSchema = z.object({
  educationLevel: z.string().min(1, 'Education level is required'),
  topic: z.string().min(1, 'Topic is required'),
  marks: z.number().min(2).max(5, 'Marks should be between 2 and 5'),
});

export type QuizInput = z.infer<typeof quizValidationSchema>;
export type QnAInput = z.infer<typeof qnaValidationSchema>;