"use server"
import { cookies, headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';

export const Token_get = async () => {
const cookieStore = cookies();
  const headersList = await headers();
  
  const req = {
    headers: Object.fromEntries(headersList.entries()),
    cookies: Object.fromEntries(
      (await cookieStore).getAll()?.map((cookie: any) => [cookie.name, cookie.value])
    )
  };
  
  const nextAuthToken = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET!
  });
  
  const Google_token = (await cookieStore).get('token')?.value;
  const token = Google_token || nextAuthToken?.accessToken;
  return token; 
}