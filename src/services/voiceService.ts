import axios from 'axios';

export class VoiceService {
  private apiKey: string;
  private voiceId: string;

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    this.voiceId = process.env.KC_VOICE_ID || '';
  }

  async textToSpeech(text: string, isHinglish: boolean = true) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`;
    
    const processedText = isHinglish ? this.preprocessHinglish(text) : text;
    
    try {
      const response = await axios.post(url, {
        text: processedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.85
        }
      }, {
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      throw error;
    }
  }

  private preprocessHinglish(text: string): string {
    // Basic pronunciation mapping
    const pronunciations: Record<string, string> = {
      'बच्चे': 'bachche',
      'समझे': 'samjhe',
      'पढ़ाई': 'padhai',
      'नमस्ते': 'namaste',
      'अच्छा': 'achha'
    };

    let processed = text;
    for (const [hindi, roman] of Object.entries(pronunciations)) {
      processed = processed.replace(new RegExp(hindi, 'g'), roman);
    }

    return processed;
  }
}