
import process from "process";

const BACKEND_URL = `${process.env.BACKEND_URL}/api/auth`;
const BACKEND_URL1 = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth`;



// auth backend routes
export const api_Login_url = `${BACKEND_URL}/login`;
export const api_Signup_url = `${BACKEND_URL}/signUp`;
export const api_Google_url = `${BACKEND_URL}/google-login`;
export const api_Github_url = `${BACKEND_URL}/github-login`;
export const api_logout_url = `${BACKEND_URL}/logout`;
export const api_getme_url = `${BACKEND_URL}/me`;
export const api_forgot_url = `${BACKEND_URL}/forgot-password`;
export const api_reset_url = `${BACKEND_URL}/reset-password`;



export const api_summary_history_url = `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/api/summary-history` 
export const api_delete_summary_url = `${process.env.NEXT_PUBLIC_BACKEND_FILE_URL}/api`
export const api_interview_history_url = `${process.env.NEXT_PUBLIC_INTERVIEW_BACKEND_URL}/api/interview/history`
export const api_quiz_history_url = `${process.env.NEXT_PUBLIC_QUIZ_QNA_BACKEND_URL}/api/quiz/history`
export const api_qna_history_url = `${process.env.NEXT_PUBLIC_QUIZ_QNA_BACKEND_URL}/api/qna/history`
export const api_topic_history_url = `${process.env.NEXT_PUBLIC_TOPIC_BACKEND_URL}/api/topic/history`

export const current_affairs_url = process.env.NEXT_PUBLIC_CURRENT_AFFAIRS_BACKEND_URL 

