import { generateContentWithFallback } from '../services/geminiService';
import { AgentExecutionContext } from './companionAgent';

export async function runSafetyAgent(message: string, ctx: AgentExecutionContext): Promise<string> {
  const langPrompt =
    ctx.language === 'hi'
      ? 'सावधानी व सुरक्षा संबंधी सलाह स्पष्ट, निर्भीक और सरल हिंदी में दें। बुजुर्गों को आश्वस्त करें कि वे अकेले नहीं हैं।'
      : ctx.language === 'mr'
      ? 'सायबर सुरक्षा व फसवणूक टाळण्याचे मार्गदर्शन सोप्या मराठीत द्या. घाबरू नका, धीर धरा असा विश्वास द्या.'
      : 'Provide clear, firm, and reassuring safety guidance in plain English.';

  const systemInstruction = `
You are the "Buddy Safety & Scam Watch Agent", an alert, protective guardian for seniors.
${langPrompt}

ROLE & PRINCIPLES:
- Help seniors identify suspicious SMS, WhatsApp forwards, phishing phone calls, and lottery schemes.
- Clearly explain WHY a message or call is fake (e.g. artificial panic, urgent threats of power disconnect, demands for OTP).
- Golden Rules:
  1. Never share OTP with anyone on phone or SMS.
  2. Never enter a UPI PIN to receive money.
  3. Never download AnyDesk, TeamViewer, or QuickSupport APK files.
- Reassure the user that they did the right thing by checking first with Buddy before responding or clicking.
`;

  return generateContentWithFallback(
    message,
    { systemInstruction },
    () => {
      if (ctx.language === 'hi') {
        return `सावधान रहें! बिजली कटने या बैंक खाता बंद होने का कोई भी मैसेज अगर ओटीपी या अनजान ऐप (जैसे QuickSupport) डाउनलोड करने को कहे, तो वह 100% फर्जी धोखाधड़ी है। किसी भी अनजान नंबर पर फोन न करें और ओटीपी कभी किसी को न बताएं।`;
      }
      if (ctx.language === 'mr') {
        return `सावध राहा! वीज कापली जाईल किंवा बँक खाते बंद होईल असा मेसेज आला असल्यास घाबरू नका. कोणतीही बँक किंवा वीज वितरण कंपनी व्हॉट्सअ‍ॅपवर असे मेसेज पाठवत नाही. ओटीपी कुणालाही सांगू नका आणि अज्ञात अ‍ॅप डाऊनलोड करू नका.`;
      }
      return `Stay cautious! Messages claiming your electricity will be disconnected or your bank account will be blocked are classic fraud tricks. Real banks and government offices NEVER demand an OTP over the phone or ask you to install remote apps like QuickSupport. Do not click any links!`;
    }
  );
}
