import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { FeatureKey, FEATURE_EXPLANATIONS, FeatureExplanation } from '../utils/featureExplanations';
import { speechEngine } from '../utils/speech';
import {
  HelpCircle,
  Volume2,
  X,
  CheckCircle2,
  AlertTriangle,
  MessageSquareHeart,
  Activity,
  GraduationCap,
  ShieldAlert,
  Users,
  Eye,
  Type,
  Globe,
  UserCheck,
  Mic,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  BarChart3,
  Info,
} from 'lucide-react';

interface TooltipContextType {
  activeFeature: FeatureKey | null;
  customTooltip: { title: string; explanation: string } | null;
  showTooltip: (key: FeatureKey) => void;
  showCustomTooltip: (title: string, explanation: string) => void;
  closeTooltip: () => void;
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

export const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
};

// Map icon name to Lucide icon component
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle,
  MessageSquareHeart,
  Activity,
  GraduationCap,
  ShieldAlert,
  Users,
  Eye,
  Type,
  Globe,
  UserCheck,
  Mic,
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  BarChart3,
};

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, speechRate, highContrast } = useApp();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [customTooltip, setCustomTooltip] = useState<{ title: string; explanation: string } | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const showTooltip = (key: FeatureKey) => {
    // Subtle haptic feedback if available
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {
        // ignore
      }
    }
    setCustomTooltip(null);
    setActiveFeature(key);
  };

  const showCustomTooltip = (title: string, explanation: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(50);
      } catch {
        // ignore
      }
    }
    setActiveFeature(null);
    setCustomTooltip({ title, explanation });
  };

  const closeTooltip = () => {
    speechEngine.stop();
    setIsPlayingAudio(false);
    setActiveFeature(null);
    setCustomTooltip(null);
  };

  // Keyboard navigation: Escape key closes tooltip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (activeFeature || customTooltip)) {
        closeTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFeature, customTooltip]);

  // Focus close button on open
  useEffect(() => {
    if (activeFeature || customTooltip) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [activeFeature, customTooltip]);

  const currentItem: { title: string; explanation: string; IconComponent: React.ComponentType<{ className?: string }> } | null =
    activeFeature && FEATURE_EXPLANATIONS[activeFeature]
      ? {
          title: FEATURE_EXPLANATIONS[activeFeature].title[language] || FEATURE_EXPLANATIONS[activeFeature].title.en,
          explanation: FEATURE_EXPLANATIONS[activeFeature].explanation[language] || FEATURE_EXPLANATIONS[activeFeature].explanation.en,
          IconComponent: ICON_MAP[FEATURE_EXPLANATIONS[activeFeature].iconName] || Info,
        }
      : customTooltip
      ? {
          title: customTooltip.title,
          explanation: customTooltip.explanation,
          IconComponent: Info,
        }
      : null;

  const handleSpeakExplanation = () => {
    if (!currentItem) return;

    if (isPlayingAudio) {
      speechEngine.stop();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = `${currentItem.title}. ${currentItem.explanation}`;
    speechEngine.speak(
      textToRead,
      language,
      speechRate,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false),
      () => setIsPlayingAudio(false)
    );
  };

  const getGotItLabel = () => {
    if (language === 'hi') return 'समझ गया, धन्यवाद';
    if (language === 'mr') return 'समजले, धन्यवाद';
    return 'Got it, thank you';
  };

  const getListenLabel = () => {
    if (isPlayingAudio) {
      if (language === 'hi') return 'रोकें';
      if (language === 'mr') return 'थांबवा';
      return 'Stop Voice';
    }
    if (language === 'hi') return 'आवाज़ में सुनें';
    if (language === 'mr') return 'मोठ्याने ऐका';
    return 'Listen Aloud';
  };

  return (
    <TooltipContext.Provider
      value={{
        activeFeature,
        customTooltip,
        showTooltip,
        showCustomTooltip,
        closeTooltip,
      }}
    >
      {children}

      {/* Accessible Elderly Tooltip Dialog */}
      {currentItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="elder-tooltip-title"
          aria-describedby="elder-tooltip-desc"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeTooltip();
          }}
        >
          <div
            ref={dialogRef}
            className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border-4 transition-all transform scale-100 ${
              highContrast
                ? 'bg-black text-white border-amber-400 ring-4 ring-amber-300'
                : 'bg-white text-slate-900 border-amber-500 ring-4 ring-amber-200'
            }`}
          >
            {/* Header: Icon + Title + Close Button */}
            <div className="flex items-start justify-between gap-4 border-b-2 pb-4 mb-5 border-amber-200 dark:border-amber-400">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 ${
                    highContrast
                      ? 'bg-amber-400 text-black'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  <currentItem.IconComponent className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    {language === 'hi'
                      ? 'सुविधा जानकारी'
                      : language === 'mr'
                      ? 'सुविधेची माहिती'
                      : 'Feature Guide'}
                  </div>
                  <h3
                    id="elder-tooltip-title"
                    className="text-2xl sm:text-3xl font-black tracking-tight"
                  >
                    {currentItem.title}
                  </h3>
                </div>
              </div>

              <button
                ref={closeButtonRef}
                onClick={closeTooltip}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 min-h-[50px] min-w-[50px] flex items-center justify-center border-2 border-slate-300 dark:border-slate-600 cursor-pointer transition-colors"
                aria-label="Close feature explanation"
              >
                <X className="w-7 h-7" />
              </button>
            </div>

            {/* Simple 1-Sentence Explanation (Minimum 20px readable font) */}
            <div className="mb-6 space-y-3">
              <p
                id="elder-tooltip-desc"
                className="text-xl sm:text-2xl font-bold leading-relaxed text-slate-800 dark:text-slate-100"
              >
                {currentItem.explanation}
              </p>

              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>
                  {language === 'hi'
                    ? 'सुझाव: किसी भी बटन को दबाए रखने पर यह जानकारी दोबारा दिखाई देगी।'
                    : language === 'mr'
                    ? 'टीप: कोणत्याही बटणावर थोडे दाबून ठेवल्यास ही माहिती पुन्हा दिसेल.'
                    : 'Tip: You can press and hold any feature button anytime to hear what it does.'}
                </span>
              </div>
            </div>

            {/* Actions: Listen Aloud & Got It */}
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {/* Voice Read Aloud Button */}
              <button
                onClick={handleSpeakExplanation}
                className={`min-h-[60px] px-5 py-3.5 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer border-2 ${
                  isPlayingAudio
                    ? 'bg-amber-600 text-white border-amber-700 animate-pulse'
                    : highContrast
                    ? 'bg-black text-amber-300 border-amber-400 hover:bg-amber-950'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                }`}
                aria-label={getListenLabel()}
              >
                <Volume2 className="w-6 h-6" />
                <span>{getListenLabel()}</span>
              </button>

              {/* Got It Button (Min 60px height) */}
              <button
                onClick={closeTooltip}
                className={`flex-1 min-h-[60px] px-6 py-3.5 rounded-2xl font-black text-xl flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer border-2 ${
                  highContrast
                    ? 'bg-amber-400 text-black border-white hover:bg-amber-300'
                    : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border-amber-600'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>{getGotItLabel()}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </TooltipContext.Provider>
  );
};
