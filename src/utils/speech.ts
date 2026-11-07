import { Language } from '../types';

// Speech synthesis (Text-to-Speech)
class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private lastSpokenText: string = '';
  private lastLanguage: Language = 'en';
  private lastRate: number = 0.85;
  private volume: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1.0, vol));
  }

  public speak(
    text: string,
    language: Language = 'en',
    rate: number = 0.85,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    this.lastSpokenText = text;
    this.lastLanguage = language;
    this.lastRate = rate;

    // Clean markdown/symbols from text before reading
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = Math.max(0.65, Math.min(1.2, rate));
    utterance.pitch = 1.0;
    utterance.volume = this.volume;

    // Pick best matching voice
    const langCode = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.lang = langCode;

    if (this.voices.length > 0) {
      const match = this.voices.find(v => v.lang.startsWith(langCode)) ||
        this.voices.find(v => language === 'en' && v.lang.startsWith('en')) ||
        this.voices.find(v => (language === 'hi' || language === 'mr') && (v.lang.includes('hi') || v.lang.includes('IN')));
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public replay(onStart?: () => void, onEnd?: () => void, onError?: (err: any) => void) {
    if (this.lastSpokenText) {
      this.speak(this.lastSpokenText, this.lastLanguage, this.lastRate, onStart, onEnd, onError);
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public cancel() {
    this.stop();
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }
}

export const speechEngine = new SpeechEngine();

// Speech Recognition (Speech-to-Text)
export interface SpeechRecognitionHookOptions {
  language: Language;
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class VoiceRecognition {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(
    language: Language,
    onResult: (transcript: string, isFinal?: boolean) => void,
    onError?: (msg: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      if (onError) onError('Voice input is not supported in this browser. Please type your message.');
      return;
    }

    // Interrupt any ongoing TTS speech when user begins speaking
    speechEngine.stop();

    if (this.isListening) {
      this.stopListening();
    }

    this.recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript.trim()) {
        onResult(finalTranscript.trim(), true);
      } else if (interimTranscript.trim()) {
        onResult(interimTranscript.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let errorMsg = 'Could not catch voice. Please try speaking again.';
      if (event.error === 'not-allowed') {
        errorMsg = 'Microphone permission denied. Please allow microphone access in browser settings.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No speech detected. Please press the mic and speak clearly.';
      }
      if (onError) onError(errorMsg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (onEnd) onEnd();
    };

    try {
      this.recognition.start();
    } catch (err: any) {
      console.warn('Speech recognition start error:', err);
      if (onError) onError('Could not activate microphone.');
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        // ignore
      }
      this.isListening = false;
    }
  }

  public getListeningStatus(): boolean {
    return this.isListening;
  }
}

export const voiceRecognizer = new VoiceRecognition();
