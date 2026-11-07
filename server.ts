import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { chatRoutes } from './backend/routes/chatRoutes';
import { memoryRoutes } from './backend/routes/memoryRoutes';
import { ragRoutes } from './backend/routes/ragRoutes';
import { emergencyRoutes } from './backend/routes/emergencyRoutes';
import { adminRoutes } from './backend/routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini API
const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();
const hasValidGeminiKey =
  Boolean(geminiApiKey) &&
  geminiApiKey !== 'MY_GEMINI_API_KEY' &&
  !geminiApiKey.startsWith('MY_') &&
  geminiApiKey.length > 10;

const ai = hasValidGeminiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

function callWithTimeout<T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('AI request timed out')), timeoutMs)
    ),
  ]);
}

// Persistent Data Storage setup
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AppStore {
  user: {
    id: string;
    name: string;
    role: 'senior' | 'caregiver';
    age: number;
    language: 'en' | 'hi' | 'mr';
    preferredSpeechRate: number;
    highContrast: boolean;
    fontSize: 'standard' | 'large' | 'extra-large';
    emergencyContacts: Array<{
      id: string;
      name: string;
      relation: string;
      phone: string;
      isPrimaryCaregiver: boolean;
    }>;
    privacySettings: {
      shareWellnessWithCaregiver: boolean;
      shareExercisesWithCaregiver: boolean;
      shareLearningProgress: boolean;
      allowEmergencyLocation: boolean;
    };
  };
  checkIns: Array<{
    id: string;
    userId: string;
    date: string;
    timestamp: string;
    mood: 'great' | 'good' | 'okay' | 'tired' | 'pain';
    sleepQuality: 'deep' | 'adequate' | 'restless';
    physicalDiscomfort: string[];
    notes?: string;
  }>;
  exerciseLogs: Array<{
    id: string;
    exerciseId: string;
    date: string;
    completed: boolean;
    timestamp: string;
  }>;
  completedLessons: string[];
  emergencyLogs: Array<{
    id: string;
    reason: string;
    timestamp: string;
    status: string;
  }>;
}

const DEFAULT_STORE: AppStore = {
  user: {
    id: 'senior_1',
    name: 'Ramesh Sharma',
    role: 'senior',
    age: 72,
    language: 'en',
    preferredSpeechRate: 0.85,
    highContrast: false,
    fontSize: 'large',
    emergencyContacts: [
      {
        id: 'c1',
        name: 'Priya Sharma (Daughter)',
        relation: 'Daughter & Primary Caregiver',
        phone: '+91 98765 43210',
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
    },
  },
  checkIns: [
    {
      id: 'chk_init_1',
      userId: 'senior_1',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      timestamp: '09:15 AM',
      mood: 'good',
      sleepQuality: 'adequate',
      physicalDiscomfort: ['None (Feeling comfortable)'],
      notes: 'Morning walk in garden',
    },
    {
      id: 'chk_init_2',
      userId: 'senior_1',
      date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
      timestamp: '08:45 AM',
      mood: 'great',
      sleepQuality: 'deep',
      physicalDiscomfort: ['None (Feeling comfortable)'],
      notes: 'Slept soundly',
    },
  ],
  exerciseLogs: [
    {
      id: 'ex_log_1',
      exerciseId: 'ex_1',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      completed: true,
      timestamp: '10:30 AM',
    },
  ],
  completedLessons: ['l_phone_1', 'l_wa_1'],
  emergencyLogs: [],
};

function loadStore(): AppStore {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading store file, using default', err);
  }
  saveStore(DEFAULT_STORE);
  return DEFAULT_STORE;
}

function saveStore(data: AppStore) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file', err);
  }
}

let store = loadStore();

// Fall Prevention Exercises Static Data
const EXERCISE_GUIDES = [
  {
    id: 'ex_1',
    titleEn: 'Seated Gentle Leg Lifts',
    titleHi: 'कुर्सी पर बैठकर हल्के पैर उठाना',
    titleMr: 'खुर्चीवर बसून पाय वर उचलणे',
    category: 'legs',
    durationMinutes: 5,
    descriptionEn: 'Strengthens front thigh muscles and knees while comfortably seated on a stable chair.',
    descriptionHi: 'स्थिर कुर्सी पर आराम से बैठकर जांघों व घुटनों की मांसपेशियों को मजबूत करता है।',
    descriptionMr: 'खुर्चीवर बसून गुडघे व मांड्यांचे स्नायू बळकट करणारा अत्यंत सुरक्षित व्यायाम.',
    stepsEn: [
      'Sit tall on a sturdy dining chair with feet flat on the floor.',
      'Slowly straighten your right leg forward until it is horizontal.',
      'Hold the position gently for 3 to 5 seconds while breathing smoothly.',
      'Slowly lower the foot back to the floor.',
      'Repeat 8 times for the right leg, then 8 times for the left leg.',
    ],
    stepsHi: [
      'एक मजबूत कुर्सी पर सीधी पीठ रखकर बैठें, दोनों पैर जमीन पर टिके हों।',
      'धीरे-धीरे अपने दाएं पैर को आगे की ओर सीधा उठाएं।',
      '3 से 5 सेकंड तक इसी स्थिति में रुकें और सामान्य सांस लेते रहें।',
      'धीरे-धीरे पैर को वापस जमीन पर रखें।',
      'दाएं पैर से 8 बार दोहराएं, फिर बाएं पैर से 8 बार करें।',
    ],
    stepsMr: [
      'मजबूत खुर्चीवर सरळ पाठीने बसा, दोन्ही पाय जमिनीवर ठेवा.',
      'हळूवारपणे उजवा पाय समोर सरळ उचला.',
      '३ ते ५ सेकंद पाय वर धरून ठेवा आणि सामान्य श्वास घ्या.',
      'पाय हळूहळू खाली जमिनीवर आणा.',
      '८ वेळा उजव्या पायाने करा, नंतर ८ वेळा डाव्या पायाने करा.',
    ],
    safetyTipsEn: 'Do not lock your knee joint rigidly. Keep breathing steadily; never hold your breath.',
    safetyTipsHi: 'घुटने पर अत्यधिक दबाव न डालें। सांस रोक कर न रखें, सामान्य सांस लेते रहें।',
    safetyTipsMr: 'गुडघ्यावर अति ताण देऊ नका. श्वास रोखून धरू नका.',
    iconName: 'Activity',
  },
  {
    id: 'ex_2',
    titleEn: 'Gentle Ankle Circles & Pointing',
    titleHi: 'टखनों को गोल घुमाना व लचीलापन',
    titleMr: 'घोटा गोल फिरवणे व ताणणे',
    category: 'ankles',
    durationMinutes: 4,
    descriptionEn: 'Improves blood circulation in feet and strengthens ankles for stumble prevention.',
    descriptionHi: 'पैरों में रक्त संचार बढ़ाता है और टखनों को मजबूत कर फिसलने से बचाता है।',
    descriptionMr: 'पायातील रक्ताभिसरण सुधारते आणि तोल जाण्यापासून संरक्षण करते.',
    stepsEn: [
      'Sit comfortably and raise one foot slightly off the floor.',
      'Point your toes forward, then pull them up towards your shin 5 times.',
      'Slowly rotate your ankle in a circle clockwise 5 times.',
      'Rotate counter-clockwise 5 times.',
      'Switch to the other foot and repeat.',
    ],
    stepsHi: [
      'आराम से बैठें और एक पैर को जमीन से थोड़ा ऊपर उठाएं।',
      'पैर की उंगलियों को आगे की ओर दबाएं, फिर ऊपर अपनी ओर खींचें (5 बार)।',
      'टखने को घड़ी की दिशा में 5 बार गोल घुमाएं।',
      'फिर उल्टी दिशा में 5 बार घुमाएं।',
      'अब दूसरे पैर से यही क्रिया दोहराएं।',
    ],
    stepsMr: [
      'खुर्चीवर बसा आणि एक पाय जमिनीपासून थोडा वर उचला.',
      'पायाची बोटे समोर ताणा, नंतर स्वतःच्या दिशेने ओढा (५ वेळा).',
      'घोटा गोलाकार दिशेने ५ वेळा फिरवा.',
      'दुसऱ्या बाजूने ५ वेळा फिरवा आणि दुसऱ्या पायानेही करा.',
    ],
    safetyTipsEn: 'Move smoothly without forcing stiffness. Stop if you feel sharp calf pain.',
    safetyTipsHi: 'झटके के साथ न घुमाएं। यदि पिंडलियों में दर्द हो तो तुरंत रुक जाएं।',
    safetyTipsMr: 'झटका देऊ नका. दुखत असल्यास थांबा.',
    iconName: 'Activity',
  },
  {
    id: 'ex_3',
    titleEn: 'Chair-Supported Standing Balance',
    titleHi: 'कुर्सी के सहारे खड़े होकर संतुलन',
    titleMr: 'खुर्चीचा आधार घेऊन उभे राहणे',
    category: 'balance',
    durationMinutes: 5,
    descriptionEn: 'Enhances posture, hip strength, and steady walking stability with two-hand support.',
    descriptionHi: 'दोनों हाथों से कुर्सी पकड़कर खड़े रहने का संतुलन और चाल में स्थिरता बढ़ाता है।',
    descriptionMr: 'चालताना तोल सांभाळण्याची क्षमता वाढवणारा सोपा व सुरक्षित व्यायाम.',
    stepsEn: [
      'Stand behind a sturdy kitchen counter or heavy dining chair.',
      'Hold firmly onto the backrest with both hands.',
      'Stand tall with feet shoulder-width apart, looking straight ahead.',
      'Slowly shift your body weight slightly to the right foot, then left foot.',
      'Perform this gentle sway for 10 repetitions.',
    ],
    stepsHi: [
      'किसी भारी कुर्सी या मजबूत मेज के पीछे खड़े हों।',
      'दोनों हाथों से कुर्सी के पिछले हिस्से को मजबूती से पकड़ें।',
      'सीधे खड़े रहें और सामने देखें।',
      'धीरे-धीरे अपना वजन दाएं पैर पर और फिर बाएं पैर पर संतुलित करें।',
      'इसे शांत भाव से 10 बार दोहराएं।',
    ],
    stepsMr: [
      'मजबूत खुर्चीच्या किंवा टेबलच्या मागे उभे राहा.',
      'दोन्ही हातांनी खुर्चीची पाठ घट्ट पकडा.',
      'सरळ उभे राहून हळूहळू उजव्या आणि डाव्या पायावर वजन नियंत्रित करा.',
      '१० वेळा हळुवारपणे करा.',
    ],
    safetyTipsEn: 'Always maintain firm hand contact on the chair. Wear non-slip footwear.',
    safetyTipsHi: 'कुर्सी को हमेशा दोनों हाथों से पकड़े रखें। फिसलने वाले जूते-चप्पल न पहनें।',
    safetyTipsMr: 'खुर्चीवर दोन्ही हातांचा आधार नेहमी ठेवा. घसरणाऱ्या चपला वापरू नका.',
    iconName: 'Activity',
  },
];

// Digital Literacy Courses Static Data
const DIGITAL_COURSES = [
  {
    id: 'course_phone',
    titleEn: 'Smartphone Basics & Comfort',
    titleHi: 'स्मार्टफोन की बुनियादी बातें',
    titleMr: 'स्मार्टफोनचे मूलभूत ज्ञान',
    category: 'Device Basics',
    iconName: 'Smartphone',
    summaryEn: 'Learn how to hold, charge, adjust volume, and make fonts larger on your phone.',
    summaryHi: 'फोन पकड़ना, चार्ज करना, आवाज़ बढ़ाना और लिखावट को बड़ा करना सीखें।',
    summaryMr: 'फोन चार्ज करणे, आवाज वाढवणे आणि अक्षरे मोठी करायला शिका.',
    practiceTaskEn: 'Practice locating the volume buttons and locking/unlocking your screen comfortably.',
    practiceTaskHi: 'फोन की स्क्रीन को लॉक और अनलॉक करने का अभ्यास करें।',
    practiceTaskMr: 'मोबाईलची स्क्रीन लॉक आणि अनलॉक करण्याचा सराव करा.',
    lessons: [
      {
        id: 'l_phone_1',
        stepNumber: 1,
        titleEn: 'Adjusting Volume & Ringer',
        titleHi: 'फोन की आवाज़ और घंटी तेज करना',
        titleMr: 'आवाज आणि रिंगटोन मोठी करणे',
        instructionEn: 'Look at the side edge of your phone. There is a long button. Press the TOP part of the button to make sounds and speech louder, and the bottom part to lower it.',
        instructionHi: 'फोन के किनारे पर एक लंबा बटन होता है। ऊपर का हिस्सा दबाने पर आवाज़ तेज होती है, और नीचे का हिस्सा दबाने पर धीमी होती है।',
        instructionMr: 'फोनच्या बाजूला एक लांब बटण असते. वरचा भाग दाबल्यास आवाज वाढतो आणि खालचा भाग दाबल्यास आवाज कमी होतो.',
        tipEn: 'You can test the volume while on a phone call with your daughter or son.',
        tipHi: 'कॉल के दौरान भी आप इसे दबाकर सुनने की आवाज़ तेज कर सकते हैं।',
        tipMr: 'फोनवर बोलतानाही आवाज मोठा करता येतो.',
      },
      {
        id: 'l_phone_2',
        stepNumber: 2,
        titleEn: 'Making Text & Fonts Bigger',
        titleHi: 'स्क्रीन के अक्षरों को बड़ा करना',
        titleMr: 'स्क्रीनवरील अक्षरे मोठी करणे',
        instructionEn: 'Open Settings (the gear icon ⚙️), tap "Display", then tap "Font Size". Slide the dot to the right to make all letters big and easy to read without straining eyes.',
        instructionHi: 'फोन की सेटिंग्स (गियर आइकन ⚙️) खोलें, "डिस्प्ले" पर जाएं और "फॉन्ट साइज" को दाएं खिसकाकर बड़ा कर लें।',
        instructionMr: 'सेटिंग्ज ⚙️ मध्ये जाऊन डिस्प्ले निवडा आणि फॉन्ट साईझ मोठी करा जेणेकरून वाचायला सोपे जाईल.',
        tipEn: 'This makes reading messages very comfortable without needing reading glasses every time.',
        tipHi: 'इससे बिना चश्मे के भी संदेश आसानी से पढ़े जा सकेंगे।',
        tipMr: 'यामुळे चष्मा न लावताही मेसेज छान वाचता येतात.',
      },
    ],
  },
  {
    id: 'course_whatsapp',
    titleEn: 'WhatsApp: Messages & Voice Notes',
    titleHi: 'व्हाट्सएप: संदेश और वॉइस नोट भेजना',
    titleMr: 'व्हॉट्सअ‍ॅप: मेसेज आणि व्हॉइस नोट',
    category: 'Communication',
    iconName: 'MessageCircle',
    summaryEn: 'Send text, record voice audio messages, and keep in touch with children and grandchildren.',
    summaryHi: 'लिखकर या बोलकर वॉइस संदेश भेजें और परिवार से जुड़े रहें।',
    summaryMr: 'बोलून व्हॉइस मेसेज पाठवणे व कुटुंबियांच्या संपर्कात राहणे.',
    practiceTaskEn: 'Practice pressing the green microphone button in the simulator to send a greeting voice note.',
    practiceTaskHi: 'सिम्युलेटर में माइक बटन दबाकर अपने नाती-पोतों को नमस्ते संदेश भेजने का अभ्यास करें।',
    practiceTaskMr: 'माइक बटण दाबून नातवंडांना आवाजातील निरोप पाठवण्याचा सराव करा.',
    lessons: [
      {
        id: 'l_wa_1',
        stepNumber: 1,
        titleEn: 'Sending a Voice Note',
        titleHi: 'बोलकर संदेश (वॉइस नोट) भेजना',
        titleMr: 'बोलून व्हॉइस मेसेज पाठवणे',
        instructionEn: 'Instead of typing on small keys, press and hold the green microphone icon 🎙️ in any chat. Speak your heart out, and release your finger to send!',
        instructionHi: 'टाइप करने की जगह नीचे दिए गए हरे माइक 🎙️ बटन को दबाकर रखें। अपनी बात बोलें और उंगली हटाते ही संदेश चला जाएगा!',
        instructionMr: 'टाईप करण्याऐवजी खालचे हिरवे माइकचे बटण 🎙️ दाबून ठेवा. बोला आणि बोट काढताच मेसेज जाईल!',
        tipEn: 'If you made a mistake while speaking, just slide your finger to the left to cancel.',
        tipHi: 'यदि बोलते समय गलती हो जाए, तो उंगली को बाईं ओर खिसका दें, संदेश रद्द हो जाएगा।',
        tipMr: 'काही चूक झाल्यास बोट डावीकडे सरकवून मेसेज रद्द करता येतो.',
      },
      {
        id: 'l_wa_2',
        stepNumber: 2,
        titleEn: 'Sending Photos to Family',
        titleHi: 'बच्चों को फोटो भेजना',
        titleMr: 'नातवंडांना फोटो पाठवणे',
        instructionEn: 'Tap the paperclip icon 📎 or Camera icon 📷 at the bottom of the chat. Select the photo you want, and tap the green paper airplane send button.',
        instructionHi: 'चैट में नीचे कैमरा 📷 या पिन 📎 आइकन दबाएं। अपनी पसंद की फोटो चुनें और हरे बटन को दबाकर भेज दें।',
        instructionMr: 'कॅमेरा 📷 किंवा पिन 📎 आयकॉन दाबा, फोटो निवडा आणि पाठवा.',
        tipEn: 'You can send photos of your garden, morning tea, or festival pooja to brighten their day.',
        tipHi: 'त्योहार या पूजा की सुंदर तस्वीरें बच्चों को आसानी से भेजें।',
        tipMr: 'सणासुदीचे व पूजेचे फोटो घरच्यांना सहज पाठवा.',
      },
    ],
  },
  {
    id: 'course_upi_safety',
    titleEn: 'UPI & Banking Safety',
    titleHi: 'यूपीआई व बैंक सुरक्षा: कभी न करें ये गलतियां',
    titleMr: 'UPI आणि बँक सुरक्षा',
    category: 'Finance & Security',
    iconName: 'Lock',
    summaryEn: 'Understand UPI PIN, why you NEVER enter PIN to receive money, and how to spot fraud.',
    summaryHi: 'यूपीआई पिन क्या है, पैसे प्राप्त करने के लिए कभी पिन क्यों नहीं डालते, सीखें।',
    summaryMr: 'UPI पिन काय आहे आणि पैसे मिळवण्यासाठी कधीही पिन टाकू नये हे समजून घ्या.',
    practiceTaskEn: 'Practice identifying which payment prompts are genuine versus dangerous scams.',
    practiceTaskHi: 'नकली और असली बैंक मैसेज की पहचान करने का अभ्यास करें।',
    practiceTaskMr: 'खोट्या व फसव्या बँक मेसेजची ओळख पटवण्याचा सराव करा.',
    lessons: [
      {
        id: 'l_upi_1',
        stepNumber: 1,
        titleEn: 'Golden Rule of UPI PIN',
        titleHi: 'यूपीआई पिन का सबसे बड़ा नियम',
        titleMr: 'UPI पिनचा सुवर्ण नियम',
        instructionEn: 'REMEMBER: UPI PIN is ONLY entered when MONEY IS LEAVING YOUR ACCOUNT. You NEVER EVER have to enter your UPI PIN to receive money, lottery, pension, or refunds!',
        instructionHi: 'याद रखें: यूपीआई पिन केवल तभी डाला जाता है जब आपके खाते से पैसे कटने हों। पैसे पाने, पेंशन या रिफंड के लिए कभी भी पिन नहीं डाला जाता!',
        instructionMr: 'लक्षात ठेवा: खात्यातून पैसे पाठवतानाच पिन टाकावा लागतो. पैसे मिळवण्यासाठी कधीही पिन लागत नाही!',
        tipEn: 'If anyone on a phone call says "enter your PIN to receive money", cut the call immediately.',
        tipHi: 'यदि कोई फोन पर कहे कि पैसे पाने के लिए पिन डालें, तो तुरंत फोन काट दें।',
        tipMr: 'कोणी फोनवर पैसे घेण्यासाठी पिन टाका असे सांगितल्यास ताबडतोब फोन कट करा.',
      },
    ],
  },
  {
    id: 'course_email',
    titleEn: 'Email Basics & Spam Avoidance',
    titleHi: 'ईमेल पढ़ना और स्पैम से बचाव',
    titleMr: 'ईमेल वाचन आणि स्पॅमपासून बचाव',
    category: 'Communication',
    iconName: 'Mail',
    summaryEn: 'Learn how to read utility bills, government notifications, and identify fake email scams safely.',
    summaryHi: 'बिजली बिल व जरूरी ईमेल पढ़ना और फर्जी ईमेल पहचानने के तरीके सीखें।',
    summaryMr: 'लाईट बिल व सरकारी ईमेल वाचणे आणि खोट्या ईमेल्सपासून सावध राहणे.',
    practiceTaskEn: 'Practice recognizing safe sender addresses like @sbi.co.in versus fake ones like @sbi-support.xyz.',
    practiceTaskHi: 'नकली ईमेल पते और असली बैंक पते में अंतर पहचानें।',
    practiceTaskMr: 'खऱ्या आणि खोट्या ईमेल पत्त्यांमधील फरक समजून घ्या.',
    lessons: [
      {
        id: 'l_email_1',
        stepNumber: 1,
        titleEn: 'Opening & Reading Safe Emails',
        titleHi: 'सुरक्षित ईमेल खोलना और पढ़ना',
        titleMr: 'सुरक्षित ईमेल उघडणे व वाचणे',
        instructionEn: 'Tap the Gmail app icon ✉️. Your new emails appear in bold at the top. Tap once to read.',
        instructionHi: 'जीमेल ऐप ✉️ खोलें। नए संदेश ऊपर दिखेंगे, एक बार दबाकर पढ़ें।',
        instructionMr: 'जीमेल ॲप ✉️ उघडा आणि वरचा मेसेज टॅप करून वाचा.',
        tipEn: 'Never click on attachments ending with .exe, .apk, or from unknown sweepstakes.',
        tipHi: 'अपरिचित लॉटरी या .apk वाले अटैचमेंट कभी न खोलें।',
        tipMr: 'अनोळखी फाईल्स किंवा लॉटरीच्या लिंक्स उघडू नका.',
      },
    ],
  },
  {
    id: 'course_video_call',
    titleEn: 'Video Calling with Loved Ones',
    titleHi: 'बच्चों के साथ वीडियो कॉल करना',
    titleMr: 'कुटुंबियांशी व्हिडिओ कॉल करणे',
    category: 'Family Connection',
    iconName: 'Video',
    summaryEn: 'Face-to-face video talks on WhatsApp with children living far away.',
    summaryHi: 'दूर रहने वाले बच्चों और नाती-पोतों से सामने देखकर बात करना सीखें।',
    summaryMr: 'दूर राहणाऱ्या मुलांशी व नातवंडांशी समोरासमोर बोलणे शिका.',
    practiceTaskEn: 'Practice flipping the camera to show your plants or festival sweets during a call.',
    practiceTaskHi: 'वीडियो कॉल के दौरान अपना बगीचा या घर दिखाने के लिए कैमरा पलटने का अभ्यास करें।',
    practiceTaskMr: 'कॉल सुरू असताना कॅमेरा फिरवून घर किंवा बाग दाखवण्याचा सराव करा.',
    lessons: [
      {
        id: 'l_vid_1',
        stepNumber: 1,
        titleEn: 'Starting a WhatsApp Video Call',
        titleHi: 'व्हाट्सएप वीडियो कॉल शुरू करना',
        titleMr: 'व्हॉट्सॲप व्हिडिओ कॉल सुरू करणे',
        instructionEn: 'Open your child’s chat. At the very top right, look for the small video camera icon 📹. Tap it once, and wait for them to answer with a smile!',
        instructionHi: 'अपने बच्चे की चैट खोलें। ऊपर दाईं ओर छोटे वीडियो कैमरा 📹 आइकन को दबाएं।',
        instructionMr: 'मुलांची चॅट उघडा, वरच्या कोपऱ्यातील व्हिडिओ कॅमेरा 📹 आयकॉन दाबा.',
        tipEn: 'Sit near a window during daytime so your face is brightly lit and clear.',
        tipHi: 'खिड़की के पास बैठें ताकि आपका चेहरा बच्चों को साफ और उजला दिखाई दे।',
        tipMr: 'खिडकीजवळ बसा जेणेकरून तुमचा चेहरा स्पष्ट आणि उजळ दिसेल.',
      },
    ],
  },
  {
    id: 'course_safety',
    titleEn: 'Online Scam & Phishing Defense',
    titleHi: 'ऑनलाइन धोखाधड़ी से पूर्ण सुरक्षा',
    titleMr: 'ऑनलाइन फसवणुकीपासून पूर्ण संरक्षण',
    category: 'Security',
    iconName: 'Lock',
    summaryEn: 'How scammers create false urgency and how to calmly protect yourself.',
    summaryHi: 'धोखेबाजों की चालें समझें और अपने बैंक खाते को हमेशा सुरक्षित रखें।',
    summaryMr: 'फसव्या मेसेजचे डावपेच ओळखा आणि खाती सुरक्षित ठेवा.',
    practiceTaskEn: 'Learn how to pause, take a deep breath, and consult your caregiver before acting on any urgent SMS.',
    practiceTaskHi: 'किसी भी डरावने मैसेज पर तुरंत घबराने की जगह परिवार से बात करने का नियम बनाएं।',
    practiceTaskMr: 'कोणत्याही संशयास्पद मेसेजवर आधी शांत राहून कुटुंबियांना दाखवण्याचा नियम करा.',
    lessons: [
      {
        id: 'l_sec_1',
        stepNumber: 1,
        titleEn: 'Recognizing Fake Urgency & Fear',
        titleHi: 'डराने वाले फर्जी संदेशों की पहचान',
        titleMr: 'घाबरवणाऱ्या खोट्या मेसेजची ओळख',
        instructionEn: 'Scammers always say "IMMEDIATELY" or "TONIGHT". Real banks and government offices NEVER give 2-hour ultimatums over SMS.',
        instructionHi: 'धोखेबाज हमेशा "तुरंत" या "आज रात" बिजली कटने की धमकी देते हैं। असली बैंक कभी ऐसा अल्टीमेटम नहीं देते।',
        instructionMr: 'फसवणूक करणारे नेहमी आज रात्रीत वीज किंवा बँक बंद होईल अशी भीती घालतात. सरकारी संस्था असा मेसेज कधीही पाठवत नाहीत.',
        tipEn: 'Whenever you see an urgent threat, open Buddy AI Safety Center and paste the text.',
        tipHi: 'जब भी ऐसा मैसेज आए, बडी एआई के सुरक्षा केंद्र में जांच लें।',
        tipMr: 'असा मेसेज आल्यास लगेच बडीच्या सुरक्षा केंद्रात तपासा.',
      },
    ],
  },
  {
    id: 'course_gov',
    titleEn: 'Government Portals & Senior Welfare',
    titleHi: 'सरकारी पेंशन व वरिष्ठ नागरिक योजनाएं',
    titleMr: 'सरकारी पेन्शन व ज्येष्ठ नागरिक योजना',
    category: 'Government Services',
    iconName: 'Globe',
    summaryEn: 'Access Jeevan Pramaan digital life certificates, Senior Citizen Card, and Ayushman Bharat.',
    summaryHi: 'घर बैठे जीवन प्रमाण पत्र, वरिष्ठ नागरिक कार्ड और आयुष्मान भारत की जानकारी प्राप्त करें।',
    summaryMr: 'घरी बसून जीवन प्रमाणपत्र, ज्येष्ठ नागरिक ओळखपत्र व पेन्शनची माहिती मिळवा.',
    practiceTaskEn: 'Practice reviewing the 3 required documents for Digital Life Certificate submission.',
    practiceTaskHi: 'डिजिटल जीवन प्रमाण पत्र के लिए आवश्यक 3 दस्तावेजों की जांच करें।',
    practiceTaskMr: 'डिजिटल जीवन प्रमाणपत्रासाठी लागणाऱ्या ३ कागदपत्रांची पडताळणी करा.',
    lessons: [
      {
        id: 'l_gov_1',
        stepNumber: 1,
        titleEn: 'Digital Life Certificate (Jeevan Pramaan)',
        titleHi: 'डिजिटल जीवन प्रमाण पत्र (घर बैठे)',
        titleMr: 'डिजिटल जीवन प्रमाणपत्र (घरी बसून)',
        instructionEn: 'Pensioners no longer need to stand in long bank queues every November. Using the Jeevan Pramaan face app on your phone, you can submit your certificate in 2 minutes.',
        instructionHi: 'अब हर नवंबर बैंक की लाइन में लगने की जरूरत नहीं। अपने मोबाइल के कैमरे से चेहरा दिखाकर 2 मिनट में प्रमाण पत्र जमा करें।',
        instructionMr: 'दर नोव्हेंबरला बँकेच्या रांगेत उभे न राहता मोबाईल कॅमेऱ्याने २ मिनिटांत जीवन प्रमाणपत्र सादर करता येते.',
        tipEn: 'Your daughter or son can assist you with the face scan authentication.',
        tipHi: 'आपके परिवार के सदस्य स्कैन करने में आपकी मदद कर सकते हैं।',
        tipMr: 'कुटुंबातील मुले चेहरा स्कॅन करताना मदत करू शकतात.',
      },
    ],
  },
];

// Specialized Agent System Prompts
function getAgentSystemInstruction(agent: string, language: string): string {
  const langRule =
    language === 'hi'
      ? 'Always answer respectfully in clean, simple, natural Hindi (Devanagari script), using respectful honorifics like "जी" and "आप".'
      : language === 'mr'
      ? 'Always answer warmly and respectfully in natural Marathi (Devanagari script), using polite forms like "काका/काकू", "आपण", and simple everyday words.'
      : 'Always answer in warm, clear, plain English, using kind, respectful, and easy-to-read phrasing.';

  const accessibility = `
You are Buddy Elder AI, a caring, patient, respectful, and clear digital companion for senior citizens (elderly people aged 65-90).
CRITICAL RULES:
1. Use simple words and short, clear sentences. Avoid jargon, technical buzzwords, or wall-of-text explanations.
2. Ask only ONE gentle question at a time if asking a question.
3. Be deeply respectful, compassionate, polite, and encouraging.
4. ${langRule}
`;

  switch (agent) {
    case 'companion':
      return `
${accessibility}
ROLE: Companion Agent
- Engage in cheerful, everyday friendly conversations.
- Share heartwarming folk stories, traditional anecdotes, nostalgic recollections (old songs, gardens, festivals, monsoons).
- Tell clean, gentle, smile-inducing jokes.
- Offer empathetic emotional encouragement when the senior feels lonely or tired.
- Never give unsolicited medical prescriptions or diagnostic advice.
`;

    case 'education':
      return `
${accessibility}
ROLE: Digital Education Agent
- Patiently teach seniors how to use their smartphones, WhatsApp, YouTube, making video calls, sending photos, and browsing safely.
- Break every process down into numbered, easy steps (Step 1, Step 2, Step 3).
- Explain things in terms of physical metaphors (e.g. "Think of WhatsApp like a postcard, but it arrives in one second!").
- Celebrate small victories ("That's wonderful! You are doing great!").
- Remind them that it's okay to make mistakes and they can ask you to repeat anytime.
`;

    case 'wellness':
      return `
${accessibility}
ROLE: Wellness Agent
- Provide general, gentle wellness education, hydration reminders, and routine suggestions.
- Suggest simple, seated chair stretches, gentle ankle rotations, and calming deep breathing exercises.
- STRICT MEDICAL SAFETY BOUNDARY:
  - NEVER invent or prescribe medications, dosages, or medical diagnoses.
  - If the senior describes acute chest pain, sudden severe dizziness, inability to move, or a bad fall, immediately advise them to sit down safely, call 112 or their family doctor, and trigger emergency help.
  - Remind them in a comforting tone: "I am your wellness companion, but for health symptoms, always check with your doctor."
`;

    case 'safety':
      return `
${accessibility}
ROLE: Safety & Scam Detection Agent
- Help seniors identify suspicious SMS, WhatsApp forwards, phishing links, and phone call scams.
- Explain common tricks simply: Electricity bill threats, SBI/HDFC KYC APK links, fake KBC/lottery prizes, and AnyDesk/TeamViewer screen sharing traps.
- Emphasize the golden rule: Never share OTPs, passwords, or UPI PINs with anyone.
- EMERGENCY DETECTION:
  - If the senior mentions "I have fallen", "I cannot get up", "I am hurt", "I feel dizzy/unsafe", respond immediately with utmost calm urgency, telling them to stay still and that emergency contacts and 112 are available.
`;

    default:
      return accessibility;
  }
}

// ---------------- REST API ROUTES ----------------

// 1. Auth & Profiles
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { role, pinOrPassword } = req.body;
  if (role === 'caregiver') {
    // Caregiver password check
    if (pinOrPassword && pinOrPassword.length >= 4) {
      store.user.role = 'caregiver';
      saveStore(store);
      return res.json({ user: store.user, token: 'session_caregiver_token' });
    }
    return res.status(401).json({ error: 'Invalid caregiver credentials' });
  }

  // Senior PIN check
  store.user.role = 'senior';
  saveStore(store);
  return res.json({ user: store.user, token: 'session_senior_token' });
});

app.get('/api/auth/profile', (req: Request, res: Response) => {
  res.json(store.user);
});

app.put('/api/auth/profile', (req: Request, res: Response) => {
  store.user = { ...store.user, ...req.body };
  saveStore(store);
  res.json(store.user);
});

// 2. Central Multi-Agent Orchestrator & Gemini Routes
app.use('/api/gemini', chatRoutes);

// 3. User Memory & Personalization Routes
app.use('/api/memory', memoryRoutes);

// 4. RAG Knowledge Base Routes
app.use('/api/rag', ragRoutes);

// 5. Emergency Safety & Caregiver Notification Routes
app.use('/api/emergency', emergencyRoutes);

// 6. Admin Dashboard & Analytics Routes
app.use('/api/admin', adminRoutes);

// 4. Daily Wellness & Fall Prevention Endpoints
app.post('/api/wellness/check-in', (req: Request, res: Response) => {
  const { mood, sleepQuality, physicalDiscomfort, notes } = req.body;
  const todayStr = new Date().toISOString().split('T')[0];

  const newEntry = {
    id: `chk_${Date.now()}`,
    userId: store.user.id,
    date: todayStr,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    mood: mood || 'good',
    sleepQuality: sleepQuality || 'adequate',
    physicalDiscomfort: Array.isArray(physicalDiscomfort) ? physicalDiscomfort : ['None'],
    notes: notes || '',
  };

  // Replace if exists for today or add new
  store.checkIns = store.checkIns.filter((c) => c.date !== todayStr);
  store.checkIns.unshift(newEntry);
  saveStore(store);

  res.json(newEntry);
});

app.get('/api/wellness/check-in-history', (req: Request, res: Response) => {
  res.json(store.checkIns);
});

app.get('/api/wellness/exercises', (req: Request, res: Response) => {
  res.json(EXERCISE_GUIDES);
});

app.post('/api/wellness/exercise-log', (req: Request, res: Response) => {
  const { exerciseId, date, completed } = req.body;
  const todayStr = date || new Date().toISOString().split('T')[0];

  store.exerciseLogs = store.exerciseLogs.filter(
    (l) => !(l.exerciseId === exerciseId && l.date === todayStr)
  );

  const entry = {
    id: `log_${Date.now()}`,
    exerciseId,
    date: todayStr,
    completed: !!completed,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  store.exerciseLogs.unshift(entry);
  saveStore(store);

  res.json(entry);
});

app.get('/api/wellness/exercise-logs', (req: Request, res: Response) => {
  res.json(store.exerciseLogs);
});

// 5. Digital Education Endpoints
app.get('/api/education/courses', (req: Request, res: Response) => {
  res.json(DIGITAL_COURSES);
});

app.post('/api/education/progress', (req: Request, res: Response) => {
  const { lessonId, completed } = req.body;
  if (!lessonId) return res.status(400).json({ error: 'lessonId required' });

  if (completed) {
    if (!store.completedLessons.includes(lessonId)) {
      store.completedLessons.push(lessonId);
    }
  } else {
    store.completedLessons = store.completedLessons.filter((id) => id !== lessonId);
  }

  saveStore(store);
  res.json({ success: true, completedLessons: store.completedLessons });
});

app.get('/api/education/progress', (req: Request, res: Response) => {
  res.json({ completedLessons: store.completedLessons });
});

// 6. Caregiver Overview & Privacy
app.get('/api/caregiver/overview', (req: Request, res: Response) => {
  res.json({
    senior: store.user,
    recentCheckIns: store.user.privacySettings.shareWellnessWithCaregiver
      ? store.checkIns
      : [],
    exerciseLogs: store.user.privacySettings.shareExercisesWithCaregiver
      ? store.exerciseLogs
      : [],
    completedLessons: store.user.privacySettings.shareLearningProgress
      ? store.completedLessons
      : [],
    privacySettings: store.user.privacySettings,
    emergencyContacts: store.user.emergencyContacts,
  });
});

app.put('/api/caregiver/privacy', (req: Request, res: Response) => {
  store.user.privacySettings = { ...store.user.privacySettings, ...req.body };
  saveStore(store);
  res.json(store.user.privacySettings);
});

// 7. Emergency Alert Logging
app.post('/api/emergency/alert', (req: Request, res: Response) => {
  const { reason = 'Elderly emergency button pressed' } = req.body;

  const alertEntry = {
    id: `alert_${Date.now()}`,
    reason,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE_RECORDED',
  };

  store.emergencyLogs.unshift(alertEntry);
  saveStore(store);

  console.log(`[EMERGENCY ALERT TRIGGERED]: ${reason} at ${alertEntry.timestamp}`);

  res.json({
    success: true,
    alertId: alertEntry.id,
    loggedAt: alertEntry.timestamp,
    emergencyNumber: '112',
    instructions: [
      'Stay seated or still if you have had a slip or fall.',
      'Tap Call 112 on your screen to speak to emergency operators immediately.',
      'Your primary caregiver phone is directly callable on the alert screen.',
    ],
  });
});

// Serve frontend in production or mount Vite middleware in development
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Buddy Elder AI Server listening on port ${PORT} (isProduction: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
