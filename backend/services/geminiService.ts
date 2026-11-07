import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasValidGeminiKey =
  Boolean(geminiApiKey) &&
  geminiApiKey !== 'MY_GEMINI_API_KEY' &&
  !geminiApiKey.startsWith('MY_') &&
  geminiApiKey.length > 10;

export const geminiClient = hasValidGeminiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export function isGeminiAvailable(): boolean {
  return geminiClient !== null;
}

export function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    ),
  ]);
}

export interface GenerateOptions {
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}

export async function generateContentWithFallback(
  prompt: string | any[],
  options: GenerateOptions = {},
  fallbackGenerator: () => string
): Promise<string> {
  if (!geminiClient) {
    return fallbackGenerator();
  }

  try {
    const contents = Array.isArray(prompt) ? prompt : [{ role: 'user', parts: [{ text: prompt }] }];
    const config: any = {};
    if (options.systemInstruction) {
      config.systemInstruction = options.systemInstruction;
    }
    if (options.responseMimeType) {
      config.responseMimeType = options.responseMimeType;
    }

    const response = await callWithTimeout(
      geminiClient.models.generateContent({
        model: options.model || 'gemini-3.8-flash',
        contents,
        config,
      }),
      8000
    );

    return response.text || fallbackGenerator();
  } catch (err: any) {
    console.warn('[Gemini Service] Fallback activated:', err.message);
    return fallbackGenerator();
  }
}
