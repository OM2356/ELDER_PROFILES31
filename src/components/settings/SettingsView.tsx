import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { EmergencyContact, Language, UserMemoryItem } from '../../types';
import { speechEngine } from '../../utils/speech';
import { FeatureInfoButton } from '../common/AccessibleTooltip';
import {
  Settings,
  Eye,
  Type,
  Volume2,
  Globe,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    user,
    language,
    setLanguage,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    speechRate,
    setSpeechRate,
    refreshUserData,
    t,
  } = useApp();

  const [testSpeechPlaying, setTestSpeechPlaying] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  // Memory states
  const [savedMemories, setSavedMemories] = useState<UserMemoryItem[]>([]);
  const [personalizationEnabled, setPersonalizationEnabled] = useState(true);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState('');
  const [newMemCategory, setNewMemCategory] = useState('interests');
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemValue, setNewMemValue] = useState('');

  const loadMemories = async () => {
    try {
      setLoadingMemories(true);
      const data = await api.getUserMemory('senior_1');
      setSavedMemories(data.memories || data.items || []);
      setPersonalizationEnabled(data.enablePersonalization ?? true);
    } catch (err) {
      console.warn('Failed to load memories:', err);
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleTogglePersonalization = async () => {
    try {
      const next = !personalizationEnabled;
      const res = await api.togglePersonalization(next, 'senior_1');
      setPersonalizationEnabled(res.enablePersonalization);
      setMemoryStatus(next ? 'Personalization enabled. Buddy will remember preferences.' : 'Personalization paused. Buddy will use clean slate.');
      setTimeout(() => setMemoryStatus(''), 4000);
    } catch {
      alert('Failed to update personalization setting.');
    }
  };

  const handleAddCustomMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemValue.trim()) return;

    try {
      await api.saveMemoryItem(newMemCategory, newMemKey.trim(), newMemValue.trim(), 'senior_1');
      setNewMemKey('');
      setNewMemValue('');
      setMemoryStatus('Preference saved to Buddy memory.');
      setTimeout(() => setMemoryStatus(''), 4000);
      loadMemories();
    } catch {
      alert('Failed to save memory.');
    }
  };

  const handleDeleteMemory = async (itemId: string) => {
    try {
      await api.deleteMemoryItem(itemId, 'senior_1');
      setSavedMemories((prev) => prev.filter((m) => m.id !== itemId));
      setMemoryStatus('Memory item deleted.');
      setTimeout(() => setMemoryStatus(''), 3000);
    } catch {
      alert('Failed to delete memory item.');
    }
  };

  const handleClearAllMemories = async () => {
    if (window.confirm('Are you sure you want to delete all stored conversation memories? Buddy will reset to clean slate.')) {
      try {
        await api.clearUserMemories('senior_1');
        setSavedMemories([]);
        setMemoryStatus('All memories cleared successfully.');
        setTimeout(() => setMemoryStatus(''), 4000);
      } catch {
        alert('Failed to clear memories.');
      }
    }
  };

  const handleTestSpeech = () => {
    setTestSpeechPlaying(true);
    const testText =
      language === 'hi'
        ? 'नमस्ते! मैं आपकी आवाज़ सहायक बडी हूँ। यह आवाज़ की गति का परीक्षण है।'
        : language === 'mr'
        ? 'नमस्कार! मी आपली बडी सोबती आहे. हा आवाजाच्या वेगाचा नमुना आहे.'
        : 'Hello! I am your Buddy AI companion. This is a sample of my current speech speed.';

    speechEngine.speak(
      testText,
      language,
      speechRate,
      () => setTestSpeechPlaying(true),
      () => setTestSpeechPlaying(false),
      () => setTestSpeechPlaying(false)
    );
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      id: `c_${Date.now()}`,
      name: newContactName.trim(),
      relation: newContactRelation.trim() || 'Family',
      phone: newContactPhone.trim(),
      isPrimaryCaregiver: false,
    };

    const updatedContacts = [...(user?.emergencyContacts || []), newContact];
    try {
      await api.updateProfile({ emergencyContacts: updatedContacts });
      setNewContactName('');
      setNewContactRelation('');
      setNewContactPhone('');
      setSaveStatus('Contact added successfully.');
      setTimeout(() => setSaveStatus(''), 4000);
      refreshUserData();
    } catch {
      alert('Failed to save contact.');
    }
  };

  const handleDeleteContact = async (id: string) => {
    const updated = (user?.emergencyContacts || []).filter((c) => c.id !== id);
    try {
      await api.updateProfile({ emergencyContacts: updated });
      refreshUserData();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Title */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        <div className="flex items-center gap-4 border-b pb-4 border-slate-200">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-black">{t('navSettings')}</h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium">
              Customize text size, speaking speed, contrast, and emergency contacts.
            </p>
          </div>
        </div>

        <div className="space-y-8 mt-6">
          {/* Section 1: Language */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xl font-extrabold flex items-center gap-2">
                <Globe className="w-6 h-6 text-amber-600" />
                <span>{t('languageLabel')} / भाषा निवडा</span>
              </label>
              <FeatureInfoButton featureKey="language_switch" size="sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { code: 'en' as Language, title: 'English', sub: 'Primary language' },
                { code: 'hi' as Language, title: 'हिन्दी (Hindi)', sub: 'सरल और सहज' },
                { code: 'mr' as Language, title: 'मराठी (Marathi)', sub: 'आपली मायबोली' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code)}
                  className={`min-h-[64px] p-4 rounded-2xl border-3 text-left transition-all cursor-pointer ${
                    language === item.code
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50'
                  }`}
                  aria-pressed={language === item.code}
                >
                  <div className="font-extrabold text-lg">{item.title}</div>
                  <div className="text-xs opacity-90">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Text Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xl font-extrabold flex items-center gap-2">
                <Type className="w-6 h-6 text-amber-600" />
                <span>{t('fontSizeLabel')}</span>
              </label>
              <FeatureInfoButton featureKey="font_size" size="sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { size: 'standard' as const, label: 'Standard (18px)', sample: 'Sample text' },
                { size: 'large' as const, label: 'Large (22px)', sample: 'Sample text' },
                { size: 'extra-large' as const, label: 'Extra Large (26px)', sample: 'Sample text' },
              ].map((item) => (
                <button
                  key={item.size}
                  onClick={() => setFontSize(item.size)}
                  className={`min-h-[64px] p-4 rounded-2xl border-3 text-left transition-all cursor-pointer ${
                    fontSize === item.size
                      ? 'bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-amber-50'
                  }`}
                  aria-pressed={fontSize === item.size}
                >
                  <div className="font-extrabold text-lg">{item.label}</div>
                  <div className="text-xs opacity-80 mt-1">Comfortable reading</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: High Contrast Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xl font-extrabold flex items-center gap-2">
                <Eye className="w-6 h-6 text-amber-600" />
                <span>Display Contrast</span>
              </label>
              <FeatureInfoButton featureKey="high_contrast" size="sm" />
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 dark:bg-slate-900">
              <div>
                <div className="font-extrabold text-xl">High Contrast Colors</div>
                <div className="text-sm font-medium text-slate-500">
                  Bold black background with bright yellow borders for maximum readability.
                </div>
              </div>
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`min-h-[50px] px-6 py-2 rounded-xl font-black text-lg transition-all cursor-pointer border-2 ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-white'
                    : 'bg-slate-300 text-slate-800 border-slate-400'
                }`}
              >
                {highContrast ? 'Enabled (ON)' : 'Disabled (OFF)'}
              </button>
            </div>
          </div>

          {/* Section 4: Voice Speaking Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xl font-extrabold flex items-center gap-2">
                <Volume2 className="w-6 h-6 text-amber-600" />
                <span>Voice Reading Speed</span>
              </label>
              <FeatureInfoButton featureKey="speech_rate" size="sm" />
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-slate-200 bg-slate-50 dark:bg-slate-900">
              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center justify-between text-base font-extrabold">
                  <span>Slow & Gentle (0.75x)</span>
                  <span className="text-amber-600 text-lg">Current: {speechRate}x</span>
                  <span>Brisk (1.2x)</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.2"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-3 bg-slate-200 rounded-lg cursor-pointer"
                  aria-label="Adjust voice rate"
                />
              </div>

              <button
                onClick={handleTestSpeech}
                className="min-h-[54px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base flex items-center gap-2 flex-shrink-0 cursor-pointer shadow-sm"
              >
                <Volume2 className="w-5 h-5" />
                <span>{testSpeechPlaying ? 'Playing...' : 'Test Voice'}</span>
              </button>
            </div>
          </div>

          {/* Section 5: Long-Term Memory & Personalization Controls */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
                  <Sparkles className="w-6 h-6 text-amber-600" />
                  <span>Buddy Long-Term Memory & Personalization</span>
                  <FeatureInfoButton featureKey="long_term_memory" size="sm" />
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-300 font-medium mt-1">
                  Buddy learns your favorite topics and daily routines to make every conversation feel personal and comforting.
                </p>
              </div>

              <button
                onClick={handleTogglePersonalization}
                className={`min-h-[52px] px-6 py-2.5 rounded-2xl font-black text-lg transition-all cursor-pointer border-2 flex items-center gap-2 flex-shrink-0 ${
                  personalizationEnabled
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
                    : 'bg-slate-200 text-slate-700 border-slate-400 hover:bg-slate-300'
                }`}
                aria-pressed={personalizationEnabled}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>{personalizationEnabled ? 'Memory: Active (ON)' : 'Memory: Paused (OFF)'}</span>
              </button>
            </div>

            {memoryStatus && (
              <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-950 font-bold text-base flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                <span>{memoryStatus}</span>
              </div>
            )}

            {/* Privacy notice banner */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 text-amber-950 dark:text-amber-100 text-base font-medium space-y-1">
              <div className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Your Privacy & Full Control</span>
              </div>
              <p>
                All memories are stored securely and never shared with advertisers or third parties. You can inspect every single memory or delete everything at any moment.
              </p>
            </div>

            {/* List of saved memory items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-lg text-slate-800 dark:text-slate-200">
                  What Buddy Remembers About You ({savedMemories.length})
                </span>
                {savedMemories.length > 0 && (
                  <button
                    onClick={handleClearAllMemories}
                    className="text-sm font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All Memories</span>
                  </button>
                )}
              </div>

              {loadingMemories ? (
                <div className="p-6 text-center text-slate-500 font-bold animate-pulse">
                  Loading memory records...
                </div>
              ) : savedMemories.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-300 text-center text-slate-500 font-medium">
                  No memories saved yet. Talk to Buddy in chat or add your favorite routines below!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedMemories.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border-2 border-slate-200 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 text-amber-900">
                            {item.category}
                          </span>
                          <span className="font-extrabold text-base text-slate-900 dark:text-white capitalize">
                            {item.key.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                          "{item.value}"
                        </div>
                        <div className="text-xs text-slate-400">
                          {new Date(item.timestamp || item.learnedAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteMemory(item.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete this memory"
                        aria-label={`Delete memory: ${item.key}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Memory Form */}
            <form onSubmit={handleAddCustomMemory} className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 space-y-3">
              <div className="font-bold text-base text-slate-900 dark:text-white">
                Teach Buddy Something About You:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={newMemCategory}
                  onChange={(e) => setNewMemCategory(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium bg-white dark:bg-slate-800"
                >
                  <option value="interests">Interests & Hobbies</option>
                  <option value="routine">Daily Routine & Habit</option>
                  <option value="health">Gentle Health & Care</option>
                  <option value="family">Family & Loved Ones</option>
                </select>
                <input
                  type="text"
                  placeholder="Topic (e.g. Morning Tea, Old Songs)"
                  value={newMemKey}
                  onChange={(e) => setNewMemKey(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Detail (e.g. Loves ginger tea at 7:30 AM)"
                  value={newMemValue}
                  onChange={(e) => setNewMemValue(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium bg-white dark:bg-slate-800"
                />
              </div>
              <button
                type="submit"
                className="min-h-[50px] px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base flex items-center gap-2 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Save to Buddy's Memory</span>
              </button>
            </form>
          </div>

          {/* Section 5: Emergency Contacts Management */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-2xl font-black flex items-center gap-2">
              <Phone className="w-6 h-6 text-red-600" />
              <span>Manage Emergency Contacts</span>
            </h3>

            {saveStatus && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-950 font-bold text-sm">
                {saveStatus}
              </div>
            )}

            <div className="space-y-2">
              {user?.emergencyContacts.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-300 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-extrabold text-lg">
                      {c.name} ({c.relation})
                    </div>
                    <div className="text-sm font-semibold text-slate-500">📞 {c.phone}</div>
                  </div>
                  {!c.isPrimaryCaregiver && (
                    <button
                      onClick={() => handleDeleteContact(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete contact"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Contact Form */}
            <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border space-y-3">
              <div className="font-bold text-base">Add New Emergency Family Contact:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Rahul)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium"
                />
                <input
                  type="text"
                  placeholder="Relation (e.g. Nephew)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="p-3 rounded-xl border border-slate-300 text-base font-medium"
                />
              </div>
              <button
                type="submit"
                className="min-h-[50px] px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-base flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Save Contact</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
