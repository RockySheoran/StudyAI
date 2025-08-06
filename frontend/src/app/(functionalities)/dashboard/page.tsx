// app/page.tsx
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';
import Page1 from '../../../components/common-Components/page1';

export default async function Page() {
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

  return (
    <div>
      {/* Pass token as prop and initialize store in Page1 */}
      <Page1 initialToken={token} />
    </div>
  );
}