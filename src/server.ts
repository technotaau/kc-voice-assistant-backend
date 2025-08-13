import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
dotenv.config();

import { setupGoogleCredentials, cleanupGoogleCredentials } from './utils/googleCredentials';

// Setup Google credentials before importing routes
setupGoogleCredentials();

// Import routes after environment is set up
import voiceRoutes from './routes/voiceRoutes';
import knowledgeRoutes from './routes/knowledgeRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: function (origin: any, callback: any) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
      /\.vercel\.app$/,
      /^https:\/\/kc-voice-assistant.*\.vercel\.app$/
    ];
    
    if (!origin || allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed && allowed.test(origin);
    })) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KC Voice Assistant API' });
});

app.use('/api/voice', voiceRoutes);
app.use('/api/knowledge', knowledgeRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Cleanup on exit
process.on('SIGINT', () => {
  cleanupGoogleCredentials();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  cleanupGoogleCredentials();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
//EOF < /dev/null