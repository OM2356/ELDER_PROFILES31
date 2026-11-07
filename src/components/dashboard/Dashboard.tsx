import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DailyCheckIn, ExerciseLog } from '../../types';
import { speechEngine, voiceRecognizer } from '../../utils/speech';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureInfoButton, useLongPress } from '../common/AccessibleTooltip';
import {
  MessageSquareHeart,
  Activity,
  GraduationCap,
  Users,
  ShieldAlert,
  Mic,
  MicOff,
  Volume2,
  Phone,
  CheckCircle2,
  Calendar,
  Sparkles,
  Heart,
  ArrowRight,
  Smile,
  HelpCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    user,
    setCurrentTab,
    triggerEmergency,
    t,
    language,
    speechRate,
    highContrast,
  } = useApp();

  const { showTooltip } = useTooltip();

  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [exerciseCount, setExerciseCount] = useState<number>(0);
  const [completedLessonCount, setCompletedLessonCount] = useState<number>(0);
  const [isListening, setIsListening] = useState(false);
  const [voiceNotice, setVoiceNotice] = useState<string>('');

  const micLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('mic_input'),
  });

  const checkInLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('daily_checkin'),
    onClick: () => setCurrentTab('wellness'),
  });

  const exercisesLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('fall_prevention'),
    onClick: () => setCurrentTab('wellness'),
  });

  const learningLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('digital_learning'),
    onClick: () => setCurrentTab('education'),
  });

  const chatCardLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('voice_chat'),
  });

  const wellnessCardLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('fall_prevention'),
  });

  const educationCardLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('digital_learning'),
  });

  const safetyCardLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('safety_center'),
  });

  const caregiverCardLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('family_portal'),
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const history = await api.getCheckInHistory();
      const todayStr = new Date().toISOString().split('T')[0];
      const today = history.find((c) => c.date === todayStr);
      if (today) setTodayCheckIn(today);

      const logs = await api.getExerciseLogs();
      const todayExercises = logs.filter((l) => l.date === todayStr && l.completed);
      setExerciseCount(todayExercises.length);

      const progress = await api.getLearningProgress();
      setCompletedLessonCount(progress.completedLessons?.length || 0);
    } catch {
      // fallback safe states
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('welcomeGreetingMorning');
    if (hour < 17) return t('welcomeGreetingAfternoon');
    return t('welcomeGreetingEvening');
  };

  const speakWelcome = () => {
    const name = user?.name || 'Friend';
    let text = `${getGreeting()}, ${name}! `;
    if (todayCheckIn) {
      text += `Your daily check-in is complete today. How may I companion you?`;
    } else {
      text += `Please complete your gentle 1-minute daily health check-in, or tap the microphone to talk with me anytime.`;
    }
    speechEngine.speak(text, language, speechRate);
  };

  const handleVoiceQuickStart = () => {
    if (isListening) {
      voiceRecognizer.stopListening();
      setIsListening(false);
      setVoiceNotice('');
      return;
    }

    if (!voiceRecognizer.isSupported()) {
      setVoiceNotice('Voice recognition is not supported in this browser.');
      return;
    }

    setIsListening(true);
    setVoiceNotice('Listening... Please speak now.');

    voiceRecognizer.startListening(
      language,
      (transcript) => {
        setIsListening(false);
        setVoiceNotice(`Heard: "${transcript}"`);
        // Check for emergency keywords
        const lower = transcript.toLowerCase();
        if (
          lower.includes('fallen') ||
          lower.includes('fall') ||
          lower.includes('help') ||
          lower.includes('unsafe') ||
          lower.includes('चोट') ||
          lower.includes('मदत') ||
          lower.includes('पडलो')
        ) {
          triggerEmergency(`Voice trigger: "${transcript}"`);
        } else {
          // Switch to chat with user query
          sessionStorage.setItem('buddy_pending_prompt', transcript);
          setCurrentTab('chat');
        }
      },
      (err) => {
        setIsListening(false);
        setVoiceNotice(err);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const primaryCaregiver = user?.emergencyContacts.find((c) => c.isPrimaryCaregiver) || user?.emergencyContacts[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Elderly Accessibility Feature Guide Tip Banner */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 text-base sm:text-lg font-bold shadow-sm ${
          highContrast
            ? 'bg-black text-amber-300 border-amber-400'
            : 'bg-amber-50 text-amber-950 border-amber-300'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <span>
            {language === 'hi'
              ? 'सुझाव: किसी भी बटन या कार्ड को कुछ देर दबाए रखें अथवा (ℹ️) पर टैप करें यह जानने के लिए कि वह क्या करता है।'
              : language === 'mr'
              ? 'टीप: कोणत्याही बटणावर किंवा कार्डवर थोडे दाबून ठेवा किंवा (ℹ️) वर टॅप करा त्याचे कार्य समजण्यासाठी.'
              : 'Tip: Long-press (press & hold) any button or card, or tap (ℹ️) to hear a simple explanation of what it does.'}
          </span>
        </div>
      </div>

      {/* Personalized Welcome Banner */}
      <section
        aria-label="Welcome Overview"
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl transition-all relative ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white border-amber-400 shadow-amber-500/20'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-sm font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{getGreeting()}</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                Namaste, {user?.name || 'Ramesh Ji'}!
              </h2>
              <FeatureInfoButton featureKey="voice_chat" size="md" variant="contrast" />
            </div>
            <p className="text-lg sm:text-xl font-medium opacity-95 max-w-2xl leading-relaxed">
              {t('howAreYouFeeling')} I am your Buddy AI, always here to listen, teach, and protect.
            </p>
          </div>

          {/* Quick Voice Interaction Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
              <button
                onClick={handleVoiceQuickStart}
                {...micLongPress}
                className={`w-full sm:w-auto min-h-[68px] px-6 py-4 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 text-white voice-recording-pulse border-2 border-white'
                    : 'bg-white text-slate-900 hover:bg-amber-50 active:scale-95 border-2 border-amber-200'
                }`}
                aria-label="Voice conversation microphone button. Long press for explanation."
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8 text-white animate-spin" />
                    <span>Listening... Tap to Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8 text-amber-600" />
                    <span>Tap to Speak with Buddy</span>
                  </>
                )}
              </button>
              <div className="absolute -top-2 -right-2 z-10">
                <FeatureInfoButton featureKey="mic_input" size="sm" variant="contrast" />
              </div>
            </div>

            <button
              onClick={speakWelcome}
              className="min-h-[68px] min-w-[68px] p-4 rounded-2xl bg-amber-400/30 hover:bg-amber-400/50 text-white border-2 border-white/40 flex items-center justify-center transition-colors cursor-pointer"
              title="Read welcome aloud"
              aria-label="Read welcome greeting aloud"
            >
              <Volume2 className="w-8 h-8" />
            </button>
          </div>
        </div>

        {voiceNotice && (
          <div className="mt-4 p-3 rounded-xl bg-black/40 text-amber-200 font-semibold text-lg flex items-center gap-2">
            <span>🗣️</span>
            <span>{voiceNotice}</span>
          </div>
        )}
      </section>

      {/* Daily Activity Summary Strip */}
      <section aria-label="Daily Activity Summary" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Mood Check-In Status */}
        <div
          {...checkInLongPress}
          className={`p-5 rounded-2xl border-3 shadow-md flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : todayCheckIn
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}
          aria-label="Daily check in status. Long press for explanation."
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-2xl ${
                todayCheckIn ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
              }`}
            >
              {todayCheckIn ? '😊' : '📝'}
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <span>Daily Check-in</span>
              </div>
              <div className="text-xl font-extrabold">
                {todayCheckIn ? 'Completed Today' : 'Pending Check-in'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FeatureInfoButton featureKey="daily_checkin" size="sm" variant={highContrast ? 'contrast' : 'badge'} />
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Exercises Done */}
        <div
          {...exercisesLongPress}
          className={`p-5 rounded-2xl border-3 shadow-md flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-blue-50 border-blue-300 text-blue-950'
          }`}
          aria-label="Gentle exercise status. Long press for explanation."
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-200 text-blue-800 flex items-center justify-center">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Gentle Exercises
              </div>
              <div className="text-xl font-extrabold">{exerciseCount} Routine(s) Done</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FeatureInfoButton featureKey="fall_prevention" size="sm" variant={highContrast ? 'contrast' : 'badge'} />
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Digital Learning */}
        <div
          {...learningLongPress}
          className={`p-5 rounded-2xl border-3 shadow-md flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-purple-50 border-purple-300 text-purple-950'
          }`}
          aria-label="Digital learning status. Long press for explanation."
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Digital Skills
              </div>
              <div className="text-xl font-extrabold">{completedLessonCount} Lessons Mastered</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FeatureInfoButton featureKey="digital_learning" size="sm" variant={highContrast ? 'contrast' : 'badge'} />
            <ArrowRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </section>

      {/* Main Core Action Cards (Big 60px+ touch targets) */}
      <section aria-label="Action Modules" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI Companion Chat */}
        <div
          {...chatCardLongPress}
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-blue-400 hover:border-blue-500 shadow-blue-500/10'
          }`}
          aria-label="Buddy chat card. Long press or tap info for explanation."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md">
                <MessageSquareHeart className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="voice_chat" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-2">
              <span>{t('quickChat')}</span>
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {t('quickChatDesc')} Ask for folk stories, old songs, healthy daily tips, or simply tell me how your day went.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('chat')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>Talk to Buddy AI</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card 2: Daily Wellness & Fall Prevention */}
        <div
          {...wellnessCardLongPress}
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-emerald-400 hover:border-emerald-500 shadow-emerald-500/10'
          }`}
          aria-label="Wellness and fall prevention card. Long press or tap info for explanation."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Activity className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="fall_prevention" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-900 dark:text-emerald-200">
              {t('navWellness')}
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              Track daily mood, sleep quality, gentle chair exercises, and home fall-safety tips designed specially for joint comfort.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('wellness')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>{todayCheckIn ? 'View Wellness & Exercises' : 'Start Daily Check-in'}</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card 3: Digital Education Hub */}
        <div
          {...educationCardLongPress}
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-purple-400 hover:border-purple-500 shadow-purple-500/10'
          }`}
          aria-label="Digital education hub card. Long press or tap info for explanation."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <GraduationCap className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="digital_learning" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-900 dark:text-purple-200">
              {t('digitalHub')}
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {t('digitalHubDesc')} Practice sending pictures, making video calls, voice typing, and safe online banking with a patient mentor.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('education')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>Explore Lessons & Practice</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card 4: Safety Center & Scam Detector */}
        <div
          {...safetyCardLongPress}
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-orange-400 hover:border-orange-500 shadow-orange-500/10'
          }`}
          aria-label="Safety center and scam detector card. Long press or tap info for explanation."
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md">
                <ShieldAlert className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="safety_center" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-orange-900 dark:text-orange-200">
              {t('safetyAlert')}
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {t('safetyAlertDesc')} Paste any confusing WhatsApp or SMS message to let AI verify if it is an OTP fraud or lottery trick.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('safety')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>Check Suspicious Message</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card 5: Smart Reminders & Routine */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-amber-400 hover:border-amber-500 shadow-amber-500/10'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Calendar className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="daily_routine_reminders" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-900 dark:text-amber-200">
              {t('navReminders')}
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              Daily water intake tracker, morning stretch reminders, and gentle alerts to call family at your scheduled times.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('reminders')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>View Daily Routine & Water Tracker</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Card 6: Folklore Stories & Brain Gym */}
        <div
          className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all flex flex-col justify-between relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-white text-slate-900 border-purple-400 hover:border-purple-500 shadow-purple-500/10'
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-16 h-16 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-9 h-9" />
              </div>
              <FeatureInfoButton featureKey="nav_social" size="md" variant={highContrast ? 'contrast' : 'badge'} />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-900 dark:text-purple-200">
              {t('navSocial')}
            </h3>
            <p className="text-lg text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              Enjoy classic Tenali Rama folk stories, exercise your memory with the card matching game, and reflect with daily gratitude.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <button
              onClick={() => setCurrentTab('social')}
              className="w-full min-h-[64px] px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-extrabold text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
            >
              <span>Read Stories & Play Memory Match</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Direct Family Contact Strip */}
      {primaryCaregiver && (
        <section
          {...caregiverCardLongPress}
          aria-label="Direct Family Dialer"
          className={`p-6 rounded-3xl border-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 relative ${
            highContrast
              ? 'bg-black text-white border-yellow-400'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <Heart className="w-9 h-9 fill-rose-200" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-wider text-rose-700 flex items-center gap-2">
                <span>One-Touch Family Connection</span>
                <FeatureInfoButton featureKey="family_portal" size="sm" variant={highContrast ? 'contrast' : 'badge'} />
              </div>
              <div className="text-2xl font-black">
                {primaryCaregiver.name} ({primaryCaregiver.relation})
              </div>
              <div className="text-base font-semibold text-slate-600">
                Phone: {primaryCaregiver.phone}
              </div>
            </div>
          </div>
          <a
            href={`tel:${primaryCaregiver.phone.replace(/[^0-9+]/g, '')}`}
            className="w-full sm:w-auto min-h-[64px] px-8 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xl flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer"
          >
            <Phone className="w-6 h-6" />
            <span>Call Now</span>
          </a>
        </section>
      )}
    </div>
  );
};
