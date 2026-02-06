import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  Code, 
  Briefcase, 
  GraduationCap, 
  Globe, 
  ShieldCheck, 
  ChevronRight, 
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Bot,
  List,
  Bug,
  Search,
  Presentation,
  FileText,
  Smartphone,
  Mic,
  Coins,
  MessageCircle,
  Image as ImageIcon,
  Music,
  LayoutGrid,
  MonitorPlay
} from 'lucide-react';

// --- データはJSONから取得 ---

// --- 質問定義 (新データ構造に対応したキーを使用) ---
const QUESTIONS = [
  // --- 大分類 ---
  {
    id: 1,
    text: "画像や動画、音楽など、「形のあるもの（マルチメディア作品）」を作りたい？",
    icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
    weights: {
      yes: { "media_types:image": 5, "media_types:video": 5, "media_types:audio": 5, "media_types:text": -3, "media_types:code": -3 },
      no: { "media_types:text": 3, "media_types:code": 3, "media_types:data": 3, "media_types:image": -10, "media_types:video": -10, "media_types:audio": -10 }
    }
  },
  {
    id: 2,
    text: "仕事の効率化、ビジネス文書、プログラミングに使いたい？",
    icon: <Briefcase className="w-6 h-6 text-blue-500" />,
    weights: {
      yes: { "purposes:business": 5, "purposes:dev": 3, "category:chat": 2, "purposes:creative": -2 },
      no: { "purposes:creative": 5, "purposes:general": 2 }
    }
  },
  // --- メディア特化（排他性高め） ---
  {
    id: 3,
    text: "「動画」の生成や編集がメイン？",
    icon: <Video className="w-6 h-6 text-pink-500" />,
    weights: {
      yes: { "media_types:video": 20, "category:video": 10, "media_types:text": -15, "media_types:image": -10, "media_types:audio": -10, "media_types:code": -10 },
      no: { "media_types:video": -10 } 
    }
  },
  {
    id: 4,
    text: "「静止画（イラスト・写真・ロゴ）」の生成がメイン？",
    icon: <ImageIcon className="w-6 h-6 text-purple-500" />,
    weights: {
      yes: { "media_types:image": 20, "category:image": 10, "media_types:text": -5, "media_types:video": -10, "media_types:audio": -10, "media_types:code": -10 },
      no: { "media_types:image": -5 }
    }
  },
  {
    id: 5,
    text: "「音楽・音声・読み上げ」の生成がメイン？",
    icon: <Music className="w-6 h-6 text-rose-400" />,
    weights: {
      yes: { "media_types:audio": 20, "category:audio": 10, "media_types:text": -15, "media_types:image": -15, "media_types:video": -10, "media_types:code": -10 },
      no: { "media_types:audio": -10 }
    }
  },
  // --- 開発・ビジネス ---
  {
    id: 6,
    text: "プログラミングコードを書く補助がしたい？",
    icon: <Code className="w-6 h-6 text-green-500" />,
    weights: {
      yes: { "media_types:code": 20, "purposes:dev": 15, "media_types:image": -10, "media_types:video": -10 },
      no: { "media_types:code": -15, "purposes:dev": -15 }
    }
  },
  // --- 条件・こだわり ---
  {
    id: 7,
    text: "日本語のメニューやサポートが充実していないと不安？",
    icon: <Globe className="w-6 h-6 text-orange-500" />,
    weights: {
      yes: { "japanese_level:native": 10, "japanese_level:ok": 1, "japanese_level:poor": -20 },
      no: { "japanese_level:poor": 2 }
    }
  },
  {
    id: 8,
    text: "仕事で使うため、学習に使われない設定（オプトアウト）は必須？",
    icon: <ShieldCheck className="w-6 h-6 text-red-500" />,
    weights: {
      yes: { "optout:available": 15, "optout:unavailable": -999 }, 
      no: { "optout:unavailable": 2 }
    }
  },
  {
    id: 9,
    text: "多少難しくても、細かい設定ができる「プロ向け」ツールがいい？",
    icon: <Bot className="w-6 h-6 text-gray-700" />,
    weights: {
      yes: { "difficulty:intermediate": 5, "difficulty:advanced": 10, "difficulty:beginner": -5 },
      no: { "difficulty:beginner": 10, "difficulty:advanced": -10 }
    }
  },
  {
    id: 10,
    text: "「最新のニュース」やWeb上の情報を検索して教えてほしい？",
    icon: <Search className="w-6 h-6 text-teal-500" />,
    weights: {
      yes: { "features:web_search": 15, "features:citations": 8 },
      no: { "features:web_search": -5 }
    }
  },
  {
    id: 11,
    text: "プレゼン資料（スライド）を自動で作ってほしい？",
    icon: <Presentation className="w-6 h-6 text-yellow-500" />,
    weights: {
      yes: { "features:slides_generation": 25, "id:gamma": 5 },
      no: { "features:slides_generation": -10 }
    }
  },
  {
    id: 12,
    text: "長い文章や論文、契約書などのPDFを読み込ませて分析したい？",
    icon: <FileText className="w-6 h-6 text-cyan-500" />,
    weights: {
      yes: { "features:pdf_qa": 15, "features:long_context": 10, "id:notebooklm": 5 },
      no: { "features:pdf_qa": -5 }
    }
  },
  {
    id: 13,
    text: "スマホアプリで、出先でも手軽に使いたい？",
    icon: <Smartphone className="w-6 h-6 text-indigo-400" />,
    weights: {
      yes: { "platform:ios_app:true": 5, "platform:android_app:true": 5 },
      no: { "difficulty:advanced": 2 }
    }
  },
  {
    id: 14,
    text: "会議の議事録や文字起こしがメインの目的？",
    icon: <Mic className="w-6 h-6 text-rose-500" />,
    weights: {
      yes: { "features:meeting_transcription": 25, "media_types:audio": 5 },
      no: { "features:meeting_transcription": -20 }
    }
  },
  {
    id: 15,
    text: "とにかく「無料」の範囲で粘りたい？（有料プランへの誘導が少ないほうがいい）",
    icon: <Coins className="w-6 h-6 text-amber-500" />,
    weights: {
      yes: { "pricing:free": 15, "pricing:freemium": 8, "pricing:paid": -30 },
      no: { "pricing:paid": 5 }
    }
  },
  {
    id: 16,
    text: "AIと「おしゃべり」して暇つぶしや悩み相談をしたい？",
    icon: <MessageCircle className="w-6 h-6 text-pink-400" />,
    weights: {
      yes: { "purposes:entertainment": 20, "id:pi": 10, "purposes:business": -10 },
      no: { "purposes:business": 3 }
    }
  },
  {
    id: 17,
    text: "「Discord」というチャットアプリを使うことに抵抗はない？",
    icon: <MessageCircle className="w-6 h-6 text-indigo-500" />,
    weights: {
      yes: { "platform:requires_discord:true": 10 },
      no: { "platform:requires_discord:true": -50 } // 抵抗があるならDiscord必須アプリは大きく減点
    }
  },
  {
    id: 18,
    text: "学術論文を根拠にした、嘘のない回答が欲しい？",
    icon: <GraduationCap className="w-6 h-6 text-slate-600" />,
    weights: {
      yes: { "purposes:research": 15, "features:citations": 10 },
      no: { "purposes:research": -5 }
    }
  }
];

// --- キャラクターコンポーネント ---
const GenieCharacter = ({ expression = "neutral", className = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="animate-bounce-slow">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path d="M100 160 Q 80 180 100 200 Q 120 180 100 160" fill="#6366f1" opacity="0.8">
            <animate attributeName="d" values="M100 160 Q 80 180 100 200 Q 120 180 100 160; M100 165 Q 90 185 110 200 Q 110 185 100 165; M100 160 Q 80 180 100 200 Q 120 180 100 160" dur="3s" repeatCount="indefinite" />
          </path>
          <path d="M50,80 Q50,20 100,20 Q150,20 150,80 Q150,140 100,160 Q50,140 50,80" fill="url(#bodyGradient)" />
          <circle cx="45" cy="80" r="10" fill="#4338ca" />
          <circle cx="155" cy="80" r="10" fill="#4338ca" />
          <line x1="100" y1="20" x2="100" y2="5" stroke="#4338ca" strokeWidth="4" />
          <circle cx="100" cy="5" r="5" fill="#facc15" filter="url(#glow)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
          </circle>
          <g transform="translate(0, 5)">
            {expression === "neutral" && (
              <>
                <ellipse cx="80" cy="75" rx="8" ry="12" fill="white" />
                <ellipse cx="120" cy="75" rx="8" ry="12" fill="white" />
                <circle cx="82" cy="72" r="3" fill="#1e1b4b" />
                <circle cx="122" cy="72" r="3" fill="#1e1b4b" />
                <path d="M90 100 Q100 105 110 100" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            {expression === "happy" && (
              <>
                <path d="M72 75 Q80 65 88 75" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M112 75 Q120 65 128 75" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M85 95 Q100 110 115 95" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              </>
            )}
            {expression === "thinking" && (
              <>
                <ellipse cx="80" cy="75" rx="8" ry="12" fill="white" />
                <circle cx="82" cy="72" r="3" fill="#1e1b4b" />
                <line x1="112" y1="75" x2="128" y2="75" stroke="white" strokeWidth="3" strokeLinecap="round" />
                <circle cx="100" cy="100" r="3" fill="white" />
              </>
            )}
            {expression === "surprise" && (
              <>
                <circle cx="80" cy="75" r="10" fill="white" />
                <circle cx="120" cy="75" r="10" fill="white" />
                <circle cx="80" cy="75" r="4" fill="#1e1b4b" />
                <circle cx="120" cy="75" r="4" fill="#1e1b4b" />
                <circle cx="100" cy="100" r="6" stroke="white" strokeWidth="3" fill="none" />
              </>
            )}
          </g>
          <circle cx="65" cy="90" r="6" fill="#f472b6" opacity="0.6" />
          <circle cx="135" cy="90" r="6" fill="#f472b6" opacity="0.6" />
        </svg>
      </div>
      <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black opacity-10 rounded-full blur-sm animate-pulse"></div>
    </div>
  );
};


export default function App() {
  const [step, setStep] = useState('start');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [results, setResults] = useState([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [services, setServices] = useState([]);
  const [dataState, setDataState] = useState({ loading: true, error: null });
  const [shuffledQuestions, setShuffledQuestions] = useState(QUESTIONS);
  const isDataReady = !dataState.loading && !dataState.error && services.length > 0;

  useEffect(() => {
    let isMounted = true;

    const loadServices = async () => {
      try {
        const response = await fetch('./ai_services_database.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`データ取得に失敗しました (${response.status})`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('JSONの形式が不正です（配列ではありません）');
        }
        if (isMounted) {
          setServices(data);
          setDataState({ loading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setDataState({ loading: false, error: error?.message || 'データ取得に失敗しました' });
        }
      }
    };

    loadServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (services.length === 0) return;
    const initialScores = {};
    services.forEach(service => {
      initialScores[service.id] = 0;
    });
    setScores(initialScores);
  }, [services]);

  const handleAnswer = (answerType) => {
    const question = shuffledQuestions[currentQuestionIndex];
    const newScores = { ...scores };

    if (answerType !== 'unknown') {
      const weights = question.weights[answerType];
      if (weights) {
        Object.entries(weights).forEach(([key, score]) => {
          services.forEach(service => {
            let match = false;

            if (key.startsWith("id:")) {
              const targetId = key.split(":")[1];
              if (service.id === targetId) match = true;
            } 
            else if (key.startsWith("media_types:")) {
              const val = key.split(":")[1];
              if (service.tags.media_types && service.tags.media_types.includes(val)) match = true;
            }
            else if (key.startsWith("purposes:")) {
              const val = key.split(":")[1];
              if (service.tags.purposes && service.tags.purposes.includes(val)) match = true;
            }
            else if (key.startsWith("features:")) {
              const featureKey = key.split(":")[1];
              if (service.features && service.features[featureKey] === true) match = true;
            }
            else if (key.startsWith("platform:")) {
               // 例: platform:requires_discord:true
               const parts = key.split(":");
               const pKey = parts[1];
               const pVal = parts[2] === "true"; // 文字列からboolへ変換
               if (service.platform && service.platform[pKey] === pVal) match = true;
            }
            else if (key === "optout:available") {
               if (service.optout && service.optout.optout_available === true) match = true;
            }
            else if (key === "optout:unavailable") {
               if (!service.optout || service.optout.optout_available === false) match = true;
            }
            else {
              // 単一タグ (pricing, japanese_level, difficulty, category)
              const [prop, val] = key.split(":");
              if (service.tags && String(service.tags[prop]) === val) match = true;
              if (String(service[prop]) === val) match = true; // category対応
            }

            if (match) {
              newScores[service.id] = (newScores[service.id] || 0) + score;
            }
          });
        });
      }
    }

    setScores(newScores);

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      finishQuiz(newScores);
    }
  };

  const finishQuiz = (finalScores) => {
    setStep('loading');
    const sortedServices = [...services].sort((a, b) => {
      const scoreDiff = finalScores[b.id] - finalScores[a.id];
      if (scoreDiff !== 0) return scoreDiff;
      return a.name.localeCompare(b.name);
    });

    setTimeout(() => {
      setResults(sortedServices);
      setStep('result');
      setShowAllResults(false);
    }, 2800);
  };

  const restart = () => {
    setStep('start');
    setCurrentQuestionIndex(0);
    const initialScores = {};
    services.forEach(service => initialScores[service.id] = 0);
    setScores(initialScores);
    setShowAllResults(false);
    setShuffledQuestions(QUESTIONS);
  };

  const shuffleQuestions = () => {
    const array = [...QUESTIONS];
    for (let i = array.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    setShuffledQuestions(array);
  };

  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center max-w-2xl mx-auto animate-in fade-in duration-700">
      <div className="relative mb-6">
        <GenieCharacter expression="happy" className="w-48 h-48" />
        <div className="absolute -top-4 -right-8 bg-white px-4 py-2 rounded-2xl rounded-bl-none shadow-lg border-2 border-indigo-100 animate-in zoom-in delay-300 duration-500">
          <p className="text-indigo-600 font-bold whitespace-nowrap">君にピッタリのAIを探すよ！</p>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        あなたにおすすめの<br/><span className="text-indigo-600">AIサービス</span>診断
      </h1>
      <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
        「たくさんありすぎて分からない…」<br/>
        そんな悩み、僕が解決します。質問に答えるだけで、50種類以上の中から最適なツールを提案するよ！
      </p>
      <button 
        onClick={() => {
          shuffleQuestions();
          setCurrentQuestionIndex(0);
          setStep('quiz');
        }}
        disabled={!isDataReady}
        className={`group relative inline-flex items-center justify-center px-8 py-4 text-xl font-bold text-white transition-all duration-200 rounded-full focus:outline-none focus:ring-4 focus:ring-indigo-200 ${
          isDataReady
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-1'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        診断をはじめる
        <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
      <p className="mt-8 text-sm text-gray-400 font-medium">
        所要時間：約2分 / 対象：{services.length > 0 ? services.length : '—'}サービス
      </p>
      {!isDataReady && (
        <p className="mt-3 text-xs text-gray-500">
          {dataState.loading ? 'データを読み込み中です…' : 'データの読み込みに失敗しました'}
        </p>
      )}
    </div>
  );

  const QuizScreen = () => {
    const question = shuffledQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex) / shuffledQuestions.length) * 100;

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 max-w-2xl mx-auto w-full">
        <div className="w-full h-3 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div key={currentQuestionIndex} className="w-full flex flex-col md:flex-row items-center gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex-shrink-0">
             <GenieCharacter expression="neutral" className="w-32 h-32 md:w-40 md:h-40" />
          </div>

          <div className="relative flex-grow bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-indigo-50">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 md:top-1/2 md:-left-3 md:translate-x-0 w-6 h-6 bg-white border-t-2 border-l-2 border-indigo-50 rotate-45 md:-rotate-45"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3 text-indigo-500 font-bold uppercase tracking-wider text-sm">
                <span className="bg-indigo-100 px-2 py-0.5 rounded text-xs">Q{currentQuestionIndex + 1}</span>
                QUESTION
              </div>
              <p className="text-xl md:text-2xl text-gray-800 font-bold leading-relaxed">
                {question.text}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3 max-w-lg">
          <button 
            onClick={() => handleAnswer('yes')}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            はい
          </button>
          <button 
            onClick={() => handleAnswer('no')}
            className="w-full py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            いいえ
          </button>
          <button 
            onClick={() => handleAnswer('unknown')}
            className="w-full py-3 text-gray-400 text-sm font-medium hover:text-gray-600 transition-colors mt-2"
          >
            わからない / どちらでもない
          </button>
        </div>
      </div>
    );
  };

  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4 text-center">
      <GenieCharacter expression="thinking" className="w-56 h-56 mb-8" />
      <h2 className="text-3xl font-bold text-gray-800 animate-pulse mb-4">
        うーん、なるほど...
      </h2>
      <p className="text-lg text-gray-500 max-w-md">
        あなたの回答から、最適なAIを探し出しています。<br/>
        ちょっと待ってね！
      </p>
    </div>
  );

  const ResultScreen = () => {
    const bestMatch = results[0];
    const secondMatch = results[1];
    const otherMatches = results.slice(2, 5);

    const getPriceInfo = (pricingTag) => {
      switch(pricingTag) {
        case 'free': return { label: '完全無料', color: 'text-green-600', bg: 'bg-green-50' };
        case 'freemium': return { label: '基本無料 / 有料プランあり', color: 'text-blue-600', bg: 'bg-blue-50' };
        case 'paid': return { label: '有料プランのみ', color: 'text-orange-600', bg: 'bg-orange-50' };
        case 'enterprise': return { label: '法人契約 / お問い合わせ', color: 'text-gray-600', bg: 'bg-gray-50' };
        default: return { label: '公式サイトで確認', color: 'text-gray-500', bg: 'bg-gray-50' };
      }
    };

    const OptOutBadge = ({ available }) => (
      available ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          学習オプトアウト可
        </span>
      ) : (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          学習利用注意
        </span>
      )
    );

    const PriceBadge = ({ pricing }) => {
      const info = getPriceInfo(pricing);
      return (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${info.bg} border border-${info.color.split('-')[1]}-100`}>
          <Coins className={`w-5 h-5 ${info.color}`} />
          <span className={`text-sm font-bold ${info.color}`}>{info.label}</span>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-indigo-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-10 text-center animate-in slide-in-from-top-4 duration-700">
            <GenieCharacter expression="surprise" className="w-32 h-32 mb-4" />
            <div className="bg-white px-6 py-2 rounded-full shadow-sm border border-indigo-100 mb-2">
              <span className="text-indigo-600 font-bold">見つかりました！</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              あなたに一番おすすめのAIは...
            </h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-4 border-indigo-200 relative animate-in zoom-in duration-500 transform transition-all hover:scale-[1.01]">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-600 to-indigo-500 text-white px-6 py-2 rounded-bl-2xl font-bold text-sm shadow-md z-10">
              Best Match 👑
            </div>
            
            <div className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-4xl font-extrabold text-gray-900 tracking-tight">{bestMatch.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                     <span className="inline-block bg-indigo-100 text-indigo-800 px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wide">
                      {bestMatch.category.toUpperCase()}
                    </span>
                    <OptOutBadge available={bestMatch.optout?.optout_available} />
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-50/50 rounded-2xl p-6 mb-6 border border-indigo-50">
                <p className="text-gray-800 text-lg leading-relaxed font-medium">
                  {bestMatch.description}
                </p>
              </div>

              <div className="mb-6">
                <PriceBadge pricing={bestMatch.tags.pricing} />
              </div>

              <div className="bg-white border-2 border-gray-100 rounded-xl p-5 mb-8 shadow-sm">
                <h4 className="flex items-center text-sm font-bold text-gray-500 mb-3 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  プライバシー・学習設定
                </h4>
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {bestMatch.optout?.notes || "詳細は公式サイトをご確認ください。"}
                </p>
                {bestMatch.optout?.link && (
                  <a href={bestMatch.optout.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 hover:underline inline-flex items-center transition-colors">
                    設定方法の詳細はこちら <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>

              <a 
                href={bestMatch.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl py-5 rounded-xl transition-all shadow-lg hover:shadow-indigo-200 active:translate-y-0.5"
              >
                公式サイトを試してみる
              </a>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white p-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded mr-3 font-bold">No.2</span>
                <span className="text-gray-500 font-normal mr-2 text-sm">こちらもおすすめ:</span>
                {secondMatch.name}
              </h3>
              <div className="flex gap-2 scale-90 origin-right">
                <span className={`text-xs px-2 py-1 rounded font-bold bg-gray-100 text-gray-600`}>
                  {getPriceInfo(secondMatch.tags.pricing).label.split(' /')[0]}
                </span>
                <OptOutBadge available={secondMatch.optout?.optout_available} />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{secondMatch.description}</p>
            <a href={secondMatch.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold text-sm hover:underline flex items-center group">
              詳細を見る <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {otherMatches.length > 0 && (
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <h3 className="text-center text-gray-500 font-bold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                その他の有力な候補
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {otherMatches.map((service, index) => (
                  <div key={service.id} className="bg-white rounded-xl shadow p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded font-bold">No.{index + 3}</span>
                       <div className="scale-75 origin-top-right">
                         <OptOutBadge available={service.optout?.optout_available} />
                       </div>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2 truncate" title={service.name}>{service.name}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 h-8">{service.description}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {getPriceInfo(service.tags.pricing).label.split(' /')[0]}
                      </span>
                      <a href={service.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-xs font-bold hover:underline">
                        公式サイト &rarr;
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center pb-12 border-b border-gray-200 mb-8">
            <button 
              onClick={restart}
              className="inline-flex items-center text-gray-500 hover:text-indigo-600 font-medium transition-colors bg-white px-6 py-3 rounded-full shadow-sm hover:shadow"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              もう一度診断する
            </button>
          </div>

          <div className="text-center">
            <button 
              onClick={() => setShowAllResults(!showAllResults)}
              className="inline-flex items-center text-xs text-gray-400 hover:text-gray-600 font-medium transition-colors mb-4"
            >
              {showAllResults ? 'デバッグ表示を閉じる' : 'デバッグ：全ランキングを表示'}
              {showAllResults ? <ChevronRight className="w-3 h-3 ml-1 rotate-90" /> : <List className="w-3 h-3 ml-1" />}
            </button>

            {showAllResults && (
              <div className="bg-gray-100 rounded-xl p-4 text-left animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 mb-4 text-gray-600 text-sm font-bold uppercase">
                  <Bug className="w-4 h-4" />
                  Debug: All Rankings ({results.length})
                </div>
                <div className="space-y-2">
                  {results.map((service, index) => (
                    <div key={service.id} className="bg-white p-3 rounded-lg text-sm flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono font-bold w-6 text-right ${index < 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-gray-800">{service.name}</div>
                          <div className="text-xs text-gray-500">Score: {scores[service.id]}</div>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                        {service.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(5%); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
      {step === 'start' && <StartScreen />}
      {step === 'quiz' && <QuizScreen />}
      {step === 'loading' && <LoadingScreen />}
      {step === 'result' && <ResultScreen />}
    </div>
  );
}
