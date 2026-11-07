import { Router, Request, Response } from 'express';
import { AdminMetrics, AdminUserItem, SystemAuditLog } from '../../src/types';
import { chatMetrics } from './chatRoutes';
import { listRAGDocuments } from '../services/ragService';
import { listEmergencyRecords } from '../services/notificationService';
import { isGeminiAvailable } from '../services/geminiService';

export const adminRoutes = Router();

const SERVER_START_TIME = Date.now();

const SAMPLE_ADMIN_USERS: AdminUserItem[] = [
  {
    id: 'senior_1',
    name: 'Ramesh Sharma',
    role: 'senior',
    age: 72,
    language: 'en',
    lastActive: 'Just now',
    totalChats: 18,
    status: 'active',
  },
  {
    id: 'cg_1',
    name: 'Priya Sharma',
    role: 'caregiver',
    age: 44,
    language: 'en',
    lastActive: '1 hour ago',
    totalChats: 4,
    status: 'active',
  },
  {
    id: 'senior_2',
    name: 'Kusum Joshi',
    role: 'senior',
    age: 69,
    language: 'mr',
    lastActive: 'Yesterday',
    totalChats: 9,
    status: 'active',
  },
  {
    id: 'senior_3',
    name: 'Virendra Verma',
    role: 'senior',
    age: 76,
    language: 'hi',
    lastActive: '3 days ago',
    totalChats: 12,
    status: 'active',
  },
];

const AUDIT_LOGS: SystemAuditLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    action: 'USER_LOGIN',
    actor: 'senior_1',
    category: 'auth',
    details: 'Senior Ramesh Sharma authenticated via PIN session.',
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    action: 'RAG_INDEX_UPDATE',
    actor: 'system',
    category: 'rag',
    details: 'Seeded 4 core senior digital literacy documents.',
  },
  {
    id: 'log_3',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'EMERGENCY_DISPATCH_ATTEMPT',
    actor: 'senior_1',
    category: 'emergency',
    details: 'Emergency alert logged and notifications queued.',
  },
];

// 1. Admin Login
adminRoutes.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === 'admin123' || password === 'admin') {
    return res.json({
      success: true,
      token: 'admin_bearer_jwt_token',
      role: 'admin',
      adminUser: { name: 'Lead System Administrator', role: 'admin' },
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials. Use "admin123" for testing.' });
});

// 2. Admin System Overview & Analytics Metrics
adminRoutes.get('/metrics', (_req: Request, res: Response) => {
  const emergencyRecords = listEmergencyRecords();
  const ragDocs = listRAGDocuments();

  const metrics: AdminMetrics = {
    totalUsers: SAMPLE_ADMIN_USERS.length,
    activeUsersToday: 3,
    caregiversCount: 1,
    totalConversations: chatMetrics.totalChats,
    completedCheckIns: 14,
    completedExercises: 19,
    completedLessons: 11,
    emergencyAlertsCount: emergencyRecords.length,
    knowledgeDocsCount: ragDocs.length,
    agentUsageDistribution: chatMetrics.agentUsage,
    dailyActiveTrends: [
      { date: 'Mon', users: 2, chats: 7 },
      { date: 'Tue', users: 3, chats: 12 },
      { date: 'Wed', users: 4, chats: 15 },
      { date: 'Thu', users: 3, chats: 11 },
      { date: 'Fri', users: 5, chats: chatMetrics.totalChats },
    ],
    serviceStatus: {
      geminiApi: isGeminiAvailable() ? 'healthy' : 'degraded',
      database: 'healthy',
      notifications: 'healthy',
      ragService: 'healthy',
    },
    systemUptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
  };

  res.json(metrics);
});

// 3. User Management
adminRoutes.get('/users', (req: Request, res: Response) => {
  const query = (req.query.q as string || '').toLowerCase();
  const filtered = SAMPLE_ADMIN_USERS.filter(
    (u) => u.name.toLowerCase().includes(query) || u.role.toLowerCase().includes(query)
  );
  res.json(filtered);
});

adminRoutes.put('/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const target = SAMPLE_ADMIN_USERS.find((u) => u.id === id);
  if (!target) return res.status(404).json({ error: 'User not found' });

  target.status = status;
  AUDIT_LOGS.unshift({
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'USER_STATUS_CHANGE',
    actor: 'admin',
    category: 'admin',
    details: `User ${target.name} status updated to ${status}.`,
  });

  res.json({ success: true, user: target });
});

// 4. Audit Logs
adminRoutes.get('/logs', (_req: Request, res: Response) => {
  res.json(AUDIT_LOGS);
});

// 5. CSV Report Export
adminRoutes.get('/export', (_req: Request, res: Response) => {
  const rows = [
    ['Metric / Field', 'Value'],
    ['Total Registered Users', SAMPLE_ADMIN_USERS.length],
    ['Total Conversations', chatMetrics.totalChats],
    ['Emergency Alerts Recorded', listEmergencyRecords().length],
    ['Knowledge Base Documents', listRAGDocuments().length],
    ['Companion Agent Calls', chatMetrics.agentUsage.companion || 0],
    ['Education Agent Calls', chatMetrics.agentUsage.education || 0],
    ['Wellness Agent Calls', chatMetrics.agentUsage.wellness || 0],
    ['Safety Agent Calls', chatMetrics.agentUsage.safety || 0],
    ['Caregiver Agent Calls', chatMetrics.agentUsage.caregiver || 0],
    ['Exported At', new Date().toISOString()],
  ];

  const csvContent = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="buddy_elder_report.csv"');
  res.send(csvContent);
});
