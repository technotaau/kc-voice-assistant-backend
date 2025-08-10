import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'KC Voice Assistant API' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import voiceRoutes from './routes/voiceRoutes';

app.use('/api/voice', voiceRoutes);
//EOF < /dev/null