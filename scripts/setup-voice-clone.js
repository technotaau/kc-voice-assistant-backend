const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

async function createVoiceClone() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  if (!apiKey) {
    console.error('Please set ELEVENLABS_API_KEY in .env file');
    return;
  }

  console.log('Setting up voice clone on ElevenLabs...\n');

  // Step 1: Get available voices
  try {
    const voicesResponse = await axios.get(
      'https://api.elevenlabs.io/v1/voices',
      {
        headers: { 'xi-api-key': apiKey }
      }
    );

    console.log('Current voices in your account:');
    voicesResponse.data.voices.forEach(voice => {
      console.log(`- ${voice.name} (${voice.voice_id})`);
    });

    console.log('\n📝 Instructions for Voice Cloning:');
    console.log('1. Go to https://elevenlabs.io/voice-lab');
    console.log('2. Click "Add Voice" → "Voice Cloning"');
    console.log('3. Upload KC\'s recordings (30+ minutes)');
    console.log('4. Name it "Kamlesh Chandra"');
    console.log('5. Add description: "Educational voice for teaching"');
    console.log('6. Select "Professional Cloning" for best quality');
    console.log('7. Once created, copy the Voice ID');
    console.log('8. Update KC_VOICE_ID in your .env file');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

createVoiceClone();