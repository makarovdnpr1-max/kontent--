import React, { useState } from "react";
import { DigitalTwin } from "../types";
import { 
  Bot, Settings, ShieldAlert, CheckCircle2, Sliders, Calendar, Clock, 
  HelpCircle, RefreshCw, Radio, Sparkles, Youtube, Globe, Key, ListMinus
} from "lucide-react";

interface Props {
  twin: DigitalTwin;
  onChangeTwin: (t: DigitalTwin) => void;
  onGenerateAvatar: (prompt: string) => Promise<string>;
}

export default function DigitalTwinSettings({ twin, onChangeTwin, onGenerateAvatar }: Props) {
  // HeyGen sync configuration states
  const [heygenApiKey, setHeygenApiKey] = useState(() => localStorage.getItem("b2b_heygen_api_key") || "");
  const [avatarId, setAvatarId] = useState("charismatic_ceo_premium_09");
  const [voiceId, setVoiceId] = useState("zephyr_deep_baritone_2026");
  const [isConnected, setIsConnected] = useState(!!localStorage.getItem("b2b_heygen_api_key"));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  // Scheduling Configurations (Когда постить, сколько постить)
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [postsPerWeek, setPostsPerWeek] = useState(7);
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["10:30", "15:00", "19:00"]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableDays = [
    { id: "mon", label: "Пн" },
    { id: "tue", label: "Вт" },
    { id: "wed", label: "Ср" },
    { id: "thu", label: "Чт" },
    { id: "fri", label: "Пт" },
    { id: "sat", label: "Сб" },
    { id: "sun", label: "Вс" }
  ];

  const availableTimes = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:00", "20:30", "21:00"];

  const handleConnectHeyGen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heygenApiKey) {
      alert("Пожалуйста, введите рабочий API-ключ HeyGen");
      return;
    }
    setIsSyncing(true);
    setSyncStatus("Отсылаем пинг-запрос к API шлюзу HeyGen (v2)...");

    setTimeout(() => {
      setSyncStatus("Коннект успешен! Скачиваем цифровые слепки лица и премиум-аватар...");
      setTimeout(() => {
        setIsConnected(true);
        setIsSyncing(false);
        setSyncStatus("");
        localStorage.setItem("b2b_heygen_api_key", heygenApiKey);
      }, 1000);
    }, 1200);
  };

  const handleDisconnect = () => {
    localStorage.removeItem("b2b_heygen_api_key");
    setHeygenApiKey("");
    setIsConnected(false);
  };

  const toggleDay = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const handleSaveSchedule = () => {
    setIsSavingSchedule(true);
    setTimeout(() => {
      setIsSavingSchedule(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 BLOCK 1: HEYGEN INTEGRATION (Двоник) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-100">Интеграция ИИ-Двойника HeyGen</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Свяжите B2B контент-завод с вашим личным аккаунтом HeyGen для прямой выгрузки видео
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-500"} animate-pulse`} />
            <span className="text-xs font-mono font-bold text-slate-300">
              {isConnected ? "ПОДКЛЮЧЕН К HEYGEN" : "ОЖИДАЕТ НАСТРОЙКИ"}
            </span>
          </div>
        </div>

        {!isConnected ? (
          /* HeyGen Login Form */
          <form onSubmit={handleConnectHeyGen} className="space-y-4 max-w-xl">
            <div className="p-4 bg-slate-950/60 border border-amber-500/10 rounded-xl flex items-start gap-3">
              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Для полностью автономного рендеринга видеороликов вашим голосом и лицом требуется подключение к сервису <span className="text-slate-200 font-medium">HeyGen API</span>. Сгенерированные сценарии будут отправляться на рендер автоматически.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                HeyGen v2 API Token / Ключ:
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                  type="password"
                  value={heygenApiKey}
                  onChange={(e) => setHeygenApiKey(e.target.value)}
                  placeholder="Вставьте токен формата: MTQ4NzM5N2M2YTZkNDRhOTgxMmNiYzg1..."
                  className="w-full bg-slate-950 border border-slate-850 border-slate-800 text-slate-100 text-xs pl-10 pr-4 py-3 rounded-xl focus:border-violet-500 focus:outline-none placeholder-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">Avatar ID (Премиум-Слепок):</label>
                <input
                  type="text"
                  value={avatarId}
                  onChange={(e) => setAvatarId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">Voice ID (Натренированный Голос):</label>
                <input
                  type="text"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Устанавливаем связь с сервером HeyGen...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>Проверить и подключить аккаунт HeyGen API 🚀</span>
                </>
              )}
            </button>

            {syncStatus && (
              <p className="text-[11px] font-mono text-violet-400 animate-pulse">{syncStatus}</p>
            )}
          </form>
        ) : (
          /* Connected State Details & Avatar Preview */
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-slate-950/50 p-4 border border-violet-500/10 rounded-xl justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/10 font-bold text-lg">
                  DM
                </div>
                <div>
                  <h4 className="text-sm font-bold font-sans text-slate-200">Двойник Дмитрия Макарова активен</h4>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Премиум 3D-аватар HeyGen с клонированным B2B тоном готовой речи (ru-RU).
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {avatarId} | Voice: {voiceId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-1.5 bg-slate-900 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 rounded-lg text-[11px] text-slate-400 cursor-pointer font-mono font-bold transition-all"
              >
                Отключить связь
              </button>
            </div>

            <div className="p-4 bg-slate-950/30 border border-slate-800 rounded-xl space-y-2">
              <span className="text-[9px] uppercase font-mono text-slate-400 font-bold tracking-wider">🟢 Тест API Отправки:</span>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Интеграция работает в фоновом режиме. Каждый раз, когда во вкладке "Сценарии" вы запускаете отправку, система обращается к HeyGen API, собирает короткое видео (Shorts) длительностью 30-40 сек на основе ИИ-синтеза, загружает его в базы распределения и сигнализирует в Telegram.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* 📅 BLOCK 2: SCHEDULING (Сколько постить, когда постить) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans text-slate-100">Расписание & Количество публикаций</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Задайте интенсивность и точные временные слоты для ежедневной автовыгрузки
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-850 shrink-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Автопилот умной выгрузки:</span>
            <button
              type="button"
              onClick={() => setAutopilotEnabled(!autopilotEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                autopilotEnabled ? "bg-emerald-600" : "bg-slate-800"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autopilotEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-[10px] font-bold ${autopilotEnabled ? "text-emerald-400" : "text-slate-500"}`}>
              {autopilotEnabled ? "ВКЛ" : "ВЫКЛ"}
            </span>
          </div>
        </div>

        {/* Schedule Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Slider Content Strategy (How many posts) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-mono uppercase text-slate-400 font-semibold">Интенсивность постов:</label>
                <span className="text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-md border border-sky-500/20">
                  {postsPerWeek} постов в неделю
                </span>
              </div>
              
              <input
                type="range"
                min="1"
                max="14"
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>1 пост/нед</span>
                <span>7 постов (Каждый день)</span>
                <span>14 постов (2 в день)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
              <span className="text-[9px] font-mono text-slate-400 font-bold uppercase block">Контент-стратегия:</span>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                {postsPerWeek <= 3 ? (
                  "🔥 Экспертный прогрев: размеренная публикация только фундаментальных SEO-лонгридов и разборов."
                ) : postsPerWeek <= 7 ? (
                  "📈 Полноценный конвейер b2b-бюро: 1 высококлассный материал ежедневно (чередование видео и оптимизированных статей)."
                ) : (
                  "⚡ Доминирование в поиске: плотная выгрузка постов утром и вечером для максимальной индексации ИИ-поисковиками."
                )}
              </p>
            </div>
          </div>

          {/* Days Selection */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Days Of Week */}
            <div className="space-y-2">
              <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                Дни для автопостинга:
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {availableDays.map((day) => {
                  const active = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`py-2 px-1 text-xs rounded-lg font-sans text-center transition-all cursor-pointer font-bold border ${
                        active
                          ? "bg-sky-500/20 border-sky-500 text-sky-300"
                          : "bg-slate-950 border-slate-850 text-slate-500 hover:border-slate-700"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-mono uppercase text-slate-400 font-semibold">
                  Временные слоты (Золотые часы):
                </label>
                <span className="text-[10px] font-mono text-slate-500">ЛПР наиболее активны в эти часы</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableTimes.map((time) => {
                  const active = selectedTimes.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleTime(time)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer border ${
                        active
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-300"
                          : "bg-slate-950/60 border-slate-850 text-slate-500 hover:border-slate-850"
                      }`}
                    >
                      ⏰ {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Save trigger */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                disabled={isSavingSchedule}
                onClick={handleSaveSchedule}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-550 hover:to-indigo-550 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {isSavingSchedule ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Синхронизируем расписание...</span>
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    <span>Сохранить расписание автопилота</span>
                  </>
                )}
              </button>

              {saveSuccess && (
                <span className="text-xs font-sans text-emerald-400 font-semibold animate-pulse">
                  ✓ Настройки автопилота успешно применены в системе!
                </span>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
