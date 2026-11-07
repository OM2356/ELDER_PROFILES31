import React, { useState } from 'react';
import { usePWAInstall } from '../../utils/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { highContrast, language } = useApp();

  if (isInstalled) {
    return null;
  }

  const label =
    language === 'hi'
      ? 'ऐप इंस्टॉल करें'
      : language === 'mr'
      ? 'अ‍ॅप इन्स्टॉल करा'
      : 'Install App';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm sm:text-base font-extrabold shadow-sm transition-all cursor-pointer ${
          compact ? 'min-h-[46px]' : 'min-h-[50px]'
        } ${
          highContrast
            ? 'bg-amber-400 text-black border-2 border-white hover:bg-yellow-300'
            : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-emerald-600/30 ring-2 ring-emerald-500'
        }`}
        title={label}
        aria-label={label}
      >
        <Download className="w-5 h-5 animate-bounce" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs sm:text-sm font-extrabold border-2 transition-all cursor-pointer min-h-[46px] ${
            highContrast
              ? 'bg-black text-amber-400 border-amber-400 hover:bg-zinc-900'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
          }`}
          aria-label="Install on iPhone / iPad"
        >
          <Smartphone className="w-4 h-4 text-amber-600" />
          <span>{label}</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
          >
            <div
              className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border-4 ${
                highContrast
                  ? 'bg-black text-white border-amber-400'
                  : 'bg-white text-slate-900 border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between pb-4 border-b border-amber-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 id="ios-install-title" className="text-xl sm:text-2xl font-black">
                      {language === 'hi'
                        ? 'आईफोन / आईपैड पर इंस्टॉल करें'
                        : language === 'mr'
                        ? 'आयफोन वर इन्स्टॉल करा'
                        : 'Install on iPhone / iPad'}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-semibold">
                      Buddy Elder AI Home Screen App
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  aria-label="Close dialog"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-6 space-y-4 text-base sm:text-lg">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <p className="font-semibold text-slate-800">
                    {language === 'hi'
                      ? 'सफारी ब्राउज़र में नीचे दिए गए "शेयर" (Share) बटन को दबाएं।'
                      : language === 'mr'
                      ? 'सफारी ब्राऊझर मध्ये खाली असलेल्या "Share" आयकॉनवर टॅप करा.'
                      : 'Tap the Share icon at the bottom of Safari.'}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/70 border border-amber-200">
                  <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <p className="font-semibold text-slate-800">
                    {language === 'hi'
                      ? 'नीचे स्क्रॉल करें और "होम स्क्रीन पर जोड़ें" (Add to Home Screen) चुनें।'
                      : language === 'mr'
                      ? 'खाली स्क्रोल करा आणि "Add to Home Screen" निवडा.'
                      : 'Scroll down and tap "Add to Home Screen".'}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0" />
                  <p className="font-semibold text-emerald-900">
                    {language === 'hi'
                      ? 'ऊपरी दाएं कोने में "Add" दबाएं। बडी एआई आपके होम स्क्रीन पर हमेशा उपलब्ध रहेगा!'
                      : language === 'mr'
                      ? 'वरच्या कोपऱ्यात "Add" दाबा. बडी अ‍ॅप आपल्या होम स्क्रीनवर लगेच दिसेल!'
                      : 'Tap "Add" in top-right. Buddy Elder will be one tap away on your phone!'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg shadow-md cursor-pointer"
              >
                {language === 'hi' ? 'समझ गया' : language === 'mr' ? 'समजले' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
