import { VoiceService } from './voiceService';
import { SpeechService } from './speechService';
import { AIService } from './aiService';

export interface ConversationRequest {
  audioBuffer?: Buffer;
  text?: string;
  mode: 'syllabus' | 'courses';
}

export class ConversationService {
  private voiceService: VoiceService;
  private speechService: SpeechService;
  private aiService: AIService;

  constructor() {
    this.voiceService = new VoiceService();
    this.speechService = new SpeechService();
    this.aiService = new AIService();
  }

  async processConversation(request: ConversationRequest) {
    try {
      // Step 1: Get text (from audio or direct input)
      let userQuery = request.text;
      
      if (request.audioBuffer && !userQuery) {
        console.log('Transcribing audio...');
        userQuery = await this.speechService.transcribeAudio(request.audioBuffer);
      }

      if (!userQuery) {
        throw new Error('No input provided');
      }

      console.log('User Query:', userQuery);

      // Step 2: Generate AI response
      console.log('Generating response...');
      const aiResponse = await this.aiService.generateResponse(
        userQuery,
        request.mode
      );

      console.log('AI Response:', aiResponse);

      // Step 3: Convert response to speech
      console.log('Converting to speech...');
      const audioBuffer = await this.voiceService.textToSpeech(aiResponse, true);

      return {
        query: userQuery,
        response: aiResponse,
        audio: audioBuffer,
        success: true
      };
    } catch (error) {
      console.error('Conversation Error:', error);
      throw error;
    }
  }
}