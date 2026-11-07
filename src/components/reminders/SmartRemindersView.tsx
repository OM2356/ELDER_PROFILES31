import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SmartReminder } from '../../types';
import { speechEngine } from '../../utils/speech';
import {
  Clock,
  Droplets,
  Plus,
  CheckCircle,
  Bell,
  Volume2,
  Calendar,
  AlertCircle,
  Heart,
  PhoneCall,
  GraduationCap,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { FeatureInfoButton } from '../common/AccessibleTooltip';

const DEFAULT_REMINDERS: SmartReminder[] = [
  {
    id: 'rem_1',
    userId: 'senior_1',
    title: 'Morning Sunshine & Warm Water',
    category: 'hydration',
    time: '07:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    voicePrompt: 'Good morning! Please drink a glass of fresh warm water and enjoy the morning sunshine.',
  },
  {
    id: 'rem_2',
    userId: 'senior_1',
    title: 'Daily Health Check-in with Buddy',
    category: 'checkin',
    time: '09:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    voicePrompt: 'Time for your quick 1-minute daily health check-in so your family knows you are feeling well.',
  },
  {
    id: 'rem_3',
    userId: 'senior_1',
    title: 'Gentle Chair Yoga & Ankle Stretches',
    category: 'exercise',
    time: '11:00',
    daysOfWeek: [1, 2, 3, 4, 5],
    isActive: true,
    voicePrompt: 'Let us do 5 minutes of gentle seated ankle circles to keep your joints loose and steady.',
  },
  {
    id: 'rem_4',
    userId: 'senior_1',
    title: 'Daily WhatsApp Learning Lesson',
    category: 'learning',
    time: '15:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    voicePrompt: 'Ready for today’s short 3-minute lesson on sending photos to grandchildren?',
  },
  {
    id: 'rem_5',
    userId: 'senior_1',
    title: 'Evening Call to Priya (Daughter)',
    category: 'family',
    time: '18:00',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    voicePrompt: 'Time for your lovely evening chat with your daughter Priya.',
  },
  {
    id: 'rem_6',
    userId: 'senior_1',
    title: 'Evening Doctor-Advised Tablet (Reminder Aid)',
    category: 'medication',
    time: '20:30',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    isActive: true,
    isMedication: true,
    medicationDosage: '1 tablet after dinner (As prescribed by your personal doctor)',
    voicePrompt: 'Reminder to take your evening tablet with water after dinner.',
  },
];

export const SmartRemindersView: React.FC = () => {
  const { language, speechRate, highContrast, addNotification } = useApp();
  const [reminders, setReminders] = useState<SmartReminder[]>(() => {
    const saved = localStorage.getItem('buddy_smart_reminders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_REMINDERS;
      }
    }
    return DEFAULT_REMINDERS;
  });

  const [waterGlasses, setWaterGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('buddy_water_intake');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('12:00');
  const [newCategory, setNewCategory] = useState<SmartReminder['category']>('custom');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    localStorage.setItem('buddy_smart_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('buddy_water_intake', waterGlasses.toString());
  }, [waterGlasses]);

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        new Notification('Buddy Elder AI', {
          body: 'Routine reminders are now enabled! Buddy will notify you at your scheduled times.',
          icon: '/pwa-192x192.png',
        });
      }
    }
  };

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleReadAloud = (rem: SmartReminder) => {
    const prompt = rem.voicePrompt || `Reminder: ${rem.title} scheduled for ${rem.time}`;
    speechEngine.speak(prompt, language, speechRate);
  };

  const handleAddCustomReminder = () => {
    if (!newTitle.trim()) return;
    const newRem: SmartReminder = {
      id: `rem_${Date.now()}`,
      userId: 'senior_1',
      title: newTitle.trim(),
      category: newCategory,
      time: newTime,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      isActive: true,
      voicePrompt: `Reminder: ${newTitle.trim()}`,
    };
    setReminders([...reminders, newRem]);
    setNewTitle('');
    setShowAddModal(false);
    addNotification({
      category: 'wellness',
      title: 'New Routine Scheduled',
      message: `Added: "${newRem.title}" at ${newRem.time}.`,
      priority: 'low',
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'hydration':
        return <Droplets className="w-6 h-6 text-sky-500" />;
      case 'checkin':
        return <Heart className="w-6 h-6 text-rose-500" />;
      case 'exercise':
        return <Sparkles className="w-6 h-6 text-emerald-500" />;
      case 'learning':
        return <GraduationCap className="w-6 h-6 text-purple-500" />;
      case 'family':
        return <PhoneCall className="w-6 h-6 text-blue-500" />;
      case 'medication':
        return <AlertCircle className="w-6 h-6 text-amber-500" />;
      default:
        return <Clock className="w-6 h-6 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner">
            <Clock className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                {language === 'hi'
                  ? 'दैनिक दिनचर्या व स्मरणपत्र'
                  : language === 'mr'
                  ? 'दैनिक दिनक्रम व स्मरणपत्रे'
                  : 'Daily Routine & Smart Reminders'}
              </h2>
              <FeatureInfoButton featureKey="daily_routine_reminders" variant="contrast" />
            </div>
            <p className="text-sm sm:text-base md:text-lg font-medium text-amber-100 mt-1">
              {language === 'hi'
                ? 'पानी पीना, सेहत की जांच, हल्की कसरत और अपनों से बात करने के समय पर प्यार भरी याद।'
                : language === 'mr'
                ? 'पाणी पिणे, तब्येतीची नोंद, हलका व्यायाम आणि कुटुंबीयांशी गप्पा मारण्याची वेळेवर आठवण.'
                : 'Gentle voice prompts and timely alerts to keep your day structured, healthy, and connected.'}
            </p>
          </div>
        </div>

        {/* Browser Notification Permission Button */}
        {notificationPermission !== 'granted' && (
          <button
            onClick={requestNotificationPermission}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-amber-900 font-extrabold text-sm sm:text-base shadow-lg hover:bg-amber-100 cursor-pointer flex-shrink-0"
          >
            <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
            <span>Enable Sound & Alerts</span>
          </button>
        )}
      </div>

      {/* Hydration Tracker Section */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-3 shadow-md ${
          highContrast
            ? 'bg-zinc-900 border-amber-400 text-white'
            : 'bg-white border-sky-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center">
              <Droplets className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black">
                {language === 'hi' ? 'दैनिक जल सेवन (पानी पीना)' : language === 'mr' ? 'दैनिक पाणी पिण्याची नोंद' : 'Daily Hydration Tracker'}
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Aim: 8 glasses daily • Staying hydrated prevents dizziness and keeps energy high!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 font-black text-2xl text-slate-700 flex items-center justify-center cursor-pointer"
              aria-label="Decrease water count"
            >
              -
            </button>
            <span className="text-3xl font-black text-sky-600 px-2">
              {waterGlasses} / 8 <span className="text-sm font-bold text-slate-500">glasses</span>
            </span>
            <button
              onClick={() => {
                const next = Math.min(12, waterGlasses + 1);
                setWaterGlasses(next);
                if (next === 8) {
                  speechEngine.speak(
                    language === 'hi'
                      ? 'बधाई! आपने आज 8 गिलास पानी पीने का लक्ष्य पूरा कर लिया!'
                      : language === 'mr'
                      ? 'अभिनंदन! आपण आज ८ ग्लास पाण्याचे उद्दिष्ट पूर्ण केले!'
                      : 'Congratulations! You reached your goal of 8 glasses of water today!',
                    language,
                    speechRate
                  );
                }
              }}
              className="w-12 h-12 rounded-xl bg-sky-500 hover:bg-sky-600 font-black text-2xl text-white flex items-center justify-center shadow-md cursor-pointer"
              aria-label="Add 1 glass of water"
            >
              +
            </button>
          </div>
        </div>

        {/* Visual Glasses Display */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 pt-6">
          {Array.from({ length: 8 }).map((_, i) => {
            const isFilled = i < waterGlasses;
            return (
              <button
                key={i}
                onClick={() => setWaterGlasses(i + 1)}
                className={`py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isFilled
                    ? 'border-sky-400 bg-sky-100 text-sky-800 font-bold scale-105 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-sky-300'
                }`}
                title={`Glass ${i + 1}`}
              >
                <Droplets className={`w-6 h-6 ${isFilled ? 'text-sky-600' : 'text-slate-300'}`} />
                <span className="text-xs font-black">Glass {i + 1}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Reminders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            {language === 'hi' ? 'दैनिक कार्यक्रम' : language === 'mr' ? 'दैनिक दिनक्रम' : 'Scheduled Routines'}
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm sm:text-base shadow-md cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add Custom Reminder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-5 rounded-3xl border-3 shadow-md flex items-start gap-4 transition-all ${
                rem.isActive
                  ? highContrast
                    ? 'bg-zinc-900 border-amber-400 text-white'
                    : 'bg-white border-amber-200 text-slate-800'
                  : 'opacity-60 bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-zinc-800 flex-shrink-0">
                {getCategoryIcon(rem.category)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                    {rem.time}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReadAloud(rem)}
                      className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 cursor-pointer"
                      title="Read out loud"
                      aria-label="Read reminder out loud"
                    >
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <input
                      type="checkbox"
                      checked={rem.isActive}
                      onChange={() => toggleReminder(rem.id)}
                      className="w-6 h-6 text-amber-500 rounded cursor-pointer"
                      aria-label={`Toggle reminder ${rem.title}`}
                    />
                  </div>
                </div>

                <h4 className="text-xl font-extrabold mt-1 text-slate-900 dark:text-white leading-snug">
                  {rem.title}
                </h4>

                {rem.isMedication && rem.medicationDosage && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs sm:text-sm font-semibold text-amber-900">
                    <span className="font-bold">Instructions:</span> {rem.medicationDosage}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Daily schedule active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Non-Prescriptive Medication Disclaimer Note */}
      <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm font-semibold flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Important Notice:</span> Medication alerts inside Buddy Elder AI serve strictly as gentle personal reminder aids. Buddy Elder AI never prescribes medication, calculates medical dosages, or alters doctor-prescribed regimens. Always follow instructions from your registered healthcare practitioner.
        </div>
      </div>

      {/* Add Custom Reminder Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-4 border-amber-400">
            <h3 className="text-2xl font-black mb-4">Add Routine Reminder</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Reminder Name</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Afternoon Herbal Tea or Walk"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Scheduled Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 font-bold"
                >
                  <option value="custom">General Custom Routine</option>
                  <option value="hydration">Water & Hydration</option>
                  <option value="exercise">Walk & Stretching</option>
                  <option value="family">Family Call</option>
                  <option value="learning">Digital Learning</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomReminder}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 font-black text-white shadow-md cursor-pointer"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
