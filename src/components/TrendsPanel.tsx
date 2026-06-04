import React, { useState } from "react";
import { Trend, GroundingSource } from "../types";
import { TrendingUp, RefreshCw, Search, ExternalLink, Sparkles, AlertCircle } from "lucide-react";

interface Props {
  niche: string;
  setNiche: (n: string) => void;
  trends: Trend[];
  sources: GroundingSource[];
  isLoading: boolean;
  onFetchTrends: () => void;
  onSelectTrend: (trendTitle: string) => void;
  apiMessage?: string;
}

export default function TrendsPanel({
  niche,
  setNiche,
  trends,
  sources,
  isLoading,
  onFetchTrends,
  onSelectTrend,
  apiMessage
}: Props) {
  const [tempNiche, setTempNiche] = useState(niche);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNiche(tempNiche);
    // Trigger re-fetch when niche confirmed
    onFetchTrends();
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 id="trends-header" className="text-xl font-bold font-sans text-slate-100 flex items-center gap-2">
              SEO & Тренды Маркетинга
              <Sparkles size={16} className="text-violet-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Поиск актуальных инфоповодов с веб-заземлением Google Search</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            id="niche-input"
            type="text"
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:border-violet-500 focus:outline-none placeholder-slate-500 font-sans transition-all"
            placeholder="Ниша (например: B2B Маркетинг, AI Лидогенерация, Реклама...)"
            value={tempNiche}
            onChange={(e) => setTempNiche(e.target.value)}
          />
        </div>
        <button
          id="fetch-trends-btn"
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-sans text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          <span>{isLoading ? "Поиск..." : "Анализировать"}</span>
        </button>
      </form>

      {apiMessage && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-violet-950/20 border border-violet-800/30 mb-6">
          <AlertCircle size={15} className="text-violet-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-violet-300 font-mono leading-relaxed">{apiMessage}</p>
        </div>
      )}

      {trends.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-400 text-sm font-sans">Введите нишу или нажмите "Анализировать" для загрузки трендов</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trends.map((trend, index) => (
              <div
                key={index}
                className="group relative bg-slate-950/40 border border-slate-800/60 hover:border-violet-500/50 rounded-xl p-5 hover:bg-slate-950/80 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-mono text-[10px] text-violet-400 tracking-wider">ТРЕНД #{index + 1}</span>
                  <button
                    id={`create-script-trend-${index}`}
                    onClick={() => onSelectTrend(trend.title)}
                    className="text-xs bg-slate-800/50 hover:bg-violet-600 hover:text-white px-2.5 py-1 text-slate-300 font-sans rounded-lg font-medium transition-all cursor-pointer"
                  >
                    По этому тренду
                  </button>
                </div>
                
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-violet-300 transition-colors font-sans leading-snug">
                  {trend.title}
                </h3>
                
                <p className="text-xs text-slate-400 font-sans mt-2 mb-3.5 leading-relaxed">
                  {trend.description}
                </p>

                <div className="border-t border-slate-800/80 pt-3 mt-3">
                  <p className="text-[10px] text-slate-500 font-sans uppercase font-semibold">Ваш угол подачи (Лид-магнит / B2B):</p>
                  <p className="text-xs text-indigo-300 font-sans italic mt-1 leading-relaxed">
                    {trend.keyInsight}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {trend.seoTags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-sans"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {sources.length > 0 && (
            <div className="border-t border-slate-800/80 pt-4 mt-6">
              <h4 className="text-[11px] font-mono uppercase text-slate-500 tracking-wider mb-2.5">Заземленные источники новостей (Google Search):</h4>
              <div className="flex flex-wrap gap-3">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-all font-sans bg-indigo-950/20 px-3 py-1 rounded-lg border border-indigo-500/10"
                  >
                    <span>{source.title}</span>
                    <ExternalLink size={12} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
