import { AgentType, Language, RAGSourceItem } from '../../src/types';
import { classifyUserIntent } from './intentClassifier';
import { routeToAgent } from './agentRouter';
import { buildMemoryContextForAgent, extractMemoryCue, getUserMemory } from '../services/memoryService';
import { searchRAGKnowledge } from '../services/ragService';
import { sanitizeInput } from '../services/safetyService';

export interface OrchestrationRequest {
  userId?: string;
  requestedAgent?: AgentType; // 'auto' or explicit
  message: string;
  language?: Language;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
}

export interface OrchestrationResponse {
  reply: string;
  selectedAgent: AgentType;
  intent: string;
  isEmergency: boolean;
  emergencyCategory?: string;
  sources?: RAGSourceItem[];
  detectedMemoryCue?: { key: string; value: string; category: string } | null;
  status: 'completed' | 'emergency';
}

export async function orchestrateBuddyQuery(req: OrchestrationRequest): Promise<OrchestrationResponse> {
  const userId = req.userId || 'senior_1';
  const language = req.language || 'en';
  const cleanMessage = sanitizeInput(req.message || '');
  const history = req.history || [];

  // 1. Intent Classification & Emergency Priority Check
  const classification = classifyUserIntent(cleanMessage);

  if (classification.isEmergency) {
    let emergencyReassurance = '';
    if (language === 'hi') {
      emergencyReassurance = `कृपया शांत रहें और बिल्कुल हिलें नहीं। आपातकालीन सहायता स्क्रीन खुल गई है। आप तुरंत 112 या अपनी बेटी प्रिया जी को कॉल कर सकते हैं।`;
    } else if (language === 'mr') {
      emergencyReassurance = `कृपया शांत राहा आणि काळजी करू नका. तातडीची मदत स्क्रीन उघडली आहे. आपण थेट 112 किंवा कुटुंबियांना कॉल करू शकता.`;
    } else {
      emergencyReassurance = `Please stay still and breathe gently. I have activated your emergency assistance screen. Tap 112 or your primary caregiver to call immediately.`;
    }

    return {
      reply: emergencyReassurance,
      selectedAgent: 'safety',
      intent: classification.intent,
      isEmergency: true,
      emergencyCategory: classification.emergencyCategory,
      status: 'emergency',
    };
  }

  // 2. Select Agent (Honor user explicit choice if not 'auto', else use classifier recommendation)
  const targetAgent: AgentType =
    req.requestedAgent && req.requestedAgent !== 'auto'
      ? req.requestedAgent
      : classification.recommendedAgent;

  // 3. Retrieve Personalized Long-Term Memory
  const userContext = buildMemoryContextForAgent(userId, targetAgent);

  // 4. Retrieve RAG Knowledge Base Sources (for education, safety, or wellness)
  let ragSources: RAGSourceItem[] = [];
  if (['education', 'safety', 'wellness'].includes(targetAgent)) {
    ragSources = searchRAGKnowledge(cleanMessage, 2);
  }

  // 5. Delegate to Specialized Agent
  const reply = await routeToAgent({
    agent: targetAgent,
    message: cleanMessage,
    language,
    userContext,
    history,
    ragSources,
  });

  // 6. Detect Memory Cue for User Consent
  const memoryCue = extractMemoryCue(cleanMessage);

  return {
    reply,
    selectedAgent: targetAgent,
    intent: classification.intent,
    isEmergency: false,
    sources: ragSources.length > 0 ? ragSources : undefined,
    detectedMemoryCue: memoryCue,
    status: 'completed',
  };
}
