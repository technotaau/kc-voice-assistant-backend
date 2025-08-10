const axios = require('axios');
const fs = require('fs');

async function testTTS() {
  try {
    console.log('Testing Text-to-Speech...');
    const response = await axios.post('http://localhost:5000/api/voice/tts', {
      text: 'Namaste students, aaj hum memory techniques seekhenge',
      isHinglish: true
    }, {
      responseType: 'arraybuffer'
    });

    fs.writeFileSync('test-output.mp3', response.data);
    console.log('✅ Audio saved as test-output.mp3');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTTS();