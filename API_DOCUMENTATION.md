# Buddy Elder AI - REST API Documentation

This document describes the backend endpoints provided by `server.ts` for Buddy Elder AI.

## Base URL
All API endpoints are mounted on `/api`.

---

## 1. Authentication & Profiles

### `POST /api/auth/login`
Authenticates a Senior or Caregiver user.
- **Request Body:**
  ```json
  {
    "role": "senior" | "caregiver",
    "pinOrPassword": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": { ...UserProfile },
    "token": "string"
  }
  ```

### `GET /api/auth/profile`
Retrieves the active user profile, emergency contacts, and accessibility preferences.
- **Response:**
  ```json
  {
    "id": "senior_1",
    "name": "Ramesh Sharma",
    "role": "senior",
    "age": 72,
    "language": "en",
    "preferredSpeechRate": 0.85,
    "highContrast": false,
    "fontSize": "large",
    "emergencyContacts": [ ... ],
    "privacySettings": { ... }
  }
  ```

### `PUT /api/auth/profile`
Updates user preferences (font size, contrast, language, emergency contacts).
- **Request Body:** Partial `<UserProfile>`

---

## 2. Gemini AI Assistant

### `POST /api/gemini/chat`
Conversational endpoint for the 4 specialized agents.
- **Request Body:**
  ```json
  {
    "agent": "companion" | "education" | "wellness" | "safety",
    "message": "string",
    "language": "en" | "hi" | "mr",
    "history": [
      { "role": "user" | "model", "text": "string" }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "reply": "Empathetic, clear AI response",
    "isEmergency": false,
    "detectedKeywords": []
  }
  ```

### `POST /api/gemini/scam-analyzer`
Analyzes SMS, WhatsApp messages, or links for scam patterns and fraud techniques.
- **Request Body:**
  ```json
  {
    "content": "string",
    "language": "en" | "hi" | "mr"
  }
  ```
- **Response:**
  ```json
  {
    "verdict": "SAFE" | "SUSPICIOUS" | "DANGEROUS",
    "riskScore": 92,
    "category": "Electricity Bill Threat",
    "summary": "This message is a fake threat aimed at stealing money.",
    "reasons": [
      "Electricity companies never cut off power with an SMS notice.",
      "Asks to call an unofficial mobile number or download an APK."
    ],
    "safeAction": "Delete message immediately. Do not call the number or install apps.",
    "warningNote": "Automated scan is advisory."
  }
  ```

---

## 3. Daily Wellness & Fall Prevention

### `POST /api/wellness/check-in`
Submits a daily questionnaire response.
- **Request Body:**
  ```json
  {
    "mood": "great" | "good" | "okay" | "tired" | "pain",
    "sleepQuality": "deep" | "adequate" | "restless",
    "physicalDiscomfort": ["string"],
    "notes": "string"
  }
  ```

### `GET /api/wellness/check-in-history`
Returns chronological daily check-in records for wellness trends.

### `GET /api/wellness/exercises`
Returns chair-supported fall prevention exercises with multilingual steps and safety precautions.

### `POST /api/wellness/exercise-log`
Toggles exercise completion status for a given date.
- **Request Body:**
  ```json
  {
    "exerciseId": "ex_1",
    "date": "2026-11-06",
    "completed": true
  }
  ```

---

## 4. Digital Education Hub

### `GET /api/education/courses`
Returns step-by-step smartphone and digital literacy courses.

### `POST /api/education/progress`
Records lesson mastery for the senior.
- **Request Body:**
  ```json
  {
    "lessonId": "l_wa_1",
    "completed": true
  }
  ```

---

## 5. Caregiver Oversight & Privacy

### `GET /api/caregiver/overview`
Aggregated dashboard for registered family caregivers, respecting the senior's privacy authorizations.

### `PUT /api/caregiver/privacy`
Updates senior data sharing permissions.
- **Request Body:**
  ```json
  {
    "shareWellnessWithCaregiver": true,
    "shareExercisesWithCaregiver": true,
    "shareLearningProgress": true,
    "allowEmergencyLocation": true
  }
  ```

---

## 6. Emergency Safety Services

### `POST /api/emergency/alert`
Logs emergency triggers from the SOS button, fall detection, or voice queries.
- **Request Body:**
  ```json
  {
    "reason": "Slip in living room or SOS button pressed"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "alertId": "alert_1730880000000",
    "loggedAt": "2026-11-06T08:30:00Z",
    "emergencyNumber": "112",
    "instructions": [ ... ]
  }
  ```
