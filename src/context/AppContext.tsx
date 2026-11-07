import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, UserProfile, UserRole, AppNotification } from '../types';
import { api } from '../services/api';

export type NavigationTab =
  | 'home'
  | 'chat'
  | 'education'
  | 'wellness'
  | 'family'
  | 'safety'
  | 'reminders'
  | 'social'
  | 'admin'
  | 'settings';

interface AppContextType {
  user: UserProfile | null;
  role: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  toggleHighContrast: () => void;
  fontSize: 'standard' | 'large' | 'extra-large';
  setFontSize: (size: 'standard' | 'large' | 'extra-large') => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  theme: 'light' | 'dark' | 'contrast';
  setTheme: (theme: 'light' | 'dark' | 'contrast') => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
  screenReaderAssistance: boolean;
  setScreenReaderAssistance: (val: boolean) => void;
  currentTab: NavigationTab;
  setCurrentTab: (tab: NavigationTab) => void;
  switchRole: (role: UserRole) => Promise<void>;
  emergencyModalOpen: boolean;
  setEmergencyModalOpen: (open: boolean) => void;
  emergencyReason: string;
  triggerEmergency: (reason: string) => void;
  closeEmergency: () => void;
  onboardingModalOpen: boolean;
  setOnboardingModalOpen: (open: boolean) => void;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  t: (key: string) => string;
  refreshUserData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'Buddy Elder AI',
    appSubtitle: 'Your Loving Voice-First Companion & Safety Guide',
    navHome: 'Home',
    navChat: 'Buddy Chat',
    navLearn: 'Learn Digital',
    navWellness: 'Health & Wellness',
    navFamily: 'Family & Caregivers',
    navSafety: 'Safety Center',
    navReminders: 'Reminders & Routine',
    navSocial: 'Stories & Brain Gym',
    navAdmin: 'Admin Portal',
    navSettings: 'Settings',
    sosButton: 'EMERGENCY SOS (112)',
    welcomeGreetingMorning: 'Good morning',
    welcomeGreetingAfternoon: 'Good afternoon',
    welcomeGreetingEvening: 'Good evening',
    howAreYouFeeling: 'How are you feeling today?',
    checkInNow: 'Daily Health Check-in',
    checkInDone: 'Check-in Completed Today',
    quickChat: 'Talk with Buddy AI',
    quickChatDesc: 'Stories, jokes, questions, or just a warm friendly chat.',
    digitalHub: 'Digital Skills Learning',
    digitalHubDesc: 'Learn WhatsApp, video calling, UPI safety step-by-step.',
    familyCall: 'Call Family & Caregivers',
    familyCallDesc: 'One-touch direct calling to your loved ones.',
    safetyAlert: 'Scam Detector & Emergency Help',
    safetyAlertDesc: 'Check suspicious SMS or messages, prevent frauds.',
    fallPrevention: 'Fall Prevention & Exercises',
    fallPreventionDesc: 'Gentle chair yoga and ankle routines to stay steady.',
    voiceSpeakPrompt: 'Tap microphone and speak your heart out',
    highContrastMode: 'High Contrast',
    fontSizeLabel: 'Font Size',
    voiceSpeedLabel: 'Voice Speed',
    languageLabel: 'Language',
    seniorMode: 'Senior Mode',
    caregiverMode: 'Caregiver Portal',
    emergencyModalTitle: 'Emergency Assistance Alert',
    emergencyModalDesc: 'We detected you might need immediate help. What would you like to do?',
    call112: 'Call 112 (National Emergency)',
    callCaregiver: 'Call Primary Caregiver',
    callFamily: 'Call Family Member',
    iAmSafe: 'I am Safe / Cancel',
    disclaimerMedical: 'Notice: Buddy Elder AI is a supportive companion and does not replace professional medical or emergency personnel.',
    installApp: 'Install App',
    notificationsTitle: 'Notifications',
    clearAll: 'Clear All',
    noNotifications: 'No new notifications right now. Everything is peaceful!',
    markRead: 'Mark Read',
    startOnboarding: 'Personalize My Setup',
    onboardingTitle: 'Welcome to Buddy Elder AI',
    cyberHelplineLabel: 'National Cyber Crime Helpline: 1930',
  },
  hi: {
    appTitle: 'बडी एल्डर एआई',
    appSubtitle: 'आपका स्नेही व आवाज़-आधारित साथी और सुरक्षा सहायक',
    navHome: 'मुख्य पृष्ठ',
    navChat: 'बडी से बात करें',
    navLearn: 'डिजिटल सीखें',
    navWellness: 'स्वास्थ्य व योग',
    navFamily: 'परिवार व देखभाल',
    navSafety: 'सुरक्षा केंद्र',
    navReminders: 'स्मरणपत्र व दिनचर्या',
    navSocial: 'कहानियां व दिमागी खेल',
    navAdmin: 'प्रशासन पोर्टल',
    navSettings: 'सेटिंग्स',
    sosButton: 'आपातकालीन सहायता (112)',
    welcomeGreetingMorning: 'सुप्रभात',
    welcomeGreetingAfternoon: 'शुभ दोपहर',
    welcomeGreetingEvening: 'शुभ संध्या',
    howAreYouFeeling: 'आज आपकी तबीयत कैसी है?',
    checkInNow: 'दैनिक स्वास्थ्य जांच',
    checkInDone: 'आज की जांच पूरी हुई',
    quickChat: 'बडी एआई से बात करें',
    quickChatDesc: 'कहानियां, चुटकुले, सवाल या बस एक प्यार भरी बातचीत।',
    digitalHub: 'डिजिटल कौशल सीखें',
    digitalHubDesc: 'व्हाट्सएप, वीडियो कॉल और सुरक्षित यूपीआई आसानी से सीखें।',
    familyCall: 'परिवार को कॉल करें',
    familyCallDesc: 'अपने प्रियजनों को एक टच में तुरंत कॉल करें।',
    safetyAlert: 'धोखाधड़ी जांच व सुरक्षा',
    safetyAlertDesc: 'संदिग्ध एसएमएस या संदेश की जांच करें और सुरक्षित रहें।',
    fallPrevention: 'गिरने से बचाव व हल्के व्यायाम',
    fallPreventionDesc: 'कुर्सी पर बैठकर करने वाले सरल व्यायाम जो संतुलन बनाए रखें।',
    voiceSpeakPrompt: 'माइक दबाएं और प्यार से बोलें',
    highContrastMode: 'हाई कंट्रास्ट',
    fontSizeLabel: 'अक्षर का आकार',
    voiceSpeedLabel: 'आवाज़ की गति',
    languageLabel: 'भाषा',
    seniorMode: 'वरिष्ठ नागरिक मोड',
    caregiverMode: 'देखभालकर्ता पोर्टल',
    emergencyModalTitle: 'आपातकालीन सहायता चेतावनी',
    emergencyModalDesc: 'हमें लगा कि आपको तुरंत सहायता की आवश्यकता हो सकती है। आप क्या करना चाहेंगे?',
    call112: '112 पर कॉल करें (राष्ट्रीय आपातकाल)',
    callCaregiver: 'देखभालकर्ता को कॉल करें',
    callFamily: 'परिवार के सदस्य को कॉल करें',
    iAmSafe: 'मैं सुरक्षित हूँ / रद्द करें',
    disclaimerMedical: 'सूचना: बडी एआई एक सहायक साथी है और यह किसी चिकित्सक या आपातकालीन सेवा का विकल्प नहीं है।',
    installApp: 'ऐप इंस्टॉल करें',
    notificationsTitle: 'सूचनाएं',
    clearAll: 'सभी हटाएं',
    noNotifications: 'अभी कोई नई सूचना नहीं है। सब कुछ शांत और सुरक्षित है!',
    markRead: 'पढ़ा गया',
    startOnboarding: 'अपनी पसंद सेट करें',
    onboardingTitle: 'बडी एल्डर एआई में आपका स्वागत है',
    cyberHelplineLabel: 'राष्ट्रीय साइबर अपराध हेल्पलाइन: 1930',
  },
  mr: {
    appTitle: 'बडी एल्डर एआय',
    appSubtitle: 'आपला प्रेमळ आवाज-सक्षम सोबती आणि सुरक्षा मार्गदर्शक',
    navHome: 'मुख्य पान',
    navChat: 'बडीशी गप्पा',
    navLearn: 'डिजिटल शिका',
    navWellness: 'आरोग्य व व्यायाम',
    navFamily: 'कुटुंब व काळजीवाहक',
    navSafety: 'सुरक्षा केंद्र',
    navReminders: 'स्मरणपत्रे व दिनक्रम',
    navSocial: 'गोष्टी व मेंदूचा व्यायाम',
    navAdmin: 'प्रशासक पोर्टल',
    navSettings: 'सेटिंग्ज',
    sosButton: 'तातडीची मदत (112)',
    welcomeGreetingMorning: 'शुभ सकाळ',
    welcomeGreetingAfternoon: 'शुभ दुपार',
    welcomeGreetingEvening: 'शुभ संध्याकाळ',
    howAreYouFeeling: 'आज आपली प्रकृती कशी आहे?',
    checkInNow: 'दैनिक आरोग्य नोंद',
    checkInDone: 'आजची नोंद पूर्ण झाली',
    quickChat: 'बडी एआयशी गप्पा मारा',
    quickChatDesc: 'गोष्टी, विनोद, रोजच्या गप्पा आणि आपुलकीची साथ.',
    digitalHub: 'डिजिटल कौशल्ये शिका',
    digitalHubDesc: 'व्हॉट्सअ‍ॅप, व्हिडिओ कॉल आणि सुरक्षित UPI सहज शिका.',
    familyCall: 'कुटुंबाला फोन करा',
    familyCallDesc: 'आपल्या माणसांना एका क्लिकवर थेट कॉल करा.',
    safetyAlert: 'फसवणूक तपासणी व मदत',
    safetyAlertDesc: 'संशयास्पद मेसेज तपासा आणि ऑनलाइन फसवणुकीपासून सुरक्षित राहा.',
    fallPrevention: 'संतुलन व सोपे व्यायाम',
    fallPreventionDesc: 'खुर्चीवर बसून करण्याचे सोपे व्यायाम जे पाय मजबूत ठेवतील.',
    voiceSpeakPrompt: 'माइक दाबा आणि मनातील बोला',
    highContrastMode: 'हाय कॉन्ट्रास्ट',
    fontSizeLabel: 'अक्षरांचा आकार',
    voiceSpeedLabel: 'आवाजाचा वेग',
    languageLabel: 'भाषा',
    seniorMode: 'ज्येष्ठ नागरिक मोड',
    caregiverMode: 'काळजीवाहक पोर्टल',
    emergencyModalTitle: 'तातडीची मदत सूचना',
    emergencyModalDesc: 'आपल्याला तातडीच्या मदतीची गरज असल्याचे दिसते. आपण काय करू इच्छिता?',
    call112: '112 वर कॉल करा (आपत्कालीन सेवा)',
    callCaregiver: 'काळजीवाहकाला कॉल करा',
    callFamily: 'कुटुंबातील सदस्याला कॉल करा',
    iAmSafe: 'मी सुरक्षित आहे / रद्द करा',
    disclaimerMedical: 'सूचना: बडी एआई हा केवळ सोबती आहे आणि तो कोणत्याही वैद्यकीय उपचारांचा पर्याय नाही.',
    installApp: 'अ‍ॅप इन्स्टॉल करा',
    notificationsTitle: 'सूचना केंद्र',
    clearAll: 'सर्व काढा',
    noNotifications: 'सध्या कोणत्याही नवीन सूचना नाहीत. सर्व शांत आणि सुरक्षित आहे!',
    markRead: 'वाचले',
    startOnboarding: 'माझी प्राधान्ये सेट करा',
    onboardingTitle: 'बडी एल्डर एआय मध्ये आपले स्वागत आहे',
    cyberHelplineLabel: 'राष्ट्रीय सायबर हेल्पलाइन: 1930',
  },
};

const DEFAULT_SENIOR_USER: UserProfile = {
  id: 'senior_1',
  name: 'Ramesh Sharma',
  role: 'senior',
  age: 72,
  language: 'en',
  preferredSpeechRate: 0.85,
  highContrast: false,
  fontSize: 'large',
  theme: 'light',
  reducedMotion: false,
  screenReaderAssistance: false,
  onboardingCompleted: true,
  emergencyContacts: [
    {
      id: 'c1',
      name: 'Priya Sharma (Daughter)',
      relation: 'Daughter & Primary Caregiver',
      phone: '+91 98765 43210',
      email: 'priya.sharma@example.com',
      isPrimaryCaregiver: true,
    },
    {
      id: 'c2',
      name: 'Amit Sharma (Son)',
      relation: 'Son',
      phone: '+91 98111 22233',
      isPrimaryCaregiver: false,
    },
    {
      id: 'c3',
      name: 'Dr. V. K. Mehta (Family Doctor)',
      relation: 'Physician',
      phone: '+91 98222 33344',
      isPrimaryCaregiver: false,
    },
  ],
  privacySettings: {
    shareWellnessWithCaregiver: true,
    shareExercisesWithCaregiver: true,
    shareLearningProgress: true,
    allowEmergencyLocation: true,
    enableLongTermMemory: true,
  },
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    category: 'wellness',
    title: 'Hydration Reminder',
    message: 'Time for a fresh glass of warm water or herbal tea! Keep energized.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    priority: 'medium',
    actionTab: 'reminders',
  },
  {
    id: 'notif_2',
    category: 'learning',
    title: 'WhatsApp Skill Lesson',
    message: 'Ready for today’s short 3-minute lesson on sending photos to grandchildren?',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    priority: 'low',
    actionTab: 'education',
  },
  {
    id: 'notif_3',
    category: 'family',
    title: 'Priya Checked In',
    message: 'Your daughter Priya viewed your health check-in and sends warm regards.',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: true,
    priority: 'low',
    actionTab: 'family',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_SENIOR_USER);
  const [role, setRole] = useState<UserRole>('senior');
  const [language, setLanguageState] = useState<Language>('en');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [fontSize, setFontSizeState] = useState<'standard' | 'large' | 'extra-large'>('large');
  const [speechRate, setSpeechRateState] = useState<number>(0.85);
  const [theme, setThemeState] = useState<'light' | 'dark' | 'contrast'>('light');
  const [reducedMotion, setReducedMotionState] = useState<boolean>(false);
  const [screenReaderAssistance, setScreenReaderAssistanceState] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [emergencyModalOpen, setEmergencyModalOpen] = useState<boolean>(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');
  const [onboardingModalOpen, setOnboardingModalOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('buddy_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  useEffect(() => {
    const savedLang = localStorage.getItem('buddy_lang') as Language;
    if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
      setLanguageState(savedLang);
    }
    const savedContrast = localStorage.getItem('buddy_high_contrast');
    if (savedContrast === 'true') {
      setHighContrastState(true);
      document.documentElement.classList.add('high-contrast');
    }
    const savedFontSize = localStorage.getItem('buddy_font_size') as 'standard' | 'large' | 'extra-large';
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
    }
    const savedMotion = localStorage.getItem('buddy_reduced_motion');
    if (savedMotion === 'true') {
      setReducedMotionState(true);
    }
    const savedOnboarding = localStorage.getItem('buddy_onboarding_done');
    if (savedOnboarding !== 'true') {
      // Prompt onboarding if first time
      setOnboardingModalOpen(true);
    }

    refreshUserData();
  }, []);

  useEffect(() => {
    localStorage.setItem('buddy_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const refreshUserData = async () => {
    try {
      const profile = await api.getProfile();
      if (profile) {
        setUser(profile);
        if (profile.language) setLanguageState(profile.language);
        if (profile.highContrast !== undefined) {
          setHighContrastState(profile.highContrast);
          if (profile.highContrast) {
            document.documentElement.classList.add('high-contrast');
          } else {
            document.documentElement.classList.remove('high-contrast');
          }
        }
      }
    } catch {
      // fallback
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('buddy_lang', lang);
    if (user) {
      api.updateProfile({ language: lang }).catch(() => {});
    }
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    localStorage.setItem('buddy_high_contrast', val ? 'true' : 'false');
    if (val) {
      document.documentElement.classList.add('high-contrast');
      setThemeState('contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      setThemeState('light');
    }
    if (user) {
      api.updateProfile({ highContrast: val }).catch(() => {});
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const setFontSize = (size: 'standard' | 'large' | 'extra-large') => {
    setFontSizeState(size);
    localStorage.setItem('buddy_font_size', size);
    if (user) {
      api.updateProfile({ fontSize: size }).catch(() => {});
    }
  };

  const setSpeechRate = (rate: number) => {
    setSpeechRateState(rate);
    if (user) {
      api.updateProfile({ preferredSpeechRate: rate }).catch(() => {});
    }
  };

  const setTheme = (newTheme: 'light' | 'dark' | 'contrast') => {
    setThemeState(newTheme);
    if (newTheme === 'contrast') {
      setHighContrast(true);
    } else {
      setHighContrast(false);
    }
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    localStorage.setItem('buddy_reduced_motion', val ? 'true' : 'false');
  };

  const setScreenReaderAssistance = (val: boolean) => {
    setScreenReaderAssistanceState(val);
  };

  const switchRole = async (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'caregiver') {
      setCurrentTab('family');
    } else {
      setCurrentTab('home');
    }
  };

  const triggerEmergency = (reason: string) => {
    setEmergencyReason(reason);
    setEmergencyModalOpen(true);
    addNotification({
      category: 'emergency',
      title: 'Emergency SOS Triggered',
      message: `Emergency signal opened: ${reason}. Verification in progress.`,
      priority: 'urgent',
    });
  };

  const closeEmergency = () => {
    setEmergencyModalOpen(false);
    setEmergencyReason('');
  };

  const completeOnboarding = async (data: Partial<UserProfile>) => {
    localStorage.setItem('buddy_onboarding_done', 'true');
    setOnboardingModalOpen(false);
    if (data.language) setLanguage(data.language);
    if (data.fontSize) setFontSize(data.fontSize);
    if (data.preferredSpeechRate) setSpeechRate(data.preferredSpeechRate);
    if (data.name && user) {
      const updated = { ...user, ...data, onboardingCompleted: true };
      setUser(updated);
      try {
        await api.updateProfile(updated);
      } catch {}
    }
    addNotification({
      category: 'system',
      title: 'Welcome to Buddy Elder AI',
      message: 'Your personalized preferences have been successfully configured.',
      priority: 'low',
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (
    item: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        role,
        language,
        setLanguage,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        speechRate,
        setSpeechRate,
        theme,
        setTheme,
        reducedMotion,
        setReducedMotion,
        screenReaderAssistance,
        setScreenReaderAssistance,
        currentTab,
        setCurrentTab,
        switchRole,
        emergencyModalOpen,
        setEmergencyModalOpen,
        emergencyReason,
        triggerEmergency,
        closeEmergency,
        onboardingModalOpen,
        setOnboardingModalOpen,
        completeOnboarding,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        clearAllNotifications,
        addNotification,
        t,
        refreshUserData,
      }}
    >
      <div
        className={`${highContrast ? 'high-contrast' : ''} ${
          fontSize === 'extra-large' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg'
        } ${reducedMotion ? 'motion-reduce' : ''}`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
