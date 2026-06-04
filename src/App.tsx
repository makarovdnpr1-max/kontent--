import React, { useState, useEffect } from "react";
import { DigitalTwin, VideoScript, Trend, GroundingSource } from "./types";
import DigitalTwinSettings from "./components/DigitalTwinSettings";
import TrendsPanel from "./components/TrendsPanel";
import VideoWorkspace from "./components/VideoWorkspace";
import VideoPlayer from "./components/VideoPlayer";
import AnalyticsPanel from "./components/AnalyticsPanel";
import CostCalculator from "./components/CostCalculator";
import AutoPostHub from "./components/AutoPostHub";
import LauncherPanel from "./components/LauncherPanel";
import { Bot, TrendingUp, Layers, BarChart3, DollarSign, Sparkles, Radio, Zap } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<'launcher' | 'montage' | 'autopost' | 'twin' | 'analytics' | 'costs'>('launcher');
  
  // Launcher active trackings
  const [launcherFormat, setLauncherFormat] = useState<"text" | "video">("text");
  const [launcherChannel, setLauncherChannel] = useState<string>("zen");
  const [launcherTopic, setLauncherTopic] = useState<string>("GEO оптимизация под СНГ: Как ИИ-поисковики заменяют стандартное SEO");
  
  // 1. Digital Twin state
  const [twin, setTwin] = useState<DigitalTwin>({
    name: "Дмитрий Макаров",
    avatarUrl: "",
    voice: "Zephyr",
    tone: "charismatic",
    specialty: "B2B Маркетинг & AI-лидогенерация",
    agencyName: "b2b-бюро",
    targetAudience: "CEO крупного финтеха, директора по развитию, основатели ИТ-компаний",
    customPrompt: "Говорить уверенно, приводить числовые доводы и кейсы, избегать банальностей вроде 'это круто'"
  });

  // 2. Automated Script state
  const [script, setScript] = useState<VideoScript | null>(null);
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0);
  const [selectedTrendTopic, setSelectedTrendTopic] = useState<string>("");

  // 3. Trends telemetry state
  const [trends, setTrends] = useState<Trend[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<string>("");

  // Auto-fetch some initial marketing trends on mount
  useEffect(() => {
    fetchLatestTrends();
  }, []);

  const fetchLatestTrends = async () => {
    setIsFetchingTrends(true);
    setApiMessage("");
    try {
      const response = await fetch("/api/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: twin.specialty })
      });
      const data = await response.json();
      if (data.trends) {
        setTrends(data.trends);
        if (data.sources) setSources(data.sources);
        if (data.message) setApiMessage(data.message);
      }
    } catch (e) {
      console.error("Failed to fetch marketing trends:", e);
      setApiMessage("Failed to connect to trends engine. Showing offline marketing database.");
    } finally {
      setIsFetchingTrends(false);
    }
  };

  const handleGenerateScript = async (topic: string, tone: string): Promise<VideoScript> => {
    const response = await fetch("/api/generate-script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic,
        tone,
        brandDetails: `Agency name: ${twin.agencyName}, Target: ${twin.targetAudience}, Specialty topic leads: ${twin.specialty}`
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to write AI script on the server.");
    }
    
    const data = await response.json();
    return data.script;
  };

  const handleGenerateSceneImage = async (sceneId: number, prompt: string): Promise<string> => {
    const response = await fetch("/api/generate-visual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error("Failed to render AI visual framework.");
    }
    
    const data = await response.json();
    return data.image; // Returns base64 string
  };

  const handleGenerateSceneVoice = async (sceneId: number, text: string): Promise<string> => {
    const response = await fetch("/api/synthesize-voice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceName: twin.voice })
    });
    
    if (!response.ok) {
      throw new Error("Failed to synthesize digital twin voiceover.");
    }
    
    const data = await response.json();
    return data.audio; // Returns base64 wav data
  };

  const handleManualAvatarGeneration = async (prompt: string): Promise<string> => {
    return handleGenerateSceneImage(0, prompt);
  };

  const handleSelectTrendForScript = (trendTitle: string) => {
    setSelectedTrendTopic(trendTitle);
    setActiveTab('montage');
  };

  const handleLaunchFromLauncher = (format: "text" | "video", channel: string, topic: string) => {
    setLauncherFormat(format);
    setLauncherChannel(channel);
    setLauncherTopic(topic);
    if (format === "text") {
      setActiveTab("autopost");
    } else {
      setSelectedTrendTopic(topic);
      setActiveTab("montage");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-violet-600/35 selection:text-white">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 border-b border-slate-900 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/10">
              <Bot size={20} className="text-white animate-pulse" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight font-sans text-slate-100 flex items-center gap-2">
                B2B Контент-Завод
                <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
                  Live v1.4
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Автоматический монтаж & Цифровой двойник от лица {twin.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">2026 Marketing Automation Hub</span>
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" title="Система автоматического кросс-постинга подключена" />
          </div>
        </div>
      </header>

      {/* Primary Layout Matrix */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* Left Column: Instant 9:16 Media Player Preview (Col-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-bold font-sans text-slate-200 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                Визуализация кадра (9:16)
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">Интерактивный симулятор Shorts / Reels / Stories</p>
            </div>

            <VideoPlayer
              script={script}
              activeSceneIdx={activeSceneIdx}
              setActiveSceneIdx={setActiveSceneIdx}
            />

            <div className="border-t border-slate-800/80 pt-4 mt-5 space-y-1 text-center">
              <p className="text-[10px] uppercase font-mono text-slate-500 font-bold">Синхронизация Звука & Картинки</p>
              <p className="text-[11px] text-slate-400 leading-snug">
                Плеер автоматически озвучивает текущий кадр голосом <span className="text-violet-400 font-bold">{twin.voice}</span> по SRT-сценарию.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Workspaces Tabs & Dashboards (Col-8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Bento navigation tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-slate-950/80 border border-slate-900 rounded-2xl">
            <button
              id="tab-btn-launcher"
              onClick={() => setActiveTab('launcher')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'launcher' ? "bg-slate-900 text-violet-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap size={16} className={activeTab === 'launcher' ? "animate-bounce" : ""} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Старт 🚀</span>
            </button>

            <button
              id="tab-btn-montage"
              onClick={() => setActiveTab('montage')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'montage' ? "bg-slate-900 text-violet-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers size={16} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Сценарии</span>
            </button>

            <button
              id="tab-btn-autopost"
              onClick={() => setActiveTab('autopost')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'autopost' ? "bg-slate-900 text-sky-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Radio size={16} className={activeTab === 'autopost' ? "text-sky-450 text-sky-400 animate-pulse" : "text-slate-400"} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Тексты & SEO</span>
            </button>

            <button
              id="tab-btn-twin"
              onClick={() => setActiveTab('twin')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'twin' ? "bg-slate-900 text-violet-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bot size={16} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Автопилот</span>
            </button>

            <button
              id="tab-btn-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'analytics' ? "bg-slate-900 text-violet-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart3 size={16} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Аналитика</span>
            </button>

            <button
              id="tab-btn-costs"
              onClick={() => setActiveTab('costs')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'costs' ? "bg-slate-900 text-violet-400 border border-slate-800" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <DollarSign size={16} />
              <span className="text-[10px] sm:text-xs font-semibold font-sans">Окупаемость</span>
            </button>
          </div>

          {/* RENDER ACTIVE TAB COMPONENT */}
          <div className="flex-1">
            {activeTab === 'launcher' && (
              <LauncherPanel
                onLaunch={handleLaunchFromLauncher}
                trends={trends}
                defaultTopic={launcherTopic}
              />
            )}

            {activeTab === 'montage' && (
              <VideoWorkspace
                twin={twin}
                script={script}
                onSetScript={setScript}
                onGenerateScript={handleGenerateScript}
                onGenerateSceneImage={handleGenerateSceneImage}
                onGenerateSceneVoice={handleGenerateSceneVoice}
                activeSceneIdx={activeSceneIdx}
                setActiveSceneIdx={setActiveSceneIdx}
                selectedTrendTopic={selectedTrendTopic}
                setSelectedTrendTopic={setSelectedTrendTopic}
              />
            )}

            {activeTab === 'twin' && (
              <DigitalTwinSettings
                twin={twin}
                onChangeTwin={setTwin}
                onGenerateAvatar={handleManualAvatarGeneration}
              />
            )}

            {activeTab === 'autopost' && (
              <AutoPostHub
                script={script}
                agencyName={twin.agencyName}
                preSelectedFormat={launcherFormat}
                preSelectedTopic={launcherTopic}
                preSelectedChannel={launcherChannel}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsPanel agencyName={twin.agencyName} />
            )}

            {activeTab === 'costs' && (
              <CostCalculator />
            )}
          </div>
        </div>
      </main>

      {/* Styled Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500 font-mono">
        <p>B2B Marketing & Content Factory - Built with Gemini LLM & Google AI Studio</p>
        <p className="mt-1 text-[10px] text-slate-600">Все права защищены © 2026</p>
      </footer>
    </div>
  );
}
