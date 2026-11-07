import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Language, UserProfile } from '../../types';
import { speechEngine } from '../../utils/speech';
import {
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Sparkles,
  Shield,
  Type,
  Users,
  Award,
  Globe,
  X,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const {
    user,
    onboardingModalOpen,
    setOnboardingModalOpen,
    completeOnboarding,
    language,
    setLanguage,
    fontSize,
    setFontSize,
    speechRate,
    setSpeechRate,
    highContrast,
  } = useApp();

  const [step, setStep] = useState<number>(1);
  const [seniorName, setSeniorName] = useState<string>(user?.name || 'Ramesh Sharma');
  const [nickname, setNickname] = useState<string>('Uncle / Baba');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([
    'Devotional Music & Bhajans',
    'Morning Garden Walks',
    'Old Bollywood Songs',
  ]);
  const [emergencyName, setEmergencyName] = useState<string>('Priya Sharma (Daughter)');
  const [emergencyPhone, setEmergencyPhone] = useState<string>('+91 98765 43210');
  const [shareWellness, setShareWellness] = useState<boolean>(true);
  const [enableMemory, setEnableMemory] = useState<boolean>(true);

  if (!onboardingModalOpen) return null;

  const totalSteps = 9;

  const HOBBY_OPTIONS = [
    { id: 'bhajans', label: 'Spiritual & Bhajans (भजन / कीर्तन)', icon: '🕉️' },
    { id: 'walks', label: 'Morning Nature Walks (सकाळची चाल)', icon: '🌳' },
    { id: 'music', label: 'Old Melodies & Songs (जुनी गाणी)', icon: '📻' },
    { id: 'gardening', label: 'Gardening & Flowers (बागकाम)', icon: '🌸' },
    { id: 'cooking', label: 'Traditional Cooking & Tea (पाककला)', icon: '☕' },
    { id: 'reading', label: 'Newspapers & Reading (वाचन)', icon: '📰' },
    { id: 'grandchildren', label: 'Stories with Grandchildren (नातवंडे)', icon: '👶' },
    { id: 'yoga', label: 'Gentle Yoga & Meditation (योग)', icon: '🧘' },
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    const updatedData: Partial<UserProfile> = {
      name: seniorName,
      language,
      fontSize,
      preferredSpeechRate: speechRate,
      onboardingCompleted: true,
      emergencyContacts: [
        {
          id: 'contact_1',
          name: emergencyName,
          relation: 'Primary Caregiver',
          phone: emergencyPhone,
          isPrimaryCaregiver: true,
        },
      ],
      privacySettings: {
        shareWellnessWithCaregiver: shareWellness,
        shareExercisesWithCaregiver: true,
        shareLearningProgress: true,
        allowEmergencyLocation: true,
        enableLongTermMemory: enableMemory,
      },
    };
    await completeOnboarding(updatedData);
  };

  const playVoicePreview = () => {
    const msg =
      language === 'hi'
        ? `नमस्ते ${seniorName || 'जी'}, मैं बडी हूँ। आपका हमेशा ख्याल रखूँगा।`
        : language === 'mr'
        ? `नमस्कार ${seniorName || 'काका'}, मी बडी आहे. मी नेहमी आपल्या सोबत आहे.`
        : `Hello ${seniorName || 'friend'}, I am Buddy! I am delighted to be with you every day.`;
    speechEngine.speak(msg, language, speechRate);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-step-title"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-10 shadow-2xl border-4 transition-all my-auto ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : 'bg-white text-slate-900 border-amber-400'
        }`}
      >
        {/* Progress bar and skip button */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-amber-200">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black mb-1.5 text-amber-700 dark:text-amber-400">
              <span>
                Step {step} of {totalSteps}
              </span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setOnboardingModalOpen(false)}
            className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer"
            title="Skip for now"
          >
            Skip for now
          </button>
        </div>

        {/* STEP CONTENT */}
        <div className="min-h-[340px] flex flex-col justify-center">
          {/* STEP 1: WELCOME */}
          {step === 1 && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-xl">
                <HeartHandshake className="w-12 h-12" />
              </div>
              <h2 id="onboarding-step-title" className="text-3xl sm:text-4xl font-black">
                {language === 'hi'
                  ? 'बडी एल्डर एआई में आपका स्वागत है!'
                  : language === 'mr'
                  ? 'बडी एल्डर एआय मध्ये आपले मनापासून स्वागत!'
                  : 'Welcome to Buddy Elder AI!'}
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-medium leading-relaxed">
                {language === 'hi'
                  ? 'हमारा उद्देश्य आपके जीवन को खुशहाल, सुरक्षित और आसान बनाना है। आइए आपके अनुसार सब कुछ तैयार करें!'
                  : language === 'mr'
                  ? 'आपले जीवन आनंदी, सुरक्षित आणि सुलभ करणे हाच आमचा ध्यास आहे. चला, फक्त २ मिनिटांत आपली रचना करूया!'
                  : 'We are here to keep you safe, bring joyful companionship, and help you stay connected with loved ones.'}
              </p>
            </div>
          )}

          {/* STEP 2: LANGUAGE SELECTION */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Globe className="w-8 h-8 text-amber-500" />
                <div>
                  <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                    Choose Your Preferred Language
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    आपली आवडती भाषा निवडा • अपनी पसंदीदा भाषा चुनें
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`p-6 rounded-2xl border-4 text-center cursor-pointer transition-all ${
                      language === lang
                        ? 'border-amber-500 bg-amber-100/70 shadow-lg scale-105'
                        : 'border-slate-200 hover:border-amber-300 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <span className="text-3xl font-black block mb-2">
                      {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                    </span>
                    <span className="text-sm font-semibold opacity-75">
                      {lang === 'en'
                        ? 'Voice & Interface'
                        : lang === 'hi'
                        ? 'आवाज़ व बातचीत'
                        : 'आवाज व संभाषण'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: NAME & NICKNAME */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                {language === 'hi'
                  ? 'हम आपको किस नाम से बुलाएं?'
                  : language === 'mr'
                  ? 'आम्ही आपल्याला कोणत्या नावाने हाक मारावी?'
                  : 'What Should Buddy Call You?'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-base sm:text-lg font-bold mb-2">
                    Full Name (संपूर्ण नाव)
                  </label>
                  <input
                    type="text"
                    value={seniorName}
                    onChange={(e) => setSeniorName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-amber-300 text-xl font-bold bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    placeholder="e.g. Ramesh Sharma"
                  />
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-bold mb-2">
                    Friendly Nickname / Title (उदा. बाबा / काका / Sharma ji)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-amber-300 text-xl font-bold bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    placeholder="e.g. Dada, Uncle, Sharma ji"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: HOBBIES & INTERESTS */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                {language === 'hi'
                  ? 'आपको क्या पसंद है? (शौक)'
                  : language === 'mr'
                  ? 'आपल्या आवडीनिवडी कोणत्या आहेत?'
                  : 'What Do You Enjoy? (Hobbies)'}
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-300">
                Buddy will share stories, music, and topics based on what brings you joy.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {HOBBY_OPTIONS.map((item) => {
                  const isChecked = selectedHobbies.includes(item.label);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isChecked) {
                          setSelectedHobbies(selectedHobbies.filter((h) => h !== item.label));
                        } else {
                          setSelectedHobbies([...selectedHobbies, item.label]);
                        }
                      }}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left font-bold text-sm sm:text-base cursor-pointer transition ${
                        isChecked
                          ? 'border-amber-500 bg-amber-100/70 text-amber-900'
                          : 'border-slate-200 bg-white dark:bg-zinc-900 text-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {isChecked && <CheckCircle2 className="w-6 h-6 text-amber-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: TEXT SIZE */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Type className="w-8 h-8 text-amber-500" />
                <div>
                  <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                    Choose Comfortable Text Size
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    Easily readable without straining your eyes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'standard', label: 'Standard', sample: 'Text size 18px' },
                  { id: 'large', label: 'Large (Recommended)', sample: 'Text size 22px' },
                  { id: 'extra-large', label: 'Extra Large', sample: 'Text size 26px' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setFontSize(s.id as any)}
                    className={`p-5 rounded-2xl border-4 text-center cursor-pointer transition ${
                      fontSize === s.id
                        ? 'border-amber-500 bg-amber-100/80 shadow-lg scale-105'
                        : 'border-slate-200 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <span className="font-extrabold text-lg block mb-2">{s.label}</span>
                    <span
                      className={`block font-bold ${
                        s.id === 'extra-large'
                          ? 'text-2xl'
                          : s.id === 'large'
                          ? 'text-xl'
                          : 'text-base'
                      }`}
                    >
                      {s.sample}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: VOICE SPEED & AUDIO PREVIEW */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Volume2 className="w-8 h-8 text-amber-500" />
                <div>
                  <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                    Voice Reading Speed
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    Listen to a test voice and pick what feels gentle and clear.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { rate: 0.75, label: 'Gentle & Calm (0.75x)' },
                  { rate: 0.85, label: 'Natural & Clear (0.85x)' },
                  { rate: 1.0, label: 'Standard Speed (1.0x)' },
                ].map((item) => (
                  <button
                    key={item.rate}
                    onClick={() => setSpeechRate(item.rate)}
                    className={`p-5 rounded-2xl border-4 text-center cursor-pointer transition ${
                      speechRate === item.rate
                        ? 'border-amber-500 bg-amber-100/80 shadow-lg'
                        : 'border-slate-200 bg-white dark:bg-zinc-900'
                    }`}
                  >
                    <span className="font-extrabold text-lg">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={playVoicePreview}
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-md cursor-pointer"
                >
                  <Volume2 className="w-6 h-6 animate-pulse" />
                  <span>Play Test Voice Now</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: EMERGENCY CONTACT SETUP */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-red-500" />
                <div>
                  <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                    Primary Family Contact
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    Who should receive instant alerts if you ever press Emergency SOS?
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-base sm:text-lg font-bold mb-2">
                    Caregiver Name & Relation
                  </label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-amber-300 text-xl font-bold bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    placeholder="e.g. Priya (Daughter)"
                  />
                </div>

                <div>
                  <label className="block text-base sm:text-lg font-bold mb-2">
                    Phone Number for SOS & WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-amber-300 text-xl font-bold bg-white dark:bg-zinc-900 text-slate-900 dark:text-white"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: PRIVACY & MEMORY CONSENT */}
          {step === 8 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-600" />
                <div>
                  <h2 id="onboarding-step-title" className="text-2xl sm:text-3xl font-black">
                    Your Privacy & Peace of Mind
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-300">
                    You have total control. We never sell or expose your private data.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 bg-white dark:bg-zinc-900">
                  <div>
                    <h4 className="text-lg font-extrabold">Share Wellness Status with Caregiver</h4>
                    <p className="text-sm text-slate-500">
                      Lets your daughter/son see that you completed today’s check-in.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={shareWellness}
                    onChange={(e) => setShareWellness(e.target.checked)}
                    className="w-7 h-7 text-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 bg-white dark:bg-zinc-900">
                  <div>
                    <h4 className="text-lg font-extrabold">Enable Buddy Long-Term Memory</h4>
                    <p className="text-sm text-slate-500">
                      Allows Buddy to remember your tea preferences and favorite stories.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableMemory}
                    onChange={(e) => setEnableMemory(e.target.checked)}
                    className="w-7 h-7 text-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: CELEBRATION & READY TO GO */}
          {step === 9 && (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xl animate-bounce">
                <Award className="w-14 h-14" />
              </div>
              <h2 id="onboarding-step-title" className="text-3xl sm:text-4xl font-black">
                {language === 'hi'
                  ? 'बधाई! आपकी व्यक्तिगत प्रोफ़ाइल तैयार है!'
                  : language === 'mr'
                  ? 'अभिनंदन! आपले वैयक्तिक प्रोफाईल तयार आहे!'
                  : 'Congratulations! You are Ready!'}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto font-semibold">
                {language === 'hi'
                  ? `बडी हमेशा आपकी सेवा में है, ${seniorName || 'जी'}। जब भी मन करे, माइक दबाकर बात करें!`
                  : language === 'mr'
                  ? `बडी नेहमी आपल्या मदतीसाठी तत्पर आहे, ${seniorName || 'काका'}. हवे तेव्हा माइक दाबून बोला!`
                  : `Buddy Elder is fully customized for you, ${seniorName || 'friend'}. Enjoy peaceful days with complete safety!`}
              </p>
            </div>
          )}
        </div>

        {/* BOTTOM NAVIGATION BUTTONS */}
        <div className="mt-8 pt-4 border-t-2 border-amber-200 flex items-center justify-between gap-4">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-base sm:text-lg cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg sm:text-xl shadow-lg shadow-amber-500/30 cursor-pointer transition transform active:scale-95"
          >
            <span>{step === totalSteps ? 'Finish & Start Exploring' : 'Continue'}</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
