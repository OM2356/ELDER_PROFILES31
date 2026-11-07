import {
  AdminMetrics,
  AdminUserItem,
  AgentType,
  DailyCheckIn,
  DigitalCourse,
  EmergencyRecord,
  ExerciseGuide,
  ExerciseLog,
  Language,
  PrivacySettings,
  RAGDocument,
  RAGSourceItem,
  ScamAnalysisResult,
  SystemAuditLog,
  UserMemoryItem,
  UserPreferencesMemory,
  UserProfile,
} from '../types';

const BASE_URL = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.message || errJson.error || errorDetail;
    } catch {
      errorDetail = `Request failed with status ${res.status}`;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Auth & Profile
  async login(role: 'senior' | 'caregiver' | 'admin', pinOrPassword: string): Promise<{ user: UserProfile; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, pinOrPassword }),
    });
    return handleResponse(res);
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/auth/profile`);
    return handleResponse(res);
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return handleResponse(res);
  },

  // Central Multi-Agent Orchestrator Chat
  async chatWithAgent(params: {
    agent: AgentType;
    message: string;
    language: Language;
    history?: Array<{ role: 'user' | 'model'; text: string }>;
  }): Promise<{
    reply: string;
    selectedAgent: AgentType;
    intent?: string;
    isEmergency?: boolean;
    emergencyCategory?: string;
    sources?: RAGSourceItem[];
    detectedMemoryCue?: { key: string; value: string; category: string } | null;
  }> {
    const res = await fetch(`${BASE_URL}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async analyzeScam(content: string, language: Language): Promise<ScamAnalysisResult> {
    const res = await fetch(`${BASE_URL}/gemini/scam-analyzer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, language }),
    });
    return handleResponse(res);
  },

  // Long-Term Memory & Personalization API
  async getUserMemory(userId = 'senior_1'): Promise<UserPreferencesMemory> {
    const res = await fetch(`${BASE_URL}/memory/preferences?userId=${userId}`);
    return handleResponse(res);
  },

  async saveMemoryItem(category: string, key: string, value: string, userId = 'senior_1'): Promise<{ success: boolean; item: UserMemoryItem }> {
    const res = await fetch(`${BASE_URL}/memory/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, category, key, value }),
    });
    return handleResponse(res);
  },

  async deleteMemoryItem(itemId: string, userId = 'senior_1'): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/memory/items/${itemId}?userId=${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async togglePersonalization(enable: boolean, userId = 'senior_1'): Promise<{ success: boolean; enablePersonalization: boolean }> {
    const res = await fetch(`${BASE_URL}/memory/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, enable }),
    });
    return handleResponse(res);
  },

  async clearUserMemories(userId = 'senior_1'): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/memory/clear?userId=${userId}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // RAG Knowledge Base API
  async getRAGDocuments(): Promise<RAGDocument[]> {
    const res = await fetch(`${BASE_URL}/rag/documents`);
    return handleResponse(res);
  },

  async addRAGDocument(doc: {
    title: string;
    category: string;
    summary: string;
    content: string;
    tags?: string[];
    pageCount?: number;
  }): Promise<RAGDocument> {
    const res = await fetch(`${BASE_URL}/rag/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return handleResponse(res);
  },

  async deleteRAGDocument(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/rag/documents/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async searchRAG(query: string): Promise<{ query: string; results: RAGSourceItem[] }> {
    const res = await fetch(`${BASE_URL}/rag/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    return handleResponse(res);
  },

  // Emergency Assistance & Caregiver Notification API
  async triggerEmergencyAlert(payload: {
    reason: string;
    category?: string;
    user?: UserProfile;
  }): Promise<{
    success: boolean;
    record: EmergencyRecord;
    summary: string;
    emergencyNumber: string;
    instructions: string[];
  }> {
    const res = await fetch(`${BASE_URL}/emergency/alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getEmergencyRecords(): Promise<EmergencyRecord[]> {
    const res = await fetch(`${BASE_URL}/emergency/records`);
    return handleResponse(res);
  },

  async acknowledgeEmergency(recordId: string, caregiverName: string, notes: string): Promise<{ success: boolean; record: EmergencyRecord }> {
    const res = await fetch(`${BASE_URL}/emergency/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, caregiverName, notes }),
    });
    return handleResponse(res);
  },

  async cancelFalseAlarm(recordId: string, reason: string): Promise<{ success: boolean; record: EmergencyRecord }> {
    const res = await fetch(`${BASE_URL}/emergency/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recordId, reason }),
    });
    return handleResponse(res);
  },

  // Admin Dashboard & Analytics API
  async adminLogin(password: string): Promise<{ success: boolean; token: string; role: string }> {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return handleResponse(res);
  },

  async getAdminMetrics(): Promise<AdminMetrics> {
    const res = await fetch(`${BASE_URL}/admin/metrics`);
    return handleResponse(res);
  },

  async getAdminUsers(query = ''): Promise<AdminUserItem[]> {
    const res = await fetch(`${BASE_URL}/admin/users?q=${encodeURIComponent(query)}`);
    return handleResponse(res);
  },

  async updateUserStatus(id: string, status: string): Promise<{ success: boolean; user: AdminUserItem }> {
    const res = await fetch(`${BASE_URL}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(res);
  },

  async getAuditLogs(): Promise<SystemAuditLog[]> {
    const res = await fetch(`${BASE_URL}/admin/logs`);
    return handleResponse(res);
  },

  // Daily Wellness & Fall Prevention
  async submitCheckIn(data: {
    mood: DailyCheckIn['mood'];
    sleepQuality: DailyCheckIn['sleepQuality'];
    physicalDiscomfort: string[];
    notes?: string;
  }): Promise<DailyCheckIn> {
    const res = await fetch(`${BASE_URL}/wellness/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getCheckInHistory(): Promise<DailyCheckIn[]> {
    const res = await fetch(`${BASE_URL}/wellness/check-in-history`);
    return handleResponse(res);
  },

  async getExercises(): Promise<ExerciseGuide[]> {
    const res = await fetch(`${BASE_URL}/wellness/exercises`);
    return handleResponse(res);
  },

  async toggleExercise(exerciseId: string, date: string, completed: boolean): Promise<ExerciseLog> {
    const res = await fetch(`${BASE_URL}/wellness/exercise-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exerciseId, date, completed }),
    });
    return handleResponse(res);
  },

  async getExerciseLogs(): Promise<ExerciseLog[]> {
    const res = await fetch(`${BASE_URL}/wellness/exercise-logs`);
    return handleResponse(res);
  },

  // Digital Learning
  async getCourses(): Promise<DigitalCourse[]> {
    const res = await fetch(`${BASE_URL}/education/courses`);
    return handleResponse(res);
  },

  async toggleLessonProgress(courseId: string, lessonId: string, completed: boolean): Promise<{ success: boolean; completedLessons: string[] }> {
    const res = await fetch(`${BASE_URL}/education/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, lessonId, completed }),
    });
    return handleResponse(res);
  },

  async getLearningProgress(): Promise<{ completedLessons: string[] }> {
    const res = await fetch(`${BASE_URL}/education/progress`);
    return handleResponse(res);
  },

  // Caregiver Overview
  async getCaregiverOverview(): Promise<{
    senior: UserProfile;
    recentCheckIns: DailyCheckIn[];
    exerciseLogs: ExerciseLog[];
    completedLessons: string[];
    privacySettings: PrivacySettings;
    emergencyContacts: UserProfile['emergencyContacts'];
  }> {
    const res = await fetch(`${BASE_URL}/caregiver/overview`);
    return handleResponse(res);
  },

  async updatePrivacySettings(settings: PrivacySettings): Promise<PrivacySettings> {
    const res = await fetch(`${BASE_URL}/caregiver/privacy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },
};
