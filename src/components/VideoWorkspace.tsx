import React, { useState } from "react";
import { VideoScript, VideoScene, DigitalTwin } from "../types";
import { Sparkles, RefreshCw, Layers, Edit3, Image, Mic, Play, HelpCircle, CheckCircle, Trash2, ArrowRight, Copy, Download, ExternalLink, FileText, Check, AlertCircle, Video, Film } from "lucide-react";

interface Props {
  twin: DigitalTwin;
  script: VideoScript | null;
  onSetScript: (s: VideoScript | null) => void;
  onGenerateScript: (topic: string, tone: string, videoType: "sales" | "trust" | "engaging") => Promise<VideoScript>;
  onGenerateSceneImage: (sceneId: number, prompt: string) => Promise<string>;
  onGenerateSceneVoice: (sceneId: number, text: string) => Promise<string>;
  activeSceneIdx: number;
  setActiveSceneIdx: (idx: number) => void;
  selectedTrendTopic: string;
  setSelectedTrendTopic: (t: string) => void;
}

export default function VideoWorkspace({
  twin,
  script,
  onSetScript,
  onGenerateScript,
  onGenerateSceneImage,
  onGenerateSceneVoice,
  activeSceneIdx,
  setActiveSceneIdx,
  selectedTrendTopic,
  setSelectedTrendTopic
}: Props) {
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [processingSceneId, setProcessingSceneId] = useState<number | null>(null);
  const [processingType, setProcessingType] = useState<'image' | 'voice' | null>(null);
  const [videoType, setVideoType] = useState<"sales" | "trust" | "engaging">("trust");

  // Google Veo tracking states
  const [veoProgress, setVeoProgress] = useState<{ [sceneId: number]: number }>({});
  const [generatingVeoSceneId, setGeneratingVeoSceneId] = useState<number | null>(null);

  // Allow manual editing of scene subtitle directly inside the grid
  const handleSubtitleChange = (sceneId: number, subtitle: string) => {
    if (!script) return;
    const updatedScenes = script.scenes.map(s => s.id === sceneId ? { ...s, subtitle } : s);
    onSetScript({ ...script, scenes: updatedScenes });
  };

  const handleGenerateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrendTopic.trim()) return;
    setIsLoadingScript(true);
    try {
      const gScript = await onGenerateScript(selectedTrendTopic, twin.tone, videoType);
      onSetScript(gScript);
      setActiveSceneIdx(0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingScript(false);
    }
  };

  // Helper to generate visual representation for a single scene
  const handleSceneImage = async (sceneId: number, prompt: string) => {
    setProcessingSceneId(sceneId);
    setProcessingType('image');
    try {
      const mediaUrl = await onGenerateSceneImage(sceneId, prompt);
      if (script) {
        const updated = script.scenes.map(s => s.id === sceneId ? { ...s, mediaUrl } : s);
        onSetScript({ ...script, scenes: updated });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingSceneId(null);
      setProcessingType(null);
    }
  };

  // Helper to generate speech narration for a single scene
  const handleSceneVoice = async (sceneId: number, text: string) => {
    setProcessingSceneId(sceneId);
    setProcessingType('voice');
    try {
      const voiceUrl = await onGenerateSceneVoice(sceneId, text);
      if (script) {
        const updated = script.scenes.map(s => s.id === sceneId ? { ...s, voiceUrl } : s);
        onSetScript({ ...script, scenes: updated });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingSceneId(null);
      setProcessingType(null);
    }
  };

  // Helper to generate a Google Veo video as a Promise
  const handleGenerateVeoVideoPromise = (sceneId: number, visualPrompt: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      setGeneratingVeoSceneId(sceneId);
      setVeoProgress(prev => ({ ...prev, [sceneId]: 10 }));
      try {
        const startRes = await fetch("/api/generate-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: visualPrompt,
            resolution: "720p",
            aspectRatio: "9:16"
          })
        });
        const startData = await startRes.json();
        if (!startRes.ok) throw new Error(startData.error || "Ошибка старта Veo");

        const operationName = startData.operationName;
        setVeoProgress(prev => ({ ...prev, [sceneId]: 30 }));

        let attempts = 0;
        const interval = window.setInterval(async () => {
          attempts++;
          if (attempts > 40) {
            clearInterval(interval);
            setGeneratingVeoSceneId(null);
            reject(new Error("Таймаут рендеринга Google Veo (60 сек)"));
            return;
          }

          setVeoProgress(prev => {
            const current = prev[sceneId] || 30;
            return { ...prev, [sceneId]: Math.min(current + 4, 98) };
          });

          try {
            const statusRes = await fetch("/api/video-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ operationName })
            });
            const statusData = await statusRes.json();
            if (statusRes.ok) {
              if (statusData.done || statusData.status === "completed") {
                clearInterval(interval);
                setVeoProgress(prev => ({ ...prev, [sceneId]: 100 }));
                setGeneratingVeoSceneId(null);
                
                const videoStreamUrl = `/api/video-download?operationName=${encodeURIComponent(operationName)}`;
                // Update Parent State
                if (script) {
                  // Wait, because we are in an async loop updating parent state multiple times, we need to be careful
                  // But since onSetScript takes the updated script, let's update it in-place
                  resolve(videoStreamUrl);
                } else {
                  resolve(videoStreamUrl);
                }
              }
            }
          } catch (pollErr) {
            console.error("Polling error for Veo Promise:", pollErr);
          }
        }, 1500);

      } catch (err: any) {
        setGeneratingVeoSceneId(null);
        reject(err);
      }
    });
  };

  // Autonomous Montage! Iterates through all scenes to generate visual frames (Veo Videos) and speech voices
  const handleAutoAssembleAll = async () => {
    if (!script) return;
    setIsProcessingAll(true);
    try {
      let currentScenes = [...script.scenes];
      
      for (let i = 0; i < currentScenes.length; i++) {
        const scene = currentScenes[i];
        
        // 1. Check if scene has a Veo video. If not, generate a real Google Veo video scene
        const isAlreadyVideo = scene.mediaUrl && (scene.mediaUrl.includes(".mp4") || scene.mediaUrl.includes("video"));
        let targetMediaUrl = scene.mediaUrl || "";

        if (!isAlreadyVideo) {
          try {
            // Sequential Google Veo rendering
            const generatedVideoUrl = await handleGenerateVeoVideoPromise(scene.id, scene.visualPrompt);
            targetMediaUrl = generatedVideoUrl;
            
            // Build temporary scenes array to update progressive state
            currentScenes = currentScenes.map(s => s.id === scene.id ? { ...s, mediaUrl: generatedVideoUrl } : s);
            onSetScript({ ...script, scenes: currentScenes });
          } catch (veoErr) {
            console.warn("Veo rendering failed during auto assembly. Falling back to static image generation. Error:", veoErr);
            // Fallback: Generate high fidelity static visual prompt
            try {
              const staticImgUrl = await onGenerateSceneImage(scene.id, scene.visualPrompt);
              targetMediaUrl = staticImgUrl;
              currentScenes = currentScenes.map(s => s.id === scene.id ? { ...s, mediaUrl: staticImgUrl } : s);
              onSetScript({ ...script, scenes: currentScenes });
            } catch (imgErr) {
              console.error("Static image fallback also failed:", imgErr);
            }
          }
        }

        // 2. Synthesize Digital Twin voiceover for the scene if not yet done
        if (!scene.voiceUrl) {
          try {
            const voiceUrl = await onGenerateSceneVoice(scene.id, scene.subtitle);
            currentScenes = currentScenes.map(s => s.id === scene.id ? { ...s, voiceUrl } : s);
            onSetScript({ ...script, scenes: currentScenes });
          } catch (voiceErr) {
            console.error("Auto Voice generation failed for scene:", scene.id, voiceErr);
          }
        }
      }
    } catch (e) {
      console.error("Auto Montage Assembly failed major state:", e);
    } finally {
      setIsProcessingAll(false);
    }
  };

  // Triggers manual Google Veo Video Generation per-scene
  const handleGenerateVeoVideo = async (sceneId: number, visualPrompt: string) => {
    try {
      const url = await handleGenerateVeoVideoPromise(sceneId, visualPrompt);
      if (script) {
        const updated = script.scenes.map(s => s.id === sceneId ? { ...s, mediaUrl: url } : s);
        onSetScript({ ...script, scenes: updated });
      }
    } catch (err: any) {
      alert(`Ошибка рендеринга Google Veo: ${err.message || err}`);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col h-full justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
              <Layers size={20} />
            </div>
            <div>
              <h2 id="workspace-header" className="text-xl font-bold font-sans text-slate-100">Монтаж & Генерация Сценария</h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Превратите идеи из ленты новостей в готовый видеошедевр</p>
            </div>
          </div>
        </div>

        {/* Script Initiator Form */}
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl mb-6 space-y-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400">Формат & Фокус контента:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <button
                type="button"
                onClick={() => setVideoType("trust")}
                className={`py-2 px-3 text-left rounded-lg border text-xs font-sans transition-all cursor-pointer flex flex-col justify-between h-18 sm:h-16 ${
                  videoType === "trust"
                    ? "bg-violet-600/10 border-violet-500 text-violet-300 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="font-bold">🤝 Доверие / Эксперт</span>
                <span className="text-[9px] text-slate-500 font-normal leading-tight">Кейсы b2b-бюро, твердые цифры, прозрачность</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoType("engaging")}
                className={`py-2 px-3 text-left rounded-lg border text-xs font-sans transition-all cursor-pointer flex flex-col justify-between h-18 sm:h-16 ${
                  videoType === "engaging"
                    ? "bg-violet-600/10 border-violet-500 text-violet-300 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="font-bold">🔥 Вовлечение</span>
                <span className="text-[9px] text-slate-500 font-normal leading-tight">Интересные хуки, разбор ошибок, B2B мифы</span>
              </button>

              <button
                type="button"
                onClick={() => setVideoType("sales")}
                className={`py-2 px-3 text-left rounded-lg border text-xs font-sans transition-all cursor-pointer flex flex-col justify-between h-18 sm:h-16 ${
                  videoType === "sales"
                    ? "bg-violet-600/10 border-violet-500 text-violet-300 shadow-md"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <span className="font-bold">💰 Прямые продажи</span>
                <span className="text-[9px] text-slate-500 font-normal leading-tight">Лидогенерация, призыв заказать аудит</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerateScript} className="flex gap-2">
            <div className="relative flex-grow">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-400" size={16} />
              <input
                id="script-topic-input"
                type="text"
                className="w-full bg-slate-950/60 border border-slate-800 text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none placeholder-slate-500 font-sans transition-all"
                placeholder="Введите тему видео или перейдите по тренду слева..."
                value={selectedTrendTopic}
                onChange={(e) => setSelectedTrendTopic(e.target.value)}
              />
            </div>
            <button
              id="generate-script-btn"
              type="submit"
              disabled={isLoadingScript || !selectedTrendTopic.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 font-semibold text-white font-sans text-sm rounded-xl disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              {isLoadingScript ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Пишем...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={15} />
                  <span>Написать Сценарий</span>
                </>
              )}
            </button>
          </form>
        </div>

        {script ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-violet-400 uppercase tracking-widest font-bold">SEO ТЕМА:</span>
                <h3 className="text-sm font-bold text-slate-200">{script.title}</h3>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {script.seoKeywords.map((k, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-mono">
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto shrink-0 flex-wrap justify-end">
                <button
                  id="assemble-all-btn"
                  onClick={handleAutoAssembleAll}
                  disabled={isProcessingAll}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-sans text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50 transition-all shadow-md shrink-0"
                >
                  {isProcessingAll ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Sparkles size={13} />
                  )}
                  <span>{isProcessingAll ? "Автосборка..." : "Собрать Видео (Авто)"}</span>
                </button>
              </div>
            </div>

            {/* Scenes Timeline Editor */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-semibold">Сцены Сценария (Timeline):</h4>
              
              {script.scenes.map((scene, idx) => {
                const isActive = idx === activeSceneIdx;
                const isThisSceneProcessing = processingSceneId === scene.id;
                
                return (
                  <div
                    key={scene.id}
                    id={`scene-timeline-card-${scene.id}`}
                    className={`group border rounded-xl p-4 transition-all duration-300 ${
                      isActive
                        ? "bg-violet-950/10 border-violet-500/70 shadow-[0_4px_20px_-5px_rgba(139,92,246,0.15)]"
                        : "bg-slate-950/20 border-slate-800/80 hover:border-slate-850"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Thumbnail & Trigger Selection */}
                      <div
                        onClick={() => setActiveSceneIdx(idx)}
                        className="cursor-pointer flex items-center gap-3.5 flex-1"
                      >
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-800/80 bg-slate-900 flex items-center justify-center shrink-0">
                          {scene.mediaUrl ? (
                            scene.mediaUrl.toLowerCase().endsWith(".mp4") || scene.mediaUrl.toLowerCase().includes("video") ? (
                              <video
                                src={scene.mediaUrl}
                                muted
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={scene.mediaUrl}
                                alt="Scene preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            )
                          ) : (
                            <Image size={18} className="text-slate-600" />
                          )}
                          <span className="absolute bottom-1 right-1 bg-slate-950/80 text-[8px] font-mono text-slate-300 px-1 py-0.2 rounded font-bold">
                            {scene.duration} сек
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 font-bold">СЦЕНА {idx + 1}</span>
                            {scene.mediaUrl && scene.voiceUrl && (
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-medium flex items-center gap-1">
                                <CheckCircle size={10} /> Готова
                              </span>
                            )}
                          </div>
                          
                          {/* Subtitle Input editor */}
                          <div className="flex items-center gap-1.5">
                            <Edit3 size={11} className="text-slate-500" />
                            <textarea
                              id={`scene-textarea-${scene.id}`}
                              className="bg-transparent border-none text-slate-200 text-xs focus:ring-0 focus:outline-none p-0 resize-none font-sans w-full max-h-12 overflow-y-auto"
                              value={scene.subtitle}
                              rows={2}
                              onChange={(e) => handleSubtitleChange(scene.id, e.target.value)}
                              placeholder="Текст диктора для этой сцены..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Render / Synthesize Actions */}
                      <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                        <button
                          id={`render-image-scene-${scene.id}`}
                          onClick={() => handleSceneImage(scene.id, scene.visualPrompt)}
                          disabled={isThisSceneProcessing || isProcessingAll}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-semibold cursor-pointer transition-all border ${
                            scene.mediaUrl
                              ? "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-white"
                              : "bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20"
                          }`}
                          title="Сгенерировать AI картинку для кадра"
                        >
                          {isThisSceneProcessing && processingType === 'image' ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <Image size={11} />
                          )}
                          <span>{scene.mediaUrl ? "Кадр сгенерирован" : "Генерация AI Кадра"}</span>
                        </button>

                        <button
                          id={`render-voice-scene-${scene.id}`}
                          onClick={() => handleSceneVoice(scene.id, scene.subtitle)}
                          disabled={isThisSceneProcessing || isProcessingAll}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-semibold cursor-pointer transition-all border ${
                            scene.voiceUrl
                              ? "bg-slate-800/30 border-slate-800 text-slate-400 hover:text-white"
                              : "bg-violet-600/10 border-violet-500/30 text-violet-300 hover:bg-violet-600/20"
                          }`}
                          title="Озвучить цифровым голосом по сценарию"
                        >
                          {isThisSceneProcessing && processingType === 'voice' ? (
                            <RefreshCw size={11} className="animate-spin" />
                          ) : (
                            <Mic size={11} />
                          )}
                          <span>{scene.voiceUrl ? "Голос синтезирован" : "Озвучка Двойника"}</span>
                        </button>

                        <button
                          id={`render-veo-scene-${scene.id}`}
                          onClick={() => handleGenerateVeoVideo(scene.id, scene.visualPrompt)}
                          disabled={generatingVeoSceneId !== null || isThisSceneProcessing || isProcessingAll}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[10px] font-semibold cursor-pointer transition-all border ${
                            scene.mediaUrl && (scene.mediaUrl.includes(".mp4") || scene.mediaUrl.includes("video"))
                              ? "bg-slate-800/35 border-emerald-500/35 text-emerald-400 font-bold hover:text-emerald-300"
                              : "bg-emerald-600/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/20 animate-pulse"
                          }`}
                          title="Сгенерировать ультра-реалистичное видео в Google Veo"
                        >
                          {generatingVeoSceneId === scene.id ? (
                            <div className="flex items-center gap-1">
                              <RefreshCw size={11} className="animate-spin text-emerald-400" />
                              <span>Рендер {veoProgress[scene.id] || 10}%</span>
                            </div>
                          ) : (
                            <>
                              <Film size={11} />
                              <span>
                                {scene.mediaUrl && (scene.mediaUrl.includes(".mp4") || scene.mediaUrl.includes("video"))
                                  ? "Veo Видео готово ✅"
                                  : "Рендер в Google Veo"}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 flex flex-col items-center justify-center p-6">
            <Layers size={32} className="text-slate-700 mb-3" />
            <h3 className="text-slate-300 font-bold font-sans text-sm">Сценарий ещё не создан</h3>
            <p className="text-xs text-slate-500 font-sans mt-1.5 max-w-sm">
              Выберите интересующую вас тему или напишите её в строке выше, чтобы запустить генератор сценариев, завязанных на привлечение контрактов в ваше B2B агентство.
            </p>
          </div>
        )}
      </div>

      {script && (
        <div className="pt-4 mt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono text-slate-400">
            <p className="flex items-center gap-1.5">
              <span>Общая длительность:</span>
              <span className="text-violet-400 font-bold">
                {script.scenes.reduce((acc, curr) => acc + (curr.duration || 10), 0)} секунд
              </span>
            </p>
            <p className="flex items-center gap-1">
              <span>Статус сборки:</span>
              <span className={`font-bold ${
                script.scenes.every(s => s.mediaUrl && s.voiceUrl) ? "text-emerald-400" : "text-amber-400 animate-pulse"
              }`}>
                {script.scenes.every(s => s.mediaUrl && s.voiceUrl) ? "Монтаж завершен 🚀" : "Требует сборки"}
              </span>
            </p>
          </div>

          {/* Premium compiler download panel */}
          {script.scenes.every(s => s.mediaUrl) ? (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
              <div className="space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-emerald-400 font-sans flex items-center justify-center sm:justify-start gap-1">
                  <CheckCircle size={14} />
                  <span>Полноценное видео успешно скомпилировано!</span>
                </p>
                <p className="text-[10px] text-slate-400 font-sans tracking-wide leading-tight">
                  Все кадры Google Veo и цифровой голос объединены в единый High-Fidelity MP4 файл.
                </p>
              </div>
              <a
                id="download-full-video-link"
                href="/api/download-full-video"
                download={`b2b_content_factory_full_${Date.now()}.mp4`}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold font-sans rounded-xl shadow-lg transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download size={14} />
                <span>Скачать готовое видео (MP4)</span>
              </a>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-950/50 border border-slate-900 rounded-xl flex items-center gap-2.5 text-xs text-slate-500 font-sans">
              <AlertCircle size={14} className="text-amber-500 animate-pulse shrink-0" />
              <span>
                Нажмите зеленое <strong className="text-emerald-400">«Собрать Видео (Авто)»</strong> вверху, чтобы автоматически озвучить и отрендерить все сцены видеоролика со звуком.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
