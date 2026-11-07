import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { speechEngine } from '../../utils/speech';
import {
  Sparkles,
  BookOpen,
  Brain,
  Smile,
  Volume2,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Heart,
  HelpCircle,
  VolumeX,
} from 'lucide-react';
import { FeatureInfoButton } from '../common/AccessibleTooltip';

interface MemoryCard {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const INITIAL_CARDS: Array<{ symbol: string; name: string }> = [
  { symbol: '🌸', name: 'Lotus (कमळ)' },
  { symbol: '🥭', name: 'Mango (आंबा)' },
  { symbol: '🍎', name: 'Apple (सफरचंद)' },
  { symbol: '🌻', name: 'Sunflower (सूर्यफूल)' },
];

export const SocialEngagementView: React.FC = () => {
  const { language, speechRate, highContrast, addNotification } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'stories' | 'game' | 'trivia' | 'gratitude'>('stories');

  // STORIES
  const stories = [
    {
      id: 'story_1',
      titleEn: 'Tenali Rama and the Hidden Treasure',
      titleHi: 'तेनालीराम और कुएं का खजाना',
      titleMr: 'तेनालीराम आणि विहिरीचा खजिना',
      contentEn:
        'Once, two thieves entered Tenali Rama’s backyard. Knowing this, Tenali loudly told his wife, "Let us hide our gold box inside the deep garden well!" The thieves stayed up all night drawing bucket after bucket of water, expecting to find the treasure. By morning, Rama’s entire vegetable garden was watered without any effort, and the tired thieves apologized! Wisdom always overcomes greed.',
      contentHi:
        'एक बार तेनालीराम के घर चोर घुस आए। तेनालीराम ने समझदारी दिखाते हुए अपनी पत्नी से जोर से कहा, "सोने का संदूक बगीचे के कुएं में छिपा देते हैं!" चोर रातभर बाल्टी से कुएं का पानी निकालते रहे। सुबह तक तेनालीराम के पूरे बगीचे को पानी मिल गया और चोर थककर भाग गए! बुद्धि हमेशा बल से श्रेष्ठ होती है।',
      contentMr:
        'एके रात्री तेनालीरामांच्या बागेत दोन चोर शिरले. रामांनी चतुरपणे पत्नीला मोठ्या आवाजात सांगितले, "आपली सोन्याची पेटी विहिरीत लपवू या!" चोरांनी रात्रभर विहिरीचे पाणी उपसले. सकाळपर्यंत बागेला आपोआप भरपूर पाणी मिळाले आणि चोर थकले! चतुराई नेहमी शक्तीवर मात करते.',
      moralEn: 'Wit and presence of mind can solve any difficult situation peacefully.',
      moralHi: 'सच्ची सूझबूझ और धैर्य से हर मुश्किल आसान हो जाती है।',
      moralMr: 'चातुर्य आणि शांत डोक्याने घेतलेला निर्णय संकटातून मार्ग काढतो.',
    },
    {
      id: 'story_2',
      titleEn: 'The Banyan Tree of Kindness',
      titleHi: 'दयालु बरगद का पेड़',
      titleMr: 'मायेचे वडाचे झाड',
      contentEn:
        'An old banyan tree in a Maharashtra village gave cool shade to pilgrims, nests to hundreds of sparrows, and ripe figs to wandering travelers. A traveler asked the tree, "Do you never tire of giving?" The banyan rustled softly in the breeze and said, "The greatest joy of growing old is knowing that your shade gives relief to tired souls." Generosity is the eternal medicine of youth.',
      contentHi:
        'एक बूढ़ा बरगद का पेड़ मुसाफिरों को ठंडी छाया और चिड़ियों को घर देता था। एक यात्री ने पूछा, "क्या आप कभी देने से थकते नहीं?" बरगद ने मुस्कुराते हुए कहा, "उम्र ढलने का सबसे बड़ा सुख यह है कि आपकी छाया दूसरों की थकान मिटा दे।" परोपकार ही जीवन का सच्चा आनंद है।',
      contentMr:
        'गावातील एका जुन्या वटवृक्षाने शेकडो पाखरांना आसरा आणि वाटसरूंना गार सावली दिली होती. एका पांथस्थाने विचारले, "तुम्ही कधी थकत नाही का?" झाडाने प्रेमाने सांगितले, "वृद्ध होण्यातला खरा आनंद यातच आहे की आपल्या अस्तित्वाने कोणाची तरी सावली व्हावे."',
      moralEn: 'Giving love and patience enriches the soul at every age.',
      moralHi: 'दूसरों की मदद करने से मन हमेशा शांत और संतुष्ट रहता है।',
      moralMr: 'दुसऱ्यांच्या कामी येणे हेच जीवनातील खरे समाधान आहे.',
    },
  ];

  // MEMORY GAME STATE
  const generateDeck = (): MemoryCard[] => {
    const double = [...INITIAL_CARDS, ...INITIAL_CARDS];
    // Shuffle
    const shuffled = double.sort(() => Math.random() - 0.5);
    return shuffled.map((card, index) => ({
      id: index,
      symbol: card.symbol,
      name: card.name,
      isFlipped: false,
      isMatched: false,
    }));
  };

  const [cards, setCards] = useState<MemoryCard[]>(generateDeck);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);

  const handleCardClick = (id: number) => {
    if (selectedIds.length === 2) return;
    const clicked = cards.find((c) => c.id === id);
    if (!clicked || clicked.isFlipped || clicked.isMatched) return;

    const newCards = cards.map((c) => (c.id === id ? { ...c, isFlipped: true } : c));
    setCards(newCards);

    const newSelected = [...selectedIds, id];
    setSelectedIds(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const first = newCards.find((c) => c.id === newSelected[0])!;
      const second = newCards.find((c) => c.id === newSelected[1])!;

      if (first.symbol === second.symbol) {
        // Matched!
        setTimeout(() => {
          const matchedCards = newCards.map((c) =>
            c.id === first.id || c.id === second.id
              ? { ...c, isMatched: true }
              : c
          );
          setCards(matchedCards);
          setSelectedIds([]);

          if (matchedCards.every((c) => c.isMatched)) {
            setGameWon(true);
            speechEngine.speak(
              language === 'hi'
                ? 'शाबाश! आपने बहुत सुंदर खेल दिखाया और सभी जोड़ियां ढूंढ लीं!'
                : language === 'mr'
                ? 'फार छान! आपण सर्व जोड्या यशस्वीपणे जुळवल्या!'
                : 'Wonderful job! You matched all pairs in memory gym!',
              language,
              speechRate
            );
          }
        }, 500);
      } else {
        // Not matched, flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setSelectedIds([]);
        }, 1100);
      }
    }
  };

  const resetGame = () => {
    setCards(generateDeck());
    setSelectedIds([]);
    setMoves(0);
    setGameWon(false);
  };

  // TRIVIA STATE
  const triviaQuestions = [
    {
      questionEn: 'Which sacred river is known as the Ganga of the South in Maharashtra and Telangana?',
      questionHi: 'दक्षिण की गंगा के रूप में किस पावन नदी को जाना जाता है?',
      questionMr: 'महाराष्ट्रात कोणत्या पवित्र नदीला दक्षिण गंगा म्हटले जाते?',
      optionsEn: ['Godavari', 'Krishna', 'Kaveri', 'Narmada'],
      optionsHi: ['गोदावरी', 'कृष्णा', 'कावेरी', 'नर्मदा'],
      optionsMr: ['गोदावरी', 'कृष्णा', 'कावेरी', 'नर्मदा'],
      answerIndex: 0,
      hintEn: 'It originates near Trimbakeshwar in Nashik district.',
      hintHi: 'यह नासिक के त्र्यंबकेश्वर से निकलती है।',
      hintMr: 'या नदीचा उगम नाशिकच्या त्र्यंबकेश्वर येथे होतो.',
    },
    {
      questionEn: 'What is the national fruit of India that brings sweetness to summer?',
      questionHi: 'भारत का राष्ट्रीय फल कौन सा है जो गर्मियों में मिठास भर देता है?',
      questionMr: 'भारताचे राष्ट्रीय फळ कोणते जे उन्हाळ्यात गोडवा आणते?',
      optionsEn: ['Apple', 'Mango (Aam)', 'Banana', 'Guava'],
      optionsHi: ['सेब', 'आम', 'केला', 'अमरूद'],
      optionsMr: ['सफरचंद', 'आंबा', 'केळे', 'पेरू'],
      answerIndex: 1,
      hintEn: 'Often celebrated as the king of fruits with Alphonso being famous.',
      hintHi: 'इसे फलों का राजा कहा जाता है, जैसे हापुस और दशहरी।',
      hintMr: 'फळांचा राजा, विशेषतः कोकणातील हापूस प्रसिद्ध आहे.',
    },
  ];

  const [triviaAnswers, setTriviaAnswers] = useState<Record<number, number>>({});
  const [triviaHints, setTriviaHints] = useState<Record<number, boolean>>({});

  // GRATITUDE STATE
  const [gratitudeNote, setGratitudeNote] = useState<string>('');
  const [savedNotes, setSavedNotes] = useState<string[]>([
    'Grateful for the warm morning tea and sunlight in the courtyard.',
    'Grateful for my daughter calling with cheerful news.',
  ]);

  const handleSaveGratitude = () => {
    if (!gratitudeNote.trim()) return;
    const newNotes = [gratitudeNote.trim(), ...savedNotes];
    setSavedNotes(newNotes);
    setGratitudeNote('');
    speechEngine.speak(
      language === 'hi'
        ? 'आपका आभार संदेश सहेज लिया गया। आपका दिन शुभ हो!'
        : language === 'mr'
        ? 'आपली आनंदाची नोंद सेव्ह केली. आपला दिवस आनंदाचा जावो!'
        : 'Your gratitude note has been saved. Wishing you a peaceful day!',
      language,
      speechRate
    );
  };

  const handleReadStory = (story: (typeof stories)[0]) => {
    const text =
      language === 'hi'
        ? `${story.titleHi}. ${story.contentHi} सीख: ${story.moralHi}`
        : language === 'mr'
        ? `${story.titleMr}. ${story.contentMr} बोध: ${story.moralMr}`
        : `${story.titleEn}. ${story.contentEn} Moral: ${story.moralEn}`;
    speechEngine.speak(text, language, speechRate);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white border-purple-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0 shadow-inner">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black">
                {language === 'hi'
                  ? 'वरिष्ठ मनोरंजन व दिमागी कसरत'
                  : language === 'mr'
                  ? 'मनोरंजन, गोष्टी व मेंदूचा व्यायाम'
                  : 'Senior Stories & Brain Gym'}
              </h2>
              <FeatureInfoButton featureKey="nav_social" variant="contrast" />
            </div>
            <p className="text-sm sm:text-base md:text-lg font-medium text-purple-100 mt-1">
              {language === 'hi'
                ? 'मनोरंजक लोककथाएं, चित्रों का मिलान, ज्ञानवर्धक पहेलियां और दैनिक आभार।'
                : language === 'mr'
                ? 'सुंदर बोधकथा, स्मरणशक्तीचा खेळ, रंजक कोडी आणि रोजच्या समाधानाची नोंद.'
                : 'Uplifting folklore stories, memory gym puzzles, friendly trivia, and daily gratitude notes.'}
            </p>
          </div>
        </div>

        {/* Sub-tab selection */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base cursor-pointer transition ${
              activeTab === 'stories' ? 'bg-white text-purple-900 shadow-md' : 'text-white hover:bg-white/20'
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base cursor-pointer transition ${
              activeTab === 'game' ? 'bg-white text-purple-900 shadow-md' : 'text-white hover:bg-white/20'
            }`}
          >
            Brain Gym
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base cursor-pointer transition ${
              activeTab === 'trivia' ? 'bg-white text-purple-900 shadow-md' : 'text-white hover:bg-white/20'
            }`}
          >
            Trivia
          </button>
          <button
            onClick={() => setActiveTab('gratitude')}
            className={`px-4 py-2 rounded-xl font-black text-sm sm:text-base cursor-pointer transition ${
              activeTab === 'gratitude' ? 'bg-white text-purple-900 shadow-md' : 'text-white hover:bg-white/20'
            }`}
          >
            Gratitude
          </button>
        </div>
      </div>

      {/* 1. STORIES SECTION */}
      {activeTab === 'stories' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stories.map((s) => (
              <div
                key={s.id}
                className={`p-6 sm:p-8 rounded-3xl border-3 shadow-md flex flex-col justify-between gap-4 ${
                  highContrast
                    ? 'bg-zinc-900 border-amber-400 text-white'
                    : 'bg-white border-purple-200 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800">
                      Folklore & Wisdom
                    </span>
                    <button
                      onClick={() => handleReadStory(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs sm:text-sm cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Listen Out Loud</span>
                    </button>
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
                    {language === 'hi' ? s.titleHi : language === 'mr' ? s.titleMr : s.titleEn}
                  </h3>

                  <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? s.contentHi : language === 'mr' ? s.contentMr : s.contentEn}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-purple-900 dark:text-purple-300">
                    <Heart className="w-5 h-5 text-rose-500 fill-rose-500 flex-shrink-0" />
                    <span>
                      Moral:{' '}
                      <span className="font-semibold text-slate-600 dark:text-slate-400">
                        {language === 'hi' ? s.moralHi : language === 'mr' ? s.moralMr : s.moralEn}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SENIOR BRAIN GYM (MEMORY CARD MATCHING) */}
      {activeTab === 'game' && (
        <div
          className={`p-6 sm:p-10 rounded-3xl border-3 shadow-lg ${
            highContrast
              ? 'bg-zinc-900 border-amber-400 text-white'
              : 'bg-white border-indigo-200 text-slate-800'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center">
                <Brain className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black">Senior Mind Gym: Memory Match</h3>
                <p className="text-sm font-semibold text-slate-500">
                  Tap cards to reveal pairs • Keeps neural pathways sharp and joyful!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                Moves: <span className="font-black text-indigo-600">{moves}</span>
              </span>
              <button
                onClick={resetGame}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-8 max-w-2xl mx-auto">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isFlipped || card.isMatched}
                className={`h-32 sm:h-40 rounded-3xl border-4 text-center flex flex-col items-center justify-center transition-all transform cursor-pointer select-none active:scale-95 ${
                  card.isFlipped || card.isMatched
                    ? 'border-indigo-500 bg-indigo-50 shadow-md rotate-0'
                    : 'border-slate-300 bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow hover:scale-105'
                }`}
              >
                {card.isFlipped || card.isMatched ? (
                  <>
                    <span className="text-4xl sm:text-5xl">{card.symbol}</span>
                    <span className="text-xs sm:text-sm font-black text-indigo-900 mt-2">
                      {card.name}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-white/80">❓</span>
                )}
              </button>
            ))}
          </div>

          {gameWon && (
            <div className="mt-8 p-6 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-center animate-bounce">
              <Trophy className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h4 className="text-2xl font-black text-emerald-900">
                Spectacular Memory! You Found All Pairs!
              </h4>
              <p className="text-base font-bold text-emerald-800 mt-1">
                Completed in {moves} moves. Your mind is wonderfully sharp today!
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. TRIVIA SECTION */}
      {activeTab === 'trivia' && (
        <div className="space-y-6">
          {triviaQuestions.map((q, qIndex) => {
            const isAnswered = triviaAnswers[qIndex] !== undefined;
            const selectedOpt = triviaAnswers[qIndex];
            const isCorrect = selectedOpt === q.answerIndex;
            const showHint = triviaHints[qIndex];

            const questionText =
              language === 'hi' ? q.questionHi : language === 'mr' ? q.questionMr : q.questionEn;
            const options =
              language === 'hi' ? q.optionsHi : language === 'mr' ? q.optionsMr : q.optionsEn;
            const hint = language === 'hi' ? q.hintHi : language === 'mr' ? q.hintMr : q.hintEn;

            return (
              <div
                key={qIndex}
                className={`p-6 sm:p-8 rounded-3xl border-3 shadow-md ${
                  highContrast
                    ? 'bg-zinc-900 border-amber-400 text-white'
                    : 'bg-white border-purple-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-extrabold text-sm text-purple-600">
                    Question {qIndex + 1}
                  </span>
                  <button
                    onClick={() =>
                      setTriviaHints((prev) => ({ ...prev, [qIndex]: !prev[qIndex] }))
                    }
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-purple-600 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>{showHint ? 'Hide Hint' : 'Need a hint?'}</span>
                  </button>
                </div>

                <h4 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-4">
                  {questionText}
                </h4>

                {showHint && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-sm font-semibold text-amber-900">
                    💡 Hint: {hint}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt, optIndex) => {
                    const chosen = selectedOpt === optIndex;
                    let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-purple-50 text-slate-800';

                    if (isAnswered) {
                      if (optIndex === q.answerIndex) {
                        btnStyle = 'border-emerald-500 bg-emerald-100 text-emerald-900 font-black';
                      } else if (chosen) {
                        btnStyle = 'border-red-400 bg-red-100 text-red-900 font-bold';
                      }
                    }

                    return (
                      <button
                        key={optIndex}
                        onClick={() => {
                          setTriviaAnswers((prev) => ({ ...prev, [qIndex]: optIndex }));
                          if (optIndex === q.answerIndex) {
                            speechEngine.speak('Correct answer! Wonderful!', language, speechRate);
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 text-left text-lg font-bold transition cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="mt-4 pt-3 flex items-center gap-2 text-base font-extrabold">
                    {isCorrect ? (
                      <span className="text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5" /> Correct! Outstanding knowledge.
                      </span>
                    ) : (
                      <span className="text-amber-700">
                        Good try! The correct answer is {options[q.answerIndex]}.
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 4. DAILY GRATITUDE NOTE */}
      {activeTab === 'gratitude' && (
        <div
          className={`p-6 sm:p-8 rounded-3xl border-3 shadow-md ${
            highContrast
              ? 'bg-zinc-900 border-amber-400 text-white'
              : 'bg-white border-rose-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 pb-4 border-b border-rose-100 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center">
              <Smile className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black">Daily Gratitude & Positivity</h3>
              <p className="text-sm font-semibold text-slate-500">
                Write or speak one thing that brought a smile to your face today.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              rows={3}
              value={gratitudeNote}
              onChange={(e) => setGratitudeNote(e.target.value)}
              placeholder="e.g. My tea tasted wonderful this morning, and the birds were singing in the balcony..."
              className="w-full p-4 rounded-2xl border-2 border-rose-200 font-bold text-lg text-slate-900 dark:text-white bg-rose-50/30"
            />

            <div className="flex justify-end">
              <button
                onClick={handleSaveGratitude}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-lg shadow-md cursor-pointer"
              >
                <Heart className="w-5 h-5" />
                <span>Save Today's Gratitude</span>
              </button>
            </div>

            {/* Past Notes */}
            <div className="mt-8 pt-6 border-t border-rose-100 space-y-3">
              <h4 className="text-lg font-black text-slate-700 dark:text-slate-300">
                Your Past Reflections
              </h4>
              {savedNotes.map((note, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-slate-800 font-semibold text-base flex items-center gap-3"
                >
                  <span className="text-xl">🌸</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
