import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupGoogleCredentials, cleanupGoogleCredentials } from './utils/googleCredentials';
import voiceRoutes from './routes/voiceRoutes';

dotenv.config();

// Setup Google credentials before initializing services
setupGoogleCredentials();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KC Voice Assistant API' });
});

app.use('/api/voice', voiceRoutes);

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