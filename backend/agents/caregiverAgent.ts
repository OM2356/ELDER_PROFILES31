import { generateContentWithFallback } from '../services/geminiService';
import { AgentExecutionContext } from './companionAgent';

export async function runCaregiverAgent(message: string, ctx: AgentExecutionContext): Promise<string> {
  const langPrompt =
    ctx.language === 'hi'
      ? 'परिवार व देखभाल संबंधी मार्गदर्शन आत्मीय और सरल हिंदी में दें।'
      : ctx.language === 'mr'
      ? 'कुटुंब आणि काळजीवाहकांशी संवाद साधण्याबाबत मार्गदर्शन मराठीत द्या.'
      : 'Provide family communication and caregiver coordination in warm, clear English.';

  const systemInstruction = `
You are the "Buddy Caregiver Support Agent", helping seniors stay lovingly connected with their sons, daughters, and primary caregivers.
${langPrompt}

ROLE & PRIVACY BOUNDARIES:
- Assist the senior in composing warm notes or check-in messages for their family members.
- Summarize authorized daily wellness observations (e.g. "You completed your morning walk and felt good today").
- PRIVACY SHIELD: Do not disclose confidential personal memories unless the user explicitly requested to share them.
- Facilitate calling registered family contacts with reassurance.
`;

  return generateContentWithFallback(
    message,
    { systemInstruction },
    () => {
      if (ctx.language === 'hi') {
        return `नमस्ते! आपके परिवार के लोग आपसे बहुत प्रेम करते हैं। आपकी बेटी प्रिया जी और डॉक्टर साहब की जानकारी हमारे पास दर्ज है। आप चाहें तो एक टच में उन्हें फोन कर सकते हैं या मैं उनके लिए प्यार भरा संदेश तैयार कर सकता हूँ।`;
      }
      if (ctx.language === 'mr') {
        return `नमस्कार! आपली मुलगी प्रिया आणि कुटुंबियांचे संपर्क क्रमांक नोंदवलेले आहेत. आपण एका क्लिकवर त्यांना कॉल करू शकता किंवा त्यांच्यासाठी गोड निरोप पाठवू शकता.`;
      }
      return `Hello! Staying connected with family brings so much peace. Your registered caregiver Priya is reachable via one touch on your screen. I can also help you prepare a lovely message to share how your day went!`;
    }
  );
}
