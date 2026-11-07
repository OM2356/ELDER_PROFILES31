import { generateContentWithFallback } from '../services/geminiService';
import { AgentExecutionContext } from './companionAgent';

export async function runWellnessAgent(message: string, ctx: AgentExecutionContext): Promise<string> {
  const langPrompt =
    ctx.language === 'hi'
      ? 'उत्तर आत्मीय, शांत और सरल हिंदी में दें। हमेशा याद दिलाएं कि आप चिकित्सक नहीं हैं।'
      : ctx.language === 'mr'
      ? 'उत्तर अत्यंत सौम्य आणि सोप्या मराठीत द्या. वैद्यकीय उपचारांसाठी डॉक्टरांचा सल्ला घेण्याची आठवण करा.'
      : 'Provide gentle, calming wellness advice in simple English with mandatory medical disclaimer.';

  const systemInstruction = `
You are the "Buddy Wellness Agent", a gentle routine companion for elderly health awareness and fall prevention.
${langPrompt}

PERSONALIZED CONTEXT:
${ctx.userContext}

ROLE & BOUNDARIES:
- Suggest gentle chair-supported stretches, ankle rotations, hydration reminders, and relaxing breathing habits.
- STRICT MEDICAL BOUNDARY:
  - You are a routine companion, NOT a medical doctor.
  - NEVER diagnose diseases, interpret clinical blood tests, or prescribe medications/dosages.
  - If the user reports acute pain, dizziness, or shortness of breath, advise them to sit down comfortably and consult their family physician or call 112 if urgent.
`;

  return generateContentWithFallback(
    message,
    { systemInstruction },
    () => {
      if (ctx.language === 'hi') {
        return `नमस्ते! आपके स्वास्थ्य का ध्यान रखना सबसे महत्वपूर्ण है। एक स्थिर कुर्सी पर बैठकर अपने पैरों को धीरे-धीरे आगे उठाएं और 3 सेकंड रुकें। दिनभर में गुनगुना पानी थोड़ा-थोड़ा पीते रहें।\n(सूचना: यह सामान्य दिनचर्या सलाह है, किसी भी स्वास्थ्य समस्या के लिए कृपया डॉक्टर से परामर्श लें।)`;
      }
      if (ctx.language === 'mr') {
        return `नमस्कार! प्रकृती जपणे सर्वात महत्त्वाचे आहे. खुर्चीवर बसून पाय हळुवारपणे वर उचला आणि ३ सेकंद तसेच ठेवा. दिवसभरात थोडे थोडे कोमट पाणी पित राहा.\n(सूचना: हा केवळ दैनंदिन दिनक्रमाचा भाग असून, औषधोपचारांसाठी डॉक्टरांचा सल्ला घ्यावा.)`;
      }
      return `Hello! Taking care of your daily comfort is wonderful. Sit comfortably on a sturdy chair, gently lift your foot forward, and hold for 3 gentle breaths. Also remember to sip some warm water through the day.\n(Notice: Buddy provides gentle lifestyle suggestions; always consult your physician for medical symptoms.)`;
    }
  );
}
