/**
 * Server-side translation utility using Google Cloud Translation API (Official)
 * Used only when admin creates/edits tasks or templates
 */
import { Translate } from '@google-cloud/translate/build/src/v2';
import path from 'path';

// Initialize the Google Cloud Translation client
// In production (Netlify), use base64-encoded credentials from environment variable
// In development, use local credentials file
let translateClient: Translate;

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  // Production: decode base64 credentials from environment variable
  const credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8')
  );
  translateClient = new Translate({
    credentials,
    projectId: 'skyward-475804'
  });
} else {
  // Development: use local credentials file
  const credentialsPath = path.join(process.cwd(), 'google-credentials.json');
  translateClient = new Translate({
    keyFilename: credentialsPath,
    projectId: 'skyward-475804'
  });
}

/**
 * Translate text from English to Spanish using Google Cloud Translation API
 * @param text - The English text to translate
 * @returns Translated Spanish text, or null if translation fails
 */
export async function translateToSpanish(text: string): Promise<string | null> {
  if (!text || !text.trim()) {
    return null;
  }

  try {
    const [translation] = await translateClient.translate(text, {
      from: 'en',
      to: 'es'
    });
    
    return translation;
  } catch (error) {
    console.error('Translation failed:', error);
    // Return null if translation fails - task/template will be saved in English only
    return null;
  }
}

