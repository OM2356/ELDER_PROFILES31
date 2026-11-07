import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { AgentType, ChatMessage, Language, RAGSourceItem } from '../../types';
import { speechEngine, voiceRecognizer } from '../../utils/speech';
import { useTooltip } from '../../context/TooltipContext';
import { FeatureInfoButton, useLongPress } from '../common/AccessibleTooltip';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  GraduationCap,
  Activity,
  ShieldCheck,
  HeartHandshake,
  Bot,
  AlertCircle,
  BookOpen,
  Check,
  X,
  PhoneCall,
  HelpCircle,
} from 'lucide-react';

interface AgentInfo {
  id: AgentType;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  subtitleEn: string;
  subtitleHi: string;
  subtitleMr: string;
  icon: React.ComponentType<{ className?: string }>;
  quickPromptsEn: string[];
  quickPromptsHi: string[];
  quickPromptsMr: string[];
}

const AGENT_LIST: AgentInfo[] = [
  {
    id: 'auto',
    titleEn: 'Auto (Buddy Decides)',
    titleHi: 'ऑटो (बडी चुनेगा)',
    titleMr: 'ऑटो (बडी ठरवेल)',
    subtitleEn: 'Intelligent orchestrator delegates your question automatically.',
    subtitleHi: 'बुद्धिमत्ता से आपके सवाल का सही साथी अपने आप चुनेगा।',
    subtitleMr: 'तुमच्या प्रश्नासाठी योग्य सोबती आपोआप निवडेल.',
    icon: Bot,
    quickPromptsEn: [
      'How do I send a photo on WhatsApp?',
      'Tell me a cheerful folk story to smile',
      'I am feeling a little tired and stiff today',
      'I received an SMS saying electricity will be cut',
    ],
    quickPromptsHi: [
      'व्हाट्सएप पर फोटो कैसे भेजें?',
      'एक सुंदर और ज्ञानवर्धक लोककथा सुनाइए',
      'आज मुझे थोड़ी थकान लग रही है, कुछ हल्का बताएं',
      'बिजली कटने का मैसेज आया है, क्या यह सच है?',
    ],
    quickPromptsMr: [
      'व्हॉट्सअ‍ॅपवर फोटो कसा पाठवायचा?',
      'मला एक छान आणि सुंदर गोष्ट सांगा',
      'आज मला थोडा थकवा जाणवतोय, काही सोपे सांगा',
      'वीज कापली जाईल असा मेसेज आला आहे, हे काय आहे?',
    ],
  },
  {
    id: 'companion',
    titleEn: 'Companion Buddy',
    titleHi: 'स्नेही साथी बडी',
    titleMr: 'मित्र बडी',
    subtitleEn: 'Warm friendly talks, folklore, old memories, and clean jokes.',
    subtitleHi: 'सुख-दुख की बातें, कहानियां, चुटकुले और अपनत्व भरी बातें।',
    subtitleMr: 'गप्पागोष्टी, जुन्या आठवणी, छान गोष्टी आणि आपुलकीची सोबत.',
    icon: Sparkles,
    quickPromptsEn: [
      'Tell me a warm story from old village days',
      'Share a clean joke to make me smile',
      'What were popular radio songs in the 1960s?',
      'I am feeling a bit lonely this morning',
    ],
    quickPromptsHi: [
      'मुझे पुराने समय की एक प्यारी लोककथा सुनाइए',
      'एक प्यारा और मजेदार चुटकुला सुनाइए',
      'पुराने रेडियो गीतों की मधुर यादें साझा करें',
      'आज मेरा मन थोड़ा शांत है, कुछ अच्छा सुनाइए',
    ],
    quickPromptsMr: [
      'मला जुन्या काळातील एक गोड कथा सांगा',
      'चेहऱ्यावर हसू आणणारा एक छान विनोद सांगा',
      'रेडिओवरच्या जुन्या गाण्यांवर गप्पा मारूया',
      'आज मला छान गोष्टी ऐकायच्या आहेत',
    ],
  },
  {
    id: 'education',
    titleEn: 'Digital Learning Buddy',
    titleHi: 'डिजिटल शिक्षक बडी',
    titleMr: 'डिजिटल मार्गदर्शक',
    subtitleEn: 'Step-by-step patient phone, WhatsApp, and UPI tutorials.',
    subtitleHi: 'व्हाट्सएप, यूट्यूब, वीडियो कॉल और इंटरनेट फोन चलाना सीखें।',
    subtitleMr: 'स्मार्टफोन, व्हॉट्सअ‍ॅप आणि इंटरनेट वापरायला सोप्या भाषेत शिका.',
    icon: GraduationCap,
    quickPromptsEn: [
      'How do I send a voice note on WhatsApp without typing?',
      'How do I make a video call to my daughter?',
      'What is UPI PIN and why must I never enter it to receive money?',
      'How do I make font sizes bigger on my smartphone screen?',
    ],
    quickPromptsHi: [
      'व्हाट्सएप पर बोलकर वॉइस मैसेज कैसे भेजते हैं?',
      'अपनी बेटी को वीडियो कॉल कैसे करूं?',
      'पैसे पाने के लिए यूपीआई पिन क्यों नहीं डालना चाहिए?',
      'फोन में अक्षर बड़े कैसे करें?',
    ],
    quickPromptsMr: [
      'व्हॉट्सअ‍ॅपवर बोलून व्हॉइस मेसेज कसा पाठवायचा?',
      'मुलीला व्हिडिओ कॉल करण्याची सोपी पद्धत कोणती?',
      'पैसे मिळवण्यासाठी UPI पिन का टाकू नये?',
      'मोबाईलवर अक्षरे मोठी कशी करायची?',
    ],
  },
  {
    id: 'wellness',
    titleEn: 'Wellness Buddy',
    titleHi: 'स्वास्थ्य मित्र बडी',
    titleMr: 'आरोग्य सोबती',
    subtitleEn: 'Gentle chair stretches, hydration, and restful sleep habits.',
    subtitleHi: 'पानी पीने की याद, कुर्सी पर हल्के व्यायाम व दिनचर्या।',
    subtitleMr: 'पाणी पिण्याची आठवण, खुर्चीवर सोपे व्यायाम व दैनंदिन दिनक्रम.',
    icon: Activity,
    quickPromptsEn: [
      'Suggest 3 seated chair stretches for morning stiffness',
      'Tips for sleeping peacefully without frequent waking up',
      'Remind me how much warm water to drink today',
      'Suggest a calming deep breathing exercise',
    ],
    quickPromptsHi: [
      'घुटनों के लिए कुर्सी पर बैठकर करने वाले 3 सरल व्यायाम बताएं',
      'रात को गहरी और शांत नींद के लिए कुछ सुझाव',
      'आज दिनभर में कितना पानी पीना चाहिए?',
      'मन को शांत करने वाला प्राणायाम बताएं',
    ],
    quickPromptsMr: [
      'गुडघ्यांसाठी खुर्चीवर बसून करता येणारे ३ सोपे व्यायाम सांगा',
      'शांत झोपेसाठी काही सोपे उपाय सांगा',
      'दिवसभरात किती पाणी प्यावे?',
      'मन शांत करण्यासाठी हलका प्राणायाम सुचवा',
    ],
  },
  {
    id: 'safety',
    titleEn: 'Safety & Scam Watch',
    titleHi: 'सुरक्षा व सतर्कता बडी',
    titleMr: 'सुरक्षा रक्षक बडी',
    subtitleEn: 'Verify suspicious messages and protect against fraud.',
    subtitleHi: 'संदिग्ध एसएमएस व फोन कॉल की जांच करें और सुरक्षित रहें।',
    subtitleMr: 'संशयास्पद मेसेज तपासा, बँक फसवणूक ओळखा आणि सुरक्षित राहा.',
    icon: ShieldCheck,
    quickPromptsEn: [
      'Someone sent an SMS saying power will be disconnected at 9 PM',
      'A caller asked for an OTP to update my bank KYC',
      'Is it safe to install AnyDesk or QuickSupport on my phone?',
      'I won a 25 Lakh lottery message on WhatsApp, is it real?',
    ],
    quickPromptsHi: [
      'बिजली कटने का मैसेज आया है, क्या यह धोखाधड़ी है?',
      'बैंक केवाईसी के लिए कोई फोन पर ओटीपी मांग रहा है',
      'क्या QuickSupport ऐप डाउनलोड करना सुरक्षित है?',
      'लॉटरी जीतने का मैसेज आया है, क्या यह सच है?',
    ],
    quickPromptsMr: [
      'वीज कापली जाईल असा मेसेज आला आहे, हे खोटे आहे का?',
      'बँक KYC साठी एकाने फोनवर OTP मागितला आहे',
      'मोबाईलवर QuickSupport अ‍ॅप घेणे सुरक्षित आहे का?',
      'लॉटरी लागल्याचा मेसेज आला आहे, हे खरे आहे का?',
    ],
  },
  {
    id: 'caregiver',
    titleEn: 'Caregiver Support Buddy',
    titleHi: 'परिवार व देखभाल साथी',
    titleMr: 'कुटुंब व काळजी सोबती',
    subtitleEn: 'Family communication notes and authorized health updates.',
    subtitleHi: 'परिवार को कुशलक्षेम संदेश भेजने में सहायता।',
    subtitleMr: 'कुटुंबियांना प्रेमळ निरोप पाठवणे व काळजीवाहकांशी संवाद.',
    icon: HeartHandshake,
    quickPromptsEn: [
      'Help me draft a sweet message to my daughter Priya',
      'Remind me what family contacts I have registered',
      'Show the weekly wellness report for my caregiver',
      'Tell my family I had a peaceful walk today',
    ],
    quickPromptsHi: [
      'मेरी बेटी प्रिया के लिए एक प्यारा संदेश तैयार करें',
      'मेरे पंजीकृत पारिवारिक संपर्क दिखाएं',
      'मेरी देखभालकर्ता के लिए साप्ताहिक स्वास्थ्य सारांश',
      'परिवार को बताएं कि मैंने आज सुबह की सैर पूरी की',
    ],
    quickPromptsMr: [
      'माझ्या मुलीसाठी एक गोड निरोप तयार करा',
      'माझ्या कुटुंबातील नोंदवलेले संपर्क दाखवा',
      'काळजीवाहकांसाठी साप्ताहिक आरोग्य सारांश दाखवा',
      'कुटुंबियांना सांगा की मी आज छान चालण्याचा व्यायाम केला',
    ],
  },
];

export const BuddyChat: React.FC = () => {
  const { user, language, speechRate, triggerEmergency, highContrast, t } = useApp();
  const { showTooltip } = useTooltip();

  const [selectedAgent, setSelectedAgent] = useState<AgentType>('auto');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  const [autoSpeechEnabled, setAutoSpeechEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [detectedMemoryCue, setDetectedMemoryCue] = useState<{ key: string; value: string; category: string } | null>(null);
  const [memorySavedNotification, setMemorySavedNotification] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatMicLongPress = useLongPress({
    thresholdMs: 450,
    onLongPress: () => showTooltip('mic_input'),
  });

  useEffect(() => {
    const pendingPrompt = sessionStorage.getItem('buddy_pending_prompt');
    if (pendingPrompt) {
      sessionStorage.removeItem('buddy_pending_prompt');
      handleSendMessage(pendingPrompt);
      return;
    }

    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_init',
          sender: 'assistant',
          agent: 'companion',
          routedAgent: 'companion',
          text: getInitialGreeting(selectedAgent, language),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language,
        },
      ]);
    }
  }, [selectedAgent, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, interimVoiceText]);

  const getInitialGreeting = (agent: AgentType, lang: Language): string => {
    const name = user?.name ? user.name.split(' ')[0] : 'friend';
    if (lang === 'hi') {
      return `नमस्ते ${name} जी! मैं आपका बडी एआई हूँ। चाहे आपको बातचीत करनी हो, फोन चलाना सीखना हो, या सेहत की बात करनी हो—मैं हमेशा आपके साथ हूँ। आज आप क्या करना चाहेंगे?`;
    }
    if (lang === 'mr') {
      return `नमस्कार ${name} काका/काकू! मी आपला बडी एआय आहे. गप्पा मारायच्या असोत, मोबाईल शिकायचा असो किंवा तब्येतीची काळजी—मी सदैव आपल्या सोबतीला आहे. आज आपण काय करूया?`;
    }
    return `Hello ${name}! I am your Buddy AI central companion. Whether you want a friendly talk, step-by-step phone lessons, gentle chair stretches, or safety advice, I am right here for you. How may I companion you today?`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    // Interrupt any active speech synthesis
    speechEngine.stop();
    setCurrentlySpeakingId(null);
    setIsSpeechPaused(false);

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      sender: 'user',
      agent: selectedAgent,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setInterimVoiceText('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const res = await api.chatWithAgent({
        agent: selectedAgent,
        message: text,
        language,
        history,
      });

      const assistantMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        agent: selectedAgent,
        routedAgent: res.selectedAgent,
        text: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        isEmergencyAlert: res.isEmergency,
        sources: res.sources,
        intent: res.intent,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // If emergency was triggered
      if (res.isEmergency) {
        triggerEmergency(`Voice trigger in chat: "${text}"`);
      }

      // Memory cue detection for consent
      if (res.detectedMemoryCue) {
        setDetectedMemoryCue(res.detectedMemoryCue);
      }

      // Voice readout if enabled
      if (autoSpeechEnabled && !res.isEmergency) {
        handleSpeak(assistantMsg.id, res.reply);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'system',
        agent: selectedAgent,
        text:
          language === 'hi'
            ? 'तकनीकी संपर्क में थोड़ा समय लग रहा है। कृपया पुनः पूछें।'
            : language === 'mr'
            ? 'संपर्क साधण्यात तांत्रिक अडचण आली. कृपया पुन्हा विचारा.'
            : 'I experienced a brief delay in connection. Please feel free to ask again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (currentlySpeakingId === msgId && speechEngine.isSpeaking()) {
      speechEngine.stop();
      setCurrentlySpeakingId(null);
      setIsSpeechPaused(false);
      return;
    }

    setCurrentlySpeakingId(msgId);
    setIsSpeechPaused(false);

    speechEngine.speak(
      text,
      language,
      speechRate,
      () => {
        setCurrentlySpeakingId(msgId);
        setIsSpeechPaused(false);
      },
      () => {
        setCurrentlySpeakingId(null);
        setIsSpeechPaused(false);
      },
      () => {
        setCurrentlySpeakingId(null);
        setIsSpeechPaused(false);
      }
    );
  };

  const handlePauseResumeSpeech = () => {
    if (speechEngine.isPaused()) {
      speechEngine.resume();
      setIsSpeechPaused(false);
    } else if (speechEngine.isSpeaking()) {
      speechEngine.pause();
      setIsSpeechPaused(true);
    }
  };

  const handleReplaySpeech = () => {
    if (currentlySpeakingId) {
      const targetMsg = messages.find((m) => m.id === currentlySpeakingId);
      if (targetMsg) {
        handleSpeak(targetMsg.id, targetMsg.text);
      }
    } else {
      const lastAssistant = [...messages].reverse().find((m) => m.sender === 'assistant');
      if (lastAssistant) {
        handleSpeak(lastAssistant.id, lastAssistant.text);
      }
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      voiceRecognizer.stopListening();
      setIsListening(false);
      setInterimVoiceText('');
      return;
    }

    if (!voiceRecognizer.isSupported()) {
      alert('Voice speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    // Stop speaking whenever mic is activated
    speechEngine.stop();
    setCurrentlySpeakingId(null);
    setIsListening(true);
    setInterimVoiceText('Listening for your voice...');

    voiceRecognizer.startListening(
      language,
      (transcript, isFinal) => {
        if (isFinal) {
          setIsListening(false);
          setInterimVoiceText('');
          handleSendMessage(transcript);
        } else {
          setInterimVoiceText(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        setInterimVoiceText('');
        console.warn('Voice error:', err);
      },
      () => {
        setIsListening(false);
        setInterimVoiceText('');
      }
    );
  };

  const handleAcceptMemory = async () => {
    if (!detectedMemoryCue) return;
    try {
      await api.saveMemoryItem(
        detectedMemoryCue.category,
        detectedMemoryCue.key,
        detectedMemoryCue.value,
        user?.id || 'senior_1'
      );
      setMemorySavedNotification(`Saved preference: "${detectedMemoryCue.value}"`);
      setDetectedMemoryCue(null);
      setTimeout(() => setMemorySavedNotification(''), 4000);
    } catch {
      setDetectedMemoryCue(null);
    }
  };

  const getAgentBadgeLabel = (agent: AgentType | undefined) => {
    switch (agent) {
      case 'education':
        return 'Digital Learning Buddy is helping you';
      case 'wellness':
        return 'Wellness Buddy is helping you';
      case 'safety':
        return 'Safety & Scam Watch Buddy is helping you';
      case 'caregiver':
        return 'Caregiver Support Buddy is helping you';
      case 'companion':
      default:
        return 'Buddy Companion is helping you';
    }
  };

  const currentAgentInfo = AGENT_LIST.find((a) => a.id === selectedAgent) || AGENT_LIST[0];

  const getPrompts = () => {
    if (language === 'hi') return currentAgentInfo.quickPromptsHi;
    if (language === 'mr') return currentAgentInfo.quickPromptsMr;
    return currentAgentInfo.quickPromptsEn;
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Central Orchestrator Agent Ribbon */}
      <section aria-label="Buddy AI Specialized Agents" className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <span>Specialized AI Companions</span>
            <FeatureInfoButton featureKey="agent_selection" size="sm" variant={highContrast ? 'contrast' : 'badge'} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={autoSpeechEnabled}
              onChange={(e) => setAutoSpeechEnabled(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded"
            />
            <span>Auto-Read Replies</span>
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {AGENT_LIST.map((agent) => {
            const Icon = agent.icon;
            const isSelected = selectedAgent === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => {
                  speechEngine.stop();
                  setCurrentlySpeakingId(null);
                  setSelectedAgent(agent.id);
                }}
                className={`p-3 rounded-2xl min-h-[64px] border-3 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? highContrast
                      ? 'bg-yellow-400 text-black border-white shadow-xl'
                      : 'bg-white text-slate-900 border-amber-500 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                    : highContrast
                    ? 'bg-black text-white border-slate-700 hover:border-yellow-400'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-amber-50/50'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-extrabold text-sm sm:text-base leading-tight">
                    {language === 'hi' ? agent.titleHi : language === 'mr' ? agent.titleMr : agent.titleEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Conversational Chat Container */}
      <section
        aria-label="Conversation Container"
        className={`rounded-3xl border-4 shadow-xl overflow-hidden flex flex-col h-[670px] ${
          highContrast ? 'bg-black text-white border-yellow-400' : 'bg-white border-slate-300'
        }`}
      >
        {/* Chat Top Bar & Voice Playback Controls */}
        <div
          className={`px-5 py-3 border-b-2 flex items-center justify-between gap-3 ${
            highContrast ? 'bg-slate-900 border-yellow-400' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <currentAgentInfo.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black">
                {language === 'hi' ? currentAgentInfo.titleHi : language === 'mr' ? currentAgentInfo.titleMr : currentAgentInfo.titleEn}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {selectedAgent === 'auto' ? 'Central Orchestrator Active' : 'Specialized Agent Locked'}
              </p>
            </div>
          </div>

          {/* Voice Playback Control Buttons */}
          <div className="flex items-center gap-2">
            {speechEngine.isSpeaking() && (
              <button
                onClick={handlePauseResumeSpeech}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
                title={isSpeechPaused ? 'Resume Speech' : 'Pause Speech'}
              >
                {isSpeechPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                <span className="hidden sm:inline">{isSpeechPaused ? 'Resume' : 'Pause'}</span>
              </button>
            )}

            <button
              onClick={handleReplaySpeech}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer"
              title="Replay Audio"
            >
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Replay</span>
            </button>

            <button
              onClick={() => {
                speechEngine.stop();
                setCurrentlySpeakingId(null);
                setMessages([]);
              }}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-300 hover:bg-slate-200 text-slate-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Start Fresh</span>
            </button>
          </div>
        </div>

        {/* Long-Term Memory Consent Toast */}
        {detectedMemoryCue && (
          <div className="p-3 bg-amber-100 border-b-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="text-sm sm:text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <span>
                Buddy noticed your interest: <strong>"{detectedMemoryCue.value}"</strong>. Remember this for your next chats?
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAcceptMemory}
                className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Yes, Remember</span>
              </button>
              <button
                onClick={() => setDetectedMemoryCue(null)}
                className="px-2.5 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>
        )}

        {memorySavedNotification && (
          <div className="p-2.5 bg-emerald-100 text-emerald-950 font-bold text-sm text-center border-b border-emerald-300">
            ✅ {memorySavedNotification}
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSystem = msg.sender === 'system';
            const isSpeakingThis = currentlySpeakingId === msg.id && speechEngine.isSpeaking();

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold text-center text-lg flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                  <span>{msg.text}</span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}>
                {/* Agent Attribution Banner */}
                {!isUser && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wide mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{getAgentBadgeLabel(msg.routedAgent || msg.agent)}</span>
                  </div>
                )}

                <div
                  className={`p-4 sm:p-5 rounded-3xl max-w-[88%] sm:max-w-[80%] border-2 text-xl sm:text-2xl font-medium leading-relaxed shadow-sm transition-all ${
                    isUser
                      ? 'bg-amber-500 text-white border-amber-600 rounded-tr-none'
                      : highContrast
                      ? 'bg-slate-900 text-white border-yellow-400 rounded-tl-none'
                      : 'bg-slate-50 text-slate-900 border-slate-200 rounded-tl-none'
                  } ${isSpeakingThis ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Grounded RAG Sources Accordion */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-sm font-normal">
                      <div className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>Verified Knowledge Grounding:</span>
                        </div>
                        <FeatureInfoButton featureKey="rag_grounding" size="sm" variant="badge" />
                      </div>
                      <div className="space-y-1">
                        {msg.sources.map((s, idx) => (
                          <div key={idx} className="p-2 rounded-xl bg-purple-50 text-purple-950 border border-purple-200 text-xs font-medium">
                            <strong className="font-bold text-purple-900">📚 {s.title}</strong>
                            <p className="opacity-90 mt-0.5 italic text-slate-700">"{s.snippet}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Read Aloud Button */}
                  {!isUser && (
                    <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.text)}
                          className={`min-h-[46px] px-3.5 py-1.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 border transition-all cursor-pointer ${
                            isSpeakingThis
                              ? 'bg-red-600 text-white border-red-700'
                              : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50'
                          }`}
                          aria-label={isSpeakingThis ? 'Stop speaking' : 'Read message aloud'}
                        >
                          {isSpeakingThis ? (
                            <>
                              <VolumeX className="w-5 h-5 text-white" />
                              <span>Stop Reading</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-5 h-5 text-amber-600" />
                              <span>Read Aloud</span>
                            </>
                          )}
                        </button>
                        <FeatureInfoButton featureKey="voice_readout" size="sm" variant="subtle" />
                      </div>

                      <span className="text-xs font-bold text-slate-400">{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-lg animate-pulse w-fit">
              <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
              <span>Buddy Central Orchestrator is formulating your response...</span>
            </div>
          )}

          {interimVoiceText && (
            <div className="p-3 rounded-2xl bg-red-50 text-red-900 font-bold text-base flex items-center gap-2 animate-pulse w-fit border border-red-200">
              <Mic className="w-5 h-5 text-red-600 animate-bounce" />
              <span>{interimVoiceText}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 overflow-x-auto scrollbar-none flex gap-2">
          {getPrompts().map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="min-h-[46px] px-3.5 py-2 rounded-xl bg-white text-slate-800 text-sm sm:text-base font-bold border-2 border-slate-300 hover:border-amber-500 hover:bg-amber-50 whitespace-nowrap shadow-sm transition-all flex-shrink-0 cursor-pointer"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Voice-First Input Bar (60px+ targets) */}
        <div className={`p-4 border-t-2 ${highContrast ? 'bg-black border-yellow-400' : 'bg-white border-slate-200'}`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            {/* Microphone Button (Speech-to-Text) with Long-Press & Accessible Info */}
            <div className="relative inline-flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={handleVoiceToggle}
                {...chatMicLongPress}
                className={`min-h-[64px] min-w-[64px] sm:px-5 py-3 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all cursor-pointer border-3 ${
                  isListening
                    ? 'bg-red-600 text-white voice-recording-pulse border-white'
                    : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white border-amber-600 shadow-md'
                }`}
                title={isListening ? 'Stop listening' : 'Start speaking (Press and hold for explanation)'}
                aria-label={isListening ? 'Stop microphone' : 'Start voice input. Long press or tap info for explanation.'}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-8 h-8 animate-spin" />
                    <span className="hidden sm:inline">Listening...</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-8 h-8" />
                    <span className="hidden sm:inline">Voice</span>
                  </>
                )}
              </button>
              <div className="absolute -top-2 -right-2 z-10">
                <FeatureInfoButton featureKey="mic_input" size="sm" variant="contrast" />
              </div>
            </div>

            {/* Accessible Large Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'यहाँ लिखें या माइक दबाकर बोलें...'
                  : language === 'mr'
                  ? 'येथे लिहा किंवा माइक दाबून बोला...'
                  : 'Type your message or tap Voice...'
              }
              className={`flex-1 min-h-[64px] px-5 rounded-2xl border-3 text-lg sm:text-xl font-medium focus:outline-none focus:ring-4 focus:ring-amber-400 ${
                highContrast
                  ? 'bg-slate-900 text-white border-yellow-400 placeholder:text-slate-400'
                  : 'bg-slate-100 text-slate-900 border-slate-300 placeholder:text-slate-500'
              }`}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="min-h-[64px] min-w-[64px] px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-40 text-white font-extrabold text-xl flex items-center justify-center transition-all cursor-pointer shadow-md"
              aria-label="Send message"
            >
              <Send className="w-7 h-7" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
