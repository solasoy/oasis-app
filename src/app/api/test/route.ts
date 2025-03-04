import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(JSON.stringify({
    message: 'Test endpoint working'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
} 