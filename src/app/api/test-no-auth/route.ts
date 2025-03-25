import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'This API endpoint works without any authentication',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const requestBody = await request.text();
    console.log('Raw request body:', requestBody);

    let body;
    try {
      body = JSON.parse(requestBody);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON', 
          rawBody: requestBody 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'This API endpoint works without any authentication',
      receivedData: body,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Unexpected error in test-no-auth API:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error 
      },
      { status: 500 }
    );
  }
}