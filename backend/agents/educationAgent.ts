import { generateContentWithFallback } from '../services/geminiService';
import { AgentExecutionContext } from './companionAgent';
import { RAGSourceItem } from '../../src/types';

export interface EducationAgentContext extends AgentExecutionContext {
  ragSources?: RAGSourceItem[];
}

export async function runEducationAgent(message: string, ctx: EducationAgentContext): Promise<string> {
  const langPrompt =
    ctx.language === 'hi'
      ? 'निर्देश सरल, छोटे चरणों (चरण 1, चरण 2) में शुद्ध हिंदी में दें। तकनीकी शब्दों को बोलचाल की भाषा में समझाएं।'
      : ctx.language === 'mr'
      ? 'मार्गदर्शन अत्यंत सोप्या टप्प्यांत (टप्पा १, टप्पा २) मराठीत द्या. कठीण इंग्रजी शब्द सोपे करून सांगा.'
      : 'Provide guidance in simple, numbered, step-by-step instructions. Use intuitive metaphors.';

  let ragContext = '';
  if (ctx.ragSources && ctx.ragSources.length > 0) {
    ragContext = `
VERIFIED KNOWLEDGE BASE SOURCES:
${ctx.ragSources.map((s) => `[Source: ${s.title}]\n${s.snippet}`).join('\n\n')}
`;
  }

  const systemInstruction = `
You are the "Buddy Digital Education Agent", a gentle, patient technology tutor for elderly beginners.
${langPrompt}

PERSONALIZED CONTEXT:
${ctx.userContext}
${ragContext}

ROLE & GUIDELINES:
- Teach smartphones, WhatsApp, photo sharing, making video calls, emails, voice typing, and UPI safety step-by-step.
- Present instructions in 2 to 4 clear numbered steps.
- Reassure the senior that it is completely normal to take time to learn and that you are always ready to repeat.
- Ground your answer in the provided knowledge base sources whenever available.
- Emphasize safety: Remind them never to share passwords or UPI PINs.
`;

  return generateContentWithFallback(
    message,
    { systemInstruction },
    () => {
      if (ctx.language === 'hi') {
        return `नमस्ते! फोन चलाना सीखना बहुत आसान है।\nचरण 1: अपने फोन की स्क्रीन पर दिए गए हरे रंग के व्हाट्सएप आइकन को हल्के से छुएं।\nचरण 2: जिस प्रियजन से बात करनी है उनके नाम पर टैप करें।\nचरण 3: नीचे दिए गए हरे माइक बटन को दबाकर रखें और अपना संदेश बोलें!`;
      }
      if (ctx.language === 'mr') {
        return `नमस्कार! मोबाईल शिकणे खूप सोपे आहे.\nटप्पा १: स्क्रीनवरील हिरव्या व्हॉट्सअ‍ॅप आयकॉनला हलकेच दाबा.\nटप्पा २: ज्यांना मेसेज करायचा आहे त्यांच्या नावावर क्लिक करा.\nटप्पा ३: खालील माइकचे बटण दाबून ठेवून बोला. मी आपल्याला शिकवायला नेहमी तयार आहे!`;
      }
      return `Hello! Learning your phone is easy and fun.\nStep 1: Gently tap the green WhatsApp icon on your screen.\nStep 2: Tap on the contact name of your family member.\nStep 3: Press and hold the green microphone icon at the bottom and speak your message clearly!`;
    }
  );
}
