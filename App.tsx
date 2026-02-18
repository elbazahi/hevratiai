
import { 
  CheckCircle2, 
  Monitor, 
  Mail, 
  Phone, 
  Info, 
  Calendar, 
  BookOpen, 
  Target, 
  Zap, 
  Moon, 
  Layout, 
  Clock, 
  Check, 
  Trophy, 
  Award, 
  Star, 
  RefreshCcw, 
  Sparkles, 
  RotateCcw, 
  Crown, 
  Medal, 
  BarChart3, 
  Save, 
  LogOut, 
  FileText, 
  Users, 
  ShieldCheck, 
  MapPin, 
  Bell, 
  Navigation, 
  Share2, 
  Laptop, 
  Smartphone, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  XCircle, 
  Shuffle, 
  Shield, 
  Send, 
  FileDown, 
  Cpu, 
  History, 
  Settings, 
  Power, 
  Loader2, 
  TrendingUp, 
  MessageSquare, 
  Presentation, 
  ChevronRight, 
  X, 
  BarChart, 
  QrCode, 
  ArrowUpFromLine, 
  SquarePlus, 
  ChevronDown, 
  Search, 
  Video,
  Wrench,
  Download,
  Terminal,
  MousePointer2,
  Layers,
  SmartphoneNfc,
  Lock,
  Bot,
  User,
  Sparkle,
  Flame,
  BrainCircuit,
  Fingerprint,
  Lightbulb,
  Command,
  Activity,
  ChevronLeft,
  FileBox,
  Compass,
  Rocket,
  ShieldAlert,
  ZapOff,
  HelpCircle
} from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { INITIAL_EXAMS } from './constants';
import { DELINQUENCY_QUESTIONS } from './questions_delinquency';
import { POLICE_QUESTIONS } from './questions_police';
import { Difficulty, Question, Exam } from './types';
import { GoogleGenAI } from "@google/genai";
import { POLICE_AND_SOCIETY_CONTENT } from './knowledge';

// API Configuration (Google Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbzXOXrmmlaC3HCVpP4fi5VY1jNN9xIiiV3VqbqjmY2-JVY2Whg65VUFZGKt0cGHz4GY/exec";
const MATERIALS_API_URL = "https://script.google.com/macros/s/AKfycbwPCi66_bRdmu8xk0HQDamBLJQcFOgFTt7PlJ0OMpOIDtgVmQwUsE2_iCyuB6Q-eBFr/exec";

// LocalStorage versioning key
const STORAGE_KEY = 'tzachi_exams_v13_4';

const fetchWithRetry = async (url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<any> => {
  const isPost = options.method === 'POST';
  
  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    redirect: 'follow',
    mode: isPost ? 'no-cors' : 'cors',
    body: options.body,
  };
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, fetchOptions);
      if (isPost && fetchOptions.mode === 'no-cors') return { sent: true };
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, backoff));
    }
  }
};

const AnimatedScore = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [target]);

  return <span>{count.toLocaleString()}</span>;
};

const StatCard = ({ label, value, subValue, subValueClass, sideImage, isLoading, hasLightning }: { label: string; value: React.ReactNode, subValue?: string, subValueClass?: string, sideImage?: string, isLoading?: boolean, hasLightning?: boolean }) => (
  <div className="bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-white/40 dark:border-slate-700 min-h-[160px] flex flex-col justify-center items-center text-center transition-transform hover:scale-105 hover:shadow-2xl group w-full relative overflow-hidden">
    {hasLightning && (
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-x-0 h-full w-full bg-gradient-to-t from-transparent via-cyan-400/50 to-transparent animate-lightning"></div>
      </div>
    )}
    <div className="text-gray-400 dark:text-slate-400 text-lg md:text-xl font-black mb-3 uppercase tracking-wide group-hover:text-[#6c5ce7] transition-colors z-10">{label}</div>
    
    <div className="relative flex items-center justify-center w-full">
      <div className="text-5xl md:text-7xl font-black text-[#6c5ce7] dark:text-[#a29bfe] tracking-tight drop-shadow-sm z-10 flex items-center gap-3">
        {isLoading ? <Loader2 className="w-10 h-10 animate-spin opacity-30" /> : value}
      </div>
      
      {sideImage && (
        <div className="absolute -right-8 md:-right-20 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
          <img 
            src={sideImage} 
            alt="icon" 
            className="w-44 h-44 md:w-80 md:h-80 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-breathe opacity-80 md:opacity-90 group-hover:opacity-100" 
          />
        </div>
      )}
    </div>
    
    {subValue && <div className={`text-lg font-bold mt-3 ${subValueClass || ''} z-10`}>{subValue}</div>}
  </div>
);

const cleanSubjectName = (subject: string) => {
  if (!subject) return '';
  return subject.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2B50\u2B55]|[\u2190-\u21FF]/g, '').trim();
};

const formatOnlyTime = (timeStr: any) => {
  if (!timeStr) return '-';
  const str = String(timeStr);
  if (str.includes('T') || str.length > 10) {
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    } catch(e) {}
  }
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    let hour = parseInt(match[1]);
    let minute = match[2];
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  return str;
};

interface AICategory {
  id: string;
  name: string;
  active: boolean;
  folderId: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

interface ExternalMaterial {
  name: string;
  active: boolean;
  filesList: { name: string; link: string; dateCreated?: string }[];
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginName, setLoginName] = useState(() => localStorage.getItem('user_name') || '');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [userCity, setUserCity] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [topLeaders, setTopLeaders] = useState<any[]>([]);
  const [activeSemester, setActiveSemester] = useState<'a' | 'b' | 'summer'>('a');
  
  const [apiMaterials, setApiMaterials] = useState<ExternalMaterial[]>([]);

  const [aiCategories, setAiCategories] = useState<AICategory[]>([
    { id: '1', name: 'משטרה וחברה', active: true, folderId: 'folder_police_society' },
    { id: '2', name: 'בתי סוהר', active: true, folderId: 'folder_prisons' },
    { id: '3', name: 'מבוא למשפט עברי', active: true, folderId: 'folder_hebrew_law' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState<AICategory | null>(null);
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([]);
  const [aiInputValue, setAiInputValue] = useState('');
  const [isAiAnswering, setIsAiAnswering] = useState(false);
  const [aiCooldown, setAiCooldown] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await fetchWithRetry(MATERIALS_API_URL);
        if (data && data.categories && Array.isArray(data.categories)) {
          setApiMaterials(data.categories);
        } else if (data && Array.isArray(data)) {
          setApiMaterials(data);
        }
      } catch (err) {
        console.warn("Dynamic materials fetch failed:", err);
      }
    };
    fetchMaterials();
  }, []);

  useEffect(() => {
    if (aiCooldown > 0) {
      const timer = setTimeout(() => setAiCooldown(aiCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [aiCooldown]);

  const [showZoomLinkBox, setShowZoomLinkBox] = useState(false);
  const policeZoomLink = "https://us02web.zoom.us/rec/play/FYORGCW-o7an7CUeH-PQeHzlgKUrwJxWyIlhdwbpT9qslKCfQ9kF5mb5jwoj8qd83TBlAD-XZmxneba4.QVLIzqpeMYTrrjYa";

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstructionPopup, setShowInstructionPopup] = useState(false);
  const [isMaterialPreviewOpen, setIsMaterialPreviewOpen] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isMobileView = window.innerWidth < 1024;
      if (isMobileView && document.visibilityState === 'visible') {
        if (isLoggedIn && loginName !== 'צחיי') {
          setIsLoggedIn(false);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoggedIn, loginName]);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isLoggedIn]);

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [showMaintenanceUI, setShowMaintenanceUI] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);

  const [adminTickerText, setAdminTickerText] = useState<string>('');
  const [dashboardTickerMessages, setDashboardTickerMessages] = useState<string[]>([]);
  const [adminLastEntries, setAdminLastEntries] = useState<any[]>([]);
  const [adminGraphData, setAdminGraphData] = useState<{ label: string; value: number }[]>([]);
  const [isAdminLoadingData, setIsAdminLoadingData] = useState(false);
  const [isSavingTicker, setIsSavingTicker] = useState(false);

  const maxVisits = useMemo(() => {
    const vals = adminGraphData.map(d => d.value);
    return vals.length > 0 ? Math.max(...vals, 1) : 1;
  }, [adminGraphData]);

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return INITIAL_EXAMS.map(e => ({ ...e, originalDate: e.date }));
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(25 * 60);
  const timerRef = useRef<number | null>(null);
  
  const [isHallOfFameOpen, setIsHallOfFameOpen] = useState(false);
  const [hallOfFameData, setHallOfFameData] = useState<any[]>([]);
  const [loadingHallOfFame, setLoadingHallOfFame] = useState(false);
  const [currentHallOfFameSubject, setCurrentHallOfFameSubject] = useState('');

  const [isDelinquencyQuizOpen, setIsDelinquencyQuizOpen] = useState(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);
  const [celebration, setCelebration] = useState<'gold' | 'silver' | 'bronze' | null>(null);
  
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizStats, setQuizStats] = useState({ correct: 0, incorrect: 0 });
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [currentQuizTitle, setCurrentQuizTitle] = useState('');

  const [contactModal, setContactModal] = useState<{ isOpen: boolean; type: 'phone' | 'email'; value: string; title: string }>({
    isOpen: false,
    type: 'phone',
    value: '',
    title: ''
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadInitialData = async () => {
    try {
      const data = await fetchWithRetry(API_URL, { method: 'GET' });
      if (data) {
        setMaintenanceMode(data.maintenanceMode === true || data.maintenanceMode === 'ON');
        const rawTicker = data.tickerMessages || data.ticker || data.messages;
        if (rawTicker) {
          if (Array.isArray(rawTicker)) {
            setDashboardTickerMessages(rawTicker);
          } else {
            setDashboardTickerMessages(String(rawTicker).split(/[;|\n]/).map(s => s.trim()).filter(s => s.length > 0));
          }
        }
        if (data.visitorCount) {
          setTotalEntries(data.visitorCount);
        }
        if (data.categories && Array.isArray(data.categories)) {
          setAiCategories(data.categories);
        }
      }
    } catch (e) {
      console.warn("Initial data load failed.");
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  const refreshStats = async () => {
    setIsStatsLoading(true);
    try {
      const data = await fetchWithRetry(`${API_URL}?subject=${encodeURIComponent("משטרה וחברה")}`, { method: 'GET' });
      if (data) {
        if (data.visitorCount) setTotalEntries(data.visitorCount);
        if (data.status === "success" && data.hallOfFame) {
          const leaders = data.hallOfFame
            .map((item: any) => ({
              name: item.name.trim(),
              points: parseInt(item.totalPoints || "0")
            }))
            .slice(0, 10);
          setTopLeaders(leaders);
        }
      }
    } catch (e) { 
      console.warn("Stats refresh failed."); 
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    const tickerInterval = setInterval(loadInitialData, 5 * 60 * 1000);
    return () => clearInterval(tickerInterval);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      refreshStats();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isAdminPanelOpen && loginName === 'צחיי') {
      const fetchAdminData = async () => {
        setIsAdminLoadingData(true);
        try {
          const data = await fetchWithRetry(API_URL, { method: 'GET' });
          if (data) {
            if (Array.isArray(data.tickerMessages)) {
              setAdminTickerText(data.tickerMessages.join('; '));
            } else {
              setAdminTickerText(String(data.tickerMessages || ''));
            }
            const rawRecent = data.recentEntries || [];
            setAdminLastEntries(Array.isArray(rawRecent) ? rawRecent : []);
            if (data.graphData && Array.isArray(data.graphData)) {
              setAdminGraphData(data.graphData);
            }
          }
        } catch (e) {
          console.error("Admin data fetch failed");
          setAdminLastEntries([]);
        } finally {
          setIsAdminLoadingData(false);
        }
      };
      fetchAdminData();
    }
  }, [isAdminPanelOpen, loginName]);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const isHebrewOnly = (name: string) => {
    if (!name) return false;
    if (name === 'צחיי') return true;
    return /^[\u0590-\u05FF\s]+$/.test(name);
  };

  const handleLogin = async () => {
    const trimmedName = loginName.trim();
    if (trimmedName.length < 2) {
      alert("נא להזין שם מלא כדי להיכנס למערכת המטלות");
      return;
    }
    if (!isHebrewOnly(trimmedName)) {
      alert("יש להזין שם בעברית בלבד");
      return;
    }

    setIsLoggingIn(true);
    let detectedCity = 'לא ידוע';
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      if (data && data.city) detectedCity = data.city;
    } catch (e) {}

    const loginAction = trimmedName === 'צחיי' ? "admin_access" : (window.innerWidth < 1024 ? "טלפון" : "מחשב");
    
    try {
      await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        redirect: "follow",
        body: JSON.stringify({
          action: loginAction,
          name: trimmedName,
          city: detectedCity 
        })
      });
      setUserCity(detectedCity);

      const data = await fetchWithRetry(API_URL, { method: 'GET' });
      const currentMaintenance = data.maintenanceMode === true || data.maintenanceMode === 'ON';
      setMaintenanceMode(currentMaintenance);
      
      if (data.visitorCount) {
        setTotalEntries(data.visitorCount);
      }

      if (trimmedName === 'צחיי') {
        localStorage.removeItem('user_name');
        setIsLoggedIn(true);
        setIsAdminPanelOpen(true);
      } else if (currentMaintenance) {
        localStorage.setItem('user_name', trimmedName);
        setShowMaintenanceUI(true);
        setIsLoggedIn(false);
      } else {
        localStorage.setItem('user_name', trimmedName);
        setIsLoggedIn(true);
        refreshStats();
      }
    } catch (error: any) {
      console.error("Login process failed:", error);
      alert("שגיאת תקשורת בחיבור למערכת. נסה שוב.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCopyValue = (val: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setCopyFeedback('הועתק!');
      setTimeout(() => setCopyFeedback(null), 2000);
    });
  };

  const handleSendEmailLink = () => {
    if (!shareEmail.includes('@')) {
      alert("נא להזין כתובת מייל תקינה");
      return;
    }
    const subject = encodeURIComponent("לינק לאתר ניהול המטלות - קרימינולוגיה");
    const body = encodeURIComponent(`היי, מצורף לינק לאתר ניהול המטלות לקרימינולוגיה:\nhttps://sensational-babka-0a548f.netlify.app/\n\nבהצלחה!`);
    window.open(`mailto:${shareEmail}?subject=${subject}?body=${body}`, '_self');
  };

  const toggleMaintenanceMode = async () => {
    setIsUpdatingStatus(true);
    try {
      await fetchWithRetry(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "maintenance_toggle" })
      });
      setMaintenanceMode(!maintenanceMode);
      alert(`מצב תחזוקה עודכן בהצלחה!`);
    } catch (e) {
      alert("שגיאת תקשורת בעדכון המצב.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleUpdateTicker = async () => {
    if (loginName !== 'צחיי') return;
    setIsSavingTicker(true);
    try {
      await fetchWithRetry(API_URL, {
        method: "POST",
        body: JSON.stringify({ 
          action: "update_ticker", 
          message: adminTickerText 
        })
      });
      alert("המבזקים עודכנו בהצלחה!");
      setDashboardTickerMessages(adminTickerText.split(';').map(s => s.trim()).filter(s => s.length > 0));
      loadInitialData();
    } catch (e) {
      alert("שגיאת תקשורת בעדכון.");
    } finally {
      setIsSavingTicker(false);
    }
  };

  const submitScoreToDB = async (subject: string, score: number) => {
    if (loginName === 'צחיי') return;
    try {
        const cleanSubject = cleanSubjectName(subject);
        await fetchWithRetry(API_URL, {
            method: "POST",
            body: JSON.stringify({
              action: "סימולטור", 
              name: loginName,
              city: userCity,
              subject: cleanSubject,
              points: score
            })
        });
    } catch (error: any) { console.error('API score log failed:', error); }
  };

  const toggleStatus = (id: number) => { 
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: e.status === 'active' ? 'archive' : 'active', completedAt: e.status === 'active' ? Date.now() : undefined } : e)); 
  };

  const finishQuiz = async () => {
      setIsSubmittingScore(true);
      try {
          await submitScoreToDB(currentQuizTitle, quizStats.correct);
          if (loginName === 'צחיי') { setIsDelinquencyQuizOpen(false); setIsSubmittingScore(false); return; }
          const data = await fetchWithRetry(API_URL, { method: 'GET' });
          if (data && data.recentEntries) {
            const cleanTargetSubject = cleanSubjectName(currentQuizTitle);
            const rawScores = data.recentEntries.filter((e: any) => e.userAction === "סימולטור");
            const grouped = rawScores.reduce((acc: any, curr: any) => {
              const sSub = cleanSubjectName(curr.subject || "");
              if (sSub === cleanTargetSubject) {
                const name = (curr.userName || "").trim();
                const pts = parseInt(curr.points || "0");
                if (name) {
                  acc[name] = Math.max(acc[name] || 0, pts);
                }
              }
              return acc;
            }, {});
            const leaders = Object.keys(grouped)
              .map(name => ({ name, points: grouped[name] }))
              .sort((a, b) => b.points - a.points);
            const myRank = leaders.findIndex(l => l.name === loginName);
            if (myRank === 0) setCelebration('gold');
            else if (myRank === 1) setCelebration('silver');
            else if (myRank === 2) setCelebration('bronze');
            else { 
              alert("הציון נשמר בהצלחה!"); 
              setIsDelinquencyQuizOpen(false); 
            }
            if (myRank >= 0 && myRank <= 2) { 
              setTimeout(() => { 
                setCelebration(null); 
                setIsDelinquencyQuizOpen(false); 
                refreshStats();
              }, 6000); 
            } else {
              refreshStats();
            }
          }
      } catch (e) { 
        alert("אירעה שגיאה בשמירת הציון."); 
        setIsDelinquencyQuizOpen(false);
      } finally { 
        setIsSubmittingScore(false); 
      }
  };

  const openHallOfFame = async (subject: string) => {
      const cleanTargetSubject = cleanSubjectName(subject);
      setCurrentHallOfFameSubject(subject);
      setIsHallOfFameOpen(true);
      setLoadingHallOfFame(true);
      setHallOfFameData([]);
      try {
          const data = await fetchWithRetry(`${API_URL}?subject=${encodeURIComponent(cleanTargetSubject)}`, { method: 'GET' });
          if (data && data.status === "success" && data.hallOfFame) {
             const leaderboard = data.hallOfFame.map((item: any) => ({
                name: item.name.trim(),
                points: parseInt(item.totalPoints || "0")
             }));
             setHallOfFameData(leaderboard);
          } else {
             setHallOfFameData([]);
          }
      } catch (error) { 
        console.error("Hall of Fame fetch error:", error);
        alert("שגיאה בטעינת נתונים"); 
      } finally { 
        setLoadingHallOfFame(false); 
      }
  };

  const getDaysDiff = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return 999;
    const [d, m, y] = parts.map(Number);
    const target = new Date(y, m - 1, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
  };

  const createGoogleCalendarUrl = (exam: Exam) => {
    const parts = exam.date.split('/');
    if (parts.length !== 3) return '#';
    const [d, m, y] = parts;
    const dateStr = `${y}${m}${d}`;
    const subject = encodeURIComponent(`משימה: ${exam.subject}`);
    const details = encodeURIComponent(`${exam.adminNote}\n\nמרצה: ${exam.lecturer}\nמערכת המטלות: https://sensational-babka-0a548f.netlify.app/`);
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${subject}&dates=${dateStr}/${dateStr}&details=${details}`;
  };

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(exams)); }, [exams]);

  useEffect(() => {
    if (isFocusMode) {
      timerRef.current = window.setInterval(() => {
        setFocusSeconds((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            alert("זמן המיקוד הסתיים! כל הכבוד ☕");
            setIsFocusMode(false);
            return 25 * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isFocusMode]);

  const toggleFocus = () => { setFocusSeconds(25 * 60); setIsFocusMode(!isFocusMode); };
  const formatTimeMinutes = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const activeExams = exams.filter(e => e.status === 'active');
  const archivedExams = exams.filter(e => e.status === 'archive').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  const sortedActive = [...activeExams].sort((a, b) => getDaysDiff(a.date) - getDaysDiff(b.date));
  const progressPercent = Math.round(((exams.length - activeExams.length) / (exams.length || 1)) * 100);

  const shufflePractice = () => {
    const questions = currentQuizTitle.includes("עבריינות") ? DELINQUENCY_QUESTIONS : POLICE_QUESTIONS;
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
    setQuizIdx(0);
    setSelectedAnswer(null);
    setQuizStats({ correct: 0, incorrect: 0 });
  };

  const startQuiz = async (subject: string) => {
    setCurrentQuizTitle(subject);
    setQuizStats({ correct: 0, incorrect: 0 });
    setQuizIdx(0);
    setSelectedAnswer(null);
    const loginAction = window.innerWidth < 1024 ? "טלפון" : "מחשב";
    try {
      fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        redirect: "follow",
        body: JSON.stringify({
          action: "סימולטור", 
          name: loginName,
          city: userCity,
          device: loginAction,
          subject: subject
        })
      });
    } catch (e) {}
    const questions = subject.includes("עבריינות") ? DELINQUENCY_QUESTIONS : POLICE_QUESTIONS;
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    setActiveQuestions(shuffled);
    setIsDelinquencyQuizOpen(true);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      alert("נא לבחור תשובה לפני שמתקדמים לשאלה הבאה");
      return;
    }
    if (quizIdx < activeQuestions.length - 1) {
       setQuizIdx(prev => prev + 1);
       setSelectedAnswer(null);
    } else { 
      alert("סיימת את כל השאלות! כל הכבוד! 🏆"); 
      finishQuiz(); 
      setQuizIdx(0); 
    }
  };

  const returnToMoedA = (id: number) => { 
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'active', date: e.originalDate || e.date, completedAt: undefined } : e)); 
  };

  const handleWhatsAppShare = () => {
    const text = `היי, מצורף לינק לאתר ניהול המטלות לקרימינולוגיה:\nhttps://sensational-babka-0a548f.netlify.app/\n\nבהצלחה בלימודים!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const renderSubjectWithGlint = (subject: string, isUrgent: boolean = false) => {
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|\u200D|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2B50\u2B55]|[\u2190-\u21FF]/g;
    const parts = subject.split(emojiRegex);
    const matches = subject.match(emojiRegex);
    return (
      <span className={isUrgent ? 'animate-blink-red' : ''}>
        <span className="text-glint-continuous">{parts[0]}</span>
        {matches && matches.map((m, i) => <span key={i}>{m}</span>)}
        {parts.length > 1 && <span className="text-glint-continuous">{parts.slice(1).join('')}</span>}
      </span>
    );
  };

  const handleAppLogoClick = () => {
    if (window.innerWidth >= 1024) return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      setShowInstructionPopup(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      setShowInstructionPopup(true);
    }
  };

  if (showMaintenanceUI && loginName !== 'צחיי') {
    return (
      <div className="h-screen bg-slate-50 dark:bg-[#0a0f1d] flex flex-col items-center justify-center p-6 text-center overflow-hidden animate-in fade-in duration-500" dir="rtl">
        <div className="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] border-4 border-indigo-500 shadow-[0_30px_100px_rgba(0,0,0,0.2)] max-w-2xl w-full relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
          <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/30 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce group-hover:rotate-12 transition-transform">
            <Wrench className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white mb-6 tracking-tight">האתר בשדרוג זמני 🛠️</h1>
          <div className="h-1.5 w-32 bg-indigo-500 rounded-full mx-auto mb-10 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
          <div className="space-y-6 mb-12">
            <p className="text-xl md:text-2xl font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">סטודנטים יקרים, אנחנו מעדכנים תכנים כרגע. נחזור לפעילות מלאה בקרוב!</p>
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800"><p className="text-sm font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-widest">מערכת הניהול בשיפורים טכניים</p></div>
          </div>
          <div className="flex flex-col gap-4">
            <button onClick={() => { setShowMaintenanceUI(false); loadInitialData(); }} className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"><RefreshCcw className="w-6 h-6" /><span>ניסיון חוזר</span></button>
            <button onClick={() => setShowMaintenanceUI(false)} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-[2rem] font-black text-lg border-2 border-slate-200 dark:border-slate-700 transition-all active:scale-95">חזרה למסך הכניסה</button>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">© 2026 צחי אלבז - מערכת ניהול מטלות</p></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (isLoadingMaintenance) {
      return (
        <div className="h-screen bg-[#f0f2f5] flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#6c5ce7] opacity-40" />
        </div>
      );
    }
    const hasEnglish = /[a-zA-Z]/.test(loginName);
    const canLogin = isHebrewOnly(loginName) && loginName.trim().length >= 2;
    const isRememberedName = !!localStorage.getItem('user_name') && loginName === localStorage.getItem('user_name');
    return (
      <div className="h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-3 font-sans text-center overflow-hidden" dir="rtl">
        <div className="max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-500 overflow-hidden">
           <div className="bg-white/95 backdrop-blur-2xl p-5 md:p-6 rounded-[2.5rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.15)] border border-white w-full relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 left-0 w-full h-1 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-indigo-500"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
              </div>
              <div className="relative mb-1 mt-1"><h2 className="text-xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#6c5ce7] to-[#00b894] drop-shadow-sm tracking-tight">ברוכים הבאים!</h2></div>
              <p className="text-gray-400 mb-2 font-extrabold text-[10px] md:text-xs uppercase tracking-widest flex items-center gap-2 justify-center"><ShieldCheck className="w-3 h-3 text-[#6c5ce7]" />מכללה חברתי - ניהול מטלות</p>
              <div className="relative mb-4 flex items-center justify-center w-full"><div className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] relative z-10 rounded-full overflow-hidden border-2 border-white shadow-[0_0_15px_rgba(0,0,0,0.1)] animate-breathe ring-4 ring-[#6c5ce7]/5"><video src="https://res.cloudinary.com/djmztsgdk/video/upload/v1770589248/%D7%99%D7%A6%D7%99%D7%A8%D7%AA_%D7%9C%D7%95%D7%92%D7%95_%D7%90%D7%A0%D7%99%D7%9E%D7%A6%D7%99%D7%94_%D7%9C%D7%93%D7%9E%D7%95%D7%AA_wnrjdh.mp4" autoPlay muted loop playsInline className="w-full h-full object-cover" /></div></div>
              <div className="space-y-3 w-full max-sm"><div className="relative group"><input type="text" placeholder="הקלידו שם מלא בעברית" value={loginName} onChange={(e) => setLoginName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && canLogin) handleLogin(); }} className={`w-full p-3.5 rounded-2xl border-2 text-center text-base md:text-lg font-black outline-none transition-all placeholder:text-gray-300 shadow-inner group-hover:bg-white ${isRememberedName ? 'bg-blue-50/50 border-blue-200 text-blue-800' : 'bg-gray-50/50 border-gray-100 text-gray-800'} ${hasEnglish ? 'border-red-500 focus:border-red-600' : 'focus:border-[#6c5ce7]'}`} autoFocus /><div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20 group-focus-within:opacity-100 transition-opacity"><Zap className="w-4 h-4 text-[#6c5ce7]" /></div></div>{hasEnglish && <p className="text-red-500 font-black text-[10px] md:text-xs animate-bounce">נא להקליד בעברית בלבד! ⚠️</p>}<button onClick={handleLogin} disabled={isLoggingIn || !canLogin} className={`w-full py-3.5 rounded-2xl font-black text-base md:text-lg transition-all flex justify-center items-center gap-2.5 active:scale-95 ${canLogin ? 'bg-gradient-to-br from-[#6c5ce7] to-[#00b894] text-white shadow-lg hover:shadow-xl hover:scale-[1.02]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{isLoggingIn ? (<><span className="animate-spin text-lg">⏳</span><span>מתחבר...</span></>) : (<><Navigation className="w-4 h-4" /><span>כניסה למערכת</span></>)}</button></div>
           </div>
           <p className="mt-4 text-[9px] md:text-[10px] font-black text-gray-400 tracking-wider uppercase flex items-center gap-1.5 justify-center"><span>צחי אלבז © 2026</span></p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen transition-colors duration-500 relative flex flex-col pt-[80px] overflow-hidden ${isDarkMode ? 'bg-[#0a0f1d] text-slate-100' : 'bg-[#f0f2f5] text-gray-800'}`}>
      {celebration && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-500 hi-tech-grid bg-black/95">
           <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40"><div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/50 animate-[scan_4s_linear_infinite]"></div><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]"></div></div>
           <div className="relative z-10 flex flex-col items-center text-center p-10 md:p-16 rounded-[4rem] bg-white/5 backdrop-blur-2xl border-4 border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.4)] animate-[pop-in_0.5s_ease-out] max-w-2xl w-full">
              <div className="relative mb-8"><div className="absolute inset-0 bg-cyan-500 blur-3xl opacity-20 animate-pulse"></div><div className="text-9xl md:text-[10rem] animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">{celebration === 'gold' ? '👑' : celebration === 'silver' ? '🥈' : '🥉'}</div></div>
              <div className="space-y-4">
                 <h2 className={`text-4xl md:text-7xl font-black mb-4 uppercase tracking-tighter drop-shadow-lg ${celebration === 'gold' ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-500 animate-shimmer' : celebration === 'silver' ? 'text-slate-200' : 'text-orange-400'}`}>{celebration === 'gold' ? 'CHAMPION' : celebration === 'silver' ? 'PRO LEVEL' : 'ELITE RANK'}</h2><div className="h-1.5 w-32 mx-auto bg-cyan-500 rounded-full mb-8 shadow-[0_0_100px_cyan]"></div><h3 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">{celebration === 'gold' ? 'מקום ראשון חדש!' : celebration === 'silver' ? 'הישג מדהים - מקום שני!' : 'ביצוע עלית - מקום שלישי!'}</h3><p className="text-lg md:text-2xl text-cyan-200/80 font-bold max-w-md mx-auto leading-relaxed italic">{celebration === 'gold' ? 'שברת את כל המוסכמות! הישג היסטורי.' : celebration === 'silver' ? 'עלית לפסגת היכל התהילה!' : 'נכנסת לשלישיית הצמרת של הקורס!'} </p>
              </div>
              <div className="mt-12 flex items-center gap-4"><Shield className="w-8 h-8 text-cyan-400 animate-pulse" /><span className="text-cyan-400 font-black tracking-widest text-sm uppercase">Verification Complete</span></div>
           </div>
        </div>
      )}

      {isFocusMode && (
        <div className="fixed inset-0 z-[250] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="text-[10rem] md:text-[15rem] font-black text-[#6c5ce7] mb-10 drop-shadow-2xl tabular-nums">{formatTimeMinutes(focusSeconds)}</div>
          <button onClick={toggleFocus} className="bg-red-600 hover:bg-red-500 text-white px-10 py-5 rounded-2xl text-2xl font-black transition-all hover:scale-105 shadow-[0_0_35px_rgba(220,38,38,0.9)] animate-pulse">צא ממצב מיקוד ❌</button>
        </div>
      )}

      <div className={`max-w-6xl mx-auto px-4 py-8 flex-grow w-full overflow-y-auto custom-scrollbar ${isFocusMode ? 'hidden' : ''}`}>
        <header className="flex flex-col items-center mb-10 text-center w-full">
          <div className="w-full flex justify-center mb-6"><div className="w-full max-w-4xl p-1 bg-white/50 dark:bg-slate-700/50 rounded-[2rem] shadow-2xl border border-white/20"><video src="https://res.cloudinary.com/djmztsgdk/video/upload/v1770587600/acc_logo_vfmhue.mp4" autoPlay muted loop playsInline className="w-full h-auto object-cover rounded-[1.8rem] shadow-inner" /></div></div>
          <div className="mb-4 flex flex-col items-center"><div className="bg-white/80 dark:bg-slate-800/80 px-8 py-3 rounded-full border border-[#6c5ce7]/30 shadow-lg backdrop-blur-md animate-soft-pulse flex items-center gap-4 group transition-all hover:border-[#6c5ce7]"><div className="relative"><Users className="w-6 h-6 text-[#6c5ce7] group-hover:scale-110 transition-transform" /><div className="absolute -top-1 -right-1 w-2 h-2 bg-green-50 rounded-full animate-ping"></div></div><span className="text-sm md:text-base font-black text-gray-500 dark:text-slate-300 uppercase tracking-widest">כניסות:</span><span className="text-2xl font-black text-[#6c5ce7] dark:text-[#a29bfe] tabular-nums drop-shadow-sm">{isStatsLoading ? <Loader2 className="w-6 h-6 animate-spin inline opacity-20" /> : totalEntries}</span></div></div>
          <h1 className="text-3xl md:text-5xl font-black mb-6 w-full text-center mt-2"><span className="text-glint-continuous text-[#6c5ce7] dark:text-[#a29bfe]">מערכת ניהול משימות - קרימינולוגיה</span></h1>
          
          <div className="flex justify-center gap-2 md:gap-4 mb-10 w-full max-w-2xl px-2 md:px-4 py-4 overflow-hidden">
            <button 
              className="flex-1 md:flex-none min-w-[95px] md:min-w-[140px] py-3 md:py-4 px-2 md:px-6 rounded-2xl font-black text-sm md:text-lg transition-all relative overflow-hidden bg-gradient-to-br from-[#6c5ce7] to-[#8e44ad] text-white shadow-[0_0_20px_rgba(108,92,231,0.6)] border-2 border-indigo-400/30 active:scale-95 group"
              onClick={() => setActiveSemester('a')}
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-center gap-1 md:gap-2 relative z-10">
                <Sparkles className="w-3 h-3 md:w-5 md:h-5 animate-pulse text-yellow-300" />
                <span className="truncate">סמסטר א'</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-yellow-300 rounded-full shadow-[0_0_100px_#f1c40f]" />
            </button>
            
            <button 
              disabled 
              className="flex-1 md:flex-none min-w-[95px] md:min-w-[140px] py-3 md:py-4 px-2 md:px-6 rounded-2xl font-black text-sm md:text-lg bg-gray-200 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 border-2 border-transparent cursor-not-allowed opacity-60 flex items-center justify-center gap-1 md:gap-2"
            >
              <Lock className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">סמסטר ב'</span>
            </button>
            
            <button 
              disabled 
              className="flex-1 md:flex-none min-w-[95px] md:min-w-[140px] py-3 md:py-4 px-2 md:px-6 rounded-2xl font-black text-sm md:text-lg bg-gray-200 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 border-2 border-transparent cursor-not-allowed opacity-60 flex items-center justify-center gap-1 md:gap-2"
            >
              <Lock className="w-3 h-3 md:w-4 md:h-4" />
              <span className="truncate">קיץ</span>
            </button>
          </div>

          <div className="text-sm font-bold text-gray-400 dark:text-slate-300 mb-6">שלום, {loginName} {loginName === 'צחיי' ? '👑' : '👋'}</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <StatCard label="🎯 היעד הבא" value={sortedActive.length > 0 ? sortedActive[0].subject.replace('💻', '').trim() : 'סיימנו!'} subValue={sortedActive.length > 0 ? `בעוד ${getDaysDiff(sortedActive[0].date)} ימים` : undefined} subValueClass={sortedActive.length > 0 && getDaysDiff(sortedActive[0].date) <= 5 ? 'text-red-500 animate-blink-red' : 'text-green-500 dark:text-green-400'} />
          <StatCard label="📚 משימות פעילות" value={activeExams.length} sideImage="https://i.ibb.co/cS0y0CPw/23423455.png" />
          <StatCard label="🚀 אחוז ביצוע" value={<div className="flex items-center gap-2"><span>{progressPercent}%</span><TrendingUp className="w-10 h-10 text-green-500 text-glint-continuous drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]" /></div>} isLoading={isStatsLoading} hasLightning={true} />
        </div>

        <div className="max-w-4xl mx-auto mb-12 animate-in fade-in duration-1000">
          <div className="flex justify-between items-end mb-2"><span className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">התקדמות כללית</span><div className="flex items-center gap-2"><span className="text-xl font-black text-[#6c5ce7] dark:text-[#a29bfe]">{progressPercent}%</span><TrendingUp className="w-5 h-5 text-green-500 text-glint-continuous drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]" /></div></div>
          <div className="w-full bg-gray-200 dark:bg-slate-700/50 rounded-full h-5 overflow-hidden shadow-inner border border-white/10 relative"><div className="h-full bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#00b894] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(108,92,231,0.4)] relative overflow-hidden" style={{ width: `${progressPercent}%` }}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-rtl" style={{ backgroundSize: '200% 100%' }} /></div></div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
           <div className="bg-slate-900/90 dark:bg-black/40 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-[#6c5ce7]/50 shadow-[0_20px_50px_rgba(108,92,231,0.3)] relative overflow-hidden group">
             <div className="flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="flex-1 space-y-6 w-full">
                 <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-indigo-400 flex items-center gap-3 text-right" dir="rtl"><Cpu className="w-8 h-8 text-cyan-400" /><span>עדכוני מערכת v13.4</span></h2>
                 <div className="h-[176px] bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md relative overflow-hidden shadow-inner p-6">{dashboardTickerMessages.length > 0 ? (<div className="absolute w-full left-0 animate-ticker-up hover:pause-animation"><ul className="space-y-6 px-6 flex flex-col items-center">{[...dashboardTickerMessages, ...dashboardTickerMessages].map((msg, i) => (<React.Fragment key={i}><li className="w-full flex items-center gap-4 transition-all hover:scale-[1.05] relative group/msg"><div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] flex-shrink-0 animate-pulse" /><div className="text-cyan-400 text-xl md:text-2xl font-black leading-tight text-center flex-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] uppercase tracking-wide italic">{msg}</div><div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)] flex-shrink-0 animate-pulse" /></li><div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-neon-line mx-auto opacity-20" /></React.Fragment>))}</ul></div>) : (<div className="h-full flex items-center justify-center text-slate-500 font-bold italic">{isLoadingMaintenance ? <Loader2 className="animate-spin text-cyan-400" /> : "אין עדכונים חדשים כרגע"}</div>)}</div>
               </div>
               <div className="w-full md:w-[280px] bg-gradient-to-br from-[#6c5ce7]/30 to-cyan-500/20 p-6 rounded-[2.5rem] border border-white/20 text-center backdrop-blur-xl relative overflow-hidden">
                 <button onClick={() => openHallOfFame("משטרה וחברה")} className="w-full hover:scale-105 transition-transform group">
                   <h3 className="text-yellow-400 font-black mb-1 flex items-center justify-center gap-2 relative z-10 group-hover:drop-shadow-[0_0_100px_rgba(250,204,21,0.5)]"><Crown className="w-5 h-5" /><span>היכל התהילה</span></h3>
                   <p className="text-[10px] text-gray-400 font-bold mb-4 relative z-10">משטרה וחברה</p>
                 </button>
                 <div className="space-y-3 relative z-10 max-h-[250px] overflow-y-auto custom-scrollbar px-1">{topLeaders.slice(0, 3).map((item, i) => (<div key={i} className="flex items-center justify-between bg-white/10 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/20 transition-all"><div className="flex items-center gap-2"><span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-[10px] text-white/50 font-mono">#{i + 1}</span>}</span><span className="text-xs font-black text-white truncate max-w-[90px]">{item.name}</span></div><span className="text-xs font-black text-cyan-400">{item.points} נק'</span></div>))}{topLeaders.length === 0 && !isStatsLoading && <p className="text-xs text-slate-500 italic">ממתינים לאלופים...</p>}{isStatsLoading && <Loader2 className="w-5 h-5 animate-spin mx-auto text-cyan-400" />}</div><p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest animate-pulse relative z-10">כל הכבוד למצטיינים</p>
               </div>
             </div>
           </div>
        </div>

        <section className="mb-16 flex flex-col items-center w-full">
          <h2 className={`text-2xl font-extrabold mb-6 flex items-center gap-2 justify-center w-full ${isDarkMode ? 'text-white' : 'text-gray-800'}`}><span className="text-[#6c5ce7] dark:text-[#a29bfe]">📋</span> משימות נוכחיות</h2>
          <div className="grid grid-cols-1 gap-8 text-center max-w-4xl w-full">
            {sortedActive.map(exam => {
              const diff = getDaysDiff(exam.date);
              const isUrgent = diff <= 5;
              const isBlueScreen = exam.subject.includes('💻');
              const canPractice = exam.id === 2 || exam.id === 3;
              
              const cleanName = cleanSubjectName(exam.subject);
              const apiMatch = apiMaterials.find(m => cleanSubjectName(m.name) === cleanName);
              const hasExternalFiles = apiMatch && apiMatch.active && apiMatch.filesList && apiMatch.filesList.length > 0;
              const hasInternalNote = exam.adminNote && exam.adminNote.length > 10;
              
              const specialSubjects = ['מבוא למשפט עברי'];
              const isSpecial = specialSubjects.includes(cleanName);
              
              let btnBaseColor = "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed";
              let btnTitle = "אין חומרים כרגע";

              if (hasExternalFiles) {
                btnBaseColor = "bg-[#2563eb] text-white hover:bg-blue-700 hover:shadow-blue-500/50 shadow-lg";
                btnTitle = "חומרים ודגשים ✨";
              } else if (isSpecial) {
                btnBaseColor = "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed";
                btnTitle = "אין חומרים כרגע";
              } else if (hasInternalNote) {
                btnBaseColor = "bg-[#6c5ce7] text-white hover:bg-[#5a4bcf] hover:shadow-[#6c5ce7]/50 shadow-lg";
                btnTitle = "חומרים ודגשים ✨";
              }

              return (
                <div key={exam.id} className="relative bg-white/90 dark:bg-[#1e293b]/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border-2 border-white/50 dark:border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-8 group hover:shadow-xl transition-all duration-300">
                  <div className="flex-1 text-center md:text-right z-10 w-full">
                    <h3 className={`text-2xl md:text-3xl font-black mb-2 flex items-center justify-center md:justify-start gap-4 ${isUrgent ? 'text-red-500 animate-blink-red' : 'text-gray-800 dark:text-slate-100'}`}>{renderSubjectWithGlint(exam.subject.replace('💻', '').trim(), isUrgent)}{isBlueScreen && <Monitor className="w-8 h-8 text-blue-500 animate-pulse" />}</h3>
                    <p className="text-gray-500 dark:text-slate-400 text-lg font-bold">👨‍🏫 {exam.lecturer}</p>
                    <div className="flex gap-4 mt-6 justify-center md:justify-start">
                      {exam.phone && <button onClick={() => setContactModal({ isOpen: true, type: 'phone', value: exam.phone!, title: `טלפון המרצה: ${exam.lecturer}` })} className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all border border-green-100 dark:border-green-800 shadow-sm hover:bg-green-600 hover:text-white hover:shadow-green-500/50"><Phone className="w-6 h-6" /></button>}
                      <button onClick={() => setContactModal({ isOpen: true, type: 'email', value: exam.email, title: `מייל המרצה: ${exam.lecturer}` })} className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-green-400 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all border border-blue-100 dark:border-green-800 shadow-sm hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/50"><Mail className="w-6 h-6" /></button>
                      <button onClick={() => window.open(createGoogleCalendarUrl(exam), '_blank')} className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 transition-all border border-indigo-100 dark:border-green-800 shadow-sm hover:bg-indigo-600 hover:text-white hover:shadow-indigo-500/50"><Calendar className="w-6 h-6" /></button>
                    </div>
                  </div>
                  <div className="text-center px-6 py-4 bg-gray-100 rounded-2xl border border-gray-200 min-w-[140px] shadow-sm">
                     <div className="text-xl md:text-2xl font-black tabular-nums text-black">{exam.date}</div>
                     <div className={`text-base font-bold mt-1 ${isUrgent ? 'text-red-500 animate-blink-red' : 'text-green-600'}`}>בעוד {diff} ימים</div>
                  </div>
                  <div className="flex flex-col gap-3 w-full md:w-auto items-center min-w-[220px]">
                    <button 
                      onClick={() => { 
                        if(hasExternalFiles || (hasInternalNote && !isSpecial)) { 
                          setSelectedExam(exam); 
                          setShowZoomLinkBox(false); 
                          setIsInfoModalOpen(true); 
                        } 
                      }} 
                      className={`p-4 rounded-2xl font-black text-sm transition-all w-full hover:scale-105 ${btnBaseColor}`}
                    >
                      {btnTitle}
                    </button>
                    
                    {canPractice && (
                      <>
                        <button onClick={() => startQuiz(exam.subject)} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-2xl font-black text-sm shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95 transition-all relative overflow-hidden flex items-center justify-center gap-2">
                          <span>תרגול למבחן 🎯</span>
                        </button>
                        <button onClick={() => openHallOfFame(exam.subject)} className="w-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white p-4 rounded-2xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                          <Trophy className="w-5 h-5" />
                          <span>היכל התהילה 👑</span>
                        </button>
                      </>
                    )}

                    <button onClick={() => toggleStatus(exam.id)} className="w-full bg-[#00b894] text-white p-4 rounded-2xl font-black text-lg hover:scale-105 shadow-lg transition-all flex items-center justify-center gap-3 hover:bg-[#00a383] hover:shadow-[#00b894]/50"><span>סיימתי!</span><CheckCircle2 className="w-6 h-6" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {archivedExams.length > 0 && (
          <section className="mt-20 mb-10 text-center flex flex-col items-center w-full">
            <div className="flex items-center gap-6 w-full max-w-4xl mb-12"><div className={`h-[2px] flex-1 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-500 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'}`} /><h2 className={`text-2xl font-black tracking-wider whitespace-nowrap flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><span>משימות שהושלמו</span><CheckCircle2 className="w-6 h-6 text-green-500" /></h2><div className={`h-[2px] flex-1 rounded-full ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-500 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'}`} /></div>
            <div className="grid grid-cols-1 gap-6 max-w-4xl w-full">{archivedExams.map(exam => (<div key={exam.id} className="relative bg-white/70 dark:bg-[#1e293b]/70 backdrop-blur-sm p-8 rounded-[2.5rem] border-2 border-white/30 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hover:shadow-2xl transition-all duration-300 group overflow-hidden"><div className="flex-1 text-center md:text-right z-10 w-full"><h4 className="font-black text-xl md:text-2xl text-gray-700 dark:text-slate-100 flex items-center justify-center md:justify-start gap-3"><Sparkles className="w-7 h-7 text-yellow-400 animate-pulse" />{renderSubjectWithGlint(exam.subject.replace('💻','').trim())}</h4><p className="text-sm text-green-600 dark:text-green-400 font-black mt-2 flex items-center justify-center md:justify-start gap-1"><Check className="w-4 h-4" />המשימה הושלמה בתאריך: {exam.date}</p></div><div className="flex flex-col gap-2 w-full md:w-auto"><button onClick={() => returnToMoedA(exam.id)} className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl font-black text-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-blue-500/50"><span>חזרה למשימות</span><RefreshCcw className="w-5 h-5" /></button></div></div>))}</div>
          </section>
        )}

        <div className="max-w-xl mx-auto mb-12 px-4 animate-in fade-in duration-1000">
           <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-xl border border-indigo-100 dark:border-slate-700 backdrop-blur-md group"><div className="flex flex-col items-center text-center gap-4 mb-6"><div className="flex flex-col items-center"><div className="relative w-16 h-12 bg-white rounded-xl border-2 border-gray-100 shadow-lg flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110"><svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-[2.5] stroke-red-500 drop-shadow-sm"><path d="M3 8L12 13L21 8" strokeLinecap="round" strokeLinejoin="round" /><rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /></svg><div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-red-500/5 pointer-events-none"></div></div><span className="text-[11px] font-black text-gray-500 dark:text-gray-400 mt-2 tracking-[0.25em] ml-1">GMAIL</span></div><h3 className="text-xl font-black text-gray-800 dark:text-white">שלח לעצמך את הלינק למייל</h3><p className="text-sm text-gray-500 dark:text-slate-400 font-bold">כדי שתוכל לגשת למערכת בקלות מהמחשב או מכל מכשיר אחר</p></div><div className="flex flex-col sm:flex-row gap-3"><div className="flex-1 relative group"><input type="email" placeholder="הזן כתובת אימייל" value={shareEmail} onChange={(e) => setShareEmail(e.target.value)} className="w-full p-4 pr-12 rounded-2xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-900/50 text-center font-bold outline-none focus:border-indigo-500 transition-all dark:text-white" /><div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-30"><Mail className="w-5 h-5 text-indigo-600" /></div></div><button onClick={handleSendEmailLink} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/50"><span>שלח לינק</span><Send className="w-5 h-5" /></button></div></div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 py-16 text-center">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="group relative flex flex-col items-center gap-3 hover:scale-110 transition-all"><div className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(255,255,0,0.8)] transition-all group-hover:-translate-y-2">{isDarkMode ? '🌞' : '🌙'}</div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">מצב {isDarkMode ? 'יום' : 'לילה'}</span></button>
          {loginName === 'צחיי' && <button onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)} className="group relative flex flex-col items-center gap-3 hover:scale-110 transition-all"><div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-180 group-hover:bg-[#6c5ce7] group-hover:shadow-[#6c5ce7]/50 transition-all duration-700 group-hover:-translate-y-2"><Settings className="w-8 h-8 text-[#6c5ce7] dark:text-[#a29bfe] group-hover:text-white transition-colors" /></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">ניהול</span></button>}
          <button onClick={toggleFocus} className="group relative flex flex-col items-center gap-3 hover:scale-110 transition-all"><div className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(255,105,180,0.8)] transition-all group-hover:-translate-y-2 group-hover:rotate-12">🎯</div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">מיקוד</span></button>
          <button onClick={() => setIsGuideModalOpen(true)} className="group relative flex flex-col items-center gap-3 hover:scale-110 transition-all"><div className="text-5xl group-hover:drop-shadow-[0_0_15px_rgba(0,191,255,0.8)] transition-all group-hover:-translate-y-2 group-hover:rotate-12">📖</div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">מדריך</span></button>
          <button onClick={handleAppLogoClick} className="install-btn-mobile-only group relative flex flex-col items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-2 hover:scale-110"><div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 dark:border-slate-700 overflow-hidden group-hover:drop-shadow-[0_0_15px_rgba(108,92,231,0.5)] transition-all group-hover:-translate-y-2"><img src="https://i.ibb.co/4nnjQf4m/ICON.png" alt="App Icon" className="w-full h-full object-cover" /></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">אפליקציה</span></button>
          <button onClick={handleWhatsAppShare} className="group relative flex flex-col items-center gap-3 hover:scale-110 transition-all"><div className="w-12 h-12 md:w-14 md:h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 dark:border-slate-700 overflow-hidden group-hover:drop-shadow-[0_0_15px_rgba(37,211,102,0.5)] transition-all group-hover:-translate-y-2"><svg viewBox="0 0 24 24" className="w-7 h-7 md:w-8 md:h-8 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.014 12.032c0 2.12.556 4.188 1.613 6.007L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.635 0 12.032-5.396 12.036-12.032a11.782 11.782 0 00-3.411-8.505z"/></svg></div><span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-slate-300 group-hover:text-[#6c5ce7] transition-colors">וואצאפ</span></button>
        </div>
        <footer className="w-full bg-white dark:bg-[#070b14] border-t border-gray-200 dark:border-slate-800 py-10 text-center mt-auto"><p className="text-gray-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">כל הזכויות שמורות לצחי אלבז © 2026 | גרסה 13.4</p></footer>
      </div>

      {showInstructionPopup && (
        <div className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 max-sm w-full text-center shadow-2xl relative border-4 border-indigo-500 animate-[pop-in_0.3s_ease-out]">
            <button onClick={() => setShowInstructionPopup(false)} className="absolute top-6 left-6 text-2xl opacity-30 hover:opacity-100 transition-all dark:text-white">✕</button>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><Smartphone className="w-10 h-10 text-indigo-600 dark:text-indigo-400" /></div>
            <h3 className="text-2xl font-black mb-4 text-gray-800 dark:text-white">התקנה ב-iPhone</h3>
            <div className="space-y-6 text-right mb-8">
              <div className="flex items-start gap-4"><div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-black shrink-0">1</div><p className="font-bold text-gray-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">לחצו על כפתור <b>"שתף"</b> בתחתית הדפדפן <span className="mx-1 inline-flex items-center justify-center p-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg"><svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg></span></p></div>
              <div className="flex items-start gap-4"><div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-black shrink-0">2</div><p className="font-bold text-gray-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">גללו מטה בתפריט ובחרו באפשרות <b>"הוסף למסך הבית"</b><span className="mx-1 inline-flex items-center justify-center p-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg"><svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg></span></p></div>
              <div className="flex items-start gap-4"><div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-black shrink-0">3</div><p className="font-bold text-gray-700 dark:text-slate-300 text-sm md:text-base">לחצו על <b>"הוסף"</b> בפינה העליונה של המסך.</p></div>
            </div>
            <button onClick={() => setShowInstructionPopup(false)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg transition-all active:scale-95">הבנתי!</button>
          </div>
        </div>
      )}

      {isDelinquencyQuizOpen && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0 md:p-6 overflow-hidden pt-[80px] md:pt-6">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative border-t-[12px] border-[#6c5ce7] flex flex-col h-full md:h-[92vh] overflow-hidden animate-[pop-in_0.5s_ease-out]">
                  <div className="bg-white dark:bg-[#0f172a] z-[50] border-b border-gray-100 dark:border-slate-800 shadow-lg relative">
                      <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#00b894] transition-all duration-700 ease-out shadow-[0_0_15px_rgba(108,92,231,0.5)]" style={{ width: `${((quizIdx + 1) / (activeQuestions.length || 1)) * 100}%` }} />
                      </div>
                      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex gap-2 w-full md:w-auto">
                              <button onClick={shufflePractice} className="flex-1 md:flex-none bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"><Shuffle className="w-4 h-4" /><span className="inline">ערבב</span></button>
                              <button onClick={finishQuiz} disabled={isSubmittingScore} className={`flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${isSubmittingScore ? 'opacity-70 animate-pulse' : ''}`}>{isSubmittingScore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span>סיים ושמור</span></button>
                          </div>
                          <div className="text-right w-full md:w-auto flex items-center gap-4 justify-between md:justify-end">
                              <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-xl border border-green-200 dark:border-green-800"><span className="text-xs text-green-700 dark:text-green-400 font-black">נכון: {quizStats.correct}</span></div>
                                  <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-xl border border-red-200 dark:border-red-800"><span className="text-xs text-red-700 dark:text-red-400 font-black">טעות: {quizStats.incorrect}</span></div>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"><h2 className="text-xs md:text-xl font-black text-gray-800 dark:text-white">שאלה {quizIdx + 1}/{activeQuestions.length}</h2><BrainCircuit className="w-5 h-5 text-indigo-500 animate-soft-pulse" /></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-10 text-right space-y-8 bg-slate-50/30 dark:bg-transparent pb-32">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-6 md:p-10 rounded-[2.5rem] border-2 border-indigo-100/50 dark:border-slate-700 shadow-xl relative overflow-hidden group backdrop-blur-sm">
                          <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-black">LEVEL: {activeQuestions[quizIdx]?.lvl === Difficulty.EASY ? 'EASY' : activeQuestions[quizIdx]?.lvl === Difficulty.MEDIUM ? 'INTERMEDIATE' : 'ADVANCED'}</div>
                          <h3 className="text-xl md:text-3xl font-black leading-relaxed text-gray-800 dark:text-white relative z-10 pt-4">{activeQuestions[quizIdx]?.q}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {activeQuestions[quizIdx]?.a.map((opt, i) => { 
                          const show = selectedAnswer !== null; 
                          const isCorrect = i === activeQuestions[quizIdx].correct; 
                          const isSelected = selectedAnswer === i; 
                          let btnClass = "group w-full p-5 md:p-6 rounded-[2rem] text-right font-bold text-sm md:text-lg border-[3px] transition-all duration-300 flex items-center justify-between relative overflow-hidden "; 
                          if (!show) { btnClass += "border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-[#6c5ce7]/50 hover:bg-indigo-50/30 active:scale-[0.98] shadow-md"; } 
                          else if (isCorrect) { btnClass += "bg-green-500 border-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-[1.02] z-10 animate-pulse-glow"; } 
                          else if (isSelected) { btnClass += "bg-red-500 border-red-600 text-white shadow-lg"; } 
                          else { btnClass += "opacity-30 border-transparent text-gray-400 dark:text-slate-600 scale-[0.97]"; }
                          return (
                            <button key={i} disabled={show} onClick={() => { setSelectedAnswer(i); if(i === activeQuestions[quizIdx].correct) setQuizStats(prev => ({...prev, correct: prev.correct+1})); else setQuizStats(prev => ({...prev, incorrect: prev.incorrect+1})); }} className={btnClass}><span className="relative z-10 leading-snug flex-1">{opt}</span><div className="relative z-10 flex-shrink-0 mr-4">{show && isCorrect && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />}{show && isSelected && !isCorrect && <XCircle className="w-6 h-6 md:w-8 md:h-8" />}</div></button>
                          ); 
                        })}
                      </div>
                      
                      {selectedAnswer !== null && (
                        <div className="animate-shiny-rise">
                          <div className={`p-6 md:p-8 rounded-[2.5rem] border-r-[10px] shadow-xl relative overflow-hidden ${selectedAnswer === activeQuestions[quizIdx].correct ? 'bg-green-50/90 dark:bg-green-900/10 border-green-500' : 'bg-red-50/90 dark:bg-red-900/10 border-red-500'}`}><div className={`flex items-center gap-3 mb-3 ${selectedAnswer === activeQuestions[quizIdx].correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}><Info className="w-6 h-6" /><h4 className="text-lg md:text-xl font-black uppercase tracking-tight">הסבר מקצועי:</h4></div><p className="text-sm md:text-xl text-gray-800 dark:text-slate-200 leading-relaxed font-bold">{activeQuestions[quizIdx].exp || "המשך לשאלה הבאה בביטחון."}</p></div>
                        </div>
                      )}
                  </div>
                  {/* Fixed Footer for Question Navigation */}
                  <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 flex flex-col items-center z-50">
                      <button onClick={nextQuestion} className={`w-full max-w-3xl bg-[#6c5ce7] hover:bg-[#5a4bcf] text-white py-5 md:py-6 rounded-[2rem] font-black text-lg md:text-2xl shadow-[0_15px_40px_rgba(108,92,231,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 group`}>
                        <span>שאלה הבאה ⬅️</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isHallOfFameOpen && (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center overflow-hidden">
           <video src="https://res.cloudinary.com/djmztsgdk/video/upload/v1770589248/%D7%99%D7%A6%D7%99%D7%A8%D7%AA_%D7%9C%D7%95%D7%92%D7%95_%D7%90%D7%A0%D7%99%D7%9E%D7%A6%D7%99%D7%94_%D7%9C%D7%93%D7%9E%D7%95%D7%AA_wnrjdh.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm scale-110" />
           <div className="relative z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl w-full max-w-2xl md:rounded-[3rem] h-full md:h-[85vh] shadow-[0_0_100px_rgba(108,92,231,0.4)] border-x md:border-4 border-[#6c5ce7]/30 flex flex-col text-right overflow-hidden animate-shiny-rise pt-24 md:pt-0">
              <div className="p-6 md:p-8 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent"><button onClick={() => setIsHallOfFameOpen(false)} className="w-12 h-12 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all shadow-xl hover:scale-110 active:scale-90"><X className="w-6 h-6" /></button><div className="text-right"><h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-yellow-600 flex items-center gap-3 justify-end drop-shadow-2xl"><Trophy className="w-10 h-10 text-yellow-500 animate-bounce" /><span>היכל התהילה</span></h2><p className="text-lg md:text-xl text-cyan-400 font-black tracking-widest mt-1 uppercase">{currentHallOfFameSubject}</p></div></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4">
                {loadingHallOfFame ? (<div className="space-y-4">{[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className="h-24 bg-slate-700/30 rounded-[2rem] animate-pulse flex items-center justify-between px-8"><div className="w-14 h-14 bg-slate-600/40 rounded-full" /><div className="flex-1 mr-6 h-8 bg-slate-600/40 rounded-full" /><div className="w-20 h-10 bg-slate-600/40 rounded-full" /></div>))}</div>) : hallOfFameData.length > 0 ? (<div className="space-y-4 animate-in fade-in duration-700">{hallOfFameData.map((s, i) => { const isCurrentUser = s.name === loginName; let rankStyle = "bg-white/5 border-white/10 hover:bg-white/10"; let medalIcon = <span className="text-slate-400 font-black text-xl">#{i + 1}</span>; let glowClass = ""; if (i === 0) { rankStyle = "bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]"; medalIcon = <span className="text-4xl">🥇</span>; } else if (i === 1) { rankStyle = "bg-slate-200/10 border-slate-300/50"; medalIcon = <span className="text-4xl">🥈</span>; } else if (i === 2) { rankStyle = "bg-orange-400/10 border-orange-400/50"; medalIcon = <span className="text-4xl">🥉</span>; } if (isCurrentUser) { glowClass = "ring-4 ring-blue-500 ring-opacity-60 shadow-[0_0_40px_rgba(59,130,246,0.7)] !bg-blue-600/20 !border-blue-400"; } return (<div key={i} className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between shadow-xl transform transition-all hover:scale-[1.03] active:scale-95 group ${rankStyle} ${glowClass}`}><div className="flex items-center gap-4 md:gap-6"><div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center shadow-inner ring-2 ring-white/5 group-hover:rotate-12 transition-transform">{medalIcon}</div><div className="text-right"><div className={`font-black text-xl md:text-3xl leading-none ${isCurrentUser ? 'text-blue-400 drop-shadow-[0_0_100px_rgba(59,130,246,0.5)]' : 'text-white'}`}>{s.name} {isCurrentUser && <span className="text-sm font-bold text-blue-300 mr-2">(זה אתה!)</span>}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Student Performance Rank</div></div></div><div className={`text-3xl md:text-6xl font-black tabular-nums transition-colors ${i === 0 ? 'text-yellow-400' : isCurrentUser ? 'text-blue-400' : 'text-cyan-400'}`}><AnimatedScore target={s.points} /></div></div>); })}</div>) : (<div className="flex flex-col items-center justify-center py-20 text-center space-y-6"><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse"><History className="w-12 h-12 text-slate-600" /></div><p className="text-2xl text-slate-400 font-black tracking-widest italic max-sm:text-xl">עדיין אין מצטיינים במקצוע זה, בואו להיות הראשונים!</p></div>)}
              </div>
              <div className="p-8 bg-gradient-to-t from-black/60 to-transparent mt-auto"><button onClick={() => setIsHallOfFameOpen(false)} className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_15px_30px_rgba(108,92,231,0.4)] transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"><RefreshCcw className="w-8 h-8" /><span>חזרה</span></button></div>
           </div>
        </div>
      )}

      {isInfoModalOpen && selectedExam && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative border-4 border-[#00b894] overflow-y-auto max-h-[90vh] text-right transition-all">
            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-6 left-6 text-3xl opacity-30 hover:opacity-100 transition-all dark:text-slate-100">✕</button>
            
            <div className="mb-6 border-b pb-4">
              <h2 className="text-3xl font-black text-[#00b894]">{selectedExam.subject}</h2>
            </div>
            
            {selectedExam.adminNote && selectedExam.adminNote.length > 5 && (
              <div className="p-8 bg-green-50/50 dark:bg-green-900/10 border-r-8 border-[#00b894] rounded-2xl mb-8 shadow-inner">
                <span className="block font-black mb-4 text-[#00b894] text-2xl">📚 דגשים:</span>
                <div className="whitespace-pre-line text-lg leading-relaxed text-gray-800 dark:text-slate-200 font-medium">
                    {(() => {
                        const cleanName = cleanSubjectName(selectedExam.subject);
                        if (cleanName === "מבוא למשפט עברי") {
                          return ""; 
                        }
                        return selectedExam.adminNote;
                    })()}
                </div>
              </div>
            )}

            {(() => {
              const match = apiMaterials.find(m => cleanSubjectName(m.name) === cleanSubjectName(selectedExam.subject));
              if (match && match.filesList && match.filesList.length > 0) {
                return (
                  <div className="mb-10">
                    <span className="block font-black mb-4 text-[#2563eb] text-2xl flex items-center gap-2">
                      <FileBox className="w-6 h-6" /> חומרים להורדה ({match.filesList.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-4">
                      {match.filesList.map((file, idx) => {
                        const isNew = file.dateCreated && (Date.now() - new Date(file.dateCreated).getTime()) < 24 * 60 * 60 * 1000;
                        
                        return (
                          <a 
                            key={idx} 
                            href={file.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-full relative bg-blue-600 dark:bg-blue-700 border-2 border-blue-400 dark:border-blue-500 text-white p-5 rounded-2xl font-black text-center shadow-lg transition-all flex items-center justify-between group active:scale-[0.98] hover:shadow-2xl hover:bg-blue-700 ${isNew ? 'animate-blue-gentle' : ''}`}
                          >
                            <span className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 rounded-lg shadow-sm group-hover:animate-bounce">
                                  <Download className="w-5 h-5" />
                              </div>
                              {file.name}
                            </span>
                            <div className="flex items-center gap-4">
                               {isNew && (
                                 <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-blink-red">חדש!</span>
                               )}
                               <ExternalLink className="w-4 h-4 opacity-50" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="mt-auto flex flex-col gap-4">
              {selectedExam.id === 2 && (
                <>
                  <a href="https://1drv.ms/p/c/1122f8b51af83346/IQAYa7h8BdDERaPoOE9gbHxAAVfxReRnZmz6fN-tqM12of8?e=awivpN" target="_blank" className="w-full bg-gradient-to-r from-blue-400 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl"><Presentation className="w-6 h-6" /><span>איסוף מצגות מקורי 📁</span></a>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQBMIZaV3YkiQJCkvHflYrYvAY0fhSLVvbHRIF3p58YC1Z8?e=uLQjHo" target="_blank" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl"><FileText className="w-6 h-6" /><span>סיכום הגדרות ממוקד</span></a>
                  <button onClick={() => { setIsInfoModalOpen(false); startQuiz("עבריינות והערכת מסוכנות"); }} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-orange-500/20"><span>תרגול למבחן 🎯</span></button>
                </>
              )}
              
              {selectedExam.id === 3 && (
                <>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQAk6cUNVLAMTIHfVuu2frQcAeXJZOF4NKx2PEfm6Tavfx8?e=3nhVx4" target="_blank" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-purple-500/20"><FileText className="w-6 h-6" /><span>סיכום סופי 📄</span></a>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQAerq4iwxYdSa4DItVqaD_yAXozXa1bpl21VannYwa_g9w?e=hVdRZG" target="_blank" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-blue-500/20"><FileText className="w-6 h-6" /><span>סיכום הגדרות 📑</span></a>
                  <button onClick={() => { setIsInfoModalOpen(false); startQuiz("משטרה וחברה"); }} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-orange-500/20"><span>תרגול למבחן 🎯</span></button>
                  <button onClick={() => setShowZoomLinkBox(!showZoomLinkBox)} className="w-full bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-blue-500/30"><Video className="w-6 h-6" /><span>זום חזרה למבחן 🎥</span></button>
                  {showZoomLinkBox && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-indigo-200 dark:border-slate-700 mt-2 space-y-4 animate-in zoom-in duration-300">
                      <div className="text-right text-sm font-bold text-gray-500 mb-1">קישור להקלטה:</div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-xs font-mono break-all text-[#6c5ce7] dark:text-indigo-300 border border-indigo-100 dark:border-slate-700">{policeZoomLink}</div>
                      <div className="flex gap-3">
                        <button onClick={() => handleCopyValue(policeZoomLink)} className="flex-1 bg-white dark:bg-slate-700 border-2 border-indigo-200 dark:border-slate-600 py-3 rounded-xl font-black text-gray-700 dark:text-white flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm">
                          <Copy className="w-4 h-4" /><span>{copyFeedback || 'העתק לינק'}</span>
                        </button>
                        <button onClick={() => window.open(policeZoomLink, '_blank')} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                          <ExternalLink className="w-4 h-4" /><span>העבר לאתר</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button onClick={() => setIsInfoModalOpen(false)} className="w-full bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 py-4 rounded-[2rem] font-black text-center border-2 border-slate-200 dark:border-slate-700 transition-all shadow-sm active:scale-95 text-lg">חזרה</button>
            </div>
          </div>
        </div>
      )}

      {isGuideModalOpen && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-2xl flex items-center justify-center p-2 md:p-6" dir="rtl">
          <div className="bg-slate-50 dark:bg-[#0f172a] w-full max-5xl rounded-[3rem] shadow-[0_0_120px_rgba(108,92,231,0.5)] relative border-t-[14px] border-[#6c5ce7] flex flex-col h-full md:h-[92vh] overflow-hidden animate-[pop-in_0.4s_ease-out]">
            <div className="p-6 md:p-10 bg-white dark:bg-slate-900 flex items-center justify-between border-b dark:border-slate-800 shrink-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-[#6c5ce7] to-purple-500 animate-shimmer"></div>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#6c5ce7] to-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 animate-soft-pulse">
                  <Compass className="w-9 h-9 text-white" />
                </div>
                <div className="text-right">
                  <h2 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tighter uppercase italic">Control Center</h2>
                  <p className="text-sm font-black text-[#6c5ce7] dark:text-indigo-400 tracking-[0.3em] mt-1 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> USER MANUAL V13.4
                  </p>
                </div>
              </div>
              <button onClick={() => setIsGuideModalOpen(false)} className="w-14 h-14 bg-gray-100 dark:bg-slate-800 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center text-gray-400 transition-all active:scale-90 shadow-inner group">
                <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 space-y-16 hi-tech-grid">
              
              {/* Introduction Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                    <Rocket className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">ברוכים הבאים למרכז ניהול המטלות</h3>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-700">
                  <p className="text-lg md:text-xl text-gray-600 dark:text-slate-300 leading-relaxed font-bold">
                    מערכת זו פותחה עבורכם, הסטודנטים לקרימינולוגיה, במטרה לרכז את כל חומרי הלימוד, המטלות והמבחנים תחת קורת גג אחת חכמה, מהירה ונגישה מכל מכשיר.
                  </p>
                </div>
              </section>

              {/* Dashboard & Progress Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl border border-cyan-200 dark:border-cyan-800">
                    <Layout className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">לוח בקרה חכם (Dashboard)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 group hover:border-cyan-500 transition-all">
                    <div className="flex items-center gap-4 mb-5">
                      <Target className="w-8 h-8 text-red-500" />
                      <h4 className="font-black text-xl text-gray-800 dark:text-white">זיהוי יעד דחוף</h4>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                      המערכת סורקת את כל המשימות ומציגה את ה-"Target" הבא שלכם בראש המסך. 
                      <br/><span className="text-red-500 font-black">שימו לב:</span> אם נותרו פחות מ-5 ימים, שם המקצוע יהבהב באדום בוהק להגברת הערנות.
                    </p>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-700 group hover:border-cyan-500 transition-all">
                    <div className="flex items-center gap-4 mb-5">
                      <Zap className="w-8 h-8 text-yellow-400 animate-pulse" />
                      <h4 className="font-black text-xl text-gray-800 dark:text-white">אחוז ביצוע חשמלי</h4>
                    </div>
                    <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed">
                      מד ההתקדמות אינו סטטי. ככל שתסמנו משימות כ-"בוצע", אחוז הביצוע יעלה וכרטיסיית הסטטיסטיקה תציג אפקט ברקים דינמי המסמל את "עוצמת הלמידה" שלכם.
                    </p>
                  </div>
                </div>
              </section>

              {/* Task Management Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                    <FileBox className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">ניהול משימות וקורסים</h3>
                </div>
                <div className="space-y-8">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600"><Phone className="w-6 h-6" /></div>
                        <h4 className="font-black text-lg text-gray-800 dark:text-white">תקשורת מהירה</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">לחיצה על הטלפון או המייל פותחת חיוג ישיר או כתיבת הודעה למרצה ללא צורך בהעתקה ידנית.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600"><Calendar className="w-6 h-6" /></div>
                        <h4 className="font-black text-lg text-gray-800 dark:text-white">סנכרון ליומן</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">כפתור ה-Calendar מייצר אוטומטית אירוע ביומן ה-Google שלכם עם כל פרטי המשימה והקישורים הרלוונטיים.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600"><Sparkles className="w-6 h-6" /></div>
                        <h4 className="font-black text-lg text-gray-800 dark:text-white">חומרים ודגשים</h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">לחיצה על "חומרים ודגשים" תפתח עולם של סיכומי הגדרות, מצגות מאוגדות, הקלטות זום וקבצי PDF בלעדיים.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Exam Simulator Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl border border-orange-200 dark:border-orange-800">
                    <BrainCircuit className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">סימולטור המבחנים (The Simulator)</h3>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-red-600/10 p-10 rounded-[3rem] border-2 border-orange-300/30 shadow-2xl relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-400/10 blur-3xl rounded-full"></div>
                  <div className="flex flex-col md:flex-row gap-10 relative z-10">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-orange-500 rounded-lg text-white shadow-lg shadow-orange-500/30"><Shuffle className="w-6 h-6" /></div>
                        <h4 className="font-black text-2xl text-gray-800 dark:text-white">תרגול אינסופי</h4>
                      </div>
                      <p className="text-gray-700 dark:text-slate-200 font-medium leading-loose">
                        הסימולטור מציג שאלות בסדר אקראי (Shuffle). לכל שאלה מוצמד <b>הסבר מקצועי</b> המופיע מיד לאחר המענה, כדי שתוכלו ללמוד מהטעויות בזמן אמת. הממשק מעוצב כ-"Forward-only" כדי לדמות תנאי בחינה אמיתיים.
                      </p>
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-yellow-500 rounded-lg text-white shadow-lg shadow-yellow-500/30"><Trophy className="w-6 h-6" /></div>
                        <h4 className="font-black text-2xl text-gray-800 dark:text-white">היכל התהילה</h4>
                      </div>
                      <p className="text-gray-700 dark:text-slate-200 font-medium leading-loose">
                        בסיום התרגול, הציון שלכם נשמר במערכת הענן. 10 הסטודנטים המובילים יזכו להופיע בטבלת ה-Elite של הקורס. זכייה באחד משלושת המקומות הראשונים תפעיל <b>חגיגת "Crown"</b> מיוחדת על המסך שלכם!
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Advanced Features Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-slate-200 dark:bg-slate-700 rounded-2xl border border-slate-300 dark:border-slate-600">
                    <Wrench className="w-7 h-7 text-slate-700 dark:text-slate-200" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white">תכונות מתקדמות ומצב עבודה</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Focus Card */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-indigo-500/50 transition-all group">
                    <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-4 group-hover:scale-110 transition-transform">
                      <Target className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-xl text-gray-800 dark:text-white mb-2">מצב מיקוד (Focus Mode)</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                      טיימר פומודורו מובנה של 25 דקות. הפעלתו תחסום את כל המערכת ותשאיר רק טיימר ענק, כדי להכניס אתכם ל-"Zone" של למידה ללא הפרעות.
                    </p>
                  </div>
                  {/* Dark Mode Card */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-yellow-500/50 transition-all group">
                    <div className="w-14 h-14 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                      <Moon className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-xl text-gray-800 dark:text-white mb-2">מצב לילה (Dark View)</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                      ממשק כהה ויוקרתי השומר על העיניים שלכם בלילות שלפני בחינות. המעבר מתבצע בלחיצת כפתור אחת בתחתית המסך.
                    </p>
                  </div>
                  {/* PWA Card */}
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-lg border-2 border-transparent hover:border-green-500/50 transition-all group">
                    <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                      <SmartphoneNfc className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-xl text-gray-800 dark:text-white mb-2">התקנה כאפליקציה</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">
                      המערכת תומכת ב-PWA. לחצו על אייקון ה-"אפליקציה" בתחתית כדי להוסיף את האתר למסך הבית שלכם ולהשתמש בו כאפליקציה טבעית (Native App).
                    </p>
                  </div>
                </div>
              </section>

              {/* Troubleshooting/Security Section */}
              <section className="relative animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms' }}>
                <div className="bg-slate-800 dark:bg-black/40 p-8 rounded-[2.5rem] border-2 border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-8">
                  <div className="w-20 h-20 bg-slate-700 rounded-3xl flex items-center justify-center text-cyan-400 shadow-inner">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center md:text-right">
                    <h4 className="font-black text-2xl text-white mb-2">אבטחה ופרטיות</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      כל הפעולות שלכם במערכת (כניסות, ציוני סימולטור, עדכונים) מתועדות ב-Live לצורך שיפור חוויית המשתמש ומניעת כניסות לא מורשות. המערכת מזהה אוטומטית כניסה ממחשב או טלפון ומבצעת התאמות תצוגה בהתאם.
                    </p>
                  </div>
                </div>
              </section>

            </div>
            
            {/* Footer of the Modal */}
            <div className="p-8 bg-white dark:bg-slate-900 border-t dark:border-slate-800 shrink-0 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mb-1">Lead Developer</p>
                <p className="text-sm font-bold text-gray-600 dark:text-slate-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#6c5ce7]" /> 2026 צחי אלבז - פיתוח מערכות למידה
                </p>
              </div>
              <button 
                onClick={() => setIsGuideModalOpen(false)} 
                className="w-full md:w-auto bg-gradient-to-r from-cyan-600 via-[#6c5ce7] to-indigo-600 text-white px-16 py-6 rounded-[2rem] font-black text-2xl shadow-[0_20px_40px_rgba(108,92,231,0.3)] transition-all active:scale-95 hover:scale-[1.02] flex items-center justify-center gap-4 group"
              >
                <span>יאללה, למשימות!</span>
                <Rocket className="w-8 h-8 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isDelinquencyQuizOpen && (
          <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0 md:p-6 overflow-hidden pt-[80px] md:pt-6">
              <div className="bg-white dark:bg-[#0f172a] w-full max-w-4xl md:rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.6)] relative border-t-[12px] border-[#6c5ce7] flex flex-col h-full md:h-[92vh] overflow-hidden animate-[pop-in_0.5s_ease-out]">
                  <div className="bg-white dark:bg-[#0f172a] z-[50] border-b border-gray-100 dark:border-slate-800 shadow-lg relative">
                      <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#6c5ce7] via-[#a29bfe] to-[#00b894] transition-all duration-700 ease-out shadow-[0_0_15px_rgba(108,92,231,0.5)]" style={{ width: `${((quizIdx + 1) / (activeQuestions.length || 1)) * 100}%` }} />
                      </div>
                      <div className="p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex gap-2 w-full md:w-auto">
                              <button onClick={shufflePractice} className="flex-1 md:flex-none bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md"><Shuffle className="w-4 h-4" /><span className="inline">ערבב</span></button>
                              <button onClick={finishQuiz} disabled={isSubmittingScore} className={`flex-1 md:flex-none bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${isSubmittingScore ? 'opacity-70 animate-pulse' : ''}`}>{isSubmittingScore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span>סיים ושמור</span></button>
                          </div>
                          <div className="text-right w-full md:w-auto flex items-center gap-4 justify-between md:justify-end">
                              <div className="flex items-center gap-2">
                                  <div className="flex flex-col items-center bg-green-50 dark:bg-green-900/20 px-4 py-1.5 rounded-xl border border-green-200 dark:border-green-800"><span className="text-xs text-green-700 dark:text-green-400 font-black">נכון: {quizStats.correct}</span></div>
                                  <div className="flex flex-col items-center bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-xl border border-red-200 dark:border-red-800"><span className="text-xs text-red-700 dark:text-red-400 font-black">טעות: {quizStats.incorrect}</span></div>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2"><h2 className="text-xs md:text-xl font-black text-gray-800 dark:text-white">שאלה {quizIdx + 1}/{activeQuestions.length}</h2><BrainCircuit className="w-5 h-5 text-indigo-500 animate-soft-pulse" /></div>
                          </div>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-10 text-right space-y-8 bg-slate-50/30 dark:bg-transparent pb-32">
                      <div className="bg-white/80 dark:bg-slate-800/80 p-6 md:p-10 rounded-[2.5rem] border-2 border-indigo-100/50 dark:border-slate-700 shadow-xl relative overflow-hidden group backdrop-blur-sm">
                          <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-black">LEVEL: {activeQuestions[quizIdx]?.lvl === Difficulty.EASY ? 'EASY' : activeQuestions[quizIdx]?.lvl === Difficulty.MEDIUM ? 'INTERMEDIATE' : 'ADVANCED'}</div>
                          <h3 className="text-xl md:text-3xl font-black leading-relaxed text-gray-800 dark:text-white relative z-10 pt-4">{activeQuestions[quizIdx]?.q}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                        {activeQuestions[quizIdx]?.a.map((opt, i) => { 
                          const show = selectedAnswer !== null; 
                          const isCorrect = i === activeQuestions[quizIdx].correct; 
                          const isSelected = selectedAnswer === i; 
                          let btnClass = "group w-full p-5 md:p-6 rounded-[2rem] text-right font-bold text-sm md:text-lg border-[3px] transition-all duration-300 flex items-center justify-between relative overflow-hidden "; 
                          if (!show) { btnClass += "border-transparent bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 hover:border-[#6c5ce7]/50 hover:bg-indigo-50/30 active:scale-[0.98] shadow-md"; } 
                          else if (isCorrect) { btnClass += "bg-green-500 border-green-600 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-[1.02] z-10 animate-pulse-glow"; } 
                          else if (isSelected) { btnClass += "bg-red-500 border-red-600 text-white shadow-lg"; } 
                          else { btnClass += "opacity-30 border-transparent text-gray-400 dark:text-slate-600 scale-[0.97]"; }
                          return (
                            <button key={i} disabled={show} onClick={() => { setSelectedAnswer(i); if(i === activeQuestions[quizIdx].correct) setQuizStats(prev => ({...prev, correct: prev.correct+1})); else setQuizStats(prev => ({...prev, incorrect: prev.incorrect+1})); }} className={btnClass}><span className="relative z-10 leading-snug flex-1">{opt}</span><div className="relative z-10 flex-shrink-0 mr-4">{show && isCorrect && <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" />}{show && isSelected && !isCorrect && <XCircle className="w-6 h-6 md:w-8 md:h-8" />}</div></button>
                          ); 
                        })}
                      </div>
                      
                      {selectedAnswer !== null && (
                        <div className="animate-shiny-rise">
                          <div className={`p-6 md:p-8 rounded-[2.5rem] border-r-[10px] shadow-xl relative overflow-hidden ${selectedAnswer === activeQuestions[quizIdx].correct ? 'bg-green-50/90 dark:bg-green-900/10 border-green-500' : 'bg-red-50/90 dark:bg-red-900/10 border-red-500'}`}><div className={`flex items-center gap-3 mb-3 ${selectedAnswer === activeQuestions[quizIdx].correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}><Info className="w-6 h-6" /><h4 className="text-lg md:text-xl font-black uppercase tracking-tight">הסבר מקצועי:</h4></div><p className="text-sm md:text-xl text-gray-800 dark:text-slate-200 leading-relaxed font-bold">{activeQuestions[quizIdx].exp || "המשך לשאלה הבאה בביטחון."}</p></div>
                        </div>
                      )}
                  </div>
                  {/* Fixed Footer for Question Navigation */}
                  <div className="absolute bottom-0 left-0 w-full p-4 md:p-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 flex flex-col items-center z-50">
                      <button onClick={nextQuestion} className={`w-full max-w-3xl bg-[#6c5ce7] hover:bg-[#5a4bcf] text-white py-5 md:py-6 rounded-[2rem] font-black text-lg md:text-2xl shadow-[0_15px_40px_rgba(108,92,231,0.3)] hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 group`}>
                        <span>שאלה הבאה ⬅️</span>
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isHallOfFameOpen && (
        <div className="fixed inset-0 z-[300] bg-black flex items-center justify-center overflow-hidden">
           <video src="https://res.cloudinary.com/djmztsgdk/video/upload/v1770589248/%D7%99%D7%A6%D7%99%D7%A8%D7%AA_%D7%9C%D7%95%D7%92%D7%95_%D7%90%D7%A0%D7%99%D7%9E%D7%A6%D7%99%D7%94_%D7%9C%D7%93%D7%9E%D7%95%D7%AA_wnrjdh.mp4" autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm scale-110" />
           <div className="relative z-10 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl w-full max-w-2xl md:rounded-[3rem] h-full md:h-[85vh] shadow-[0_0_100px_rgba(108,92,231,0.4)] border-x md:border-4 border-[#6c5ce7]/30 flex flex-col text-right overflow-hidden animate-shiny-rise pt-24 md:pt-0">
              <div className="p-6 md:p-8 flex justify-between items-center bg-gradient-to-b from-black/40 to-transparent"><button onClick={() => setIsHallOfFameOpen(false)} className="w-12 h-12 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-all shadow-xl hover:scale-110 active:scale-90"><X className="w-6 h-6" /></button><div className="text-right"><h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-white to-yellow-600 flex items-center gap-3 justify-end drop-shadow-2xl"><Trophy className="w-10 h-10 text-yellow-500 animate-bounce" /><span>היכל התהילה</span></h2><p className="text-lg md:text-xl text-cyan-400 font-black tracking-widest mt-1 uppercase">{currentHallOfFameSubject}</p></div></div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 space-y-4">
                {loadingHallOfFame ? (<div className="space-y-4">{[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className="h-24 bg-slate-700/30 rounded-[2rem] animate-pulse flex items-center justify-between px-8"><div className="w-14 h-14 bg-slate-600/40 rounded-full" /><div className="flex-1 mr-6 h-8 bg-slate-600/40 rounded-full" /><div className="w-20 h-10 bg-slate-600/40 rounded-full" /></div>))}</div>) : hallOfFameData.length > 0 ? (<div className="space-y-4 animate-in fade-in duration-700">{hallOfFameData.map((s, i) => { const isCurrentUser = s.name === loginName; let rankStyle = "bg-white/5 border-white/10 hover:bg-white/10"; let medalIcon = <span className="text-slate-400 font-black text-xl">#{i + 1}</span>; let glowClass = ""; if (i === 0) { rankStyle = "bg-yellow-400/10 border-yellow-400/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]"; medalIcon = <span className="text-4xl">🥇</span>; } else if (i === 1) { rankStyle = "bg-slate-200/10 border-slate-300/50"; medalIcon = <span className="text-4xl">🥈</span>; } else if (i === 2) { rankStyle = "bg-orange-400/10 border-orange-400/50"; medalIcon = <span className="text-4xl">🥉</span>; } if (isCurrentUser) { glowClass = "ring-4 ring-blue-500 ring-opacity-60 shadow-[0_0_40px_rgba(59,130,246,0.7)] !bg-blue-600/20 !border-blue-400"; } return (<div key={i} className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between shadow-xl transform transition-all hover:scale-[1.03] active:scale-95 group ${rankStyle} ${glowClass}`}><div className="flex items-center gap-4 md:gap-6"><div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center shadow-inner ring-2 ring-white/5 group-hover:rotate-12 transition-transform">{medalIcon}</div><div className="text-right"><div className={`font-black text-xl md:text-3xl leading-none ${isCurrentUser ? 'text-blue-400 drop-shadow-[0_0_100px_rgba(59,130,246,0.5)]' : 'text-white'}`}>{s.name} {isCurrentUser && <span className="text-sm font-bold text-blue-300 mr-2">(זה אתה!)</span>}</div><div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Student Performance Rank</div></div></div><div className={`text-3xl md:text-6xl font-black tabular-nums transition-colors ${i === 0 ? 'text-yellow-400' : isCurrentUser ? 'text-blue-400' : 'text-cyan-400'}`}><AnimatedScore target={s.points} /></div></div>); })}</div>) : (<div className="flex flex-col items-center justify-center py-20 text-center space-y-6"><div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center animate-pulse"><History className="w-12 h-12 text-slate-600" /></div><p className="text-2xl text-slate-400 font-black tracking-widest italic max-sm:text-xl">עדיין אין מצטיינים במקצוע זה, בואו להיות הראשונים!</p></div>)}
              </div>
              <div className="p-8 bg-gradient-to-t from-black/60 to-transparent mt-auto"><button onClick={() => setIsHallOfFameOpen(false)} className="w-full bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-[0_15px_30px_rgba(108,92,231,0.4)] transition-all hover:scale-102 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"><RefreshCcw className="w-8 h-8" /><span>חזרה</span></button></div>
           </div>
        </div>
      )}

      {isInfoModalOpen && selectedExam && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative border-4 border-[#00b894] overflow-y-auto max-h-[90vh] text-right transition-all">
            <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-6 left-6 text-3xl opacity-30 hover:opacity-100 transition-all dark:text-slate-100">✕</button>
            
            <div className="mb-6 border-b pb-4">
              <h2 className="text-3xl font-black text-[#00b894]">{selectedExam.subject}</h2>
            </div>
            
            {selectedExam.adminNote && selectedExam.adminNote.length > 5 && (
              <div className="p-8 bg-green-50/50 dark:bg-green-900/10 border-r-8 border-[#00b894] rounded-2xl mb-8 shadow-inner">
                <span className="block font-black mb-4 text-[#00b894] text-2xl">📚 דגשים:</span>
                <div className="whitespace-pre-line text-lg leading-relaxed text-gray-800 dark:text-slate-200 font-medium">
                    {(() => {
                        const cleanName = cleanSubjectName(selectedExam.subject);
                        if (cleanName === "מבוא למשפט עברי") {
                          return ""; 
                        }
                        return selectedExam.adminNote;
                    })()}
                </div>
              </div>
            )}

            {(() => {
              const match = apiMaterials.find(m => cleanSubjectName(m.name) === cleanSubjectName(selectedExam.subject));
              if (match && match.filesList && match.filesList.length > 0) {
                return (
                  <div className="mb-10">
                    <span className="block font-black mb-4 text-[#2563eb] text-2xl flex items-center gap-2">
                      <FileBox className="w-6 h-6" /> חומרים להורדה ({match.filesList.length}):
                    </span>
                    <div className="grid grid-cols-1 gap-4">
                      {match.filesList.map((file, idx) => {
                        const isNew = file.dateCreated && (Date.now() - new Date(file.dateCreated).getTime()) < 24 * 60 * 60 * 1000;
                        
                        return (
                          <a 
                            key={idx} 
                            href={file.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-full relative bg-blue-600 dark:bg-blue-700 border-2 border-blue-400 dark:border-blue-500 text-white p-5 rounded-2xl font-black text-center shadow-lg transition-all flex items-center justify-between group active:scale-[0.98] hover:shadow-2xl hover:bg-blue-700 ${isNew ? 'animate-blue-gentle' : ''}`}
                          >
                            <span className="flex items-center gap-3">
                              <div className="p-2 bg-white/20 rounded-lg shadow-sm group-hover:animate-bounce">
                                  <Download className="w-5 h-5" />
                              </div>
                              {file.name}
                            </span>
                            <div className="flex items-center gap-4">
                               {isNew && (
                                 <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.6)] animate-blink-red">חדש!</span>
                               )}
                               <ExternalLink className="w-4 h-4 opacity-50" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="mt-auto flex flex-col gap-4">
              {selectedExam.id === 2 && (
                <>
                  <a href="https://1drv.ms/p/c/1122f8b51af83346/IQAYa7h8BdDERaPoOE9gbHxAAVfxReRnZmz6fN-tqM12of8?e=awivpN" target="_blank" className="w-full bg-gradient-to-r from-blue-400 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl"><Presentation className="w-6 h-6" /><span>איסוף מצגות מקורי 📁</span></a>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQBMIZaV3YkiQJCkvHflYrYvAY0fhSLVvbHRIF3p58YC1Z8?e=uLQjHo" target="_blank" className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl"><FileText className="w-6 h-6" /><span>סיכום הגדרות ממוקד</span></a>
                  <button onClick={() => { setIsInfoModalOpen(false); startQuiz("עבריינות והערכת מסוכנות"); }} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-orange-500/20"><span>תרגול למבחן 🎯</span></button>
                </>
              )}
              
              {selectedExam.id === 3 && (
                <>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQAk6cUNVLAMTIHfVuu2frQcAeXJZOF4NKx2PEfm6Tavfx8?e=3nhVx4" target="_blank" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-purple-500/20"><FileText className="w-6 h-6" /><span>סיכום סופי 📄</span></a>
                  <a href="https://1drv.ms/w/c/1122f8b51af83346/IQAerq4iwxYdSa4DItVqaD_yAXozXa1bpl21VannYwa_g9w?e=hVdRZG" target="_blank" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-blue-500/20"><FileText className="w-6 h-6" /><span>סיכום הגדרות 📑</span></a>
                  <button onClick={() => { setIsInfoModalOpen(false); startQuiz("משטרה וחברה"); }} className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-orange-500/20"><span>תרגול למבחן 🎯</span></button>
                  <button onClick={() => setShowZoomLinkBox(!showZoomLinkBox)} className="w-full bg-gradient-to-r from-blue-500 to-indigo-700 text-white py-5 rounded-[2rem] font-black text-center shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2 text-xl shadow-blue-500/30"><Video className="w-6 h-6" /><span>זום חזרה למבחן 🎥</span></button>
                  {showZoomLinkBox && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-[2rem] border-2 border-indigo-200 dark:border-slate-700 mt-2 space-y-4 animate-in zoom-in duration-300">
                      <div className="text-right text-sm font-bold text-gray-500 mb-1">קישור להקלטה:</div>
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl text-xs font-mono break-all text-[#6c5ce7] dark:text-indigo-300 border border-indigo-100 dark:border-slate-700">{policeZoomLink}</div>
                      <div className="flex gap-3">
                        <button onClick={() => handleCopyValue(policeZoomLink)} className="flex-1 bg-white dark:bg-slate-700 border-2 border-indigo-200 dark:border-slate-600 py-3 rounded-xl font-black text-gray-700 dark:text-white flex items-center justify-center gap-2 hover:bg-indigo-50 transition-all shadow-sm">
                          <Copy className="w-4 h-4" /><span>{copyFeedback || 'העתק לינק'}</span>
                        </button>
                        <button onClick={() => window.open(policeZoomLink, '_blank')} className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                          <ExternalLink className="w-4 h-4" /><span>העבר לאתר</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button onClick={() => setIsInfoModalOpen(false)} className="w-full bg-slate-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 py-4 rounded-[2rem] font-black text-center border-2 border-slate-200 dark:border-slate-700 transition-all shadow-sm active:scale-95 text-lg">חזרה</button>
            </div>
          </div>
        </div>
      )}

      {isAdminPanelOpen && loginName === 'צחיי' && (
        <div className="fixed inset-0 z-[400] bg-black/40 backdrop-blur-sm flex items-start justify-center p-2 md:p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-xl rounded-[2.5rem] p-5 md:p-6 shadow-2xl relative border-4 border-[#6c5ce7] animate-[pop-in_0.4s_ease-out] text-right mt-4 md:mt-8 mb-8 max-h-[90vh] flex flex-col overflow-hidden"><button onClick={() => setIsAdminPanelOpen(false)} className="absolute top-4 left-6 text-2xl opacity-40 hover:opacity-100 transition-all dark:text-white z-20">✕</button><div className="flex items-center gap-3 mb-4 border-b border-[#6c5ce7]/20 pb-3"><Settings className="w-5 h-5 text-[#6c5ce7] animate-spin-slow" /><h2 className="text-xl font-black text-[#6c5ce7] dark:text-[#a29bfe]">ניהול מערכת</h2></div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-5 pr-1"><section className="space-y-3"><div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#6c5ce7]" /><h3 className="text-sm font-black text-gray-800 dark:text-white">עדכון מבזקים</h3></div><div className="relative"><textarea value={adminTickerText} onChange={(e) => setAdminTickerText(e.target.value)} placeholder="הזן מבזקים מופרדים ב-(;)" className="w-full h-20 p-3 rounded-xl border-2 border-gray-100 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 font-bold outline-none focus:border-[#6c5ce7] transition-all dark:text-white resize-none text-xs" /></div><button onClick={handleUpdateTicker} disabled={isSavingTicker || isAdminLoadingData} className="w-full bg-[#6c5ce7] text-white py-3 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 transition-all">{isSavingTicker ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}<span>שמור ועדכן</span></button></section><section className="space-y-2"><div className="bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-200 dark:border-slate-700 flex items-center justify-between"><div className="flex items-center gap-2"><Power className={`w-4 h-4 ${maintenanceMode ? 'text-red-500' : 'text-green-500'}`} /><span className="text-xs font-black text-gray-800 dark:text-white">מצב תחזוקה</span></div><button onClick={toggleMaintenanceMode} disabled={isUpdatingStatus} className={`w-10 h-5 rounded-full relative transition-all shadow-inner ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-md ${maintenanceMode ? 'right-0.5' : 'right-5.5'}`} /></button></div><p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold px-1 italic">כאשר הלחצן אדום - האתר במצב תחזוקה וחסום לגישת משתמשים.</p></section><section className="space-y-3"><div className="flex items-center gap-2"><BarChart className="w-4 h-4 text-orange-500" /><h3 className="text-sm font-black text-gray-800 dark:text-white">סטטיסטיקת כניסות יומית (Live)</h3></div><div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 h-[200px] flex items-end justify-between gap-2 relative group overflow-hidden pt-10">{isAdminLoadingData ? (<div className="w-full h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-orange-500 opacity-30" /></div>) : adminGraphData.length > 0 ? (adminGraphData.map((d, i) => { const now = new Date(); const todayLabel = now.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' }); const isToday = d.label.includes(todayLabel); return (<div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end"><div className="relative w-full flex justify-center items-end h-[100px]"><div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-black ${isToday ? 'text-blue-600 scale-110' : 'text-orange-600'} bg-white dark:bg-slate-900 px-2 py-0.5 rounded-lg border shadow-sm z-20 animate-in fade-in zoom-in`}>{d.value}</div><div className={`w-full max-w-[28px] ${isToday ? 'bg-gradient-to-t from-blue-700 via-blue-500 to-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.8)]' : 'bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400'} rounded-t-lg transition-all duration-1000 ease-out h-[${(d.value / maxVisits) * 100}%]`} style={{ height: `${(d.value / Math.max(...adminGraphData.map(v => v.value), 1)) * 100}%` }} /></div><div className={`text-[9px] font-black ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'} uppercase tracking-tighter text-center mt-1`}>{d.label}</div></div>); })) : (<div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic font-bold">ממתין לנתוני גרף...</div>)}</div></section><section className="space-y-2"><div className="flex items-center gap-2"><History className="w-4 h-4 text-indigo-500" /><h3 className="text-sm font-black text-gray-800 dark:text-white">כניסות אחרונות</h3></div><div className="flex flex-wrap gap-2 mb-2 px-1"><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div><span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">טלפון</span></div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div><span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">מחשב</span></div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div><span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">סימולטור</span></div><div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div><span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">ניהול</span></div></div><div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-inner"><div className="max-h-[300px] overflow-y-auto custom-scrollbar"><table className="w-full text-center border-collapse"><thead className="bg-gray-100 dark:bg-slate-700 sticky top-0 z-20"><tr className="text-[10px] font-black text-gray-500 dark:text-slate-100"><th className="py-2 px-1">שם</th><th className="py-2 px-1">פעולה</th><th className="py-2 px-1">תאריך</th><th className="py-2 px-1">שעה</th><th className="py-2 px-1">עיר</th></tr></thead><tbody className="text-[11px]">{isAdminLoadingData ? (<tr><td colSpan={5} className="py-8"><Loader2 className="w-5 h-5 animate-spin mx-auto text-[#6c5ce7]" /></td></tr>) : adminLastEntries.length > 0 ? (adminLastEntries.slice(0, 100).map((user: any, idx: number) => { const action = String(user.userAction || '-'); let badgeColor = 'bg-gray-50 text-gray-600 border-gray-200'; if (action === 'סימולטור') badgeColor = 'bg-yellow-50 text-yellow-600 border-yellow-200'; else if (action === 'טלפון') badgeColor = 'bg-green-50 text-green-600 border-green-200'; else if (action === 'מחשב') badgeColor = 'bg-blue-50 text-blue-600 border-blue-200'; else if (action === 'admin_access') badgeColor = 'bg-purple-50 text-purple-600 border-purple-200'; return (<tr key={idx} className="border-t border-gray-50 dark:border-slate-700 hover:bg-indigo-50/30 transition-colors"><td className="py-2 px-1 font-bold text-gray-800 dark:text-slate-100 truncate max-w-[70px]">{user.userName || '-'}</td><td className="py-2 px-1"><span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black border ${badgeColor}`}>{action}</span></td><td className="py-2 px-1 text-gray-500 tabular-nums">{user.entryDate || '-'}</td><td className="py-2 px-1 tabular-nums text-indigo-600 dark:text-indigo-300 font-bold">{formatOnlyTime(user.entryTime)}</td><td className="py-2 px-1 text-gray-400 truncate max-w-[60px]">{user.userCity || '-'}</td></tr>); })) : (<tr><td colSpan={5} className="py-10 text-gray-400 italic">אין נתונים זמינים</td></tr>)}</tbody></table></div></div></section></div><button onClick={() => setIsAdminPanelOpen(false)} className="mt-4 w-full bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-white py-3 rounded-xl font-black text-sm active:scale-95 transition-all">סגור חלונית</button></div>
        </div>
      )}

      {contactModal.isOpen && (
        <div className="fixed inset-0 z-[500] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[2.5rem] p-8 shadow-2xl relative border-2 border-[#6c5ce7] text-right animate-[pop-in_0.3s_ease-out]"><button onClick={() => setContactModal(p => ({ ...p, isOpen: false }))} className="absolute top-4 left-6 text-xl opacity-40 hover:opacity-100 dark:text-white">✕</button><div className="flex flex-col items-center gap-4 text-center"><div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${contactModal.type === 'phone' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>{contactModal.type === 'phone' ? <Phone className="w-8 h-8" /> : <Mail className="w-8 h-8" />}</div><h3 className="text-xl font-black text-gray-800 dark:text-white">{contactModal.title}</h3><p className="text-lg font-bold text-[#6c5ce7] break-all">{contactModal.value}</p><div className="flex flex-col gap-3 w-full mt-4"><a href={contactModal.type === 'phone' ? `tel:${contactModal.value}` : `mailto:${contactModal.value}`} className={`w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${contactModal.type === 'phone' ? 'bg-green-600 shadow-green-600/20 hover:bg-green-700' : 'bg-blue-600 shadow-blue-600/20 hover:bg-blue-700'}`}>{contactModal.type === 'phone' ? <><Phone className="w-5 h-5" /><span>התקשר עכשיו</span></> : <><Send className="w-5 h-5" /><span>שלח הודעה</span></>}</a><button onClick={() => handleCopyValue(contactModal.value)} className="w-full py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-gray-700 dark:text-white font-black flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all hover:bg-slate-200"><Copy className="w-5 h-5" /><span>{copyFeedback || 'העתק למגש'}</span></button></div></div></div>
        </div>
      )}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
