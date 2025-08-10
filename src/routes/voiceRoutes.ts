import { Router, Request, Response } from 'express';
import multer from 'multer';
import { VoiceService } from '../services/voiceService';
import { SpeechService } from '../services/speechService';
import { ConversationService } from '../services/conversationService';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const voiceService = new VoiceService();
const speechService = new SpeechService();
const conversationService = new ConversationService();

// Test TTS endpoint
router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, isHinglish = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const audioBuffer = await voiceService.textToSpeech(text, isHinglish);
    
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length.toString(),
    });
    
    res.send(audioBuffer);
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'TTS generation failed' });
  }
});

// STT endpoint
router.post('/stt', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const transcript = await speechService.transcribeAudio(req.file.buffer);
    
    res.json({ transcript, success: true });
  } catch (error) {
    console.error('STT Error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

// Main conversation endpoint
router.post('/conversation', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { text, mode = 'syllabus' } = req.body;
    
    const result = await conversationService.processConversation({
      audioBuffer: req.file?.buffer,
      text,
      mode
    });

    // Send audio as base64 for easier frontend handling
    res.json({
      query: result.query,
      response: result.response,
      audio: result.audio.toString('base64'),
      success: true
    });
  } catch (error) {
    console.error('Conversation Error:', error);
    res.status(500).json({ error: 'Conversation processing failed' });
  }
});

export default router;