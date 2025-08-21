import { NextResponse } from 'next/server';
import apiClient from '@/lib/Api/Interview-api';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await apiClient.post('http://localhost:8002/interview/start', body);
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start interview' },
      { status: 500 }
    );
  }
}