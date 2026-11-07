import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DailyCheckIn, ExerciseGuide, ExerciseLog } from '../../types';
import { speechEngine } from '../../utils/speech';
import {
  Heart,
  Smile,
  Moon,
  AlertCircle,
  Activity,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  Volume2,
  Info,
  Sparkles,
  Award,
} from 'lucide-react';

export const WellnessSection: React.FC = () => {
  const { user, language, speechRate, triggerEmergency, t, highContrast } = useApp();

  const [activeTab, setActiveTab] = useState<'checkin' | 'exercises' | 'history'>('checkin');
  const [history, setHistory] = useState<DailyCheckIn[]>([]);
  const [exercises, setExercises] = useState<ExerciseGuide[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Questionnaire Form State
  const [mood, setMood] = useState<DailyCheckIn['mood']>('good');
  const [sleepQuality, setSleepQuality] = useState<DailyCheckIn['sleepQuality']>('adequate');
  const [selectedDiscomforts, setSelectedDiscomforts] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      const [historyData, exerciseData, logData] = await Promise.all([
        api.getCheckInHistory(),
        api.getExercises(),
        api.getExerciseLogs(),
      ]);
      setHistory(historyData);
      setExercises(exerciseData);
      setExerciseLogs(logData);

      // Check if already checked in today
      const todayEntry = historyData.find((h) => h.date === todayStr);
      if (todayEntry) {
        setMood(todayEntry.mood);
        setSleepQuality(todayEntry.sleepQuality);
        setSelectedDiscomforts(todayEntry.physicalDiscomfort);
      }
    } catch {
      // safe fallback
    }
  };

  const handleDiscomfortToggle = (item: string) => {
    if (item === 'None') {
      setSelectedDiscomforts(['None']);
      return;
    }
    const filtered = selectedDiscomforts.filter((d) => d !== 'None');
    if (filtered.includes(item)) {
      setSelectedDiscomforts(filtered.filter((d) => d !== item));
    } else {
      setSelectedDiscomforts([...filtered, item]);
    }
  };

  const handleSubmitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      await api.submitCheckIn({
        mood,
        sleepQuality,
        physicalDiscomfort: selectedDiscomforts.length ? selectedDiscomforts : ['None'],
        notes,
      });

      setSuccessMessage(
        language === 'hi'
          ? 'आपका दैनिक स्वास्थ्य रिकॉर्ड सफलतापूर्वक सहेज लिया गया है।'
          : language === 'mr'
          ? 'आपली दैनिक आरोग्य नोंद यशस्वीरीत्या जतन केली गेली आहे.'
          : 'Your daily wellness check-in has been recorded successfully.'
      );

      // Read reassuring encouragement
      const encouragement =
        mood === 'pain' || selectedDiscomforts.includes('Severe Joint Pain')
          ? language === 'hi'
            ? 'हमने आपकी असुविधा दर्ज कर ली है। कृपया थोड़ा आराम करें और आवश्यकता होने पर डॉक्टर से परामर्श लें।'
            : 'We recorded your discomfort. Please rest gently, stay hydrated, and consult your doctor if pain continues.'
          : language === 'hi'
          ? 'बहुत खूब! स्वस्थ दिनचर्या बनाए रखने के लिए बधाई।'
          : 'Wonderful! Thank you for prioritizing your wellness today.';

      speechEngine.speak(encouragement, language, speechRate);
      loadWellnessData();
    } catch (err: any) {
      alert('Could not submit check-in: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleExercise = async (exerciseId: string) => {
    const isCurrentlyDone = exerciseLogs.some(
      (l) => l.exerciseId === exerciseId && l.date === todayStr && l.completed
    );

    try {
      await api.toggleExercise(exerciseId, todayStr, !isCurrentlyDone);
      // Reload logs
      const updated = await api.getExerciseLogs();
      setExerciseLogs(updated);

      if (!isCurrentlyDone) {
        const cheer =
          language === 'hi'
            ? 'शाबाश! आपने यह हल्का व्यायाम पूरा कर लिया।'
            : language === 'mr'
            ? 'छान! आपण हा सोपा व्यायाम यशस्वीरीत्या पूर्ण केला.'
            : 'Well done! Exercise routine marked complete.';
        speechEngine.speak(cheer, language, speechRate);
      }
    } catch {
      // ignore
    }
  };

  const getExerciseTitle = (ex: ExerciseGuide) => {
    if (language === 'hi') return ex.titleHi;
    if (language === 'mr') return ex.titleMr;
    return ex.titleEn;
  };

  const getExerciseDesc = (ex: ExerciseGuide) => {
    if (language === 'hi') return ex.descriptionHi;
    if (language === 'mr') return ex.descriptionMr;
    return ex.descriptionEn;
  };

  const getExerciseSteps = (ex: ExerciseGuide) => {
    if (language === 'hi') return ex.stepsHi;
    if (language === 'mr') return ex.stepsMr;
    return ex.stepsEn;
  };

  const getExerciseSafety = (ex: ExerciseGuide) => {
    if (language === 'hi') return ex.safetyTipsHi;
    if (language === 'mr') return ex.safetyTipsMr;
    return ex.safetyTipsEn;
  };

  const todayCheckedIn = history.some((h) => h.date === todayStr);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Wellness Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`min-h-[58px] px-6 py-3 rounded-2xl font-black text-lg sm:text-xl border-3 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'checkin'
              ? highContrast
                ? 'bg-yellow-400 text-black border-white shadow-lg'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
              : highContrast
              ? 'bg-black text-white border-slate-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <Smile className="w-6 h-6" />
          <span>Daily Check-In</span>
          {todayCheckedIn && <CheckCircle2 className="w-5 h-5 text-emerald-300 ml-1" />}
        </button>

        <button
          onClick={() => setActiveTab('exercises')}
          className={`min-h-[58px] px-6 py-3 rounded-2xl font-black text-lg sm:text-xl border-3 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'exercises'
              ? highContrast
                ? 'bg-yellow-400 text-black border-white shadow-lg'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
              : highContrast
              ? 'bg-black text-white border-slate-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <Activity className="w-6 h-6" />
          <span>Fall Prevention Exercises</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`min-h-[58px] px-6 py-3 rounded-2xl font-black text-lg sm:text-xl border-3 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? highContrast
                ? 'bg-yellow-400 text-black border-white shadow-lg'
                : 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
              : highContrast
              ? 'bg-black text-white border-slate-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <Calendar className="w-6 h-6" />
          <span>Weekly Trends</span>
        </button>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start gap-3">
        <Info className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-base sm:text-lg font-medium leading-snug">
          <strong>Important Wellness Notice:</strong> {t('disclaimerMedical')} Always consult your physician or healthcare specialist before starting new physical movements or if experiencing persistent pain or dizziness.
        </p>
      </div>

      {/* TAB 1: DAILY CHECK-IN QUESTIONNAIRE */}
      {activeTab === 'checkin' && (
        <form
          onSubmit={handleSubmitCheckIn}
          className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-8 ${
            highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
          }`}
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-300">
              Daily Health & Routine Check-in
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium mt-1">
              Takes just 1 minute to record how your body and mind are feeling today.
            </p>
          </div>

          {/* Question 1: How are you feeling today? */}
          <div className="space-y-3">
            <label className="block text-xl sm:text-2xl font-extrabold">
              1. How are you feeling today? (आज आपकी तबीयत कैसी है?)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: 'great', emoji: '😊', label: 'Great / बहुत बढ़िया' },
                { key: 'good', emoji: '🙂', label: 'Good / अच्छा' },
                { key: 'okay', emoji: '😐', label: 'Okay / ठीक-ठाक' },
                { key: 'tired', emoji: '😟', label: 'Tired / थकान' },
                { key: 'pain', emoji: '😣', label: 'In Pain / दर्द' },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMood(item.key as any)}
                  className={`min-h-[80px] p-3 rounded-2xl border-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    mood === item.key
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-white ring-4 ring-yellow-300'
                        : 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-4 ring-emerald-300 scale-105'
                      : highContrast
                      ? 'bg-slate-900 text-white border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50'
                  }`}
                  aria-pressed={mood === item.key}
                >
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-sm font-extrabold text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: How did you sleep? */}
          <div className="space-y-3">
            <label className="block text-xl sm:text-2xl font-extrabold">
              2. How was your sleep last night? (रात को नींद कैसी रही?)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'deep',
                  emoji: '😴',
                  title: 'Deep & Restful',
                  desc: 'Slept soundly with no disturbances',
                },
                {
                  key: 'adequate',
                  emoji: '🛌',
                  title: 'Adequate',
                  desc: 'Woke up once or twice, feel fine',
                },
                {
                  key: 'restless',
                  emoji: '🥱',
                  title: 'Restless',
                  desc: 'Woke up frequently or had trouble sleeping',
                },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSleepQuality(item.key as any)}
                  className={`min-h-[74px] p-4 rounded-2xl border-3 flex items-center gap-3 transition-all cursor-pointer text-left ${
                    sleepQuality === item.key
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-white ring-4 ring-yellow-300'
                        : 'bg-emerald-100 border-emerald-600 text-emerald-950 ring-4 ring-emerald-300'
                      : highContrast
                      ? 'bg-slate-900 text-white border-slate-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-emerald-50'
                  }`}
                  aria-pressed={sleepQuality === item.key}
                >
                  <span className="text-3xl flex-shrink-0">{item.emoji}</span>
                  <div>
                    <div className="font-extrabold text-lg">{item.title}</div>
                    <div className="text-xs font-semibold opacity-80">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Physical Discomfort */}
          <div className="space-y-3">
            <label className="block text-xl sm:text-2xl font-extrabold">
              3. Are you experiencing any physical discomfort? (क्या कोई शारीरिक परेशानी है?)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'None (Feeling comfortable)',
                'Knee / Joint stiffness',
                'Lower back ache',
                'Shoulder or neck pain',
                'Dizziness or lightheadedness',
                'Foot swelling / Ankle discomfort',
              ].map((item) => {
                const isSelected = selectedDiscomforts.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleDiscomfortToggle(item)}
                    className={`min-h-[64px] p-4 rounded-2xl border-3 flex items-center justify-between transition-all cursor-pointer text-left ${
                      isSelected
                        ? highContrast
                          ? 'bg-yellow-400 text-black border-white'
                          : 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                        : highContrast
                        ? 'bg-slate-900 text-white border-slate-700'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-extrabold text-base sm:text-lg">{item}</span>
                    <div
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                        isSelected ? 'bg-white text-emerald-700' : 'border-slate-400'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 font-extrabold text-lg flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[68px] px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-black text-2xl shadow-xl shadow-emerald-600/30 border-2 border-emerald-400 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Smile className="w-8 h-8" />
            <span>{isSubmitting ? 'Saving...' : 'Save Daily Check-in'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: FALL PREVENTION & EXERCISES */}
      {activeTab === 'exercises' && (
        <div className="space-y-6">
          {/* Home Safety Tips */}
          <div
            className={`p-6 rounded-3xl border-3 shadow-md ${
              highContrast ? 'bg-black text-white border-yellow-400' : 'bg-amber-50 border-amber-300'
            }`}
          >
            <h4 className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-200 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-amber-600" />
              <span>Elderly Fall Prevention & Home Safety Checklist</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base sm:text-lg font-medium text-slate-800 dark:text-slate-200">
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>Remove loose floor rugs or tape them firmly down.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>Keep a low night-light plugged in along the path to the bathroom.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>Wear non-skid slippers with firm rubber soles at home.</span>
              </div>
              <div className="flex items-start gap-2">
                <span>✅</span>
                <span>Install strong grab bars near the shower and toilet.</span>
              </div>
            </div>
          </div>

          {/* Exercises List */}
          <div className="space-y-6">
            {exercises.map((ex) => {
              const isCompleted = exerciseLogs.some(
                (l) => l.exerciseId === ex.id && l.date === todayStr && l.completed
              );

              return (
                <div
                  key={ex.id}
                  className={`rounded-3xl p-6 sm:p-7 border-4 shadow-lg transition-all ${
                    highContrast
                      ? 'bg-black text-white border-yellow-400'
                      : isCompleted
                      ? 'bg-emerald-50/70 border-emerald-400'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0">
                        <Activity className="w-8 h-8" />
                      </div>
                      <div>
                        <h4 className="text-2xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-300">
                          {getExerciseTitle(ex)}
                        </h4>
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                          Duration: {ex.durationMinutes} Minutes • Chair Supported
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleExercise(ex.id)}
                      className={`min-h-[56px] px-6 py-3 rounded-2xl font-black text-lg flex items-center gap-2.5 transition-all cursor-pointer border-2 ${
                        isCompleted
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                          : 'bg-slate-100 hover:bg-emerald-100 text-slate-800 border-slate-300'
                      }`}
                      aria-pressed={isCompleted}
                    >
                      <CheckCircle2 className={`w-6 h-6 ${isCompleted ? 'text-white' : 'text-slate-400'}`} />
                      <span>{isCompleted ? 'Completed Today' : 'Mark Complete'}</span>
                    </button>
                  </div>

                  <p className="text-lg sm:text-xl font-medium text-slate-700 dark:text-slate-200 mb-4 leading-relaxed">
                    {getExerciseDesc(ex)}
                  </p>

                  {/* Step by step Instructions */}
                  <div className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700">
                    <div className="font-extrabold text-base sm:text-lg mb-2 text-slate-900 dark:text-white">
                      Step-by-Step Instructions:
                    </div>
                    <ol className="space-y-2 list-decimal list-inside text-base sm:text-lg text-slate-800 dark:text-slate-300 font-medium">
                      {getExerciseSteps(ex).map((st, i) => (
                        <li key={i}>{st}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Safety Tip & Read Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-amber-950 dark:text-amber-200 text-sm sm:text-base font-semibold">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      <span>Safety Precaution: {getExerciseSafety(ex)}</span>
                    </div>

                    <button
                      onClick={() =>
                        speechEngine.speak(
                          `${getExerciseTitle(ex)}. ${getExerciseDesc(ex)}. Safety note: ${getExerciseSafety(ex)}`,
                          language,
                          speechRate
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-black text-slate-800 dark:text-white border border-slate-300 flex items-center gap-1.5 text-sm font-bold cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-600" />
                      <span>Listen</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: WEEKLY TRENDS & HISTORY */}
      {activeTab === 'history' && (
        <div
          className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-6 ${
            highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
          }`}
        >
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 dark:text-emerald-300">
              Wellness Trend History
            </h3>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium mt-1">
              Recorded observations of your daily comfort and rest pattern. (Non-diagnostic).
            </p>
          </div>

          <div className="divide-y divide-slate-200">
            {history.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xl font-bold">
                No check-ins recorded yet. Complete your first check-in above!
              </div>
            ) : (
              history.map((record) => (
                <div key={record.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-xl flex items-center gap-2">
                      <span>Date: {record.date}</span>
                      <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800">
                        {record.timestamp}
                      </span>
                    </div>
                    <div className="text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
                      Mood: <strong className="capitalize">{record.mood}</strong> • Sleep:{' '}
                      <strong className="capitalize">{record.sleepQuality}</strong>
                    </div>
                    <div className="text-sm font-medium text-slate-500 mt-0.5">
                      Reported Discomfort: {record.physicalDiscomfort.join(', ')}
                    </div>
                  </div>
                  <div className="text-3xl">
                    {record.mood === 'great'
                      ? '😊'
                      : record.mood === 'good'
                      ? '🙂'
                      : record.mood === 'okay'
                      ? '😐'
                      : record.mood === 'tired'
                      ? '😟'
                      : '😣'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
