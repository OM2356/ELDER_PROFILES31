import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DigitalCourse } from '../../types';
import { speechEngine } from '../../utils/speech';
import {
  GraduationCap,
  Smartphone,
  MessageCircle,
  Video,
  Camera,
  Mail,
  CreditCard,
  Lock,
  Globe,
  CheckCircle2,
  Volume2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  PlayCircle,
  Check,
  Award,
  Printer,
  X,
} from 'lucide-react';

export const DigitalEducation: React.FC = () => {
  const { user, language, speechRate, setCurrentTab, t, highContrast } = useApp();

  const [courses, setCourses] = useState<DigitalCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<DigitalCourse | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activePracticeModal, setActivePracticeModal] = useState<boolean>(false);
  const [practiceStep, setPracticeStep] = useState<number>(0);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  useEffect(() => {
    loadCourseData();
  }, []);

  const loadCourseData = async () => {
    try {
      const [coursesList, progress] = await Promise.all([
        api.getCourses(),
        api.getLearningProgress(),
      ]);
      setCourses(coursesList);
      if (coursesList.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesList[0]);
      }
      setCompletedLessons(progress.completedLessons || []);
    } catch {
      // fallback
    }
  };

  const handleToggleLesson = async (courseId: string, lessonId: string) => {
    const isCompleted = completedLessons.includes(lessonId);
    try {
      const res = await api.toggleLessonProgress(courseId, lessonId, !isCompleted);
      setCompletedLessons(res.completedLessons);

      if (!isCompleted) {
        const msg =
          language === 'hi'
            ? 'बहुत बढ़िया! आपने यह पाठ सफलतापूर्वक पूरा किया।'
            : language === 'mr'
            ? 'छान! आपण हा धडा यशस्वीरीत्या पूर्ण केला.'
            : 'Excellent work! Lesson marked as mastered.';
        speechEngine.speak(msg, language, speechRate);
      }
    } catch {
      // ignore
    }
  };

  const getCourseTitle = (c: DigitalCourse) => {
    if (language === 'hi') return c.titleHi;
    if (language === 'mr') return c.titleMr;
    return c.titleEn;
  };

  const getCourseSummary = (c: DigitalCourse) => {
    if (language === 'hi') return c.summaryHi;
    if (language === 'mr') return c.summaryMr;
    return c.summaryEn;
  };

  const getLessonTitle = (lesson: any) => {
    if (language === 'hi') return lesson.titleHi;
    if (language === 'mr') return lesson.titleMr;
    return lesson.titleEn;
  };

  const getLessonInstruction = (lesson: any) => {
    if (language === 'hi') return lesson.instructionHi;
    if (language === 'mr') return lesson.instructionMr;
    return lesson.instructionEn;
  };

  const getLessonTip = (lesson: any) => {
    if (language === 'hi') return lesson.tipHi;
    if (language === 'mr') return lesson.tipMr;
    return lesson.tipEn;
  };

  const getPracticeTask = (c: DigitalCourse) => {
    if (language === 'hi') return c.practiceTaskHi;
    if (language === 'mr') return c.practiceTaskMr;
    return c.practiceTaskEn;
  };

  const getCourseIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-8 h-8" />;
      case 'MessageCircle':
        return <MessageCircle className="w-8 h-8" />;
      case 'Camera':
        return <Camera className="w-8 h-8" />;
      case 'Video':
        return <Video className="w-8 h-8" />;
      case 'CreditCard':
        return <CreditCard className="w-8 h-8" />;
      case 'Lock':
        return <Lock className="w-8 h-8" />;
      default:
        return <GraduationCap className="w-8 h-8" />;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-gradient-to-r from-purple-700 to-indigo-800 text-white border-purple-500 shadow-purple-600/20'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            <GraduationCap className="w-4 h-4 text-purple-200" />
            <span>Elderly Digital Academy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            {t('digitalHub')}
          </h2>
          <p className="text-lg sm:text-xl font-medium opacity-90 max-w-2xl">
            Learn smartphones, WhatsApp, photo sharing, and UPI safety in plain words with patience. No rushing, no complicated tech terms!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowCertificateModal(true)}
            className="min-h-[64px] px-5 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-lg flex items-center gap-2.5 shadow-xl flex-shrink-0 cursor-pointer"
            title="View & Print your Digital Literacy Certificate"
          >
            <Award className="w-6 h-6 text-amber-900" />
            <span>Digital Certificate</span>
          </button>

          <button
            onClick={() => {
              sessionStorage.setItem(
                'buddy_pending_prompt',
                'Please teach me step-by-step how to use my smartphone with ease.'
              );
              setCurrentTab('chat');
            }}
            className="min-h-[64px] px-6 py-4 rounded-2xl bg-white text-purple-900 hover:bg-purple-50 font-black text-lg flex items-center gap-3 shadow-xl flex-shrink-0 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>Ask Digital AI Mentor</span>
          </button>
        </div>
      </section>

      {/* Main Course Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course List Navigation (Left Column) */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold uppercase tracking-wider text-slate-500 px-1">
            Available Courses ({courses.length})
          </h3>
          <div className="space-y-2.5">
            {courses.map((course) => {
              const isSelected = selectedCourse?.id === course.id;
              const courseLessons = course.lessons.map((l) => l.id);
              const completedInCourse = courseLessons.filter((id) =>
                completedLessons.includes(id)
              ).length;
              const isAllDone =
                courseLessons.length > 0 && completedInCourse === courseLessons.length;

              return (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  className={`w-full p-4 rounded-2xl border-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-white shadow-lg'
                        : 'bg-purple-100 border-purple-600 text-purple-950 ring-2 ring-purple-400 scale-[1.01]'
                      : highContrast
                      ? 'bg-black text-white border-slate-700'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-purple-50/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {getCourseIcon(course.iconName)}
                    </div>
                    <div>
                      <div className="font-extrabold text-lg leading-snug">
                        {getCourseTitle(course)}
                      </div>
                      <div className="text-xs font-semibold opacity-75">
                        {completedInCourse} / {course.lessons.length} Lessons Finished
                      </div>
                    </div>
                  </div>
                  {isAllDone && <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Course Content & Lessons (Right Column) */}
        {selectedCourse && (
          <div
            className={`lg:col-span-2 rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-6 ${
              highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-slate-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                  {selectedCourse.category}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black mt-2 text-purple-950 dark:text-purple-300">
                  {getCourseTitle(selectedCourse)}
                </h3>
                <p className="text-base sm:text-lg font-medium text-slate-600 dark:text-slate-300 mt-1">
                  {getCourseSummary(selectedCourse)}
                </p>
              </div>

              {/* Practice Drill Trigger Button */}
              <button
                onClick={() => {
                  setPracticeStep(0);
                  setPracticeCompleted(false);
                  setActivePracticeModal(true);
                }}
                className="min-h-[56px] px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg flex items-center gap-2 shadow-md flex-shrink-0 cursor-pointer"
              >
                <PlayCircle className="w-6 h-6" />
                <span>Practice Simulation</span>
              </button>
            </div>

            {/* Lessons Step-By-Step */}
            <div className="space-y-4">
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                Lessons in this module:
              </h4>

              {selectedCourse.lessons.map((lesson, idx) => {
                const isLessonDone = completedLessons.includes(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className={`p-5 rounded-2xl border-3 transition-all ${
                      highContrast
                        ? 'bg-slate-900 text-white border-slate-700'
                        : isLessonDone
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-purple-600 text-white font-black flex items-center justify-center text-lg">
                          {idx + 1}
                        </span>
                        <h5 className="text-xl sm:text-2xl font-extrabold">
                          {getLessonTitle(lesson)}
                        </h5>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Audio Narration Button */}
                        <button
                          onClick={() =>
                            speechEngine.speak(
                              `${getLessonTitle(lesson)}. Instructions: ${getLessonInstruction(
                                lesson
                              )}. Helpful tip: ${getLessonTip(lesson)}`,
                              language,
                              speechRate
                            )
                          }
                          className="min-h-[46px] px-3.5 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-sm font-bold flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer"
                        >
                          <Volume2 className="w-4 h-4 text-purple-600" />
                          <span>Listen</span>
                        </button>

                        {/* Completed Checkbox */}
                        <button
                          onClick={() => handleToggleLesson(selectedCourse.id, lesson.id)}
                          className={`min-h-[46px] px-4 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5 cursor-pointer border ${
                            isLessonDone
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-slate-200 text-slate-700 hover:bg-emerald-100 border-slate-300'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{isLessonDone ? 'Mastered' : 'Mark Done'}</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
                      {getLessonInstruction(lesson)}
                    </p>

                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-purple-950 dark:text-purple-200 text-base font-semibold flex items-center gap-2">
                      <span className="text-lg">💡</span>
                      <span>Golden Tip: {getLessonTip(lesson)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Practice Simulation Modal */}
      {activePracticeModal && selectedCourse && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className={`w-full max-w-xl rounded-3xl p-6 sm:p-8 border-4 shadow-2xl space-y-6 ${
              highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white text-slate-900 border-purple-500'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-7 h-7 text-emerald-600" />
                <h3 className="text-2xl font-black">Interactive Practice Screen</h3>
              </div>
              <button
                onClick={() => setActivePracticeModal(false)}
                className="text-slate-500 hover:text-slate-900 font-bold text-xl px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 text-purple-950 font-bold text-lg border-2 border-purple-200">
              Task: {getPracticeTask(selectedCourse)}
            </div>

            {/* Simulated Phone Screen Interface */}
            <div className="border-4 border-slate-800 rounded-3xl p-4 bg-slate-900 text-white min-h-[260px] flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>9:41 AM</span>
                <span>Buddy Practice Simulator 📱</span>
                <span>100% 🔋</span>
              </div>

              {!practiceCompleted ? (
                <div className="text-center py-6 space-y-4">
                  <p className="text-lg font-semibold text-slate-200">
                    Step {practiceStep + 1} of 2:
                  </p>
                  <p className="text-xl font-bold text-amber-300">
                    {practiceStep === 0
                      ? 'Tap the Camera / Action button below to take a picture:'
                      : 'Now tap "Confirm & Send to Grandson":'}
                  </p>

                  <div className="flex justify-center pt-2">
                    {practiceStep === 0 ? (
                      <button
                        onClick={() => setPracticeStep(1)}
                        className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg transform active:scale-90 transition-transform cursor-pointer"
                        aria-label="Practice tap camera"
                      >
                        <Camera className="w-10 h-10" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setPracticeCompleted(true);
                          speechEngine.speak(
                            'Splendid! You completed the practice drill successfully.',
                            language,
                            speechRate
                          );
                        }}
                        className="px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl flex items-center gap-3 shadow-lg cursor-pointer"
                      >
                        <CheckCircle2 className="w-7 h-7" />
                        <span>Confirm & Send Photo</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="text-5xl">🎉</div>
                  <h4 className="text-2xl font-black text-emerald-400">
                    Practice Drill Accomplished!
                  </h4>
                  <p className="text-base text-slate-300 font-medium">
                    You did it! Now you can comfortably perform this on your real smartphone without any worry.
                  </p>
                </div>
              )}

              <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                Safe Simulator • No real messages or charges
              </div>
            </div>

            <button
              onClick={() => setActivePracticeModal(false)}
              className="w-full min-h-[56px] rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xl cursor-pointer"
            >
              Done & Close Simulator
            </button>
          </div>
        </div>
      )}

      {/* Certificate of Achievement Modal */}
      {showCertificateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-amber-50 p-6 sm:p-10 shadow-2xl border-8 border-amber-500 text-slate-900 relative">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-amber-100 cursor-pointer print:hidden"
              aria-label="Close certificate"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Printable Certificate Content */}
            <div className="text-center space-y-4 border-4 border-dashed border-amber-300 p-6 sm:p-8 rounded-2xl bg-white">
              <div className="w-20 h-20 mx-auto rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg">
                <Award className="w-12 h-12" />
              </div>

              <div className="text-xs uppercase tracking-widest font-black text-amber-800">
                Official Recognition of Accomplishment
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Certificate of Digital Literacy
              </h2>

              <p className="text-base text-slate-600 font-semibold italic">
                This certificate proudly honors and recognizes
              </p>

              <div className="text-3xl sm:text-4xl font-black text-amber-700 underline decoration-amber-400 underline-offset-8 py-2">
                {user?.name || 'Ramesh Sharma'}
              </div>

              <p className="text-base sm:text-lg text-slate-700 font-medium max-w-lg mx-auto">
                for demonstrating exceptional dedication, patience, and success in mastering digital smartphone tools, safe WhatsApp communication, and online safety.
              </p>

              <div className="pt-6 border-t-2 border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-500">
                <div>
                  <div className="text-slate-900 font-black text-sm">Buddy Elder AI Academy</div>
                  <div>Issued with Compassion & Care</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-800 font-black text-sm">★ VERIFIED MASTER ★</div>
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg shadow-md cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>Print Certificate</span>
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-6 py-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
