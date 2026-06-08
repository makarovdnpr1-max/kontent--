import React, { useState } from "react";
import { 
  Sparkles, Youtube, Radio, FileText, Send, Globe, ChevronRight, 
  TrendingUp, Lightbulb, Check, HardDrive, Play, Zap, Cpu
} from "lucide-react";

interface Props {
  onLaunch: (format: "text" | "video", channel: string, topic: string) => void;
  trends: Array<{ title: string; description: string; keyInsight: string }>;
  defaultTopic: string;
}

export default function LauncherPanel({ onLaunch, trends, defaultTopic }: Props) {
  const [selectedFormat, setSelectedFormat] = useState<"text" | "video">("text");
  const [selectedChannel, setSelectedChannel] = useState<string>("zen");
  const [topic, setTopic] = useState("");

  const hotTrends2026 = [
    {
      title: "GEO оптимизация под СНГ: Как ИИ-поисковики заменяют стандартное SEO",
      channelDefault: "zen",
      category: "SEO & AI Search"
    },
    {
      title: "Автоматические AI-SDR агенты: Кейс о замене 5 менеджеров по продажам в ИТ",
      channelDefault: "vc",
      category: "Кейсы / Рост"
    },
    {
      title: "Почему шаблоны и стоковые постеры в B2B больше не генерируют лиды в 2026",
      channelDefault: "telegram",
      category: "Тренды Контента"
    }
  ];

  // If topic is empty, fill it with defaultTopic or first trend
  React.useEffect(() => {
    if (defaultTopic && !topic) {
      setTopic(defaultTopic);
    } else if (!topic && hotTrends2026.length > 0) {
      setTopic(hotTrends2026[0].title);
    }
  }, [defaultTopic]);

  const handleFormatChange = (format: "text" | "video") => {
    setSelectedFormat(format);
    if (format === "text") {
      setSelectedChannel("zen");
    } else {
      setSelectedChannel("reels");
    }
  };

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    onLaunch(selectedFormat, selectedChannel, topic || "Инсайты B2B-Маркетинга 2026");
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      
      {/* Visual Header */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-xl shadow-md">
          <Zap size={20} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
            Быстрый Старт Постинга 
            <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-wider">
              AUTO-LAUNCHER
            </span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Выберите формат, укажите целевой канал и мгновенно запустите генератор сквозного B2B контента
          </p>
        </div>
      </div>

      <form onSubmit={handleLaunch} className="space-y-6">
        
        {/* STEP 1: SELECT FORMAT */}
        <div className="space-y-3">
          <label className="text-[10px] sm:text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-200">1</span>
            Выберите формат продвижения:
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* TEXT CARD */}
            <div 
              onClick={() => handleFormatChange("text")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                selectedFormat === "text"
                  ? "bg-gradient-to-b from-sky-500/15 to-slate-950 border-sky-500 shadow-xl shadow-sky-500/5 scale-[1.01]"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-705 hover:border-slate-700 hover:bg-slate-950"
              }`}
            >
              <div className="absolute right-3 top-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedFormat === "text" ? "border-sky-500 bg-sky-600 text-white" : "border-slate-700"
                }`}>
                  {selectedFormat === "text" && <Check size={12} strokeWidth={3} />}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${
                  selectedFormat === "text" ? "bg-sky-500/15 text-sky-400 border-sky-400/30" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-150 text-slate-200 font-sans">📝 Элитные SEO-Статьи</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                    Сгенерируйте вовлекающий лонгрид или экспертную колонку. Идеально под Яндекс Дзен, VC.ru и блоги с интеграцией AI-ссылок.
                  </p>
                  <div className="flex gap-2 mt-3 text-[9px] uppercase font-mono font-bold text-sky-400">
                    <span>• Яндекс Дзен</span>
                    <span>• VC.RU</span>
                    <span>• TELEGRAM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VIDEO CARD */}
            <div 
              onClick={() => handleFormatChange("video")}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                selectedFormat === "video"
                  ? "bg-gradient-to-b from-violet-500/15 to-slate-950 border-violet-500 shadow-xl shadow-violet-500/5 scale-[1.01]"
                  : "bg-slate-950/60 border-slate-800 hover:border-slate-705 hover:border-slate-700 hover:bg-slate-950"
              }`}
            >
              <div className="absolute right-3 top-3">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  selectedFormat === "video" ? "border-violet-500 bg-violet-600 text-white" : "border-slate-700"
                }`}>
                  {selectedFormat === "video" && <Check size={12} strokeWidth={3} />}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border ${
                  selectedFormat === "video" ? "bg-violet-500/15 text-violet-400 border-violet-400/30" : "bg-slate-900 text-slate-400 border-slate-800"
                }`}>
                  <Youtube size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-150 text-slate-200 font-sans">🎥 Видеоклип ИИ-Двойника</h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                    Создайте взрывной шорт-сценарий (9:16) с голосовой раскадровкой и авто-интеграцией Google Veo видеогенерации.
                  </p>
                  <div className="flex gap-2 mt-3 text-[9px] uppercase font-mono font-bold text-violet-400">
                    <span>• REELS (9:16)</span>
                    <span>• SHORTS</span>
                    <span>• STORIES</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* STEP 2: SELECT CHANNEL */}
        <div className="space-y-3">
          <label className="text-[10px] sm:text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-200">2</span>
            Выберите приоритетный канал дистрибуции:
          </label>

          {selectedFormat === "text" ? (
            /* TEXT CHANNELS SPREAD */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* YANDEX ZEN */}
              <div 
                onClick={() => setSelectedChannel("zen")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "zen" 
                    ? "bg-slate-900 border-sky-500 text-sky-450 text-sky-305 text-sky-300 shadow-md shadow-sky-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded-lg">
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">Яндекс.Дзен</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">dzen.ru/b2b-buro</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "zen" ? "border-sky-500 bg-sky-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "zen" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

              {/* VC.RU */}
              <div 
                onClick={() => setSelectedChannel("vc")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "vc" 
                    ? "bg-slate-900 border-sky-500 text-sky-300 shadow-md shadow-sky-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-500/10 text-teal-400 border border-teal-400/15 rounded-lg">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">VC.ru Инсайты</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">vc.ru/b2b-buro</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "vc" ? "border-sky-500 bg-sky-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "vc" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

              {/* TELEGRAM BLOG */}
              <div 
                onClick={() => setSelectedChannel("telegram")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "telegram" 
                    ? "bg-slate-900 border-sky-500 text-sky-300 shadow-md shadow-sky-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-400/15 rounded-lg">
                    <Send size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">Telegram LIVE</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">@b2b_buro_live</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "telegram" ? "border-sky-500 bg-sky-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "telegram" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

            </div>
          ) : (
            /* VIDEO CHANNELS SPREAD */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* INSTAGRAM REELS */}
              <div 
                onClick={() => setSelectedChannel("reels")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "reels" 
                    ? "bg-slate-900 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-pink-500/10 text-pink-500 border border-pink-500/15 rounded-lg font-bold">
                    <Radio size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">Instagram Reels</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">@b2b_buro_agency</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "reels" ? "border-violet-500 bg-violet-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "reels" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

              {/* YOUTUBE SHORTS */}
              <div 
                onClick={() => setSelectedChannel("shorts")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "shorts" 
                    ? "bg-slate-900 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-500/10 text-red-500 border border-red-500/15 rounded-lg">
                    <Youtube size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">YouTube Shorts</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">c/b2b-buro</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "shorts" ? "border-violet-500 bg-violet-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "shorts" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

              {/* TELEGRAM STORIES */}
              <div 
                onClick={() => setSelectedChannel("tg_stories")}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedChannel === "tg_stories" 
                    ? "bg-slate-900 border-violet-500 text-violet-300 shadow-md shadow-violet-500/5"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-500/10 text-sky-400 border border-sky-400/15 rounded-lg font-bold">
                    <Send size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans text-slate-200">Telegram Stories</h4>
                    <p className="text-[9px] text-slate-500 font-mono italic leading-none">@b2b_buro_live</p>
                  </div>
                </div>
                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                  selectedChannel === "tg_stories" ? "border-violet-500 bg-violet-600 text-white" : "border-slate-800"
                }`}>
                  {selectedChannel === "tg_stories" && <Check size={8} strokeWidth={3} />}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* STEP 3: CONVEYOR TOPIC OR PRESETS */}
        <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3">
          <label className="text-[10px] sm:text-xs font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] text-slate-200">3</span>
            Тема или Ключевые слова публикации:
          </label>

          <input
            type="text"
            className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500 transition-all font-sans"
            placeholder="Введите свою тему, например: Запуск мультимодальной ИИ-воронки для крупного финтех холдинга"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          {/* Preset Chips */}
          <div className="space-y-1.5 max-w-full">
            <span className="text-[9px] font-mono uppercase text-slate-500 tracking-wider font-extrabold flex items-center gap-1">
              <Lightbulb size={11} className="text-yellow-400" />
              Горячие AI/B2B Тренды 2026 года (нажмите для выбора):
            </span>
            <div className="flex flex-col gap-1.5">
              {hotTrends2026.map((trend, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    setTopic(trend.title);
                    if (selectedFormat === "text") {
                      setSelectedChannel(trend.channelDefault);
                    }
                  }}
                  className={`text-[11px] px-3 py-2 rounded-lg border text-left cursor-pointer transition-all flex justify-between items-center ${
                    topic === trend.title
                      ? "bg-sky-500/10 border-sky-400 text-sky-200"
                      : "bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                  }`}
                >
                  <span className="font-sans leading-snug font-medium truncate pr-4">⚡ {trend.title}</span>
                  <span className="text-[8px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 font-mono font-bold shrink-0">
                    {trend.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SUBMIT TRIGGER */}
        <button
          type="submit"
          className={`w-full py-3 bg-gradient-to-r ${
            selectedFormat === "text" ? "from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500" : "from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          } text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all transform hover:-translate-y-0.5 border border-white/5`}
        >
          <span>Запустить контент-конвейер B2B-бюро</span>
          <ChevronRight size={16} />
        </button>

      </form>
    </div>
  );
}
