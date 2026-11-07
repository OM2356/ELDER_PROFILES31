import { Router, Request, Response } from 'express';
import { orchestrateBuddyQuery } from '../orchestrator/buddyOrchestrator';
import { classifyUserIntent } from '../orchestrator/intentClassifier';
import { generateContentWithFallback } from '../services/geminiService';

export const chatRoutes = Router();

// Track metrics for admin observability
export const chatMetrics = {
  totalChats: 24,
  agentUsage: {
    companion: 12,
    education: 5,
    wellness: 4,
    safety: 2,
    caregiver: 1,
  } as Record<string, number>,
};

// 1. Central Orchestrated Chat
chatRoutes.post('/chat', async (req: Request, res: Response) => {
  const { agent = 'auto', message = '', language = 'en', history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  try {
    const result = await orchestrateBuddyQuery({
      requestedAgent: agent,
      message,
      language,
      history,
    });

    chatMetrics.totalChats += 1;
    if (chatMetrics.agentUsage[result.selectedAgent] !== undefined) {
      chatMetrics.agentUsage[result.selectedAgent] += 1;
    } else {
      chatMetrics.agentUsage[result.selectedAgent] = 1;
    }

    return res.json({
      reply: result.reply,
      selectedAgent: result.selectedAgent,
      intent: result.intent,
      isEmergency: result.isEmergency,
      emergencyCategory: result.emergencyCategory,
      sources: result.sources,
      detectedMemoryCue: result.detectedMemoryCue,
    });
  } catch (err: any) {
    console.error('[Chat Route Error]:', err);
    return res.status(500).json({ error: 'Failed to process chat query', message: err.message });
  }
});

// 2. Intent Classifier Inspection Endpoint (Testing & observability)
chatRoutes.post('/intent', (req: Request, res: Response) => {
  const { text = '' } = req.body;
  const classification = classifyUserIntent(text);
  res.json(classification);
});

// 3. Scam Analyzer Endpoint
chatRoutes.post('/scam-analyzer', async (req: Request, res: Response) => {
  const { content = '', language = 'en' } = req.body;

  if (!content.trim()) {
    return res.status(400).json({ error: 'Message content cannot be empty' });
  }

  const prompt = `
Analyze the following text or message for potential scams, fraud, phishing, lottery deception, banking fraud, OTP theft, or remote app installation traps:

Message to analyze:
"${content}"

Return a valid JSON object matching this structure:
{
  "verdict": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
  "riskScore": number (0 to 100),
  "category": string (e.g. "Electricity Bill Fraud", "OTP Banking Scam", "Fake Lottery Scheme", "Safe Personal Note"),
  "summary": string (clear 1-2 sentence explanation tailored for an elderly person),
  "reasons": string[] (2-4 clear bullet points),
  "safeAction": string (clear, actionable next step on what to do),
  "warningNote": string
}

Respond in ${language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English'}.
`;

  try {
    const jsonStr = await generateContentWithFallback(
      prompt,
      { responseMimeType: 'application/json' },
      () => {
        const lower = content.toLowerCase();
        const isSuspicious =
          lower.includes('otp') ||
          lower.includes('blocked') ||
          lower.includes('lottery') ||
          lower.includes('apk') ||
          lower.includes('electricity') ||
          lower.includes('quicksupport') ||
          lower.includes('anydesk') ||
          lower.includes('pan kyc');

        return JSON.stringify({
          verdict: isSuspicious ? 'DANGEROUS' : 'SAFE',
          riskScore: isSuspicious ? 92 : 10,
          category: isSuspicious ? 'Potential Financial / OTP Scam' : 'General Message',
          summary: isSuspicious
            ? 'This message displays classic fraud tactics: urgency, threat of blockage, or requesting verification code/APK.'
            : 'This message does not exhibit clear scam indicators, but always remain vigilant.',
          reasons: isSuspicious
            ? [
                'Asks for urgent action under threat of disconnection or block.',
                'Contains suspicious request for remote software/OTP.',
                'Legitimate institutions like banks and power boards never threaten sudden cut-offs via SMS.',
              ]
            : ['No urgent requests for money or credentials detected.'],
          safeAction: isSuspicious
            ? 'DO NOT CLICK any links, DO NOT call back the number in the SMS, and DO NOT share any OTP. Delete the message.'
            : 'If you know the sender, you may respond normally. Never share your bank PIN or passwords.',
          warningNote: 'Buddy automated scam scanner provides advisory guidance. When in doubt, speak to your family caregiver.',
        });
      }
    );

    const parsed = JSON.parse(jsonStr);
    return res.json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to analyze scam', message: err.message });
  }
});
