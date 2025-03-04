import { NextResponse } from 'next/server';

export const GET = async (request: Request) => {
  return new NextResponse(JSON.stringify({ message: 'Hello World' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}; 