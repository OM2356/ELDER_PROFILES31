# Buddy Elder AI (बडी एल्डर एआई)

**Voice-First AI Companion, Wellness Check-in, Fall Prevention, and Digital Safety for Seniors.**

Buddy Elder AI is an empathetic, accessible digital companion designed specifically for elderly adults (ages 65+) and their family caregivers. It bridges the digital divide through voice-first interactions, gentle daily routines, interactive smartphone learning, scam protection, and one-touch emergency connections in **English, Hindi (हिन्दी), and Marathi (मराठी)**.

---

## 🌟 Key Features

### 1. Main Dashboard & Voice-First Interaction
- **Personalized Welcome:** Time-aware greetings with audio readout in the senior's native language.
- **Voice-First Input:** Powered by Web Speech API (`SpeechRecognition` and `SpeechSynthesis`) with generous touch targets (60px+) and visual pulse recording feedback.
- **Daily Summary:** Visual cards displaying today's wellness check-in, gentle exercises completed, and digital lessons mastered.

### 2. 4 Specialized AI Agents (Google Gemini API)
- **Companion Agent:** Friendly conversations, uplifting folklore, clean humor, nostalgic memories, and empathetic reassurance.
- **Digital Education Agent:** Patient, jargon-free mentor teaching smartphone usage, WhatsApp, photo sharing, and UPI step-by-step.
- **Wellness Agent:** Daily routine guidance, hydration reminders, seated stretches, and sleep hygiene. *(Explicitly disclaims medical diagnosis).*
- **Safety & Scam Watch Agent:** Analyzes suspicious messages, detects fraud tricks, and recognizes emergency language.

### 3. Daily Wellness & Fall Prevention Module
- **1-Minute Check-In:** Large emoji buttons measuring mood, sleep quality, and physical discomfort.
- **Fall Safety Routines:** Seated leg lifts, ankle circles, chair-supported balance with step-by-step guides, voice narration, and home hazard checklist.
- **Weekly Trend History:** Chronological records for family and physician review.

### 4. Digital Learning Center & Practice Simulator
- **Beginner Courses:** Smartphone basics, WhatsApp messaging, photo sharing, video calling, and UPI payment safety.
- **Interactive Simulator:** Safe simulated phone interface for seniors to practice sending photos without real charges or confusion.

### 5. AI Scam Analyzer & Emergency Center
- **Scam Detection:** Analyzes SMS/WhatsApp messages for OTP theft, bank KYC fraud, fake lottery prizes, and malicious APK files.
- **The 4 Golden Rules:** Clear reminders that legitimate institutions never demand OTPs or passwords.
- **Emergency Protection:** Immediate access to **112 National Emergency Helpline (India)** and one-touch caregiver dialers with strict real-dialer disclosures.

### 6. Family & Caregiver Oversight Portal
- **Dual Role Access:** Easy Senior mode & Caregiver oversight.
- **Privacy Controls:** Senior-controlled data sharing toggles (mood, exercises, learning progress, emergency alerts).
- **Printable Weekly Report:** Printable and downloadable wellness summary report for doctors.

---

## 📁 Project Folder Structure

```
├── .env.example              # Environment variables template
├── API_DOCUMENTATION.md      # Detailed backend REST API specifications
├── README.md                 # Complete system guide & deployment instructions
├── firebase-blueprint.json   # Firestore database schema & collections blueprint
├── firestore.rules           # Production Firestore security rules with RBAC
├── index.html                # Accessible HTML5 entry with fonts & OG meta tags
├── metadata.json             # AI Studio applet capabilities and permissions
├── package.json              # Full-stack scripts & dependencies
├── server.ts                 # Express backend server with Gemini API & REST routes
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite bundler configuration
└── src/
    ├── main.tsx              # React DOM entry point
    ├── index.css             # Tailwind CSS & 20px readable accessibility baseline
    ├── App.tsx               # Primary application view router
    ├── types/
    │   └── index.ts          # TypeScript interfaces for users, checkins, courses
    ├── context/
    │   └── AppContext.tsx    # State management, translations (EN, HI, MR), contrast
    ├── utils/
    │   └── speech.ts         # Web Speech API engine (STT & TTS with rate control)
    ├── services/
    │   └── api.ts            # Frontend REST client communicating with Express
    └── components/
        ├── common/
        │   ├── Header.tsx    # Accessible top bar with SOS button & language picker
        │   └── Navigation.tsx# Large 7-button navigation (minimum 64px touch target)
        ├── dashboard/
        │   └── Dashboard.tsx # Main welcoming dashboard & status summaries
        ├── chat/
        │   └── BuddyChat.tsx # Conversational UI with 4 specialized agents
        ├── wellness/
        │   └── WellnessSection.tsx # Check-in questionnaire & fall prevention
        ├── education/
        │   └── DigitalEducation.tsx # Lessons & interactive phone simulator
        ├── safety/
        │   └── SafetyCenter.tsx # Scam analyzer, golden rules, & 112 emergency
        ├── caregiver/
        │   └── CaregiverDashboard.tsx # Caregiver portal, privacy & printable report
        ├── settings/
        │   └── SettingsView.tsx # Font sizing, voice speech rate & contacts manager
        └── emergency/
            └── EmergencyModal.tsx # Emergency modal with 112 & caregiver dialer
```

---

## 🛠️ Installation & Local Setup

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Create `.env` file (or configure in AI Studio Secrets):
   ```env
   GEMINI_API_KEY="your-google-gemini-api-key"
   PORT=3000
   ```

3. **Run Development Server (Full-Stack Express + Vite):**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build & Execution:**
   ```bash
   npm run build
   npm start
   ```

---

## 🔍 Quality & Testing Audit Report

| Feature / Module | Verification Result | Details |
|---|---|---|
| **Accessible Navigation** | **PASSED** | Large 64px buttons, clear active indicator, responsive mobile & desktop. |
| **Typography & Contrast** | **PASSED** | 20px baseline text size, high-contrast black/yellow mode, visible focus rings. |
| **Voice Engine (STT/TTS)**| **PASSED** | Web Speech API speech-to-text with mic pulse; TTS with speed slider (0.7x-1.2x). |
| **Multilingual Support**  | **PASSED** | Seamless switching across English, Hindi (हिन्दी), and Marathi (मराठी). |
| **4 Specialized Agents**  | **PASSED** | Companion, Digital Education, Wellness, and Safety agents with distinct system instructions. |
| **Fall Prevention**       | **PASSED** | Chair-supported exercises with steps, duration, safety precautions, and completion logs. |
| **Scam Detection**        | **PASSED** | AI pattern analyzer for OTP, lottery, and banking APK scams with plain recommendations. |
| **Emergency Safety**      | **PASSED** | Recognizes "I have fallen" or "I need help", triggers 112 National Helpline & Caregiver dialer with clear non-emergency disclaimer. |
| **Caregiver Oversight**   | **PASSED** | Real-time wellness logs, privacy toggles, and printable HTML/PDF report. |

---

## 🚀 Deployment Instructions

### Frontend (Vercel / Netlify / Cloudflare Pages)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: `APP_URL`

### Backend (Render / Cloud Run / Railway)
- Entry point: `tsx server.ts` or compiled `node server.js`
- Port: `3000` (or `process.env.PORT`)
- Environment variable: `GEMINI_API_KEY`

### Database (Firebase Firestore)
- Deploy security rules: `firebase deploy --only firestore:rules`
- Deploy indexes according to `firebase-blueprint.json`.
