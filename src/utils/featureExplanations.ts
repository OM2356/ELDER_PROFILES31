import { Language } from '../types';

export type FeatureKey =
  | 'sos_emergency'
  | 'voice_chat'
  | 'daily_checkin'
  | 'digital_learning'
  | 'safety_center'
  | 'family_portal'
  | 'fall_prevention'
  | 'high_contrast'
  | 'font_size'
  | 'language_switch'
  | 'role_switch'
  | 'mic_input'
  | 'agent_selection'
  | 'rag_grounding'
  | 'voice_readout'
  | 'speech_rate'
  | 'long_term_memory'
  | 'admin_portal'
  | 'nav_reminders'
  | 'nav_social'
  | 'pwa_install'
  | 'notification_center'
  | 'phishing_detector'
  | 'daily_routine_reminders'
  | 'brain_gym'
  | 'onboarding_wizard'
  | 'cyber_helpline';

export interface FeatureExplanation {
  key: FeatureKey;
  iconName: string;
  title: Record<Language, string>;
  explanation: Record<Language, string>;
}

export const FEATURE_EXPLANATIONS: Record<FeatureKey, FeatureExplanation> = {
  sos_emergency: {
    key: 'sos_emergency',
    iconName: 'AlertTriangle',
    title: {
      en: 'Emergency SOS (112)',
      hi: 'आपातकालीन सहायता (112)',
      mr: 'तातडीची मदत (112)',
    },
    explanation: {
      en: 'Instantly dials the 112 National Emergency Helpline and alerts your family caregivers that you need immediate help.',
      hi: 'तुरंत राष्ट्रीय आपातकालीन नंबर 112 डायल करता है और आपके परिवार को सूचना भेजता है कि आपको मदद चाहिए।',
      mr: 'तातडीने 112 राष्ट्रीय आपत्कालीन हेल्पलाइनवर कॉल करतो आणि कुटुंबियांना सावध करतो की तुम्हाला मदतीची गरज आहे.',
    },
  },

  voice_chat: {
    key: 'voice_chat',
    iconName: 'MessageSquareHeart',
    title: {
      en: 'Buddy AI Voice Companion',
      hi: 'बडी एआई आवाज़ साथी',
      mr: 'बडी एआय आवाज सोबती',
    },
    explanation: {
      en: 'Lets you speak naturally with your friendly AI companion to hear comforting stories, ask questions, or share your thoughts.',
      hi: 'अपनी आवाज़ में बडी से बात करें, प्रेरणादायक कहानियां सुनें या कोई भी सवाल बिना झिझक पूछें।',
      mr: 'आपल्या आवाजाने बडीशी बोला, छान गोष्टी ऐका आणि कोणत्याही विषयावर मनमोकळ्या गप्पा मारा.',
    },
  },

  daily_checkin: {
    key: 'daily_checkin',
    iconName: 'Activity',
    title: {
      en: 'Daily Health Check-in',
      hi: 'दैनिक स्वास्थ्य जांच',
      mr: 'दैनिक आरोग्य नोंद',
    },
    explanation: {
      en: 'A quick 1-minute daily check to record how you are feeling, your sleep, and comfort so your family stays reassured.',
      hi: 'एक मिनट की सरल जांच जो आपके मूड, नींद और सेहत को दर्ज करती है ताकि परिवार निश्चिंत रहे।',
      mr: 'रोजची एक मिनिटाची सोपी नोंद जी तुमचा मूड, झोप आणि तब्येत नोंदवून कुटुंबियांना निश्चिंत ठेवते.',
    },
  },

  digital_learning: {
    key: 'digital_learning',
    iconName: 'GraduationCap',
    title: {
      en: 'Digital Skills Learning',
      hi: 'डिजिटल कौशल्य सीखें',
      mr: 'डिजिटल कौशल्ये शिका',
    },
    explanation: {
      en: 'Offers simple step-by-step guides for sending WhatsApp photos, making safe online payments, and handling smartphone tasks.',
      hi: 'व्हाट्सएप पर फोटो भेजने, सुरक्षित ऑनलाइन पैसे चुकाने और मोबाइल चलाने के आसान चरण सिखाता है।',
      mr: 'व्हॉट्सॲपवर फोटो पाठवणे, सुरक्षित यूपीआय पेमेंट करणे आणि स्मार्टफोन वापरण्याचे सोपे टप्पे शिकवतो.',
    },
  },

  safety_center: {
    key: 'safety_center',
    iconName: 'ShieldAlert',
    title: {
      en: 'Safety Center & Scam Detector',
      hi: 'सुरक्षा केंद्र व धोखाधड़ी जांच',
      mr: 'सुरक्षा केंद्र व फसवणूक तपासणी',
    },
    explanation: {
      en: 'Analyzes suspicious SMS or phone messages to protect your bank account and warn you before anyone steals your money or OTP.',
      hi: 'संदिग्ध संदेशों की तुरंत जांच करता है ताकि आपकी बैंक जानकारी और ओटीपी सुरक्षित रहे और कोई ठगी न हो सके।',
      mr: 'संशयास्पद मेसेज तपासून तुमची बँक खाती आणि ओटीपी सुरक्षित ठेवतो जेणेकरून पैशांची चोरी टाळता येईल.',
    },
  },

  family_portal: {
    key: 'family_portal',
    iconName: 'Users',
    title: {
      en: 'Family & Caregivers Portal',
      hi: 'परिवार व देखभालकर्ता पोर्टल',
      mr: 'कुटुंब व काळजीवाहक पोर्टल',
    },
    explanation: {
      en: 'Allows your trusted family members to see your daily health check-ins and emergency contacts while keeping personal chats private.',
      hi: 'आपके परिवार को आपकी सेहत और गतिविधि दिखाता है, जबकि आपकी निजी बातें पूरी तरह गोपनीय रहती हैं।',
      mr: 'कुटुंबियांना तुमची तब्येत व रोजची नोंद दाखवतो, पण तुमच्या खाजगी गप्पा पूर्णपणे सुरक्षित ठेवतो.',
    },
  },

  fall_prevention: {
    key: 'fall_prevention',
    iconName: 'Activity',
    title: {
      en: 'Fall Prevention & Chair Yoga',
      hi: 'गिरने से बचाव व कुर्सी योग',
      mr: 'पडण्यापासून बचाव व खुर्ची व्यायाम',
    },
    explanation: {
      en: 'Guides you through gentle chair exercises and ankle routines designed by physiotherapists to improve balance and prevent falls.',
      hi: 'कुर्सी पर बैठकर करने वाले सरल व्यायाम सिखाता है जिससे संतुलन सुधरे और पैरों की मजबूती बनी रहे।',
      mr: 'खुर्चीवर बसून करण्याचे सुरक्षित व्यायाम शिकवून तोल सांभाळण्यास व पाय बळकट करण्यास मदत करतो.',
    },
  },

  high_contrast: {
    key: 'high_contrast',
    iconName: 'Eye',
    title: {
      en: 'High Contrast Display',
      hi: 'हाई कंट्रास्ट मोड',
      mr: 'हाय कॉन्ट्रास्ट डिस्प्ले',
    },
    explanation: {
      en: 'Switches the screen to sharp black and bright yellow colors so elderly eyes can read clearly without fatigue or glare.',
      hi: 'स्क्रीन को गहरे काले और पीले रंगों में बदल देता है ताकि आंखें थके बिना आसानी से सब कुछ पढ़ा जा सके।',
      mr: 'स्क्रीन गडद काळ्या आणि पिवळ्या रंगात बदलतो, ज्यामुळे डोळ्यांवर ताण न येता स्पष्ट वाचता येते.',
    },
  },

  font_size: {
    key: 'font_size',
    iconName: 'Type',
    title: {
      en: 'Text Size Adjuster',
      hi: 'अक्षर का आकार बदलें',
      mr: 'अक्षरांचा आकार बदला',
    },
    explanation: {
      en: 'Enlarges the letters across the entire application so words are comfortably readable without straining.',
      hi: 'पूरी ऐप में अक्षरों का आकार बड़ा करता है ताकि पढ़ने में कोई परेशानी न हो और चश्मा लगाने की जरूरत कम पड़े।',
      mr: 'संपूर्ण ॲपमधील अक्षरांचा आकार मोठा करतो ज्यामुळे डोळ्यांवर ताण न येता सहज वाचता येईल.',
    },
  },

  language_switch: {
    key: 'language_switch',
    iconName: 'Globe',
    title: {
      en: 'Language Switcher',
      hi: 'भाषा बदलें',
      mr: 'भाषा निवडा',
    },
    explanation: {
      en: 'Switches the entire app and Buddy voice companion between English, Hindi, and Marathi.',
      hi: 'पूरी ऐप और बडी की आवाज़ को अंग्रेजी, हिंदी और मराठी के बीच तुरंत बदलता है।',
      mr: 'संपूर्ण ॲप आणि बडीचा आवाज इंग्रजी, हिंदी किंवा मराठीत त्वरित बदलतो.',
    },
  },

  role_switch: {
    key: 'role_switch',
    iconName: 'UserCheck',
    title: {
      en: 'User Role Switcher',
      hi: 'भूमिका बदलें',
      mr: 'वापरकर्ता प्रकार बदला',
    },
    explanation: {
      en: 'Switches the interface between Senior simple mode, Caregiver health dashboard, and Admin system management.',
      hi: 'वरिष्ठ नागरिक के सरल मोड, परिवार के स्वास्थ्य पोर्टल और व्यवस्थापक डैशबोर्ड के बीच स्क्रीन बदलता है।',
      mr: 'ज्येष्ठ नागरिकांचा सोपा मोड, काळजीवाहकांचे पोर्टल आणि प्रशासक व्यवस्थापन यांमध्ये स्क्रीन बदलतो.',
    },
  },

  mic_input: {
    key: 'mic_input',
    iconName: 'Mic',
    title: {
      en: 'Voice Microphone Input',
      hi: 'आवाज़ माइक्रोफोन',
      mr: 'आवाज मायक्रोफोन',
    },
    explanation: {
      en: 'Activates your microphone so you can simply speak your questions out loud without needing to type on a tiny keyboard.',
      hi: 'माइक्रोफोन चालू करता है ताकि आप बिना टाइप किए सीधे अपनी आवाज़ में बोलकर सवाल पूछ सकें।',
      mr: 'मायक्रोफोन सुरू करतो ज्यामुळे टायपिंग न करता थेट आपल्या आवाजात बोलून प्रश्न विचारता येतो.',
    },
  },

  agent_selection: {
    key: 'agent_selection',
    iconName: 'Sparkles',
    title: {
      en: 'Specialized AI Companions',
      hi: 'विशेषज्ञ बडी सहायक',
      mr: 'विशेष तज्ज्ञ बडी सोबती',
    },
    explanation: {
      en: 'Routes your question to the best specialized helper: Companion for stories, Education for apps, Wellness for health, or Safety for scams.',
      hi: 'आपके सवाल को सही विशेषज्ञ के पास भेजता है: गपशप, डिजिटल शिक्षा, दैनिक स्वास्थ्य या धोखाधड़ी से सुरक्षा।',
      mr: 'तुमच्या प्रश्नानुसार योग्य तज्ज्ञ सोबती निवडतो: गोष्टींसाठी सोबती, मोबाईल शिक्षणासाठी शिक्षक, आरोग्यासाठी साथी किंवा सुरक्षेसाठी रक्षक.',
    },
  },

  rag_grounding: {
    key: 'rag_grounding',
    iconName: 'ShieldCheck',
    title: {
      en: 'Verified Official Sources (RAG)',
      hi: 'सत्यापित सरकारी संदर्भ',
      mr: 'तपासलेले अधिकृत संदर्भ',
    },
    explanation: {
      en: 'Shows the trustworthy government pension guides, WhatsApp manuals, and safety records Buddy verified to give you an accurate answer.',
      hi: 'उन आधिकारिक सरकारी पेंशन नियमों और सुरक्षित मार्गदर्शिकाओं को दिखाता है जिनका उपयोग बडी ने आपको सही उत्तर देने में किया है।',
      mr: 'बडीने दिलेले उत्तर ज्या अधिकृत सरकारी नियम व सुरक्षित मार्गदर्शकांवर आधारित आहे ते खरे संदर्भ दाखवतो.',
    },
  },

  voice_readout: {
    key: 'voice_readout',
    iconName: 'Volume2',
    title: {
      en: 'Voice Read Aloud',
      hi: 'आवाज़ में पढ़कर सुनाएं',
      mr: 'मोठ्याने वाचून दाखवा',
    },
    explanation: {
      en: 'Reads the message or answer out loud in a warm, gentle voice so you can listen comfortably without reading the screen.',
      hi: 'संदेश या उत्तर को एक शांत और स्पष्ट आवाज़ में पढ़कर सुनाता है ताकि आपको स्क्रीन पढ़ने की जरूरत न पड़े।',
      mr: 'संदेश किंवा उत्तर एका शांत व स्पष्ट आवाजात वाचून दाखवतो, जेणेकरून वाचण्याऐवजी आरामात ऐकता येईल.',
    },
  },

  long_term_memory: {
    key: 'long_term_memory',
    iconName: 'HeartHandshake',
    title: {
      en: 'Long-Term Memory & Personalization',
      hi: 'दीर्घकालिक स्मृति व निजीकरण',
      mr: 'दीर्घकालीन स्मरण व वैयक्तिकरण',
    },
    explanation: {
      en: 'Safely remembers your favorite tea times, hobbies, and family stories so Buddy always talks with you like a lifelong friend.',
      hi: 'आपकी पसंद, दिनचर्या और शौक को याद रखता है ताकि बडी हमेशा आपके एक पुराने और सच्चे मित्र की तरह बात करे।',
      mr: 'तुमच्या आवडीनिवडी, चहाच्या वेळा व सवयी लक्षात ठेवतो जेणेकरून बडी नेहमी एखाद्या जीवलग मित्रासारखा संवाद साधेल.',
    },
  },

  speech_rate: {
    key: 'speech_rate',
    iconName: 'Volume2',
    title: {
      en: 'Voice Reading Speed',
      hi: 'आवाज़ की गति',
      mr: 'बोलण्याचा वेग',
    },
    explanation: {
      en: 'Adjusts how fast or slow Buddy speaks out loud so you can understand every word comfortably and clearly.',
      hi: 'बडी के बोलने की गति धीमी या तेज करता है ताकि आप हर बात आराम से और स्पष्ट समझ सकें।',
      mr: 'बडीच्या बोलण्याचा वेग कमी किंवा जास्त करतो जेणेकरून प्रत्येक शब्द नीट आणि स्पष्ट समजेल.',
    },
  },
  admin_portal: {
    key: 'admin_portal',
    iconName: 'BarChart3',
    title: {
      en: 'Admin Governance & Health Portal',
      hi: 'प्रशासन व सुरक्षा प्रबंधन',
      mr: 'प्रशासक व्यवस्थापन व अहवाल',
    },
    explanation: {
      en: 'Provides oversight of AI safety, knowledge base updates, user accounts, and emergency alert audit records.',
      hi: 'एआई सुरक्षा, सहायता सामग्री, उपयोगकर्ता खातों और आपातकालीन कॉल रिकॉर्ड्स की निगरानी करता है।',
      mr: 'एआय सुरक्षा, माहिती दस्तऐवज, वापरकर्ते आणि आपत्कालीन नोंदींचे संपूर्ण व्यवस्थापन करतो.',
    },
  },
  nav_reminders: {
    key: 'nav_reminders',
    iconName: 'Clock',
    title: {
      en: 'Daily Routine & Smart Reminders',
      hi: 'दैनिक दिनचर्या व स्मार्ट स्मरणपत्र',
      mr: 'दैनिक दिनक्रम व स्मरणपत्रे',
    },
    explanation: {
      en: 'Gentle voice and notification reminders for drinking water, taking your morning walk, daily health check-in, and calling family.',
      hi: 'पानी पीने, सुबह टहलने, दैनिक जांच करने और परिवार से बात करने के लिए समय पर प्यार से याद दिलाता है।',
      mr: 'पाणी पिणे, सकाळचे फिरणे, तब्येतीची नोंद आणि कुटुंबियांशी बोलण्यासाठी वेळेवर आपुलकीने आठवण करून देतो.',
    },
  },
  nav_social: {
    key: 'nav_social',
    iconName: 'Sparkles',
    title: {
      en: 'Senior Social & Brain Gym',
      hi: 'वरिष्ठ मनोरंजन व दिमागी कसरत',
      mr: 'मनोरंजन, गोष्टी व मेंदूचा व्यायाम',
    },
    explanation: {
      en: 'Delightful moral folklore stories, fun memory card matching puzzles, daily wisdom trivia, and a warm gratitude journal.',
      hi: 'मनोरंजक लोककथाएं, चित्रों का मिलान करने वाला दिमागी खेल, सामान्य ज्ञान और दैनिक आभार व्यक्त करने की जगह।',
      mr: 'छान बोधकथा, स्मरणशक्ती वाढवणारा चित्रांचा खेळ, रंजक कोडी आणि रोजच्या आनंदाची नोंद.',
    },
  },
  pwa_install: {
    key: 'pwa_install',
    iconName: 'Download',
    title: {
      en: 'Install App on Phone',
      hi: 'फोन पर ऐप इंस्टॉल करें',
      mr: 'फोनवर अ‍ॅप इन्स्टॉल करा',
    },
    explanation: {
      en: 'Installs Buddy Elder directly on your smartphone screen so you can open it anytime with a single tap, even offline.',
      hi: 'बडी एल्डर को सीधे आपके मोबाइल स्क्रीन पर जोड़ता है ताकि आप एक टच में कभी भी, बिना इंटरनेट के भी इसे खोल सकें।',
      mr: 'बडी ॲप आपल्या फोनच्या स्क्रीनवर ठेवतो जेणेकरून एका टॅपवर ते ऑफलाइन असतानाही सहज वापरता येईल.',
    },
  },
  notification_center: {
    key: 'notification_center',
    iconName: 'Bell',
    title: {
      en: 'Smart Notification Center',
      hi: 'स्मार्ट सूचना केंद्र',
      mr: 'स्मार्ट सूचना केंद्र',
    },
    explanation: {
      en: 'Shows timely updates for health routines, messages from family, learning badges earned, and system safety alerts.',
      hi: 'स्वास्थ्य दिनचर्या, परिवार के संदेश, सीखे गए पाठों के मेडल और सुरक्षा अलर्ट की सभी सूचनाएं एक जगह दिखाता है।',
      mr: 'आरोग्य दिनक्रम, कुटुंबियांचे संदेश, नवीन पदके आणि सुरक्षा सूचना एकाच ठिकाणी दाखवतो.',
    },
  },
  phishing_detector: {
    key: 'phishing_detector',
    iconName: 'ShieldCheck',
    title: {
      en: 'Suspicious Link & Phishing Inspector',
      hi: 'संदिग्ध लिंक व वेबसाइट जांच',
      mr: 'संशयास्पद लिंक व फसवणूक तपासणी',
    },
    explanation: {
      en: 'Checks if an internet web link sent to you on WhatsApp or SMS is authentic or a dangerous trap designed to steal your savings.',
      hi: 'जांच करता है कि व्हाट्सएप या एसएमएस पर आया लिंक असली है या आपके पैसे चुराने का कोई खतरनाक जाल।',
      mr: 'व्हॉट्सॲप किंवा मेसेजवर आलेली लिंक खरी आहे की फसवणूक करणारी हे तपासून बँक खात्याचे संरक्षण करतो.',
    },
  },
  daily_routine_reminders: {
    key: 'daily_routine_reminders',
    iconName: 'CheckCircle',
    title: {
      en: 'Hydration & Routine Assistant',
      hi: 'पानी पीने व दिनचर्या सहायक',
      mr: 'पाणी पिणे व दिनक्रम सहाय्यक',
    },
    explanation: {
      en: 'Keeps track of daily water intake and routines to ensure you stay healthy, energetic, and hydrated throughout the day.',
      hi: 'दिनभर में पानी पीने और आदतों का हिसाब रखता है ताकि आप तरोताजा और स्वस्थ रहें।',
      mr: 'दिवसभरात पुरेसे पाणी पिण्याची आणि चांगल्या सवयींची नोंद ठेवून तुम्हाला निरोगी राहण्यास मदत करतो.',
    },
  },
  brain_gym: {
    key: 'brain_gym',
    iconName: 'Sparkles',
    title: {
      en: 'Memory Matching Game',
      hi: 'स्मृति मिलान खेल',
      mr: 'स्मरणशक्ती जोड्या जुळवा खेळ',
    },
    explanation: {
      en: 'A relaxing and enjoyable card game that exercises your memory and keeps your mind sharp and active every single day.',
      hi: 'एक सरल और मजेदार खेल जो याददाश्त तेज करता है और दिमाग को हमेशा सक्रिय और खुशहाल रखता है।',
      mr: 'एक सोपा व आनंददायी खेळ जो स्मरणशक्ती तल्लख ठेवतो आणि मेंदूला नेहमी ताजातवाना ठेवतो.',
    },
  },
  onboarding_wizard: {
    key: 'onboarding_wizard',
    iconName: 'HeartHandshake',
    title: {
      en: 'Personalized Welcome Setup',
      hi: 'व्यक्तिगत स्वागत व सेट-अप',
      mr: 'स्वागत व वैयक्तिक रचना',
    },
    explanation: {
      en: 'Guides new seniors step-by-step through setting language, preferred nickname, hobbies, text size, and primary family contact.',
      hi: 'वरिष्ठ नागरिक की पसंद, भाषा, चश्मे का नंबर, शौक और आपातकालीन संपर्क को प्यार से सेट करता है।',
      mr: 'ज्येष्ठ नागरिकांची आवडती भाषा, नाव, छंद, अक्षरांचा आकार आणि काळजीवाहकाचा नंबर सहज सेट करतो.',
    },
  },
  cyber_helpline: {
    key: 'cyber_helpline',
    iconName: 'PhoneCall',
    title: {
      en: '1930 National Cyber Fraud Helpline',
      hi: '1930 राष्ट्रीय साइबर हेल्पलाइन',
      mr: '1930 राष्ट्रीय सायबर हेल्पलाइन',
    },
    explanation: {
      en: 'Direct government emergency helpline to immediately freeze stolen funds and report cyber fraud or online financial deception in India.',
      hi: 'धोखाधड़ी होने पर तुरंत पैसे रुकवाने और रिपोर्ट दर्ज कराने के लिए भारत सरकार की आधिकारिक हेल्पलाइन 1930।',
      mr: 'ऑनलाइन आर्थिक फसवणूक झाल्यास खात्यातील पैसे थांबवण्यासाठी व तक्रार करण्यासाठी भारत सरकारची अधिकृत हेल्पलाइन 1930.',
    },
  },
};
