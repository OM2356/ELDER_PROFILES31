import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AdminMetrics, AdminUserItem, EmergencyRecord, RAGDocument, SystemAuditLog } from '../../types';
import {
  ShieldCheck,
  Users,
  MessageSquare,
  Activity,
  AlertTriangle,
  BookOpen,
  Download,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Server,
  Lock,
  FileSpreadsheet,
  Clock,
  Sparkles,
  Play,
} from 'lucide-react';
import { runAutomatedTestSuite, TestSuiteSummary } from '../../tests/automatedTestSuite';

export const AdminDashboard: React.FC = () => {
  const { role, switchRole, highContrast, t } = useApp();

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'users' | 'rag' | 'emergency' | 'logs' | 'tests'>('overview');
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [ragDocs, setRagDocs] = useState<RAGDocument[]>([]);
  const [emergencyRecords, setEmergencyRecords] = useState<EmergencyRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Automated Test Suite State
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // New RAG Document Form State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<RAGDocument['category']>('smartphone');
  const [newDocSummary, setNewDocSummary] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocPages, setNewDocPages] = useState<number>(2);
  const [ragSuccessMsg, setRagSuccessMsg] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      setIsAdminAuthenticated(true);
      loadAdminData();
    }
  }, [role]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);

    try {
      const res = await api.adminLogin(adminPassword);
      if (res.success) {
        setIsAdminAuthenticated(true);
        loadAdminData();
      }
    } catch (err: any) {
      setAuthError('Invalid administrator credentials. Try "admin123" for development.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, usersData, docsData, emergencyData, logsData] = await Promise.all([
        api.getAdminMetrics(),
        api.getAdminUsers(searchUserQuery),
        api.getRAGDocuments(),
        api.getEmergencyRecords(),
        api.getAuditLogs(),
      ]);
      setMetrics(metricsData);
      setUsersList(usersData);
      setRagDocs(docsData);
      setEmergencyRecords(emergencyData);
      setAuditLogs(logsData);
    } catch (err) {
      console.warn('Admin data load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRAGDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    try {
      await api.addRAGDocument({
        title: newDocTitle.trim(),
        category: newDocCategory,
        summary: newDocSummary.trim() || newDocTitle.trim(),
        content: newDocContent.trim(),
        pageCount: newDocPages,
      });

      setNewDocTitle('');
      setNewDocSummary('');
      setNewDocContent('');
      setRagSuccessMsg('Knowledge document indexed successfully into RAG store.');
      setTimeout(() => setRagSuccessMsg(''), 4000);

      const updatedDocs = await api.getRAGDocuments();
      setRagDocs(updatedDocs);
    } catch (err: any) {
      alert('Failed to add document: ' + err.message);
    }
  };

  const handleDeleteRAGDoc = async (id: string) => {
    if (!confirm('Are you sure you want to remove this knowledge document?')) return;
    try {
      await api.deleteRAGDocument(id);
      const updatedDocs = await api.getRAGDocuments();
      setRagDocs(updatedDocs);
    } catch {
      // ignore
    }
  };

  const handleAcknowledgeEmergency = async (recordId: string) => {
    const notes = prompt('Enter follow-up resolution notes (e.g. Spoke with family, senior is fine):');
    if (!notes) return;

    try {
      await api.acknowledgeEmergency(recordId, 'Admin Administrator', notes);
      const updated = await api.getEmergencyRecords();
      setEmergencyRecords(updated);
    } catch (err: any) {
      alert('Could not acknowledge emergency: ' + err.message);
    }
  };

  const handleToggleUserStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUserStatus(id, nextStatus);
      const updated = await api.getAdminUsers(searchUserQuery);
      setUsersList(updated);
    } catch {
      // ignore
    }
  };

  const handleDownloadCSV = () => {
    window.open('/api/admin/export', '_blank');
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl border-4 border-indigo-400 bg-white dark:bg-black shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black">Admin Access Portal</h2>
          <p className="text-sm font-semibold text-slate-500">
            Enter administrative credentials to oversee multi-agent operations, knowledge indexing, and analytics.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300 mb-1">
              Admin Password
            </label>
            <input
              type="password"
              placeholder="Enter admin password (e.g. admin123)"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-slate-300 text-lg font-bold"
              required
            />
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-red-100 text-red-950 font-bold text-sm">
              {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[58px] rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-md cursor-pointer transition-all"
          >
            {isLoading ? 'Verifying...' : 'Authenticate Admin'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-indigo-500 shadow-indigo-900/20'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-300" />
            <span>Buddy Elder AI Central Command</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            System Administration & Analytics
          </h2>
          <p className="text-base sm:text-lg font-medium opacity-90 max-w-2xl">
            Real-time monitoring of central multi-agent routing, RAG educational indexing, user governance, and emergency response audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadAdminData}
            className="min-h-[52px] px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center gap-2 border border-white/30 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="min-h-[52px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </section>

      {/* Admin Tab Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'agents', label: 'AI Agent Monitoring', icon: Sparkles },
          { id: 'users', label: 'User Governance', icon: Users },
          { id: 'rag', label: 'RAG Knowledge Base', icon: BookOpen },
          { id: 'emergency', label: 'Emergency Event Audit', icon: AlertTriangle },
          { id: 'logs', label: 'System Logs', icon: Clock },
          { id: 'tests', label: 'Automated Test Suite', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[50px] px-4 py-2 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-500">Total Users</div>
              <div className="text-3xl font-black mt-1 text-indigo-600">{metrics.totalUsers}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">{metrics.activeUsersToday} Active Today</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-500">Conversations</div>
              <div className="text-3xl font-black mt-1 text-blue-600">{metrics.totalConversations}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Orchestrated Multi-Agent</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-500">Check-ins & Exercises</div>
              <div className="text-3xl font-black mt-1 text-emerald-600">
                {metrics.completedCheckIns + metrics.completedExercises}
              </div>
              <div className="text-xs font-medium text-slate-500 mt-1">Recorded Wellness Routines</div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 shadow-sm">
              <div className="text-xs font-bold uppercase text-slate-500">Emergency Events</div>
              <div className="text-3xl font-black mt-1 text-red-600">{metrics.emergencyAlertsCount}</div>
              <div className="text-xs font-medium text-slate-500 mt-1">Multi-Channel Logged</div>
            </div>
          </div>

          {/* Service Health Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              <span>Integration Health & Service Monitor</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { label: 'Google Gemini API', status: metrics.serviceStatus.geminiApi },
                { label: 'Firestore Database', status: metrics.serviceStatus.database },
                { label: 'Notification Dispatcher', status: metrics.serviceStatus.notifications },
                { label: 'RAG Knowledge Engine', status: metrics.serviceStatus.ragService },
              ].map((srv, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-sm">{srv.label}</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{srv.status.toUpperCase()}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-500">
              System Uptime: {Math.floor(metrics.systemUptimeSeconds / 60)} minutes • Port 3000 Active
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI AGENT MONITORING */}
      {activeTab === 'agents' && metrics && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-6">
          <h3 className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            <span>Specialized AI Agent Performance & Usage Distribution</span>
          </h3>

          <div className="space-y-4">
            {[
              {
                id: 'companion',
                title: 'Companion Agent',
                desc: 'Folklore, nostalgia, jokes & emotional presence',
                count: metrics.agentUsageDistribution.companion || 0,
                color: 'bg-blue-600',
              },
              {
                id: 'education',
                title: 'Digital Education Agent',
                desc: 'Smartphones, WhatsApp, video calling & UPI tutorials',
                count: metrics.agentUsageDistribution.education || 0,
                color: 'bg-purple-600',
              },
              {
                id: 'wellness',
                title: 'Wellness Agent',
                desc: 'Seated chair yoga, daily hydration & sleep hygiene',
                count: metrics.agentUsageDistribution.wellness || 0,
                color: 'bg-emerald-600',
              },
              {
                id: 'safety',
                title: 'Safety & Scam Watch Agent',
                desc: 'Suspicious SMS verification, fraud prevention & emergency recognition',
                count: metrics.agentUsageDistribution.safety || 0,
                color: 'bg-orange-600',
              },
              {
                id: 'caregiver',
                title: 'Caregiver Support Agent',
                desc: 'Family connection summaries & caregiver communication',
                count: metrics.agentUsageDistribution.caregiver || 0,
                color: 'bg-rose-600',
              },
            ].map((agent) => {
              const total = Math.max(1, metrics.totalConversations);
              const percentage = Math.round((agent.count / total) * 100);

              return (
                <div key={agent.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-lg">{agent.title}</div>
                      <div className="text-xs font-semibold text-slate-500">{agent.desc}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black">{agent.count} Requests</span>
                      <span className="text-xs font-bold text-slate-500 block">{percentage}% of total</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                    <div className={`h-full ${agent.color}`} style={{ width: `${Math.max(5, percentage)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: USER GOVERNANCE */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-black">User Accounts & Governance</h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user or role..."
                  value={searchUserQuery}
                  onChange={(e) => setSearchUserQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-600">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4">Total Chats</th>
                  <th className="py-3 px-4">Last Active</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold">{u.name}</td>
                    <td className="py-3 px-4 capitalize">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase font-semibold">{u.language}</td>
                    <td className="py-3 px-4 font-bold">{u.totalChats}</td>
                    <td className="py-3 px-4 text-slate-500">{u.lastActive}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-black ${
                          u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className="px-2.5 py-1 text-xs font-bold border rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: RAG KNOWLEDGE BASE */}
      {activeTab === 'rag' && (
        <div className="space-y-6">
          {/* Add Document Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-4">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>Index New Educational Guide into Knowledge Base</span>
            </h3>

            {ragSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-950 font-bold text-sm">
                {ragSuccessMsg}
              </div>
            )}

            <form onSubmit={handleAddRAGDocument} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Document Title (e.g. Video Calling Guide)"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-sm font-bold"
                  required
                />
                <select
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value as any)}
                  className="p-3 rounded-xl border border-slate-300 text-sm font-bold bg-white"
                >
                  <option value="smartphone">Smartphone Basics</option>
                  <option value="whatsapp">WhatsApp Tutorials</option>
                  <option value="email">Email Tutorials</option>
                  <option value="banking_upi">Banking & UPI Safety</option>
                  <option value="wellness_fall">Fall Prevention</option>
                  <option value="government_services">Government Services</option>
                </select>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newDocPages}
                  onChange={(e) => setNewDocPages(parseInt(e.target.value, 10))}
                  placeholder="Page Count"
                  className="p-3 rounded-xl border border-slate-300 text-sm font-bold"
                />
              </div>

              <textarea
                rows={4}
                placeholder="Full text content for semantic indexing..."
                value={newDocContent}
                onChange={(e) => setNewDocContent(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-300 text-sm font-medium"
                required
              />

              <button
                type="submit"
                className="min-h-[48px] px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Index Document</span>
              </button>
            </form>
          </div>

          {/* List of Documents */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-4">
            <h3 className="text-xl font-black">Indexed Knowledge Documents ({ragDocs.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ragDocs.map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                        {doc.category}
                      </span>
                      <button
                        onClick={() => handleDeleteRAGDoc(doc.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-base font-black mt-2">{doc.title}</h4>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                      {doc.summary || doc.content}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-400">
                    Indexed: {doc.createdAt} • {doc.pageCount || 1} Pages
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EMERGENCY EVENT AUDIT */}
      {activeTab === 'emergency' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-4">
          <h3 className="text-2xl font-black text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            <span>Emergency Assistance Events & Notification Audits</span>
          </h3>

          <div className="space-y-4">
            {emergencyRecords.map((rec) => (
              <div key={rec.id} className="p-5 rounded-2xl border-2 border-red-200 bg-red-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-red-200 pb-2">
                  <div>
                    <span className="font-black text-lg text-red-950">
                      {rec.userName} • Category: {rec.category}
                    </span>
                    <div className="text-xs font-semibold text-slate-500">
                      Reason: "{rec.reason}" • Logged: {new Date(rec.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        rec.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'cancelled_false_alarm'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-600 text-white animate-pulse'
                      }`}
                    >
                      {rec.status}
                    </span>
                    {rec.status === 'active' && (
                      <button
                        onClick={() => handleAcknowledgeEmergency(rec.id)}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
                      >
                        Acknowledge & Record
                      </button>
                    )}
                  </div>
                </div>

                {/* Notifications dispatched list */}
                <div>
                  <div className="text-xs font-black uppercase text-slate-600 mb-1">
                    Multi-Channel Notifications Dispatched:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {rec.notifications.map((n) => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium">
                        <div className="flex items-center justify-between font-bold">
                          <span className="uppercase">{n.channel}</span>
                          <span className="text-indigo-600">{n.status.toUpperCase()}</span>
                        </div>
                        <div className="text-slate-600">{n.recipientName} ({n.recipientContact})</div>
                        {n.notes && <div className="text-slate-400 mt-0.5 italic">{n.notes}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {rec.resolutionNotes && (
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                    Follow-up Notes: {rec.resolutionNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SYSTEM LOGS */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 space-y-4">
          <h3 className="text-2xl font-black">System Security & Audit Logs</h3>
          <div className="divide-y divide-slate-200 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-indigo-600 mr-2">[{log.category.toUpperCase()}]</span>
                  <span className="font-black text-slate-900 dark:text-white mr-2">{log.action}:</span>
                  <span className="text-slate-600 dark:text-slate-300">{log.details}</span>
                </div>
                <div className="text-slate-400 whitespace-nowrap">{log.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUTOMATED TEST SUITE */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-3 border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <h3 className="text-2xl font-black flex items-center gap-2">
                <ShieldCheck className="w-7 h-7 text-indigo-600" />
                <span>Automated System Verification Tests</span>
              </h3>
              <p className="text-sm sm:text-base font-semibold text-slate-500 mt-1">
                Executes live test assertions for multi-agent routing, emergency overrides, RAG knowledge retrieval, memory storage, accessibility, and multilingual coverage.
              </p>
            </div>

            <button
              onClick={async () => {
                setIsRunningTests(true);
                try {
                  const res = await runAutomatedTestSuite();
                  setTestSummary(res);
                } finally {
                  setIsRunningTests(false);
                }
              }}
              disabled={isRunningTests}
              className="px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-lg flex items-center gap-2 shadow-lg cursor-pointer flex-shrink-0"
            >
              <Play className={`w-5 h-5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Running Automated Tests...' : 'Run All Tests Now'}</span>
            </button>
          </div>

          {/* Test Results Summary Banner */}
          {testSummary && (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-3xl border-4 flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  testSummary.failed === 0
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                    : 'bg-amber-50 border-amber-500 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black ${
                      testSummary.failed === 0 ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                  >
                    {testSummary.failed === 0 ? '✓' : '!'}
                  </div>
                  <div>
                    <h4 className="text-2xl font-black">
                      {testSummary.failed === 0
                        ? 'All Test Assertions Passed Successfully!'
                        : `${testSummary.failed} Test(s) Require Review`}
                    </h4>
                    <p className="text-sm font-semibold opacity-85">
                      Executed {testSummary.total} test cases across 6 architectural domains in {testSummary.durationMs}ms.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 rounded-xl bg-emerald-200 text-emerald-900 font-black text-base">
                    {testSummary.passed} Passed
                  </span>
                  {testSummary.failed > 0 && (
                    <span className="px-4 py-2 rounded-xl bg-red-200 text-red-900 font-black text-base">
                      {testSummary.failed} Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Detailed Test Items List */}
              <div className="grid grid-cols-1 gap-3">
                {testSummary.results.map((tItem) => (
                  <div
                    key={tItem.id}
                    className={`p-4 rounded-2xl border-2 flex items-start justify-between gap-4 ${
                      tItem.passed
                        ? 'bg-white dark:bg-slate-900 border-emerald-300'
                        : 'bg-red-50 border-red-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {tItem.passed ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white">
                            {tItem.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider">
                            {tItem.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-semibold mt-1">
                          {tItem.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                      {tItem.durationMs}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
