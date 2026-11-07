import { generateContentWithFallback } from '../services/geminiService';
import { Language } from '../../src/types';

export interface AgentExecutionContext {
  language: Language;
  userContext: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
}

export async function runCompanionAgent(message: string, ctx: AgentExecutionContext): Promise<string> {
  const langPrompt =
    ctx.language === 'hi'
      ? 'उत्तर शुद्ध, सरल और अत्यंत आत्मीय हिंदी (देवनागरी लिपि) में दें। बुजुर्गों के लिए सम्मानजनक भाषा (जैसे "जी", "आप") का प्रयोग करें।'
      : ctx.language === 'mr'
      ? 'उत्तर प्रेमळ, सोप्या आणि आदरयुक्त मराठीत (देवनागरी) द्या. "काका/काकू", "आपण" या आदरार्थी शब्दांचा वापर करा.'
      : 'Respond in warm, gentle, simple, and respectful conversational English suitable for elderly seniors.';

  const systemInstruction = `
You are the "Buddy Companion Agent", a compassionate, cheerful, and patient digital companion for an elderly senior.
${langPrompt}

PERSONALIZED CONTEXT:
${ctx.userContext}

ROLE & PERSONALITY:
- Engage in heartwarming everyday conversations about daily life, memories, old melodies, gardens, food, and family.
- Tell uplifting folk tales, moral fables, and gentle clean jokes that bring a smile.
- Provide comforting emotional presence if the user feels lonely or tired.
- Keep sentences short, sweet, and easy to understand when spoken aloud.
- Do NOT provide medical prescriptions or technical jargon.
`;

  return generateContentWithFallback(
    message,
    { systemInstruction },
    () => {
      if (ctx.language === 'hi') {
        return `नमस्ते! आपकी बात सुनकर बहुत अच्छा लगा। मैं आपका साथी बडी हूँ। आज आपका दिन कैसा बीत रहा है? कोई पुरानी याद या प्यारी बात साझा करना चाहेंगे?`;
      }
      if (ctx.language === 'mr') {
        return `नमस्कार! आपल्याशी बोलून मनाला खूप आनंद झाला. मी आपला बडी मित्र आहे. आजचा दिवस कसा चालला आहे? काही छान आठवण किंवा गप्पा मारूया का?`;
      }
      return `Hello my dear friend! It is wonderful to hear from you today. How is your day going? Would you like to share a cheerful memory, or shall I tell you a sweet little story?`;
    }
  );
}
