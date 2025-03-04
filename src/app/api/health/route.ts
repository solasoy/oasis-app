import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return new NextResponse(JSON.stringify({
      status: 'ok',
      time: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return new NextResponse(JSON.stringify({
      error: 'Health check failed'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 