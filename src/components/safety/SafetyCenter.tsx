import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { ScamAnalysisResult } from '../../types';
import { speechEngine } from '../../utils/speech';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureInfoButton, useLongPress } from '../common/AccessibleTooltip';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  PhoneCall,
  Lock,
  Volume2,
  CheckCircle2,
  Info,
  ExternalLink,
  Flame,
} from 'lucide-react';

const SAMPLE_SCAMS = [
  {
    title: 'Electricity Bill Cut Warning',
    text: 'Dear customer, your electricity power will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Please immediately contact electricity officer Mr. Sharma at 9876543210 or install bill update apk.',
  },
  {
    title: 'Bank KYC & APK Suspension',
    text: 'SBI alert: Your bank account will be blocked within 24 hours due to pending PAN KYC. Download QuickSupport app and enter the 6-digit verification code to update instantly: http://bit.ly/sbi-kyc-update-fast',
  },
  {
    title: 'WhatsApp Lottery 25 Lakhs',
    text: 'Congratulations! Your mobile number won 25,00,000 INR in KBC WhatsApp lucky draw contest 2026. Send photo of Aadhaar and transfer 5,000 INR processing fee to claim prize money immediately.',
  },
];

export const SafetyCenter: React.FC = () => {
  const { user, language, speechRate, triggerEmergency, t, highContrast } = useApp();
  const { showTooltip } = useTooltip();

  const [inputMessage, setInputMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ScamAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const sosLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('sos_emergency'),
  });

  const handleAnalyze = async (textToAnalyze?: string) => {
    const text = (textToAnalyze || inputMessage).trim();
    if (!text || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);

    try {
      const result = await api.analyzeScam(text, language);
      setAnalysisResult(result);

      // Read verdict out loud for elderly clarity
      const readout = `Safety Analysis Result: ${result.verdict}. ${result.summary}. Recommended safe action: ${result.safeAction}`;
      speechEngine.speak(readout, language, speechRate);
    } catch (err: any) {
      setErrorMessage('Could not complete scam analysis. ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const primaryCaregiver = user?.emergencyContacts.find((c) => c.isPrimaryCaregiver) || user?.emergencyContacts[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          highContrast
            ? 'bg-black text-white border-yellow-400'
            : 'bg-gradient-to-r from-orange-600 to-amber-700 text-white border-orange-500 shadow-orange-500/20'
        }`}
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-sm font-bold">
            <ShieldCheck className="w-4 h-4 text-orange-200" />
            <span>Fraud Prevention & Emergency Protection</span>
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl sm:text-4xl font-black">
              {t('navSafety')}
            </h2>
            <FeatureInfoButton featureKey="safety_center" size="md" variant="contrast" />
          </div>
          <p className="text-lg sm:text-xl font-medium opacity-90 max-w-2xl">
            Never get tricked by fake bank warnings, lottery messages, or urgent threats. Check suspicious messages before clicking or replying.
          </p>
        </div>

        {/* Emergency Fast SOS Button */}
        <div className="relative inline-flex items-center flex-shrink-0">
          <button
            onClick={() => triggerEmergency('Manual trigger from Safety Center')}
            {...sosLongPress}
            className="min-h-[64px] px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xl flex items-center gap-3 shadow-xl border-2 border-white/60 cursor-pointer"
            aria-label="Need Help Now? Call 112. Long press or tap info for explanation."
          >
            <AlertTriangle className="w-7 h-7 text-white animate-pulse" />
            <span>Need Help Now? (112)</span>
          </button>
          <div className="absolute -top-2 -right-2 z-10">
            <FeatureInfoButton featureKey="sos_emergency" size="sm" variant="contrast" />
          </div>
        </div>
      </section>

      {/* Golden Rules of Elder Digital Safety */}
      <section
        className={`p-6 rounded-3xl border-3 shadow-md ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-red-50 border-red-300'
        }`}
      >
        <h3 className="text-2xl font-black text-red-950 dark:text-red-300 flex items-center gap-2 mb-3">
          <Lock className="w-7 h-7 text-red-600" />
          <span>The 4 Golden Rules: Never Break These</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-lg font-bold text-red-950 dark:text-red-200">
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/50 border border-red-200 flex items-start gap-2.5">
            <span className="text-red-600 text-2xl">🚫</span>
            <span>NEVER share OTP (One Time Password) with anyone on a phone call.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/50 border border-red-200 flex items-start gap-2.5">
            <span className="text-red-600 text-2xl">🚫</span>
            <span>NEVER enter your UPI PIN to RECEIVE money. UPI PIN is only for sending.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/50 border border-red-200 flex items-start gap-2.5">
            <span className="text-red-600 text-2xl">🚫</span>
            <span>NEVER install AnyDesk, TeamViewer, or QuickSupport APK files sent on WhatsApp.</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/50 border border-red-200 flex items-start gap-2.5">
            <span className="text-red-600 text-2xl">🚫</span>
            <span>Electricity boards NEVER disconnect power with a WhatsApp or SMS warning!</span>
          </div>
        </div>
      </section>

      {/* AI Scam Message Analyzer */}
      <section
        className={`rounded-3xl p-6 sm:p-8 border-4 shadow-xl space-y-6 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div>
          <h3 className="text-2xl sm:text-3xl font-black text-orange-950 dark:text-orange-300 flex items-center gap-2">
            <Search className="w-8 h-8 text-orange-600" />
            <span>AI Suspicious Message & URL Checker</span>
          </h3>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium mt-1">
            Copy and paste any SMS, WhatsApp forward, email, or web link below. Gemini AI will analyze it for scam patterns.
          </p>
        </div>

        {/* Preset Sample Buttons for Quick Testing */}
        <div className="space-y-2">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Or Test Common Scam Templates:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SCAMS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInputMessage(s.text);
                  handleAnalyze(s.text);
                }}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 font-bold text-sm sm:text-base cursor-pointer"
              >
                ⚠️ {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Input Textarea */}
        <div className="space-y-3">
          <textarea
            rows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Paste suspicious SMS text, WhatsApp forward, or website link here..."
            className={`w-full p-4 rounded-2xl border-3 text-lg sm:text-xl font-medium focus:outline-none focus:ring-4 focus:ring-orange-400 ${
              highContrast
                ? 'bg-slate-900 text-white border-yellow-400'
                : 'bg-slate-50 text-slate-900 border-slate-300'
            }`}
          />

          <button
            onClick={() => handleAnalyze()}
            disabled={!inputMessage.trim() || isAnalyzing}
            className="w-full min-h-[64px] px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 disabled:opacity-40 text-white font-black text-xl sm:text-2xl shadow-lg border-2 border-orange-400 flex items-center justify-center gap-3 cursor-pointer"
          >
            <Search className="w-7 h-7" />
            <span>{isAnalyzing ? 'Analyzing Message with AI...' : 'Verify Message Safety'}</span>
          </button>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-100 border-2 border-red-300 text-red-950 font-bold text-lg">
            {errorMessage}
          </div>
        )}

        {/* Analysis Results Display */}
        {analysisResult && (
          <div
            className={`p-6 sm:p-7 rounded-3xl border-4 shadow-xl space-y-4 animate-in fade-in ${
              analysisResult.verdict === 'DANGEROUS'
                ? 'bg-red-50 border-red-500 text-red-950'
                : analysisResult.verdict === 'SUSPICIOUS'
                ? 'bg-amber-50 border-amber-500 text-amber-950'
                : 'bg-emerald-50 border-emerald-500 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-4 border-black/10">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black ${
                    analysisResult.verdict === 'DANGEROUS'
                      ? 'bg-red-600'
                      : analysisResult.verdict === 'SUSPICIOUS'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  }`}
                >
                  {analysisResult.verdict === 'DANGEROUS'
                    ? '🚨'
                    : analysisResult.verdict === 'SUSPICIOUS'
                    ? '⚠️'
                    : '🛡️'}
                </div>
                <div>
                  <div className="text-sm font-black uppercase tracking-wider">
                    Verdict: {analysisResult.category}
                  </div>
                  <div className="text-3xl font-black">{analysisResult.verdict}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-lg">
                  Risk Level: {analysisResult.riskScore}%
                </span>
                <button
                  onClick={() =>
                    speechEngine.speak(
                      `Verdict: ${analysisResult.verdict}. Summary: ${analysisResult.summary}. Safe action: ${analysisResult.safeAction}`,
                      language,
                      speechRate
                    )
                  }
                  className="px-4 py-2 rounded-xl bg-white text-slate-800 border-2 border-slate-300 font-bold text-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5 text-orange-600" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            <div className="text-xl font-bold leading-relaxed">
              {analysisResult.summary}
            </div>

            {/* Reasons Identified */}
            <div className="space-y-2">
              <div className="font-extrabold text-base uppercase tracking-wider">
                Why this was flagged:
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-lg font-medium">
                {analysisResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Safe Action */}
            <div className="p-4 rounded-2xl bg-white/90 border-2 border-black/10 text-slate-900">
              <div className="font-black text-lg text-emerald-800 mb-1">
                ✅ What You Should Do:
              </div>
              <div className="text-lg font-bold">{analysisResult.safeAction}</div>
            </div>

            {/* Disclaimer */}
            <div className="text-xs font-semibold opacity-75 pt-2">
              ⚠️ Note: {analysisResult.warningNote || 'Automated AI scam detection is advisory and cannot guarantee 100% security. When in doubt, speak to your family caregiver or visit your bank branch in person.'}
            </div>
          </div>
        )}
        {/* National Cyber Crime Helpline 1930 & Portal */}
        <div className="p-6 rounded-3xl bg-indigo-50 border-3 border-indigo-200 text-indigo-950 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                1930
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-black">
                  National Cyber Crime Helpline: 1930
                </h4>
                <p className="text-sm font-semibold text-indigo-800">
                  Government of India Ministry of Home Affairs Cyber Financial Fraud Helpline
                </p>
              </div>
            </div>

            <a
              href="tel:1930"
              className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg flex items-center gap-2 shadow-md cursor-pointer flex-shrink-0"
            >
              <PhoneCall className="w-5 h-5 animate-pulse" />
              <span>Call 1930 Now</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-sm font-bold text-indigo-900">
            <div className="p-3 bg-white/80 rounded-xl border border-indigo-200">
              1. Call within the "Golden Hour" (first 2-3 hours) after any unauthorized bank debit.
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-indigo-200">
              2. Keep your Bank Account Number, Transaction ID, and Debited Amount ready.
            </div>
            <div className="p-3 bg-white/80 rounded-xl border border-indigo-200">
              3. The 1930 operator coordinates with your bank to freeze funds before the fraudster withdraws.
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Assistance Direct Dialing Section */}
      <section
        className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl space-y-4 ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-slate-100 border-slate-300'
        }`}
      >
        <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <PhoneCall className="w-7 h-7 text-red-600" />
          <span>Emergency Assistance Contacts (Always Available)</span>
        </h3>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
          If you feel unwell, have fallen, or suspect immediate financial danger, call directly:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="tel:112"
            className="p-5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold flex items-center justify-between text-xl shadow-md"
          >
            <div>
              <div className="text-2xl font-black">Call 112</div>
              <div className="text-sm font-medium opacity-90">National Emergency (India)</div>
            </div>
            <PhoneCall className="w-8 h-8" />
          </a>

          {primaryCaregiver && (
            <a
              href={`tel:${primaryCaregiver.phone.replace(/[^0-9+]/g, '')}`}
              className="p-5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold flex items-center justify-between text-xl shadow-md"
            >
              <div>
                <div className="text-2xl font-black">Call Caregiver</div>
                <div className="text-sm font-medium opacity-90">{primaryCaregiver.name}</div>
              </div>
              <PhoneCall className="w-8 h-8" />
            </a>
          )}
        </div>
      </section>
    </div>
  );
};
