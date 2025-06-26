import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This is our new, built-in "Back Door"
    {
      name: 'api-guardian-server',
      configureServer(server) {
        server.middlewares.use('/api/check', async (req, res) => {
          const url = req.originalUrl.split('?url=')[1];
          if (!url) {
            res.statusCode = 400;
            res.end(JSON.stringify({ status: 'Error', message: 'URL parameter is required' }));
            return;
          }

          try {
            const decodedUrl = decodeURIComponent(url);
            new URL(decodedUrl); // Validate URL format
            
                                    const startTime = Date.now();
            const response = await fetch(decodedUrl, {
              method: 'GET',
              headers: { 'User-Agent': 'API-Guardian/1.0' },
              signal: AbortSignal.timeout(10000)
            });
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // This is the new part: read all the headers
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
              responseHeaders[key] = value;
            });

            if (response.ok) {
              res.end(JSON.stringify({ status: 'OK', responseTime: responseTime, headers: responseHeaders }));
            } else {
              res.end(JSON.stringify({ status: 'Error', responseTime: responseTime, headers: responseHeaders }));
            }
          } catch (error) {
            console.error('Error checking URL:', error.message);
            res.end(JSON.stringify({ status: 'Error' }));
          }
        });
      },
    },
  ],
});