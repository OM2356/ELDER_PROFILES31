import { RAGDocument, RAGSourceItem } from '../../src/types';

// Pre-seeded RAG Documents for Elder Literacy and Safety
const SEED_RAG_DOCUMENTS: RAGDocument[] = [
  {
    id: 'doc_wa_family',
    title: 'Senior Guide: WhatsApp Family Connections & Voice Messaging',
    category: 'whatsapp',
    summary: 'Clear step-by-step instructions for sending voice notes, sharing festive photos, and starting video calls with family.',
    content: `
Section 1: WhatsApp Voice Notes.
To send a voice note, look at the bottom right corner of the chat screen for the green microphone icon.
Press and hold this icon while speaking clearly into your phone. Release your thumb when you have finished speaking.
If you make a mistake while talking, slide your thumb to the left to cancel the recording without sending it.

Section 2: Sending Photos to Grandchildren.
Tap the paperclip icon or small camera icon at the bottom. Choose "Gallery" to see photos on your phone.
Tap the picture of your garden, morning tea, or family gathering. Press the green arrow to send it.

Section 3: Family Video Calling.
Open the chat with your son or daughter. Look at the top right header for the video camera icon.
Tap this icon to initiate a live face-to-face video call. Keep the phone steady at eye level for the best comfort.
Source Citation: Senior Citizen Smartphone Handbook, Chapter 2.
    `.trim(),
    tags: ['whatsapp', 'photos', 'voice notes', 'video call', 'family'],
    pageCount: 3,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
  },
  {
    id: 'doc_upi_safety',
    title: 'National Digital Safety: UPI Payment Security & OTP Protection',
    category: 'banking_upi',
    summary: 'Crucial security principles: why UPI PIN is never entered to receive money, and how to verify recipient identity.',
    content: `
Golden Rule 1: The UPI PIN is only needed to SEND money out of your account.
You NEVER need to enter your UPI PIN to receive money, pension, cashback, or refunds.
If someone sends you a QR code and asks you to enter your PIN to "receive money", this is 100% a fraud scam.

Golden Rule 2: OTP (One Time Password) is strictly confidential.
Banks, police, and electricity board officers will NEVER call you and ask for your OTP.
If a caller demands an OTP to "prevent your account from blocking" or "update PAN KYC", disconnect the phone call immediately.

Golden Rule 3: Remote Access Software Warning.
Never download AnyDesk, TeamViewer, or QuickSupport apps based on a telephone call or WhatsApp link.
These applications permit strangers to see your bank screen and steal money.
Source Citation: RBI Reserve Bank of India Senior Consumer Alert, Advisory 4.
    `.trim(),
    tags: ['upi', 'pin', 'otp', 'scam', 'banking', 'fraud prevention'],
    pageCount: 2,
    createdAt: '2026-11-02',
    updatedAt: '2026-11-02',
  },
  {
    id: 'doc_fall_prevention',
    title: 'Elderly Mobility & Home Fall Prevention Guidelines',
    category: 'wellness_fall',
    summary: 'Practical home environment hazard removal and seated ankle and leg stability exercises for daily confidence.',
    content: `
Guideline 1: Home Hazard Removal.
Over 60% of senior slips happen in the bedroom and bathroom.
Keep pathways clear of electrical cords, loose rugs, and low stools.
Use non-slip rubber mats inside the shower stall and place a night-light in the hallway leading to the restroom.

Guideline 2: Footwear.
Wear shoes or slippers with firm non-skid rubber soles. Avoid walking in slick socks or smooth plastic flip-flops on wet tile.

Guideline 3: Daily Chair Stability.
Perform seated ankle circles and supported standing balance routines twice daily to maintain calf and knee joint flexibility.
Notice: These exercises are general physical well-being habits and do not replace individualized medical physical therapy.
Source Citation: Geriatric Health & Fall Prevention Foundation, Guidebook 7.
    `.trim(),
    tags: ['fall prevention', 'home safety', 'chair yoga', 'joint stability', 'slippers'],
    pageCount: 4,
    createdAt: '2026-11-03',
    updatedAt: '2026-11-03',
  },
  {
    id: 'doc_gov_pension',
    title: 'Digital Life Certificate (Jeevan Pramaan) & Pensioner Services',
    category: 'government_services',
    summary: 'How senior pensioners can submit digital life certificates from home using face authentication without visiting bank branches.',
    content: `
Step 1: Digital Life Certificate Overview.
The Jeevan Pramaan portal allows pensioners to submit their annual life certificate from home.
Instead of standing in long bank queues in November, seniors can use the Jeevan Pramaan Face App on an Android smartphone.

Step 2: Requirements.
You will need your Aadhaar number, Pension Payment Order (PPO) number, bank account details, and mobile phone.
The app uses the phone camera to scan your face and verify your identity with UIDAI instantly.

Step 3: Assistance.
If you need help, India Post Payments Bank (Postman) visits elderly citizens at home to complete biometrics at your doorstep.
Source Citation: Government of India Department of Pension & Pensioners Welfare, Portal Bulletin.
    `.trim(),
    tags: ['pension', 'jeevan pramaan', 'government', 'aadhaar', 'senior citizens'],
    pageCount: 3,
    createdAt: '2026-11-04',
    updatedAt: '2026-11-04',
  },
];

let documentsStore: RAGDocument[] = [...SEED_RAG_DOCUMENTS];

export function listRAGDocuments(): RAGDocument[] {
  return documentsStore;
}

export function addRAGDocument(doc: Omit<RAGDocument, 'id' | 'createdAt' | 'updatedAt'>): RAGDocument {
  const newDoc: RAGDocument = {
    ...doc,
    id: `doc_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
  };
  documentsStore.unshift(newDoc);
  return newDoc;
}

export function deleteRAGDocument(id: string): boolean {
  const initLen = documentsStore.length;
  documentsStore = documentsStore.filter((d) => d.id !== id);
  return documentsStore.length < initLen;
}

export function searchRAGKnowledge(query: string, maxResults = 2): RAGSourceItem[] {
  const tokens = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (tokens.length === 0) return [];

  const scoredDocs = documentsStore.map((doc) => {
    let score = 0;
    const docText = `${doc.title} ${doc.summary} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();

    for (const token of tokens) {
      if (doc.title.toLowerCase().includes(token)) score += 5;
      if (doc.tags.some((t) => t.toLowerCase().includes(token))) score += 4;
      if (docText.includes(token)) score += 1;
    }

    return {
      doc,
      score,
    };
  });

  const matching = scoredDocs
    .filter((s) => s.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return matching.map((item) => {
    // Extract most relevant 150-char snippet
    const content = item.doc.content;
    const firstMatchIdx = content.toLowerCase().indexOf(tokens[0] || '');
    const start = Math.max(0, firstMatchIdx > 0 ? firstMatchIdx - 20 : 0);
    const snippet = content.slice(start, start + 180).trim() + '...';

    return {
      documentId: item.doc.id,
      title: item.doc.title,
      category: item.doc.category,
      snippet,
      relevanceScore: Math.min(99, Math.round((item.score / (tokens.length * 5)) * 100)),
    };
  });
}
