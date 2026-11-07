import React from 'react';
import { useApp } from '../../context/AppContext';
import { Language } from '../../types';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureInfoButton, useLongPress } from './AccessibleTooltip';
import {
  AlertTriangle,
  Eye,
  Type,
  UserCheck,
  HeartHandshake,
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { PWAInstallButton } from './PWAInstallButton';

export const Header: React.FC = () => {
  const {
    user,
    role,
    language,
    setLanguage,
    highContrast,
    toggleHighContrast,
    fontSize,
    setFontSize,
    switchRole,
    triggerEmergency,
    t,
  } = useApp();

  const { showTooltip } = useTooltip();

  const sosLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('sos_emergency'),
  });

  const contrastLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('high_contrast'),
  });

  const fontLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('font_size'),
  });

  const roleLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('role_switch'),
  });

  const handleNextFontSize = () => {
    if (fontSize === 'standard') setFontSize('large');
    else if (fontSize === 'large') setFontSize('extra-large');
    else setFontSize('standard');
  };

  const getFontLabel = () => {
    if (fontSize === 'standard') return 'A';
    if (fontSize === 'large') return 'A+';
    return 'A++';
  };

  return (
    <header
      role="banner"
      className={`sticky top-0 z-40 transition-colors shadow-md border-b-4 ${
        highContrast
          ? 'bg-black border-amber-400 text-white'
          : 'bg-white/95 backdrop-blur-md border-amber-500 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
              <span>{t('appTitle')}</span>
              {role === 'caregiver' && (
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full border border-purple-300">
                  Caregiver
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-medium opacity-80 hidden md:block">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Quick Accessibility Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Emergency SOS Button with Long-Press & Info Icon */}
          <div className="relative inline-flex items-center">
            <button
              onClick={() => triggerEmergency('Direct SOS button pressed')}
              {...sosLongPress}
              className="flex items-center gap-2 pl-4 pr-3 py-3 min-h-[56px] rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold shadow-lg shadow-red-500/30 transform active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-red-400 border-2 border-red-300 cursor-pointer"
              aria-label="Emergency SOS call 112. Long press or tap info for explanation."
            >
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <span className="text-base sm:text-lg tracking-wide uppercase font-black">
                {t('sosButton')}
              </span>
            </button>
            <div className="ml-1">
              <FeatureInfoButton featureKey="sos_emergency" size="sm" variant="contrast" />
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center rounded-xl bg-amber-50 p-1 border-2 border-amber-300 text-slate-800">
            {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`min-h-[46px] px-3 sm:px-4 py-1.5 rounded-lg font-bold text-sm sm:text-base transition-all ${
                  language === lang
                    ? 'bg-amber-500 text-white shadow'
                    : 'text-slate-700 hover:bg-amber-100'
                }`}
                aria-label={`Select language ${lang}`}
              >
                {lang === 'en' ? 'ENG' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </button>
            ))}
          </div>

          {/* High Contrast Toggle */}
          <div className="inline-flex items-center gap-1">
            <button
              onClick={toggleHighContrast}
              {...contrastLongPress}
              className={`min-h-[50px] min-w-[50px] px-3 py-2 rounded-xl border-2 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                highContrast
                  ? 'bg-amber-400 text-black border-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
              title="Toggle High Contrast Mode (Press and hold for explanation)"
              aria-label="Toggle High Contrast"
            >
              <Eye className="w-5 h-5" />
              <span className="hidden lg:inline text-sm">{highContrast ? 'Normal' : 'Contrast'}</span>
            </button>
            <FeatureInfoButton featureKey="high_contrast" size="sm" />
          </div>

          {/* Font Size Toggle */}
          <div className="inline-flex items-center gap-1">
            <button
              onClick={handleNextFontSize}
              {...fontLongPress}
              className="min-h-[50px] min-w-[50px] px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border-2 border-slate-300 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Adjust Font Size (Press and hold for explanation)"
              aria-label={`Current font size ${fontSize}, click to enlarge`}
            >
              <Type className="w-5 h-5 text-amber-700" />
              <span className="font-extrabold text-sm">{getFontLabel()}</span>
            </button>
            <FeatureInfoButton featureKey="font_size" size="sm" />
          </div>

          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Smart Notification Center */}
          <NotificationCenter />

          {/* Role Mode Switcher (Senior / Caregiver / Admin) */}
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => {
                if (role === 'senior') switchRole('caregiver');
                else if (role === 'caregiver') switchRole('admin');
                else switchRole('senior');
              }}
              {...roleLongPress}
              className={`min-h-[50px] px-3.5 py-2 rounded-xl border-2 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${
                role === 'admin'
                  ? 'bg-indigo-700 text-white border-indigo-900 shadow-md'
                  : role === 'caregiver'
                  ? 'bg-purple-700 text-white border-purple-900 shadow-md'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-400 hover:bg-emerald-100'
              }`}
              aria-label={`Switch between Senior, Caregiver, and Admin mode. Currently in ${role} mode. Long press for explanation.`}
            >
              {role === 'senior' && (
                <>
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <span className="hidden sm:inline">{t('seniorMode')}</span>
                </>
              )}
              {role === 'caregiver' && (
                <>
                  <Volume2 className="w-5 h-5 text-amber-300" />
                  <span className="hidden sm:inline">{t('caregiverMode')}</span>
                </>
              )}
              {role === 'admin' && (
                <>
                  <ShieldCheck className="w-5 h-5 text-yellow-300" />
                  <span className="hidden sm:inline">Admin Mode</span>
                </>
              )}
            </button>
            <FeatureInfoButton featureKey="role_switch" size="sm" />
          </div>
        </div>
      </div>
    </header>
  );
};
