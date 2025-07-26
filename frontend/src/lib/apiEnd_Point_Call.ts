
const BACKEND_URL = `${process.env.BACKEND_URL}/api/auth`;
const BACKEND_URL1 = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth`;
console.log("BACKEND_URL:", BACKEND_URL);


// auth backend routes
export const api_Login_url = `${BACKEND_URL}/login`;
export const api_Signup_url = `${BACKEND_URL}/signUp`;
export const api_Google_url = `${BACKEND_URL1}/login`;
