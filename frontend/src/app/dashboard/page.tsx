// app/page.tsx
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  console.log(token,"token")
  
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