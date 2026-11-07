import React from 'react';
import { useOnlineStatus } from '../../utils/usePWAInstall';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language, highContrast } = useApp();

  if (isOnline) return null;

  const offlineText =
    language === 'hi'
      ? 'ऑफलाइन मोड — इंटरनेट कनेक्शन नहीं है। सहेजी गई जानकारी दिखाई जा रही है।'
      : language === 'mr'
      ? 'ऑफलाइन मोड — इंटरनेट उपलब्ध नाही. सेव्ह केलेली माहिती दाखवत आहे.'
      : 'Offline Mode — No internet detected. Displaying saved local information.';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border-2 animate-bounce ${
        highContrast
          ? 'bg-black text-amber-400 border-amber-400'
          : 'bg-amber-600 text-white border-amber-300'
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
        <WifiOff className="w-5 h-5 text-white" />
      </div>
      <div className="text-sm sm:text-base font-extrabold flex-1">
        {offlineText}
      </div>
    </div>
  );
};
