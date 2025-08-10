const axios = require('axios');
const fs = require('fs');

async function testConversation() {
  try {
    console.log('Testing complete conversation flow...\n');
    
    // Test with text input
    const response = await axios.post('http://localhost:5000/api/voice/conversation', {
      text: 'What is photosynthesis? Please explain in simple terms.',
      mode: 'syllabus'
    });

    console.log('Query:', response.data.query);
    console.log('Response:', response.data.response);
    
    // Save audio
    const audioBuffer = Buffer.from(response.data.audio, 'base64');
    fs.writeFileSync('conversation-output.mp3', audioBuffer);
    console.log('\n✅ Audio saved as conversation-output.mp3');
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testConversation();