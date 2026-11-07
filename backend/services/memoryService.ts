import { UserMemoryItem, UserPreferencesMemory } from '../../src/types';

// In-memory cache synced to persistent store
const memoriesByUser: Map<string, UserPreferencesMemory> = new Map();

const DEFAULT_MEMORY_PREFERENCES: UserPreferencesMemory = {
  preferredName: 'Ramesh Sharma',
  preferredLanguage: 'en',
  favoriteHobbies: ['Gardening', 'Listening to old Hindi/Marathi melodies', 'Morning walks'],
  favoriteActivities: ['Video calling grandchildren', 'Seated chair yoga'],
  communicationStyle: 'gentle',
  learningInterests: ['WhatsApp photo sharing', 'UPI payment safety'],
  enablePersonalization: true,
  items: [
    {
      id: 'mem_1',
      userId: 'senior_1',
      category: 'hobby',
      key: 'favorite_hobby',
      value: 'Loves tending to balcony plants and marigolds',
      learnedAt: '2026-11-01',
      confidence: 0.95,
    },
    {
      id: 'mem_2',
      userId: 'senior_1',
      category: 'routine',
      key: 'morning_routine',
      value: 'Enjoys warm ginger tea at 7:30 AM after light stretching',
      learnedAt: '2026-11-02',
      confidence: 0.9,
    },
    {
      id: 'mem_3',
      userId: 'senior_1',
      category: 'interest',
      key: 'music_preference',
      value: 'Fond of classical Indian ragas and nostalgic 1960s songs',
      learnedAt: '2026-11-04',
      confidence: 0.88,
    },
  ],
};

export function getUserMemory(userId: string): UserPreferencesMemory {
  if (!memoriesByUser.has(userId)) {
    memoriesByUser.set(userId, JSON.parse(JSON.stringify(DEFAULT_MEMORY_PREFERENCES)));
  }
  return memoriesByUser.get(userId)!;
}

export function saveUserMemoryItem(
  userId: string,
  category: UserMemoryItem['category'],
  key: string,
  value: string
): UserMemoryItem {
  const memory = getUserMemory(userId);
  if (!memory.enablePersonalization) {
    throw new Error('Personalization is currently disabled by user.');
  }

  // Duplicate detection & update
  const existingIndex = memory.items.findIndex(
    (item) => item.key.toLowerCase() === key.toLowerCase() || item.value.toLowerCase() === value.toLowerCase()
  );

  const newItem: UserMemoryItem = {
    id: `mem_${Date.now()}`,
    userId,
    category,
    key,
    value,
    learnedAt: new Date().toISOString().split('T')[0],
    confidence: 0.92,
  };

  if (existingIndex >= 0) {
    memory.items[existingIndex] = newItem;
  } else {
    memory.items.unshift(newItem);
  }

  return newItem;
}

export function deleteUserMemoryItem(userId: string, itemId: string): boolean {
  const memory = getUserMemory(userId);
  const initialLength = memory.items.length;
  memory.items = memory.items.filter((m) => m.id !== itemId);
  return memory.items.length < initialLength;
}

export function updatePersonalizationToggle(userId: string, enable: boolean): boolean {
  const memory = getUserMemory(userId);
  memory.enablePersonalization = enable;
  return memory.enablePersonalization;
}

export function clearUserMemories(userId: string): void {
  const memory = getUserMemory(userId);
  memory.items = [];
}

/**
 * Extracts potential memory cues from conversational text
 */
export function extractMemoryCue(text: string): { key: string; value: string; category: UserMemoryItem['category'] } | null {
  const lower = text.toLowerCase();

  if (lower.includes('my hobby is') || lower.includes('i love') || lower.includes('i like to')) {
    const hobby = text.replace(/.*(my hobby is|i love|i like to)/i, '').trim();
    if (hobby.length > 3 && hobby.length < 80) {
      return { key: 'favorite_activity', value: hobby, category: 'hobby' };
    }
  }

  if (lower.includes('call me') || lower.includes('my name is')) {
    const name = text.replace(/.*(call me|my name is)/i, '').trim();
    if (name.length > 2 && name.length < 35) {
      return { key: 'preferred_name', value: name, category: 'preference' };
    }
  }

  return null;
}

/**
 * Builds personalized memory context string for agent instructions
 */
export function buildMemoryContextForAgent(userId: string, agentType: string): string {
  const memory = getUserMemory(userId);
  if (!memory.enablePersonalization) {
    return 'User has disabled personalization memory. Treat as neutral session.';
  }

  // Filter memories by agent relevance
  let relevantItems = memory.items;
  if (agentType === 'wellness') {
    relevantItems = memory.items.filter((i) => i.category === 'routine' || i.category === 'preference');
  } else if (agentType === 'education') {
    relevantItems = memory.items.filter((i) => i.category === 'interest' || i.category === 'preference');
  } else if (agentType === 'caregiver') {
    // Caregiver agent receives non-private high level summary only
    return `Caregiver view for senior ${memory.preferredName || 'User'}. Authorized routines: ${memory.favoriteActivities?.join(', ')}.`;
  }

  const memoryBullets = relevantItems.map((item) => `- ${item.key}: ${item.value}`).join('\n');

  return `
USER PERSONAL CONTEXT & MEMORIES:
- Preferred Name: ${memory.preferredName || 'Friend'}
- Known Hobbies & Favorites: ${memory.favoriteHobbies?.join(', ')}
- Communication Style: ${memory.communicationStyle || 'gentle'}
Active Saved Memories:
${memoryBullets || '- No specific memories yet'}
(Use these memories subtly and naturally to make the user feel recognized and cherished, without sounding robotic).
`;
}
