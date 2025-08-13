import { VoiceService } from './voiceService';
import { SpeechService } from './speechService';
import { AIService } from './aiService';
import knowledgeBaseService from './knowledgeBaseService';

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
    
    // Initialize knowledge base
    this.initializeKnowledgeBase();
  }

  private async initializeKnowledgeBase() {
    try {
      await knowledgeBaseService.initialize();
      // Load documents from the documents directory
      const documentsPath = process.env.DOCUMENTS_PATH || './documents';
      await knowledgeBaseService.loadDocuments(documentsPath);
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }

  async processConversation(request: ConversationRequest) {
    try {
      // Step 1: Get text (from audio or direct input)
      let userQuery = request.text;
      
      if (request.audioBuffer && !userQuery) {
        console.log('Transcribing audio...');
        userQuery = await this.speechService.transcribeAudio(request.audioBuffer);
        
        // If transcription is empty, provide a helpful fallback
        if (!userQuery.trim()) {
          userQuery = 'Hello, I tried to speak but the transcription was empty. Can you help me?';
          console.log('Using fallback query due to empty transcription');
        }
      }

      if (!userQuery || !userQuery.trim()) {
        throw new Error('No input provided');
      }

      console.log('User Query:', userQuery);

      // Step 2: Get context from knowledge base
      console.log('Searching knowledge base...');
      const knowledgeContext = await knowledgeBaseService.getContextForQuery(userQuery);

      // Step 3: Generate AI response with knowledge context
      console.log('Generating response...');
      const aiResponse = await this.aiService.generateResponse(
        userQuery,
        request.mode,
        knowledgeContext
      );

      console.log('AI Response:', aiResponse);

      // Step 4: Convert response to speech
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