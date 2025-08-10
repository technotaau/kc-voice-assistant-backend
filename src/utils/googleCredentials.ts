import fs from 'fs';
import path from 'path';

export function setupGoogleCredentials(): void {
  // Check if credentials are provided via environment variable (for production)
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  
  if (credentialsJson) {
    // Write credentials to a temporary file
    const credentialsPath = path.join(process.cwd(), 'temp-credentials.json');
    
    try {
      // Parse to validate JSON
      const credentials = JSON.parse(credentialsJson);
      
      // Write to file
      fs.writeFileSync(credentialsPath, JSON.stringify(credentials, null, 2));
      
      // Set the environment variable that Google Cloud SDK expects
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
      
      console.log('Google credentials configured from environment variable');
    } catch (error) {
      console.error('Failed to parse GOOGLE_CREDENTIALS_JSON:', error);
      throw new Error('Invalid Google credentials JSON in environment variable');
    }
  } else if (fs.existsSync('./credentials.json')) {
    // Use local file in development
    process.env.GOOGLE_APPLICATION_CREDENTIALS = './credentials.json';
    console.log('Using local credentials.json file');
  } else {
    console.warn('No Google credentials found. Speech-to-text will not work.');
  }
}

export function cleanupGoogleCredentials(): void {
  // Clean up temporary credentials file on exit
  const tempCredentialsPath = path.join(process.cwd(), 'temp-credentials.json');
  if (fs.existsSync(tempCredentialsPath)) {
    fs.unlinkSync(tempCredentialsPath);
  }
}