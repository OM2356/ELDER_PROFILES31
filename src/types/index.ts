export type Language = 'en' | 'hi' | 'mr';

export type UserRole = 'senior' | 'caregiver' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  age?: number;
  language: Language;
  preferredSpeechRate: number; // 0.7 to 1.2
  highContrast: boolean;
  theme?: 'light' | 'dark' | 'contrast';
  reducedMotion?: boolean;
  screenReaderAssistance?: boolean;
  onboardingCompleted?: boolean;
  fontSize: 'standard' | 'large' | 'extra-large';
  emergencyContacts: EmergencyContact[];
  privacySettings: PrivacySettings;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  isPrimaryCaregiver: boolean;
}

export interface PrivacySettings {
  shareWellnessWithCaregiver: boolean;
  shareExercisesWithCaregiver: boolean;
  shareLearningProgress: boolean;
  allowEmergencyLocation: boolean;
  enableLongTermMemory: boolean;
  allowDailyReminders?: boolean;
  shareRemindersWithCaregiver?: boolean;
}

export type AgentType = 'auto' | 'companion' | 'education' | 'wellness' | 'safety' | 'caregiver';

export interface RAGSourceItem {
  documentId: string;
  title: string;
  category: string;
  snippet: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  agent: AgentType;
  routedAgent?: AgentType;
  text: string;
  timestamp: string;
  language: Language;
  isEmergencyAlert?: boolean;
  sources?: RAGSourceItem[];
  intent?: string;
  status?: 'thinking' | 'routed' | 'completed' | 'emergency';
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  timestamp: string;
  mood: 'great' | 'good' | 'okay' | 'tired' | 'pain';
  sleepQuality: 'deep' | 'adequate' | 'restless';
  physicalDiscomfort: string[];
  notes?: string;
}

export interface ExerciseGuide {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  category: 'balance' | 'legs' | 'ankles' | 'posture';
  durationMinutes: number;
  descriptionEn: string;
  descriptionHi: string;
  descriptionMr: string;
  stepsEn: string[];
  stepsHi: string[];
  stepsMr: string[];
  safetyTipsEn: string;
  safetyTipsHi: string;
  safetyTipsMr: string;
  iconName: string;
}

export interface ExerciseLog {
  id: string;
  exerciseId: string;
  date: string;
  completed: boolean;
  timestamp: string;
}

export interface CourseLesson {
  id: string;
  stepNumber: number;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  instructionEn: string;
  instructionHi: string;
  instructionMr: string;
  tipEn: string;
  tipHi: string;
  tipMr: string;
}

export interface DigitalCourse {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  category: string;
  iconName: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
  lessons: CourseLesson[];
  practiceTaskEn: string;
  practiceTaskHi: string;
  practiceTaskMr: string;
}

export interface ScamAnalysisResult {
  verdict: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
  riskScore: number; // 0 to 100
  category: string;
  summary: string;
  reasons: string[];
  safeAction: string;
  warningNote: string;
}

// Memory & Personalization Types
export interface UserMemoryItem {
  id: string;
  userId: string;
  category: 'hobby' | 'preference' | 'interest' | 'routine' | 'family' | string;
  key: string;
  value: string;
  learnedAt?: string;
  timestamp?: string;
  confidence: number;
}

export interface UserPreferencesMemory {
  preferredName?: string;
  preferredLanguage?: Language;
  favoriteHobbies?: string[];
  favoriteActivities?: string[];
  communicationStyle?: 'gentle' | 'detailed' | 'storytelling' | 'concise';
  learningInterests?: string[];
  enablePersonalization: boolean;
  items: UserMemoryItem[];
  memories?: UserMemoryItem[];
}

// RAG Knowledge Base Types
export interface RAGDocument {
  id: string;
  title: string;
  category: 'smartphone' | 'whatsapp' | 'email' | 'banking_upi' | 'safety' | 'wellness_fall' | 'government_services';
  summary: string;
  content: string;
  tags: string[];
  pageCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Emergency Notification & Records
export interface EmergencyNotificationLog {
  id: string;
  emergencyEventId: string;
  channel: 'sms' | 'email' | 'in_app';
  recipientName: string;
  recipientContact: string;
  status: 'attempted' | 'delivered' | 'failed' | 'acknowledged';
  attemptedAt: string;
  confirmedAt?: string;
  errorMessage?: string;
  acknowledgedBy?: string;
  notes?: string;
}

export interface EmergencyRecord {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  category: 'fall' | 'breathing' | 'pain' | 'sos_button' | 'voice_trigger';
  timestamp: string;
  status: 'active' | 'resolved' | 'cancelled_false_alarm';
  notifications: EmergencyNotificationLog[];
  channels?: {
    inApp?: { status: string };
    sms?: { status: string };
    email?: { status: string };
  };
  resolutionNotes?: string;
  cancelledAt?: string;
}

// Admin & Analytics Types
export interface AdminMetrics {
  totalUsers: number;
  activeUsersToday: number;
  caregiversCount: number;
  totalConversations: number;
  completedCheckIns: number;
  completedExercises: number;
  completedLessons: number;
  emergencyAlertsCount: number;
  knowledgeDocsCount: number;
  agentUsageDistribution: Record<string, number>;
  dailyActiveTrends: Array<{ date: string; users: number; chats: number }>;
  serviceStatus: {
    geminiApi: 'healthy' | 'degraded' | 'offline';
    database: 'healthy' | 'degraded' | 'offline';
    notifications: 'healthy' | 'degraded' | 'offline';
    ragService: 'healthy' | 'degraded' | 'offline';
  };
  systemUptimeSeconds: number;
}

export interface AdminUserItem {
  id: string;
  name: string;
  role: UserRole;
  age?: number;
  language: Language;
  lastActive: string;
  totalChats: number;
  status: 'active' | 'suspended' | 'inactive';
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  category: 'auth' | 'emergency' | 'rag' | 'memory' | 'admin';
  details: string;
}

// Smart Routine & Reminder Types (Prompt 21)
export interface SmartReminder {
  id: string;
  userId: string;
  title: string;
  category: 'hydration' | 'checkin' | 'exercise' | 'learning' | 'family' | 'medication' | 'custom';
  time: string; // e.g. "08:30"
  daysOfWeek: number[]; // [0, 1, 2, 3, 4, 5, 6]
  isActive: boolean;
  isMedication?: boolean;
  medicationDosage?: string;
  voicePrompt?: string;
  lastTriggered?: string;
}

// Smart Notification Center Types (Prompt 26)
export interface AppNotification {
  id: string;
  category: 'emergency' | 'wellness' | 'learning' | 'family' | 'safety' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionTab?: string;
  actionUrl?: string;
}

// Social Engagement & Brain Gym (Prompt 24)
export interface SocialStory {
  id: string;
  category: 'folklore' | 'inspirational' | 'humor' | 'historical';
  titleEn: string;
  titleHi: string;
  titleMr: string;
  storyEn: string;
  storyHi: string;
  storyMr: string;
  moralEn: string;
  moralHi: string;
  moralMr: string;
  authorOrRegion: string;
}

export interface SocialTriviaQuestion {
  id: string;
  questionEn: string;
  questionHi: string;
  questionMr: string;
  optionsEn: string[];
  optionsHi: string[];
  optionsMr: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
  explanationMr: string;
  difficulty: 'easy' | 'medium';
}

// Learning Track & Path (Prompt 20)
export interface LearningTrack {
  id: string;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  category: 'smartphone' | 'whatsapp' | 'email' | 'video_call' | 'payments_upi' | 'safety' | 'government';
  level: 'beginner' | 'intermediate' | 'advanced';
  iconName: string;
  estimatedMinutes: number;
  badgeName: string;
  badgeIcon: string;
  lessons: CourseLesson[];
  quizQuestions: {
    question: Record<Language, string>;
    options: Record<Language, string[]>;
    correctIndex: number;
    explanation: Record<Language, string>;
  }[];
}
