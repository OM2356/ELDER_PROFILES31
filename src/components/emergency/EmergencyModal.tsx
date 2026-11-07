import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmergencyRecord } from '../../types';
import { speechEngine } from '../../utils/speech';
import {
  PhoneCall,
  AlertTriangle,
  X,
  ShieldCheck,
  User,
  HeartHandshake,
  CheckCircle2,
  Bell,
  Mail,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';

export const EmergencyModal: React.FC = () => {
  const {
    emergencyModalOpen,
    emergencyReason,
    closeEmergency,
    user,
    language,
    speechRate,
    t,
    highContrast,
  } = useApp();

  const [alertDispatched, setAlertDispatched] = useState(false);
  const [activeCallAction, setActiveCallAction] = useState<string | null>(null);
  const [currentRecord, setCurrentRecord] = useState<EmergencyRecord | null>(null);
  const [cancellingFalseAlarm, setCancellingFalseAlarm] = useState(false);
  const [falseAlarmReason, setFalseAlarmReason] = useState('Accidental button press');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (emergencyModalOpen) {
      // Voice alert for elderly reassurance
      const promptText =
        language === 'hi'
          ? 'आपातकालीन सहायता स्क्रीन खुल गई है। यदि आपको तत्काल सहायता चाहिए तो 112 या अपने परिवार को कॉल करें।'
          : language === 'mr'
          ? 'आपत्कालीन मदत स्क्रीन उघडली आहे. गरज असल्यास 112 किंवा कुटुंबियांना थेट कॉल करा.'
          : 'Emergency assistance screen is open. If you need immediate help, tap Call 112 or your caregiver.';

      speechEngine.speak(promptText, language, speechRate);

      // Log alert to backend and capture record with channels
      api.triggerEmergencyAlert({
        reason: emergencyReason || 'Elderly emergency assistance requested',
        user: user || undefined,
      })
        .then((res) => {
          if (res.record) {
            setCurrentRecord(res.record);
            setAlertDispatched(true);
          }
        })
        .catch((e) => console.warn('Failed to log emergency to backend', e));
    } else {
      setAlertDispatched(false);
      setActiveCallAction(null);
      setCurrentRecord(null);
      setCancellingFalseAlarm(false);
      setStatusMessage('');
    }
  }, [emergencyModalOpen]);

  const handleCancelFalseAlarm = async () => {
    if (!currentRecord) {
      closeEmergency();
      return;
    }
    try {
      await api.cancelFalseAlarm(currentRecord.id, falseAlarmReason);
      setStatusMessage('False alarm alert recorded. Caregiver notified that you are safe.');
      setTimeout(() => {
        closeEmergency();
      }, 1500);
    } catch (err) {
      console.warn('Failed to cancel alarm:', err);
      closeEmergency();
    }
  };

  if (!emergencyModalOpen) return null;

  const primaryCaregiver = user?.emergencyContacts.find((c) => c.isPrimaryCaregiver) || user?.emergencyContacts[0];
  const familyContact = user?.emergencyContacts.find((c) => !c.isPrimaryCaregiver) || primaryCaregiver;

  const handleSimulatedCall = (target: string, phone: string) => {
    setActiveCallAction(target);
    setAlertDispatched(true);
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`;
  };

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="emergency-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border-4 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-white text-slate-900 border-red-500'
        }`}
      >
        {/* Header Alert Banner */}
        <div className="flex items-start justify-between gap-4 border-b pb-4 mb-6 border-red-200">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-bounce flex-shrink-0">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div>
              <h2
                id="emergency-dialog-title"
                className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight"
              >
                {t('emergencyModalTitle')}
              </h2>
              <p className="text-base sm:text-lg font-bold opacity-90 mt-1">
                {t('emergencyModalDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={closeEmergency}
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 min-h-[50px] min-w-[50px] flex items-center justify-center border-2 border-slate-300"
            aria-label="Close emergency modal"
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-bold text-center">
            {statusMessage}
          </div>
        )}

        {emergencyReason && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 font-semibold text-lg flex items-center gap-3">
            <span className="font-bold">Detected Reason:</span>
            <span>"{emergencyReason}"</span>
          </div>
        )}

        {/* Multi-Channel Notification Status Display */}
        {currentRecord && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-300">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Automatic Caregiver Alerts (Dispatched)</span>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Alert Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border flex flex-col items-center text-center">
                <Bell className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs font-bold">In-App Alert</span>
                <span className="text-xs font-extrabold text-emerald-600 capitalize">
                  {currentRecord.channels?.inApp?.status || 'delivered'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border flex flex-col items-center text-center">
                <MessageSquare className="w-5 h-5 text-blue-600 mb-1" />
                <span className="text-xs font-bold">SMS Dispatch</span>
                <span className="text-xs font-extrabold text-blue-600 capitalize">
                  {currentRecord.channels?.sms?.status || 'attempted'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border flex flex-col items-center text-center">
                <Mail className="w-5 h-5 text-purple-600 mb-1" />
                <span className="text-xs font-bold">Email Notice</span>
                <span className="text-xs font-extrabold text-emerald-600 capitalize">
                  {currentRecord.channels?.email?.status || 'delivered'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Big Action Buttons */}
        <div className="space-y-4 mb-6">
          {/* Action 1: Call 112 National Emergency */}
          <a
            href="tel:112"
            onClick={() => handleSimulatedCall('112 Emergency Services', '112')}
            className="w-full min-h-[76px] px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-extrabold flex items-center justify-between shadow-xl shadow-red-600/30 border-2 border-red-400 text-xl sm:text-2xl transition-all cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <PhoneCall className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <div>{t('call112')}</div>
                <div className="text-sm font-semibold opacity-90">
                  Police, Ambulance, Fire & Disaster Helpline
                </div>
              </div>
            </div>
            <span className="bg-white text-red-600 px-3 py-1 rounded-xl text-lg font-black">
              112
            </span>
          </a>

          {/* Action 2: Call Primary Caregiver */}
          {primaryCaregiver && (
            <a
              href={`tel:${primaryCaregiver.phone.replace(/[^0-9+]/g, '')}`}
              onClick={() => handleSimulatedCall(primaryCaregiver.name, primaryCaregiver.phone)}
              className="w-full min-h-[76px] px-6 py-4 rounded-2xl bg-purple-700 hover:bg-purple-800 active:bg-purple-900 text-white font-extrabold flex items-center justify-between shadow-lg border-2 border-purple-400 text-xl sm:text-2xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <HeartHandshake className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <div>{t('callCaregiver')}</div>
                  <div className="text-sm font-semibold opacity-90">
                    {primaryCaregiver.name} ({primaryCaregiver.relation})
                  </div>
                </div>
              </div>
              <span className="text-base font-bold bg-purple-900/60 px-3 py-1 rounded-xl">
                {primaryCaregiver.phone}
              </span>
            </a>
          )}

          {/* Action 3: Call Family Member */}
          {familyContact && familyContact.id !== primaryCaregiver?.id && (
            <a
              href={`tel:${familyContact.phone.replace(/[^0-9+]/g, '')}`}
              onClick={() => handleSimulatedCall(familyContact.name, familyContact.phone)}
              className="w-full min-h-[70px] px-6 py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center justify-between shadow-md border-2 border-emerald-400 text-xl transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <div>{t('callFamily')}</div>
                  <div className="text-sm font-semibold opacity-90">
                    {familyContact.name} ({familyContact.relation})
                  </div>
                </div>
              </div>
              <span className="text-base font-bold bg-emerald-900/60 px-3 py-1 rounded-xl">
                {familyContact.phone}
              </span>
            </a>
          )}
        </div>

        {/* Clear Integration Disclosure Requirement */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-sm sm:text-base font-medium space-y-1 mb-6">
          <div className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700" />
            <span>Safety Protocol Notice:</span>
          </div>
          <p>
            Tapping the buttons above triggers your phone's native phone dialer directly (`tel:` protocol). Buddy Elder AI will never claim an emergency ambulance or police dispatched unless connected through authorized regional emergency dispatchers.
          </p>
        </div>

        {/* Action Controls: Dismiss or Cancel False Alarm */}
        {cancellingFalseAlarm ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-900 border-2 border-amber-300 space-y-3">
            <div className="font-extrabold text-base text-amber-950 dark:text-amber-200">
              Notify Caregiver That You Are Safe (Cancel Alert):
            </div>
            <select
              value={falseAlarmReason}
              onChange={(e) => setFalseAlarmReason(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 text-base font-medium bg-white dark:bg-slate-800"
            >
              <option value="Accidental button press">Pressed emergency button by mistake</option>
              <option value="Fell down but feeling okay now">Fell down, but I am standing and okay now</option>
              <option value="Testing the emergency system">Just testing the emergency button</option>
              <option value="Already received help from neighbor">Already received help from neighbor</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCancelFalseAlarm}
                className="flex-1 min-h-[52px] py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base cursor-pointer shadow-sm"
              >
                Confirm False Alarm
              </button>
              <button
                onClick={() => setCancellingFalseAlarm(false)}
                className="min-h-[52px] py-2.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-base cursor-pointer"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={closeEmergency}
              className="flex-1 min-h-[60px] py-3.5 px-6 rounded-2xl bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-800 font-extrabold text-xl transition-colors border-2 border-slate-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>{t('iAmSafe')}</span>
            </button>
            <button
              onClick={() => setCancellingFalseAlarm(true)}
              className="min-h-[60px] py-3 px-5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-base transition-colors border-2 border-amber-400 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5 text-amber-700" />
              <span>False Alarm?</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
