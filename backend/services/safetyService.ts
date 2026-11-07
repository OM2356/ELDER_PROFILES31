export interface SafetyCheckResult {
  isEmergency: boolean;
  emergencyCategory?: 'fall' | 'breathing' | 'pain' | 'sos_button' | 'voice_trigger';
  matchedKeywords: string[];
  safeForProcessing: boolean;
  disclaimerRequired?: boolean;
}

const EMERGENCY_KEYWORDS: Record<string, 'fall' | 'breathing' | 'pain' | 'voice_trigger'> = {
  // English
  'fallen': 'fall',
  'fell down': 'fall',
  'slip and fall': 'fall',
  'cannot get up': 'fall',
  'can not get up': 'fall',
  'cannot stand': 'fall',
  'unable to stand': 'fall',
  'difficulty breathing': 'breathing',
  'cannot breathe': 'breathing',
  'shortness of breath': 'breathing',
  'severe chest pain': 'pain',
  'heart pain': 'pain',
  'need emergency help': 'voice_trigger',
  'call 112': 'voice_trigger',
  'call ambulance': 'voice_trigger',
  'call my family': 'voice_trigger',
  'feeling unsafe': 'voice_trigger',

  // Hindi
  'गिर गया': 'fall',
  'गिर गई': 'fall',
  'उठ नहीं पा रहा': 'fall',
  'उठ नहीं पा रही': 'fall',
  'खड़े नहीं हो सकते': 'fall',
  'सांस लेने में तकलीफ': 'breathing',
  'सांस फूल रही है': 'breathing',
  'सीने में तेज दर्द': 'pain',
  'छाती में दर्द': 'pain',
  'आपातकालीन मदद': 'voice_trigger',
  'मदद चाहिए': 'voice_trigger',
  'चोट लग गई': 'pain',

  // Marathi
  'पडलो': 'fall',
  'खाली पडलो': 'fall',
  'उठता येत नाही': 'fall',
  'उभे राहता येत नाही': 'fall',
  'श्वास घेण्यास त्रास': 'breathing',
  'दम भरला': 'breathing',
  'छातीत दुखत आहे': 'pain',
  'तातडीची मदत': 'voice_trigger',
  'मदत करा': 'voice_trigger',
  'फार दुखत आहे': 'pain',
};

export function evaluateEmergencyPriority(text: string): SafetyCheckResult {
  const normalized = text.toLowerCase().trim();
  const matched: string[] = [];
  let detectedCategory: 'fall' | 'breathing' | 'pain' | 'sos_button' | 'voice_trigger' | undefined;

  for (const [phrase, category] of Object.entries(EMERGENCY_KEYWORDS)) {
    if (normalized.includes(phrase)) {
      matched.push(phrase);
      if (!detectedCategory) {
        detectedCategory = category;
      }
    }
  }

  const isEmergency = matched.length > 0;

  return {
    isEmergency,
    emergencyCategory: detectedCategory,
    matchedKeywords: matched,
    safeForProcessing: true,
    disclaimerRequired: normalized.includes('pain') || normalized.includes('medicine') || normalized.includes('doctor'),
  };
}

export function sanitizeInput(text: string): string {
  // Prevent prompt injection attempts like "ignore previous instructions"
  return text
    .replace(/(system prompt|ignore previous instructions|drop database|eval\()/gi, '')
    .trim()
    .slice(0, 1000);
}
