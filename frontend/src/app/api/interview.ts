// import { NextApiRequest, NextApiResponse } from 'next';
// import { getSession } from 'next-auth/react';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const session = await getSession({ req });
  
//   if (!session) {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   try {
//     if (req.method === 'POST' && req.url?.includes('/start')) {
//       const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/interview/start`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.accessToken}`,
//         },
//         body: JSON.stringify(req.body),
//       });
      
//       const data = await backendResponse.json();
//       return res.status(backendResponse.status).json(data);
//     }

//     if (req.method === 'POST' && req.url?.includes('/continue')) {
//       const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/interview/continue`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${session.accessToken}`,
//         },
//         body: JSON.stringify(req.body),
//       });
      
//       const data = await backendResponse.json();
//       return res.status(backendResponse.status).json(data);
//     }

//     if (req.method === 'GET' && req.url?.includes('/history')) {
//       const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/interview/history`, {
//         headers: {
//           'Authorization': `Bearer ${session.accessToken}`,
//         },
//       });
      
//       const data = await backendResponse.json();
//       return res.status(backendResponse.status).json(data);
//     }

//     if (req.method === 'GET') {
//       const { id } = req.query;
//       const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/interview/${id}`, {
//         headers: {
//           'Authorization': `Bearer ${session.accessToken}`,
//         },
//       });
      
//       const data = await backendResponse.json();
//       return res.status(backendResponse.status).json(data);
//     }

//     return res.status(405).json({ error: 'Method not allowed' });
//   } catch (error) {
//     console.error('API error:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }