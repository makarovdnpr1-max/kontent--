import React, { useState } from "react";
import { DigitalTwin } from "../types";
import { 
  Bot, Settings, ShieldAlert, CheckCircle2, Sliders, Calendar, Clock, 
  HelpCircle, RefreshCw, Radio, Sparkles, Youtube, Globe, Key, ListMinus,
  Play, Volume2, User, Mic, Briefcase, Target, FileText, AlertCircle, BookmarkCheck
} from "lucide-react";

interface Props {
  twin: DigitalTwin;
  onChangeTwin: (t: DigitalTwin) => void;
  onGenerateAvatar: (prompt: string) => Promise<string>;
}

export default function DigitalTwinSettings({ twin, onChangeTwin, onGenerateAvatar }: Props) {
  // Scheduling Configurations (Когда постить, сколько постить)
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const [postsPerWeek, setPostsPerWeek] = useState(7);
  const [selectedDays, setSelectedDays] = useState<string[]>(["mon", "tue", "wed", "thu", "fri"]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>(["10:30", "15:00", "19:00"]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Avatar generation states
  const [avatarPrompt, setAvatarPrompt] = useState(
    "A confident male B2B marketing CEO in Russia, dressed in stylish smart casual suit, modern business studio background with futuristic hologram overlays, perfect realistic lighting, 8k"
  );
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

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

  const voicesConfig = [
    { id: "Zephyr" as const, name: "Zephyr (Зефир)", gender: "Мужской", desc: "Уверенный, интеллигентный, мягкий голос. Прекрасно подходит для экспертного консалтинга и подробных B2B-разборов." },
    { id: "Fenrir" as const, name: "Fenrir (Фенрир)", gender: "Мужской", desc: "Глубокий, напористый, мощный тембр. Придает материалам весомость, лидерский авторитет и жесткую опора." },
    { id: "Charon" as const, name: "Charon (Харон)", gender: "Мужской", desc: "Строгий, серьезный, ровный деловой голос. Превосходен для финансовых отчетов, аналитики и крупных ИТ-сделок." },
    { id: "Kore" as const, name: "Kore (Кора)", gender: "Женский", desc: "Теплый, приятный, экспертный женский голос. Сразу располагает к себе ЛПР и отлично удерживает вовлечение." },
    { id: "Puck" as const, name: "Puck (Пак)", gender: "Женский", desc: "Живой, энергичный, харизматичный тембр. Идеально вовлекает стартапы, креативные агентства и финтех-проекты." }
  ];

  const tonesConfig = [
    { id: "charismatic" as const, label: "🔥 Харизматичный", desc: "Заряжен лидерской харизмой, вовлекает с первого слова" },
    { id: "professional" as const, label: "🤝 Строгий Бизнес", desc: "Сдержанный деловой тон с акцентом на цифры и окупаемость" },
    { id: "intellectual" as const, label: "🎓 Экспертный", desc: "Интеллигентная глубина, подходит для разборов сложных ИТ-систем" },
    { id: "energetic" as const, label: "⚡ Драйвовый", desc: "Высокая динамика, бодрый темп, привлекает внимание в Stories" },
    { id: "casual" as const, label: "🍿 Непринужденный", desc: "Расслабленная манера разговора без лишнего пафоса" }
  ];

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

  const handleTriggerAvatarGeneration = async () => {
    setIsGeneratingAvatar(true);
    try {
      const url = await onGenerateAvatar(avatarPrompt);
      onChangeTwin({ ...twin, avatarUrl: url });
    } catch (err: any) {
      alert("Не удалось отрисовать портрет двойника: " + (err.message || err));
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const handleTestVoice = async (voiceId: typeof twin.voice, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingVoice) return;
    setPlayingVoice(voiceId);

    const testText = `Привет! Я твой цифровой двойник из маркетингового бюро. Оцени качество моего нового голоса! Теперь я звучу чисто и убедительно.`;
    
    try {
      const response = await fetch("/api/synthesize-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testText, voiceName: voiceId })
      });
      const data = await response.json();
      
      if (data.audio) {
        const audio = new Audio(data.audio);
        audio.play().catch(() => {});
        audio.onended = () => setPlayingVoice(null);
      } else {
        throw new Error("Local synthesis unavailable");
      }
    } catch (err) {
      console.warn("WAV preview failed. Falling back to native browser speech synthesis:", err);
      // Fallback
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(testText);
        utterance.lang = "ru-RU";
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setPlayingVoice(null);
      } else {
        setPlayingVoice(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 🚀 BLOCK 1: DIGITAL TWIN BRANDING & CUSTOMIZATION FORM */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-slate-100">Персонализация Цифрового Двойника</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Настройте ИИ-личность основателя, бренд, фотореалистичное лицо и его уникальный тембр
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">СИНХРОНИЗИРОВАН</span>
          </div>
        </div>

        {/* Form Fields: Leader, Company, Specialty */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: Identity fields */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 block">Имя Эксперта / Спикера:</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none transition-all font-sans"
                    value={twin.name}
                    onChange={(e) => onChangeTwin({ ...twin, name: e.target.value })}
                    placeholder="Например: Дмитрий Макаров"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 block">Ваше B2B Агентство (Бренд):</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none transition-all font-sans"
                    value={twin.agencyName}
                    onChange={(e) => onChangeTwin({ ...twin, agencyName: e.target.value })}
                    placeholder="Например: b2b-бюро"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 block">Ниша и Экспертная Тема:</label>
                <div className="relative">
                  <Sliders size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none transition-all font-sans"
                    value={twin.specialty}
                    onChange={(e) => onChangeTwin({ ...twin, specialty: e.target.value })}
                    placeholder="Например: B2B Маркетинг & AI-лидогенерация"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 block">Целевая Аудитория (ЛПР):</label>
                <div className="relative">
                  <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none transition-all font-sans"
                    value={twin.targetAudience}
                    onChange={(e) => onChangeTwin({ ...twin, targetAudience: e.target.value })}
                    placeholder="Например: CEO ИТ-компаний, коммерческие директора"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400 mb-1.5 block">Инструкции по Подаче Материала (Смысловое Ядро):</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-3 text-slate-500" />
                <textarea
                  className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-xs pl-9 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none transition-all font-sans min-h-[70px] resize-none"
                  value={twin.customPrompt}
                  rows={2}
                  onChange={(e) => onChangeTwin({ ...twin, customPrompt: e.target.value })}
                  placeholder="Например: Говорить уверенно, приводить числовые доводы и кейсы, избегать банальностей..."
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Avatar Portrait Painter */}
          <div className="lg:col-span-4 bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Внешность Двойника (Фоторобот):</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-18 h-18 rounded-full overflow-hidden border-2 border-violet-500/40 bg-slate-900 shrink-0 flex items-center justify-center">
                {twin.avatarUrl ? (
                  <img src={twin.avatarUrl} alt={twin.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-xl font-bold text-violet-400 font-mono">
                    {twin.name.substring(0, 1)}
                  </div>
                )}
                {isGeneratingAvatar && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <RefreshCw className="animate-spin text-violet-400" size={16} />
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">{twin.name}</h4>
                <p className="text-[9px] text-slate-400 font-sans leading-tight">
                  {twin.avatarUrl ? "Портрет сгенерирован ИИ" : "Стандартный 3D-аватар"}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] text-slate-500 font-sans block leading-tight">Промпт для генерации внешности:</span>
              <textarea
                className="w-full bg-slate-950/80 border border-slate-850 text-slate-300 text-[10px] p-2 rounded-lg focus:outline-none focus:border-violet-500 font-sans font-normal resize-none h-14"
                value={avatarPrompt}
                onChange={(e) => setAvatarPrompt(e.target.value)}
              />
            </div>

            <button
              onClick={handleTriggerAvatarGeneration}
              disabled={isGeneratingAvatar || !avatarPrompt.trim()}
              className="w-full py-2 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/25 rounded-lg text-xs font-bold text-violet-400 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              {isGeneratingAvatar ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
              <span>Сгенерировать внешность</span>
            </button>
          </div>

        </div>

        {/* 🎙️ STEP 1.5: INTERACTIVE VOICE CHOOSER */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Голосовые модели Google (Премимум цифровая озвучка 🔊):</span>
            <span className="text-[10px] text-slate-500">Выберите голос для автоматического синтеза сценария</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {voicesConfig.map((voice) => {
              const matchesSelected = twin.voice === voice.id;
              const isSpeakerPlaying = playingVoice === voice.id;

              return (
                <div
                  key={voice.id}
                  onClick={() => onChangeTwin({ ...twin, voice: voice.id })}
                  className={`relative p-3.5 rounded-xl border transition-all duration-300 flex flex-col justify-between h-42 text-left cursor-pointer group ${
                    matchesSelected
                      ? "bg-violet-950/10 border-violet-500 shadow-md"
                      : "bg-slate-950/30 border-slate-850 hover:border-slate-700"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">{voice.name}</span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                        voice.gender === "Мужской" ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                      }`}>
                        {voice.gender}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-4">
                      {voice.desc}
                    </p>
                  </div>

                  <button
                    onClick={(e) => handleTestVoice(voice.id, e)}
                    className={`mt-4 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                      isSpeakerPlaying
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : matchesSelected
                        ? "bg-violet-600/20 hover:bg-violet-600/30 border-violet-500/35 text-violet-300"
                        : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {isSpeakerPlaying ? (
                      <>
                        <RefreshCw size={10} className="animate-spin text-emerald-400" />
                        <span>Говорит...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={10} />
                        <span>Прослушать тембр</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🎭 STEP 1.8: delivery / voiceover TONE SELECTION */}
        <div className="border-t border-slate-800 pt-5 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Характер и Подача Интонаций (Эмоциональный фильтр):</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
            {tonesConfig.map((toneItem) => {
              const isSelectedTone = twin.tone === toneItem.id;
              return (
                <button
                  type="button"
                  key={toneItem.id}
                  onClick={() => onChangeTwin({ ...twin, tone: toneItem.id })}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    isSelectedTone
                      ? "bg-violet-600/15 border-violet-500 text-violet-300 shadow-md"
                      : "bg-slate-950/30 border-slate-850 text-slate-400 hover:text-slate-300"
                  }`}
                >
                  <span className="text-xs font-bold leading-none">{toneItem.label}</span>
                  <span className="text-[9px] text-slate-500 font-sans leading-snug mt-1.5 block">
                    {toneItem.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

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
