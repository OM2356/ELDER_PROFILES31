import { AgentType } from '../../src/types';
import { evaluateEmergencyPriority } from '../services/safetyService';

export interface ClassifiedIntent {
  intent: string;
  recommendedAgent: AgentType;
  isEmergency: boolean;
  emergencyCategory?: string;
  confidence: number;
  reasoning: string;
}

export function classifyUserIntent(text: string): ClassifiedIntent {
  // 1. Check emergency keywords first (Zero-latency priority)
  const emergencyCheck = evaluateEmergencyPriority(text);
  if (emergencyCheck.isEmergency) {
    return {
      intent: 'emergency_assistance',
      recommendedAgent: 'safety',
      isEmergency: true,
      emergencyCategory: emergencyCheck.emergencyCategory,
      confidence: 1.0,
      reasoning: `Emergency phrase recognized: "${emergencyCheck.matchedKeywords.join(', ')}"`,
    };
  }

  const lower = text.toLowerCase();

  // 2. Education intent patterns (phone, whatsapp, email, upi, video call, photo, tutorial)
  if (
    lower.includes('whatsapp') ||
    lower.includes('photo') ||
    lower.includes('picture') ||
    lower.includes('video call') ||
    lower.includes('smartphone') ||
    lower.includes('phone') ||
    lower.includes('email') ||
    lower.includes('teach me') ||
    lower.includes('how to use') ||
    lower.includes('how do i') ||
    lower.includes('चरण') ||
    lower.includes('सीखें') ||
    lower.includes('शिका') ||
    lower.includes('कसे पाठवायचे') ||
    lower.includes('कसा करायचा')
  ) {
    return {
      intent: 'digital_education',
      recommendedAgent: 'education',
      isEmergency: false,
      confidence: 0.95,
      reasoning: 'User is seeking patient step-by-step guidance for smartphone or online tools.',
    };
  }

  // 3. Safety & scam patterns (scam, fake, lottery, electricity bill, kyc, otp, suspicious, fraud)
  if (
    lower.includes('scam') ||
    lower.includes('fraud') ||
    lower.includes('suspicious') ||
    lower.includes('fake') ||
    lower.includes('lottery') ||
    lower.includes('electricity') ||
    lower.includes('bill cut') ||
    lower.includes('kyc') ||
    lower.includes('otp') ||
    lower.includes('blocked') ||
    lower.includes('anydesk') ||
    lower.includes('quicksupport') ||
    lower.includes('धोखा') ||
    lower.includes('फर्जी') ||
    lower.includes('फसवणूक')
  ) {
    return {
      intent: 'security_scam_inquiry',
      recommendedAgent: 'safety',
      isEmergency: false,
      confidence: 0.95,
      reasoning: 'User is asking about a potentially fraudulent communication or online security rule.',
    };
  }

  // 4. Wellness patterns (tired, sleep, pain, stretch, exercise, water, hydration, doctor, health, walk)
  if (
    lower.includes('tired') ||
    lower.includes('sleep') ||
    lower.includes('stretch') ||
    lower.includes('exercise') ||
    lower.includes('yoga') ||
    lower.includes('water') ||
    lower.includes('hydration') ||
    lower.includes('knee') ||
    lower.includes('joint') ||
    lower.includes('back') ||
    lower.includes('health') ||
    lower.includes('थकान') ||
    lower.includes('नींद') ||
    lower.includes('व्यायाम') ||
    lower.includes('आरोग्य') ||
    lower.includes('झोप')
  ) {
    return {
      intent: 'wellness_routine',
      recommendedAgent: 'wellness',
      isEmergency: false,
      confidence: 0.9,
      reasoning: 'User is sharing daily feelings, physical routine, or requesting gentle activity reminders.',
    };
  }

  // 5. Caregiver & Family patterns (caregiver, daughter, son, family, report, summary, priya)
  if (
    lower.includes('caregiver') ||
    lower.includes('daughter') ||
    lower.includes('son') ||
    lower.includes('family') ||
    lower.includes('weekly report') ||
    lower.includes('share with priya') ||
    lower.includes('परिवार') ||
    lower.includes('बेटी') ||
    lower.includes('मुलगी') ||
    lower.includes('काळजीवाहक')
  ) {
    return {
      intent: 'caregiver_family_support',
      recommendedAgent: 'caregiver',
      isEmergency: false,
      confidence: 0.9,
      reasoning: 'User wants to interact with caregiver settings, family summaries, or family contact.',
    };
  }

  // 6. Default to Companion Agent (stories, jokes, conversation, general banter)
  return {
    intent: 'companionship_chat',
    recommendedAgent: 'companion',
    isEmergency: false,
    confidence: 0.85,
    reasoning: 'User is engaging in open conversational chat, storytelling, or companionship.',
  };
}
