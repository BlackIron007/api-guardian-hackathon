import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API route to check URL status
app.get('/api/check', async (req, res) => {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ status: 'Error', message: 'URL parameter is required' });
  }

  try {
    // Validate URL format
    new URL(url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'API-Guardian/1.0'
      },
      // Set a timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 seconds
    });

    if (response.ok && response.status >= 200 && response.status < 300) {
      res.json({ status: 'OK' });
    } else {
      res.json({ status: 'Error' });
    }
  } catch (error) {
    console.error('Error checking URL:', error.message);
    res.json({ status: 'Error' });
  }
});

// Serve static files from the React app build directory
// This part is for the "Final Build" blueprint ONLY.
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, '../dist')));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/check`);
});