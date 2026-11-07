import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartHandshake,
  ShieldCheck,
  PhoneCall,
  FileText,
  Lock,
  Info,
  HelpCircle,
  X,
  Mail,
  ExternalLink,
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { highContrast, language, setOnboardingModalOpen } = useApp();
  const [activeModal, setActiveModal] = useState<'about' | 'privacy' | 'terms' | 'contact' | null>(null);

  return (
    <>
      <footer
        role="contentinfo"
        className={`border-t-2 py-8 px-4 sm:px-6 mt-16 transition-colors print:hidden ${
          highContrast
            ? 'bg-black border-amber-400 text-white'
            : 'bg-white/90 backdrop-blur-md border-amber-200 text-slate-700'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Footer Row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-amber-100 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md">
                <HeartHandshake className="w-7 h-7" />
              </div>
              <div>
                <div className="font-black text-xl text-slate-900 dark:text-white">
                  Buddy Elder AI • Loving Companion
                </div>
                <div className="text-xs sm:text-sm font-semibold text-slate-500">
                  Empowering elderly adults with compassionate voice guidance, daily routine safety, and family peace of mind.
                </div>
              </div>
            </div>

            {/* Quick Emergency & Cyber Links */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="tel:112"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Emergency: 112</span>
              </a>
              <a
                href="tel:1930"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Cyber Helpline: 1930</span>
              </a>
            </div>
          </div>

          {/* Middle Navigation Links & Legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-extrabold text-slate-600 dark:text-slate-300">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button
                onClick={() => setActiveModal('about')}
                className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
              >
                About Buddy AI
              </button>
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
              >
                Privacy & Data Security
              </button>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
              >
                Terms & Medical Disclaimer
              </button>
              <button
                onClick={() => setActiveModal('contact')}
                className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
              >
                Caregiver Support & Contact
              </button>
              <button
                onClick={() => setOnboardingModalOpen(true)}
                className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition"
              >
                Replay Setup Tour
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              © {new Date().getFullYear()} Buddy Elder AI. Built with love for seniors.
            </div>
          </div>

          {/* Medical Notice Disclaimer */}
          <div className="text-center text-xs text-slate-500 max-w-3xl mx-auto pt-2">
            Notice: Buddy Elder AI is a digital companion and routine assistance platform. It does not provide medical diagnosis, emergency medical dispatch, or physician treatment advice. For all medical conditions, always consult a licensed doctor.
          </div>
        </div>
      </footer>

      {/* MODAL 1: ABOUT */}
      {activeModal === 'about' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
                  <Info className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">About Buddy Elder AI</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-base sm:text-lg leading-relaxed">
              <p>
                <strong>Buddy Elder AI</strong> was born from a simple, profound insight: as the world rapidly digitizes, our elderly parents and grandparents deserve technology designed with immense patience, respect, and unconditional love.
              </p>
              <p>
                From remembering tea times and telling classic folk stories, to warning against cunning cyber scams, teaching smartphone skills, and providing instant one-tap emergency calling to 112 and family caregivers, Buddy Elder AI stands beside every senior citizen as a loyal, lifelong companion.
              </p>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-200">
                <h4 className="font-black text-amber-900 dark:text-amber-300 mb-1">Our Core Pillars:</h4>
                <ul className="list-disc list-inside space-y-1 font-semibold text-slate-800 dark:text-slate-200">
                  <li>Voice-First Interaction in English, Hindi, and Marathi.</li>
                  <li>Accessible Typography (minimum 20px readable body text, 60px+ touch targets).</li>
                  <li>Zero Pill Discipline & High Contrast Visuals.</li>
                  <li>Strict Safety & Privacy Protection for Seniors.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: PRIVACY */}
      {activeModal === 'privacy' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">Privacy & Data Security Policy</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-base leading-relaxed">
              <p>
                We adhere strictly to the Digital Personal Data Protection (DPDP) Act of India and international elderly data ethics.
              </p>
              <div className="space-y-3 font-semibold text-slate-700 dark:text-slate-300">
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <strong>1. No Data Selling:</strong> We never monetize, sell, or license any elderly user's voice recordings, check-ins, or personal memories to advertisers or third parties.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <strong>2. Senior Consent & Memory Controls:</strong> Seniors and authorized family members can inspect, export, or permanently delete all stored memory items at any time from the Settings menu.
                </div>
                <div className="p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                  <strong>3. Role-Based Access Control (RBAC):</strong> Caregivers only see authorized health summaries (mood, hydration, completed routines). Personal conversations between the senior and Buddy AI remain private.
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg cursor-pointer"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: TERMS & DISCLAIMER */}
      {activeModal === 'terms' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">Terms & Medical Disclaimer</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-base leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-zinc-800 border-2 border-amber-300 font-bold text-amber-950 dark:text-amber-200">
                ⚠️ Medical & Emergency Disclaimer: Buddy Elder AI is not a licensed medical provider, hospital, or emergency dispatch service. The advice, reminders, and gentle exercise recommendations provided by Buddy are informational and supportive only.
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                In any urgent or life-threatening event (including severe chest pain, shortness of breath, acute fall with inability to get up), users and caregivers should immediately call <strong>112 (National Emergency)</strong> or go to the nearest hospital emergency room.
              </p>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: CONTACT & CAREGIVER HELP */}
      {activeModal === 'contact' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-2xl border-4 border-amber-400 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black">Caregiver Support & Contact</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-2 text-slate-500 hover:text-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-base sm:text-lg">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Our specialized caregiver support team is available to assist families with configuring routines, setting up emergency contacts, and ensuring smooth operation.
              </p>

              <div className="space-y-3 font-bold">
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-zinc-800 border border-purple-200 flex items-center gap-3">
                  <PhoneCall className="w-6 h-6 text-purple-700" />
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Caregiver Assistance Helpline</div>
                    <div className="text-xl font-black text-purple-900 dark:text-purple-300">+91 1800 200 4567 (Toll-Free)</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-zinc-800 border border-purple-200 flex items-center gap-3">
                  <Mail className="w-6 h-6 text-purple-700" />
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Email Inquiries</div>
                    <div className="text-xl font-black text-purple-900 dark:text-purple-300">support@buddyelder.ai</div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="mt-6 w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
