import { SpeechClient } from '@google-cloud/speech';
import { Readable } from 'stream';

export class SpeechService {
  private client: SpeechClient;

  constructor() {
    this.client = new SpeechClient();
  }

  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    const request = {
      audio: {
        content: audioBuffer.toString('base64'),
      },
      config: {
        encoding: 'WEBM_OPUS' as any,
        sampleRateHertz: 48000,
        languageCode: 'hi-IN',
        alternativeLanguageCodes: ['en-IN'],
        enableAutomaticPunctuation: true,
        model: 'latest_long',
        useEnhanced: true,
      },
    };

    try {
      const [response] = await this.client.recognize(request);
      const transcription = response.results
        ?.map((result: any) => result.alternatives?.[0].transcript)
        .join(' ') || '';
      
      console.log('Transcribed:', transcription);
      return transcription;
    } catch (error) {
      console.error('STT Error:', error);
      throw error;
    }
  }

  async transcribeStream(audioStream: Readable): Promise<string> {
    const request = {
      config: {
        encoding: 'WEBM_OPUS' as any,
        sampleRateHertz: 48000,
        languageCode: 'hi-IN',
        alternativeLanguageCodes: ['en-IN'],
        enableAutomaticPunctuation: true,
        model: 'latest_long',
      },
      interimResults: true,
    };

    const recognizeStream = this.client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', (data: any) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          console.log(`Interim: ${data.results[0].alternatives[0].transcript}`);
        }
      });

    audioStream.pipe(recognizeStream);

    return new Promise((resolve) => {
      let finalTranscript = '';
      recognizeStream.on('data', (data: any) => {
        if (data.results[0]?.isFinal) {
          finalTranscript = data.results[0].alternatives[0].transcript;
          resolve(finalTranscript);
        }
      });
    });
  }
}