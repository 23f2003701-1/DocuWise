import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI;

const configureGemini = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in environment variables');
  }
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini AI configured');
  return genAI;
};

export const getGenAI = (): GoogleGenerativeAI => {
  if (!genAI) {
    return configureGemini();
  }
  return genAI;
};

export default configureGemini;
