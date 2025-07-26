// app/page.tsx

import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';

export default async function Page() {
  const cookieStore = await cookies();
  const headersList = await headers();
  
  // Create a mock request object for getToken
  const req = {
    headers: Object.fromEntries(headersList.entries()),
    cookies: Object.fromEntries(
      Array.from(cookieStore.getAll().map(cookie => [cookie.name, cookie.value]))
    )
  };
  
  const nextAuthToken = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET
  });
  // console.log(nextAuthToken?.accessToken,"nextAuthToken")
  const Google_token = cookieStore.get('token')?.value;
  // console.log(Google_token,"Google_token")
  const token  = Google_token || nextAuthToken?.accessToken;
 
  
  return (
    <div>
      {token ? (
        <p>Authenticated</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}