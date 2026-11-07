import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DailyCheckIn, ExerciseLog, PrivacySettings, UserProfile } from '../../types';
import {
  Users,
  ShieldCheck,
  Printer,
  Heart,
  Phone,
  Calendar,
  CheckCircle2,
  Lock,
  Download,
  AlertCircle,
  FileText,
  User,
  Activity,
  Smile,
  GraduationCap,
} from 'lucide-react';

export const CaregiverDashboard: React.FC = () => {
  const { user, role, switchRole, t, highContrast } = useApp();

  const [overviewData, setOverviewData] = useState<{
    senior: UserProfile;
    recentCheckIns: DailyCheckIn[];
    exerciseLogs: ExerciseLog[];
    completedLessons: string[];
    privacySettings: PrivacySettings;
    emergencyContacts: UserProfile['emergencyContacts'];
  } | null>(null);

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    shareWellnessWithCaregiver: true,
    shareExercisesWithCaregiver: true,
    shareLearningProgress: true,
    allowEmergencyLocation: true,
    enableLongTermMemory: true,
  });

  const [pinInput, setPinInput] = useState('');
  const [isAuthenticatedCaregiver, setIsAuthenticatedCaregiver] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isPrinting, setIsPrinting] = useState(false);
  const [quickMsgSent, setQuickMsgSent] = useState('');

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      const data = await api.getCaregiverOverview();
      setOverviewData(data);
      if (data.privacySettings) {
        setPrivacy(data.privacySettings);
      }
    } catch {
      // fallback
    }
  };

  const handleCaregiverAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await api.login('caregiver', pinInput);
      setIsAuthenticatedCaregiver(true);
      loadOverview();
    } catch (err: any) {
      setAuthError('Incorrect Caregiver Access Key. Try "caregiver123" for testing.');
    }
  };

  const handlePrivacyToggle = async (key: keyof PrivacySettings) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    try {
      await api.updatePrivacySettings(updated);
    } catch {
      // ignore
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleSendFamilyNudge = (name: string) => {
    setQuickMsgSent(`Reassurance message queued to ${name}: "Namaste, checking in on you with love!"`);
    setTimeout(() => setQuickMsgSent(''), 5000);
  };

  const senior = overviewData?.senior || user;

  return (
    <div className="space-y-8 max-w-6xl mx-auto print:p-0">
      {/* Top Banner (Hidden on Print) */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 print:hidden ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-gradient-to-r from-purple-800 to-indigo-900 text-white border-purple-500 shadow-purple-900/20'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-sm font-bold">
            <Users className="w-4 h-4 text-purple-200" />
            <span>Family Caregiver Portal & Health Summary</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            Caregiver Oversight & Well-being
          </h2>
          <p className="text-lg sm:text-xl font-medium opacity-90 max-w-2xl">
            Keep peace of mind with daily routine logs, mood tracking, gentle exercise completion, and instant emergency alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handlePrintReport}
            className="min-h-[58px] px-6 py-3 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-black text-lg flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Printer className="w-6 h-6 text-purple-700" />
            <span>Print Weekly Report</span>
          </button>
        </div>
      </section>

      {/* Senior User Profile Card */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-3xl">
              {senior?.name.charAt(0) || 'R'}
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-black">{senior?.name}</h3>
              <p className="text-base sm:text-lg font-semibold text-slate-500">
                Age: {senior?.age || 72} Years • Primary Language:{' '}
                {senior?.language === 'hi' ? 'Hindi' : senior?.language === 'mr' ? 'Marathi' : 'English'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full text-sm font-black border border-emerald-300">
              <CheckCircle2 className="w-4 h-4" /> Active Today
            </span>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-950">
            <div className="text-sm font-bold uppercase text-emerald-700">Latest Mood</div>
            <div className="text-2xl font-black mt-1 capitalize">
              {overviewData?.recentCheckIns?.[0]?.mood || 'Good'} 😊
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Sleep: {overviewData?.recentCheckIns?.[0]?.sleepQuality || 'Adequate'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-950">
            <div className="text-sm font-bold uppercase text-blue-700">Fall Prevention</div>
            <div className="text-2xl font-black mt-1">
              {overviewData?.exerciseLogs?.filter((l) => l.completed).length || 0} Exercises Completed
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              Chair yoga & ankle stability
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-950">
            <div className="text-sm font-bold uppercase text-purple-700">Digital Skills</div>
            <div className="text-2xl font-black mt-1">
              {overviewData?.completedLessons?.length || 0} Lessons Mastered
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-0.5">
              WhatsApp, photo sharing, UPI
            </div>
          </div>
        </div>
      </section>

      {/* Senior Privacy & Sharing Authorization (Elderly Rights) */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-4 print:hidden ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Lock className="w-7 h-7 text-purple-600" />
          <h3 className="text-2xl font-black">Elderly Privacy & Data Sharing Controls</h3>
        </div>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
          Elderly users maintain full sovereignty over what wellness data and activity updates are shared with family caregivers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            {
              key: 'shareWellnessWithCaregiver' as keyof PrivacySettings,
              label: 'Share Daily Mood & Sleep Check-Ins',
              desc: 'Allows registered caregivers to view daily comfort records.',
            },
            {
              key: 'shareExercisesWithCaregiver' as keyof PrivacySettings,
              label: 'Share Exercise & Fall-Prevention Records',
              desc: 'Allows tracking of gentle physical routine completion.',
            },
            {
              key: 'shareLearningProgress' as keyof PrivacySettings,
              label: 'Share Digital Academy Progress',
              desc: 'Shows completed phone literacy and safety courses.',
            },
            {
              key: 'allowEmergencyLocation' as keyof PrivacySettings,
              label: 'Allow Emergency Assistance Alerts',
              desc: 'Transmits emergency trigger events to family contacts.',
            },
          ].map((item) => (
            <div
              key={item.key}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 dark:bg-slate-900 flex items-start justify-between gap-3"
            >
              <div>
                <div className="font-extrabold text-lg">{item.label}</div>
                <div className="text-xs font-semibold text-slate-500 mt-0.5">{item.desc}</div>
              </div>
              <button
                onClick={() => handlePrivacyToggle(item.key)}
                className={`min-h-[46px] px-4 py-1.5 rounded-xl text-sm font-black transition-all cursor-pointer ${
                  privacy[item.key]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                }`}
              >
                {privacy[item.key] ? 'Shared' : 'Private'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Registered Family & Caregiver Contacts */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-6 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7 text-rose-600" />
            <h3 className="text-2xl font-black">Registered Family & Medical Contacts</h3>
          </div>
          <span className="text-sm font-bold text-slate-500">
            {senior?.emergencyContacts.length} Contacts Configured
          </span>
        </div>

        {quickMsgSent && (
          <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-400 text-emerald-950 font-bold text-base flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{quickMsgSent}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {senior?.emergencyContacts.map((contact) => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl border-3 border-slate-200 bg-slate-50 dark:bg-slate-900 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xl">{contact.name}</span>
                  {contact.isPrimaryCaregiver && (
                    <span className="text-xs font-bold uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-sm font-bold text-slate-500 mt-1">{contact.relation}</div>
                <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-1">
                  📞 {contact.phone}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 print:hidden">
                <a
                  href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 min-h-[48px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </a>
                <button
                  onClick={() => handleSendFamilyNudge(contact.name)}
                  className="flex-1 min-h-[48px] px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Send Nudge</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly History & Printable Health Report Section */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-6 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 border-slate-200">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-purple-950 dark:text-purple-300 flex items-center gap-2">
              <FileText className="w-7 h-7 text-purple-600" />
              <span>Weekly Health & Activity Log Report</span>
            </h3>
            <p className="text-sm sm:text-base font-medium text-slate-500">
              Generated for physician visits and weekly family review.
            </p>
          </div>

          <div className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-300">
            Current Week: November 2026
          </div>
        </div>

        {/* Check-In History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-base font-medium">
            <thead>
              <tr className="border-b-2 border-slate-300 bg-slate-50 dark:bg-slate-900 text-sm font-extrabold uppercase text-slate-600 dark:text-slate-300">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Mood</th>
                <th className="py-3 px-4">Sleep Quality</th>
                <th className="py-3 px-4">Reported Discomfort</th>
                <th className="py-3 px-4">Recorded At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {overviewData?.recentCheckIns?.slice(0, 7).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold">{entry.date}</td>
                  <td className="py-3 px-4 capitalize font-semibold">
                    {entry.mood === 'great' ? '😊 Great' : entry.mood === 'good' ? '🙂 Good' : entry.mood === 'okay' ? '😐 Okay' : entry.mood === 'tired' ? '😟 Tired' : '😣 In Pain'}
                  </td>
                  <td className="py-3 px-4 capitalize">{entry.sleepQuality}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">
                    {entry.physicalDiscomfort.join(', ')}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{entry.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Printable Footer Notice */}
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Buddy Elder AI Confidential Wellness Summary • Not a medical prescription</span>
          <span>Printed on {new Date().toLocaleDateString()}</span>
        </div>
      </section>
    </div>
  );
};
