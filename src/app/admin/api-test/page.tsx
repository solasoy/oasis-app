'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApiTestPage() {
  const [isDevelopment, setIsDevelopment] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if we're in development mode
  useEffect(() => {
    // In client components, we can't directly access process.env.NODE_ENV
    // So we'll check for development-specific features or use a public env var
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    setIsDevelopment(isLocalhost);
    console.log('Development mode detection:', { isLocalhost });
  }, []);

  const testNoAuthApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Use the no-auth API endpoint
      const response = await fetch('/api/test-no-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: 'data',
          timestamp: new Date().toISOString()
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      setTestResult(data);
      
      if (!response.ok) {
        throw new Error(data.error || 'API test failed');
      }
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testDevApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Use the development-only API endpoint
      const response = await fetch('/api/admin/update-application-status-dev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: 'test-id',
          status: 'approved',
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      setTestResult(data);
      
      if (!response.ok) {
        throw new Error(data.error || 'API test failed');
      }
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testFixedApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Use the fixed API endpoint
      const response = await fetch('/api/admin/update-application-status-fixed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: 'test-id',
          status: 'approved',
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      setTestResult(data);
      
      if (!response.ok) {
        throw new Error(data.error || 'API test failed');
      }
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testOriginalApi = async () => {
    setLoading(true);
    setError(null);
    setTestResult(null);
    
    try {
      // Use the original API endpoint
      const response = await fetch('/api/admin/update-application-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId: 'test-id',
          status: 'approved',
        }),
      });

      // Log the raw response for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      // Try to parse the response
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error(`Failed to parse response: ${responseText}`);
      }

      setTestResult(data);
      
      if (!response.ok) {
        throw new Error(data.error || 'API test failed');
      }
    } catch (err) {
      console.error('API test error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Environment Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="font-medium">Development Mode:</div>
          <div>{isDevelopment ? 'Yes' : 'No'}</div>
          
          <div className="font-medium">Hostname:</div>
          <div>{typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">API Tests</h2>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testNoAuthApi}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test No-Auth API'}
            </button>
            
            <button
              onClick={testDevApi}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Development API'}
            </button>
            
            <button
              onClick={testFixedApi}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Fixed API'}
            </button>
            
            <button
              onClick={testOriginalApi}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Original API'}
            </button>
          </div>
          
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {testResult && (
            <div className="p-4 bg-gray-100 rounded">
              <p className="font-bold mb-2">API Response:</p>
              <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 bg-white p-2 rounded border">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Navigation</h2>
        <div className="flex space-x-4">
          <Link 
            href="/admin/applications-fixed"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Fixed Applications Page
          </Link>
          <Link 
            href="/admin"
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}