import React, { useState, useEffect, useRef } from "react";
import { VideoScript, VideoScene } from "../types";
import { Play, Pause, Volume2, VolumeX, Eye, Share2, Heart, MessageSquare, RotateCcw, Sparkles } from "lucide-react";

interface Props {
  script: VideoScript | null;
  activeSceneIdx: number;
  setActiveSceneIdx: (idx: number) => void;
  lang?: string;
}

export default function VideoPlayer({ script, activeSceneIdx, setActiveSceneIdx, lang = "ru" }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // overall percentage of current scene
  const [platform, setPlatform] = useState<'youtube' | 'instagram' | 'telegram'>('instagram');

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const sceneTimerRef = useRef<number | null>(null);
  const speechUttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const scenes = script?.scenes || [];
  const currentScene = scenes[activeSceneIdx] as VideoScene | undefined;

  // Clean up audio and timers on unmount
  useEffect(() => {
    return () => {
      stopAllPlayback();
    };
  }, []);

  // Handle active scene changes during playback
  useEffect(() => {
    if (isPlaying) {
      startScenePlayback();
    }
  }, [activeSceneIdx]);

  const stopAllPlayback = () => {
    // Stop HTML Audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    // Stop HTML Speech Synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Clear Intervals & Timers
    if (sceneTimerRef.current) {
      clearTimeout(sceneTimerRef.current);
      sceneTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopAllPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (scenes.length > 0) {
        startScenePlayback();
      }
    }
  };

  const startScenePlayback = () => {
    stopAllPlayback();
    setProgress(0);
    
    if (!currentScene) return;

    const durationMs = (currentScene.duration || 10) * 1000;
    const startTime = Date.now();

    // 1. Progress bar ticking
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(pct);
    }, 100);

    // 2. Play Audio if voice url exists and not muted
    if (currentScene.voiceUrl && !isMuted) {
      const audio = new Audio(currentScene.voiceUrl);
      currentAudioRef.current = audio;
      audio.play().catch(err => {
        console.warn("HTML5 audio play blocked/failed, falling back to speech synthesis:", err);
        fallbackToSpeechSynthesis(currentScene.subtitle);
      });
    } else if (!isMuted) {
      // Direct high-fidelity native browser TTS fallback representing the digital twin
      fallbackToSpeechSynthesis(currentScene.subtitle);
    }

    // 3. Chain to next scene when current scene completes
    sceneTimerRef.current = window.setTimeout(() => {
      if (activeSceneIdx < scenes.length - 1) {
        setActiveSceneIdx(activeSceneIdx + 1);
      } else {
        // Loop back to start or pause
        setIsPlaying(false);
        stopAllPlayback();
        setActiveSceneIdx(0);
        setProgress(0);
      }
    }, durationMs);
  };

  const fallbackToSpeechSynthesis = (text: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ru" ? "ru-RU" : "en-US";
      
      // Attempt to find a native premium sounding voice match if possible
      const voicesList = window.speechSynthesis.getVoices();
      const firstTarget = voicesList.find(v => v.lang.startsWith(lang));
      if (firstTarget) utterance.voice = firstTarget;

      speechUttRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    
    // If we've muted, immediately cut off the audio/speech
    if (nextMuted) {
      if (currentAudioRef.current) currentAudioRef.current.volume = 0;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else {
      if (currentAudioRef.current) currentAudioRef.current.volume = 1;
      // Re-trigger scene speech if playing
      if (isPlaying && currentScene) {
        if (currentScene.voiceUrl) {
          if (currentAudioRef.current) {
            currentAudioRef.current.play().catch(() => {});
          }
        } else {
          fallbackToSpeechSynthesis(currentScene.subtitle);
        }
      }
    }
  };

  const handleReset = () => {
    stopAllPlayback();
    setIsPlaying(false);
    setActiveSceneIdx(0);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Platform Switcher */}
      <div className="flex gap-1.5 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl mb-4 self-center text-xs font-sans">
        <button
          id="player-platform-instagram"
          onClick={() => setPlatform('instagram')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            platform === 'instagram' ? "bg-pink-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Instagram Reels
        </button>
        <button
          id="player-platform-youtube"
          onClick={() => setPlatform('youtube')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            platform === 'youtube' ? "bg-red-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          YouTube Shorts
        </button>
        <button
          id="player-platform-telegram"
          onClick={() => setPlatform('telegram')}
          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
            platform === 'telegram' ? "bg-sky-600 text-white font-medium" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          TG Stories
        </button>
      </div>

      {/* Styled Smartphone Frame */}
      <div className="relative w-[300px] h-[533px] bg-black border-[6px] border-slate-900 rounded-[38px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col group">
        
        {/* Dynamic Scene Rendering background */}
        {currentScene ? (
          <div className="absolute inset-0 w-full h-full">
            {currentScene.mediaUrl ? (
              (currentScene.mediaUrl.toLowerCase().endsWith(".mp4") || currentScene.mediaUrl.toLowerCase().includes("video")) ? (
                <video
                  src={currentScene.mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  className="w-full h-full object-cover transition-all duration-700"
                  playsInline
                />
              ) : (
                <img
                  src={currentScene.mediaUrl}
                  alt={`Scene ${activeSceneIdx + 1}`}
                  className="w-full h-full object-cover transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
              )
            ) : (
              /* High fidelity dark space theme placeholder with animated grid */
              <div className="w-full h-full bg-gradient-to-b from-indigo-950 to-slate-950 flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-16 h-16 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-4 text-violet-400 animate-pulse">
                  <Sparkles size={24} />
                </div>
                <p className="text-xs text-slate-400 font-sans tracking-wide leading-relaxed">
                  Нажмите "Собрать сцену" или "Собрать всё" для отрисовки AI-кадра {activeSceneIdx + 1}
                </p>
                <p className="text-[10px] text-slate-500 mt-2 font-mono max-w-[200px]">
                  {currentScene.visualPrompt.substring(0, 50)}...
                </p>
              </div>
            )}
            
            {/* Ambient Dark Overlay on bottom for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-xs text-slate-500 font-sans">Создайте сценарий для запуска видео-превью</p>
          </div>
        )}

        {/* TOP OVERLAYS */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          {/* Progress timelines (Instagram style segmented bars) */}
          <div className="absolute top-0 inset-x-0 flex gap-1">
            {scenes.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100 ease-out"
                  style={{
                    width: idx === activeSceneIdx ? `${progress}%` : idx < activeSceneIdx ? "100%" : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3 w-full justify-between">
            {/* Channel logo watermark */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-600 to-pink-600 border border-white/20 text-[9px] font-bold text-white flex items-center justify-center shadow-lg uppercase">
                {script?.title?.substring(0, 2) || "AI"}
              </div>
              <span className="text-[10px] font-bold text-white drop-shadow-md tracking-wide">двойник.live</span>
            </div>
            
            <div className="text-[9px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 backdrop-blur-md">
              Scene {activeSceneIdx + 1} / {scenes.length || 1}
            </div>
          </div>
        </div>

        {/* CENTER INTERACTIVE SUBTITLES OVERLAY */}
        {currentScene && (
          <div className="absolute inset-x-4 top-[32%] z-10 text-center pointer-events-none px-2">
            <span className="inline-block bg-yellow-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xl font-sans leading-relaxed tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform">
              {currentScene.subtitle}
            </span>
          </div>
        )}

        {/* BOTTOM METADATA OVERLAY */}
        <div className="absolute bottom-4 left-4 right-14 z-10 space-y-2">
          <p className="text-xs font-bold text-white tracking-wide">
            @{script?.title ? "двойник_" + script.seoKeywords[0] : "marketing_twin"}
          </p>
          <p className="text-[10px] text-slate-200 leading-snug drop-shadow font-sans">
            {script?.title || "Автоматизированное маркетинговое видео"}
          </p>
          <div className="flex gap-1.5 overflow-x-hidden">
            {script?.seoKeywords.slice(0, 3).map((keyword, i) => (
              <span key={i} className="text-[9px] text-sky-400 font-mono tracking-wider font-semibold">
                #{keyword}
              </span>
            ))}
          </div>
        </div>

        {/* SIDE ACTIONS PANEL */}
        <div className="absolute bottom-20 right-2 z-10 flex flex-col items-center gap-4 text-white">
          <div className="flex flex-col items-center">
            <button className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-violet-600/80 transition-all cursor-pointer">
              <Heart size={16} className="text-rose-500 fill-rose-500" />
            </button>
            <span className="text-[9px] mt-1 font-mono text-slate-200 drop-shadow">1.2K</span>
          </div>

          <div className="flex flex-col items-center">
            <button className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-violet-600/80 transition-all cursor-pointer">
              <MessageSquare size={16} />
            </button>
            <span className="text-[9px] mt-1 font-mono text-slate-200 drop-shadow">42</span>
          </div>

          <div className="flex flex-col items-center">
            <button className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center hover:bg-violet-600/80 transition-all cursor-pointer">
              <Share2 size={16} />
            </button>
            <span className="text-[9px] mt-1 font-mono text-slate-200 drop-shadow">Шеринг</span>
          </div>

          <div className="w-8 h-8 rounded-full border border-white/30 overflow-hidden animate-spin mt-2 bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full" />
          </div>
        </div>

        {/* FOOTER MEDIA PLAYER CONTROL DRAWER */}
        <div className="absolute bottom-4 right-2 z-10">
          <button
            id="player-mute-btn"
            onClick={handleMuteToggle}
            className="w-9 h-9 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all"
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* MEDIA TIMELINE & PLAY BUTTON OVERLAYS */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-10 flex gap-3 items-center z-10 transition-opacity opacity-100">
          <button
            id="player-play-pause-btn"
            onClick={handlePlayPause}
            disabled={scenes.length === 0}
            className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>

          <button
            id="player-reset-btn"
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer transition-all"
            title="Перемотать на начало"
          >
            <RotateCcw size={14} />
          </button>

          {/* Quick Scene Selector dots */}
          <div className="flex-1 flex gap-1 items-center justify-end px-1">
            {scenes.map((_, sIdx) => (
              <button
                key={sIdx}
                id={`player-goto-scene-${sIdx}`}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                  sIdx === activeSceneIdx ? "bg-violet-500 w-4" : "bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => {
                  stopAllPlayback();
                  setActiveSceneIdx(sIdx);
                  setProgress(0);
                  if (isPlaying) {
                    setTimeout(() => startScenePlayback(), 100);
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
