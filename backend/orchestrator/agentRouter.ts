import { AgentType, Language, RAGSourceItem } from '../../src/types';
import { runCompanionAgent } from '../agents/companionAgent';
import { runEducationAgent } from '../agents/educationAgent';
import { runWellnessAgent } from '../agents/wellnessAgent';
import { runSafetyAgent } from '../agents/safetyAgent';
import { runCaregiverAgent } from '../agents/caregiverAgent';

export interface RouteAgentParams {
  agent: AgentType;
  message: string;
  language: Language;
  userContext: string;
  history: Array<{ role: 'user' | 'model'; text: string }>;
  ragSources?: RAGSourceItem[];
}

export async function routeToAgent(params: RouteAgentParams): Promise<string> {
  const { agent, message, language, userContext, history, ragSources } = params;
  const ctx = { language, userContext, history };

  switch (agent) {
    case 'education':
      return runEducationAgent(message, { ...ctx, ragSources });

    case 'wellness':
      return runWellnessAgent(message, ctx);

    case 'safety':
      return runSafetyAgent(message, ctx);

    case 'caregiver':
      return runCaregiverAgent(message, ctx);

    case 'companion':
    default:
      return runCompanionAgent(message, ctx);
  }
}
