import React, { useState } from 'react';
import { Shield, Link2 } from 'lucide-react';

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cujnesygkqvvcmepoftm.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey)

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

    const handleStartMonitoring = async () => {
    if (!url.trim()) {
      // We can't set results to a string anymore, so just do nothing or show an alert
      alert('Please enter a URL to monitor');
      return;
    }

    // Clear old results and show loading
    setResults(null); // Set to null, not a string
    setIsLoading(true);

    try {
      // Call our server-side API route
      const response = await fetch(`/api/check?url=${encodeURIComponent(url.trim())}`);
      const data = await response.json();
      
      // This is the main fix: we put the ENTIRE data object into our results box
      setResults(data);
      // Save the scan to Supabase
const { error } = await supabase
  .from('scans')
  .insert([
    { url: url.trim(), status: data.status, response_time: data.responseTime, report: data.headers },
  ]);
if (error) {
  console.error('Error saving to Supabase:', error);
}

    } catch (error) {
      console.error('Error calling API:', error);
      // If there's an error, we create an error object to put in the box
      setResults({ status: 'Error', responseTime: 0, headers: null });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-2xl w-full">
        {/* Logo and Title */}
        <div className="flex items-center justify-center mb-4">
          <Shield className="text-white w-12 h-12 mr-4" />
          <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight">
            API Guardian
          </h1>
        </div>
        
        {/* Subtitle */}
        <p className="text-gray-400 text-lg md:text-xl mb-12 font-light">
          Secure your APIs with intelligent monitoring and protection
        </p>
        
        {/* URL Input Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <div className="flex items-center mb-4">
              <Link2 className="text-gray-400 w-5 h-5 mr-2" />
              <label htmlFor="url-input" className="text-white font-medium">
                Enter API URL to Monitor
              </label>
            </div>
            
            <div className="relative">
              <input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-6 py-4 bg-black/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg"
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            
            <button
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              onClick={handleStartMonitoring}
              disabled={isLoading}
            >
              {isLoading ? 'Monitoring...' : 'Start Monitoring'}
            </button>

                                {/* Results Area */}
            {results && (
              <div className="mt-6 p-6 bg-black/30 border border-gray-600 rounded-xl text-left">
                <p className="text-white font-medium text-lg mb-4">
                  <span className={results.status === 'OK' ? 'text-green-400' : 'text-red-400'}>
                    Status: {results.status}
                  </span>
                  <span className="text-gray-400 mx-2">|</span>
                  <span>Response Time: {results.responseTime}ms</span>
                </p>

                {results.headers && (
                  <div>
                    <h3 className="text-gray-300 font-semibold mb-3 text-lg">Security Report Card:</h3>
                    <div className="space-y-2">
                      {
                        // List of important security headers to check
                        ['content-security-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options', 'referrer-policy'].map(headerName => {
                          const headerValue = results.headers[headerName.toLowerCase()];
                          const isPresent = headerValue !== undefined;
                          
                          return (
                            <div key={headerName} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-md">
                              <span className="font-mono text-sm text-gray-300">{headerName}</span>
                              {isPresent ? (
                                <span className="font-semibold text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                                  ✓ PRESENT
                                </span>
                              ) : (
                                <span className="font-semibold text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                                  ✗ MISSING
                                </span>
                              )}
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Real-time Protection</h3>
            <p className="text-gray-400 text-sm">Monitor API endpoints for threats and anomalies</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Easy Integration</h3>
            <p className="text-gray-400 text-sm">Simple setup with any REST API endpoint</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-400 text-sm">Detailed insights and security reports</p>
          </div>
        </div>
      </div>
              {/* BUILT WITH BOLT BADGE */}
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-gray-900/80 px-3 py-2 text-sm text-gray-300 border border-gray-700 backdrop-blur-sm transition-colors hover:bg-gray-800"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.10853 14L9.10853 6.13112L6.10853 6.13112L10.8915 1L5.89147 8.86888L8.89147 8.86888L4.10853 14Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
          Built with Bolt.new
        </a>
    </div>
  );
}

export default App;