import React, { useState } from "react";
import { AnalyticsMetric } from "../types";
import { BarChart3, Youtube, Instagram, Send, Sparkles, TrendingUp, Users, Award, Calendar, ExternalLink } from "lucide-react";

interface Props {
  agencyName: string;
}

export default function AnalyticsPanel({ agencyName }: Props) {
  const [activeChannel, setActiveChannel] = useState<'all' | 'youtube' | 'instagram' | 'telegram'>('all');

  // Simulated metrics of automated campaigns over 7 days in 2026
  const data: AnalyticsMetric[] = [
    { day: "Пн", youtubeViews: 12000, instagramViews: 15400, telegramViews: 4500, leadsGenerated: 8, retentionRate: 52 },
    { day: "Вт", youtubeViews: 14500, instagramViews: 18200, telegramViews: 5200, leadsGenerated: 12, retentionRate: 55 },
    { day: "Ср", youtubeViews: 19000, instagramViews: 22405, telegramViews: 6100, leadsGenerated: 19, retentionRate: 64 },
    { day: "Чт", youtubeViews: 16200, instagramViews: 20100, telegramViews: 5800, leadsGenerated: 15, retentionRate: 58 },
    { day: "Пт", youtubeViews: 22000, instagramViews: 28540, telegramViews: 8200, leadsGenerated: 26, retentionRate: 68 },
    { day: "Сб", youtubeViews: 25000, instagramViews: 32100, telegramViews: 9500, leadsGenerated: 31, retentionRate: 72 },
    { day: "Вс", youtubeViews: 28400, instagramViews: 36700, telegramViews: 11200, leadsGenerated: 38, retentionRate: 75 }
  ];

  // Calculated KPI aggregates
  const totalYt = data.reduce((a, b) => a + b.youtubeViews, 0);
  const totalIg = data.reduce((a, b) => a + b.instagramViews, 0);
  const totalTg = data.reduce((a, b) => a + b.telegramViews, 0);
  const totalLeads = data.reduce((a, b) => a + b.leadsGenerated, 0);

  const getViewsByChannel = (metric: AnalyticsMetric) => {
    if (activeChannel === 'youtube') return metric.youtubeViews;
    if (activeChannel === 'instagram') return metric.instagramViews;
    if (activeChannel === 'telegram') return metric.telegramViews;
    return metric.youtubeViews + metric.instagramViews + metric.telegramViews;
  };

  const maxVal = Math.max(...data.map(item => getViewsByChannel(item))) * 1.15;

  const simulatedLeads = [
    { name: "Сергей Кравцов", company: "FinTech Group, CEO", source: "YouTube Short", type: "Аудит Сквозного Маркетинга", date: "Сегодня, 11:42", status: "В кадровом скоринге" },
    { name: "Анна Ланская", company: "EdTech Academy, Founder", source: "Instagram Reel", type: "Бесплатный расчет окупаемости", date: "Сегодня, 08:15", status: "Сессия назначена" },
    { name: "Игорь Морозов", company: "SaaS Dev, Маркетолог", source: "TG Story", type: "Заказ интеграции цифрового двойника", date: "Вчера, 17:34", status: "Передан менеджеру" }
  ];

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 id="analytics-header" className="text-xl font-bold font-sans text-slate-100">Аналитика Эффективности Контента</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">Данные по вовлечению цифрового двойника и лидам для {agencyName}</p>
          </div>
        </div>

        {/* Channel filter toggles */}
        <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            id="analytics-filter-all"
            onClick={() => setActiveChannel('all')}
            className={`px-2.5 py-1 rounded-lg font-sans transition-all cursor-pointer ${
              activeChannel === 'all' ? "bg-violet-600 font-medium text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Все
          </button>
          <button
            id="analytics-filter-youtube"
            onClick={() => setActiveChannel('youtube')}
            className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all flex items-center gap-1 cursor-pointer ${
              activeChannel === 'youtube' ? "bg-red-600/30 text-rose-300 border border-rose-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Youtube size={12} />
            Yt
          </button>
          <button
            id="analytics-filter-instagram"
            onClick={() => setActiveChannel('instagram')}
            className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all flex items-center gap-1 cursor-pointer ${
              activeChannel === 'instagram' ? "bg-pink-600/30 text-pink-300 border border-pink-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Instagram size={12} />
            Ig
          </button>
          <button
            id="analytics-filter-telegram"
            onClick={() => setActiveChannel('telegram')}
            className={`px-2.5 py-1 rounded-lg text-xs font-sans transition-all flex items-center gap-1 cursor-pointer ${
              activeChannel === 'telegram' ? "bg-sky-600/30 text-sky-300 border border-sky-500/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send size={12} />
            Tg
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Общие Просмотры</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-slate-200 font-sans">
              {((totalYt + totalIg + totalTg) / 1000).toFixed(1)}K
            </h3>
            <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-0.5">
              <TrendingUp size={10} /> +18.4%
            </span>
          </div>
          <p className="text-[9px] text-slate-500">За последние 7 дней активности</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Лиды в {agencyName}</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-violet-400 font-sans">{totalLeads} контрактов</h3>
            <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-0.5">
              +32%
            </span>
          </div>
          <p className="text-[9px] text-slate-500">Авто-квалифицированные лиды</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Среднее Удержание </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-slate-200 font-sans">64.3%</h3>
            <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-0.5">
              +4.8%
            </span>
          </div>
          <p className="text-[9px] text-slate-500">Успех удержания внимания</p>
        </div>

        <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Экономия бюджета</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-bold text-slate-200 font-sans">₽154,000</h3>
            <span className="text-[10px] text-indigo-400 font-sans font-bold flex items-center gap-0.5">
              100% авто
            </span>
          </div>
          <p className="text-[9px] text-slate-500">Без привлечения монтажеров</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Graph representation: 7 days trends */}
        <div className="lg:col-span-8 bg-slate-950/20 border border-slate-800/60 p-5 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
              <TrendingUp size={14} className="text-violet-400" />
              График динамики вовлечения (просмотры в день)
            </h3>
            <div className="flex gap-3 text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> YouTube</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Instagram</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Telegram</span>
            </div>
          </div>

          {/* Interactive SVG Curve chart representing views */}
          <div className="h-[200px] w-full relative">
            <svg viewBox="0 0 700 200" className="w-full h-full text-slate-500" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="#1e293b" strokeDasharray="3 3" />

              {/* Curve of Selected Channel */}
              {activeChannel === 'all' || activeChannel === 'youtube' ? (
                <path
                  d={`M 10,${180 - (data[0].youtubeViews / maxVal) * 150} 
                     L 115,${180 - (data[1].youtubeViews / maxVal) * 150} 
                     L 225,${180 - (data[2].youtubeViews / maxVal) * 150} 
                     L 335,${180 - (data[3].youtubeViews / maxVal) * 150} 
                     L 445,${180 - (data[4].youtubeViews / maxVal) * 150} 
                     L 555,${180 - (data[5].youtubeViews / maxVal) * 150} 
                     L 680,${180 - (data[6].youtubeViews / maxVal) * 150}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
              ) : null}

              {activeChannel === 'all' || activeChannel === 'instagram' ? (
                <path
                  d={`M 10,${180 - (data[0].instagramViews / maxVal) * 150} 
                     L 115,${180 - (data[1].instagramViews / maxVal) * 150} 
                     L 225,${180 - (data[2].instagramViews / maxVal) * 150} 
                     L 335,${180 - (data[3].instagramViews / maxVal) * 150} 
                     L 445,${180 - (data[4].instagramViews / maxVal) * 150} 
                     L 555,${180 - (data[5].instagramViews / maxVal) * 150} 
                     L 680,${180 - (data[6].instagramViews / maxVal) * 150}`}
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
              ) : null}

              {activeChannel === 'all' || activeChannel === 'telegram' ? (
                <path
                  d={`M 10,${180 - (data[0].telegramViews / maxVal) * 150} 
                     L 115,${180 - (data[1].telegramViews / maxVal) * 150} 
                     L 225,${180 - (data[2].telegramViews / maxVal) * 150} 
                     L 335,${180 - (data[3].telegramViews / maxVal) * 150} 
                     L 445,${180 - (data[4].telegramViews / maxVal) * 150} 
                     L 555,${180 - (data[5].telegramViews / maxVal) * 150} 
                     L 680,${180 - (data[6].telegramViews / maxVal) * 150}`}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="3"
                  className="transition-all duration-500"
                />
              ) : null}

              {/* Interactive Circles / Anchors */}
              {data.map((item, idx) => {
                const xVal = idx === 0 ? 10 : idx === 1 ? 115 : idx === 2 ? 225 : idx === 3 ? 335 : idx === 4 ? 445 : idx === 5 ? 555 : 680;
                const valueOfChannel = getViewsByChannel(item);
                const yVal = 180 - (valueOfChannel / maxVal) * 150;
                
                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={xVal} cy={yVal} r="5" fill="#a78bfa" className="transition-all hover:r-7" />
                    <circle cx={xVal} cy={yVal} r="10" fill="#a78bfa" fillOpacity="0.15" />
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between px-2 pt-2 text-[10px] font-mono text-slate-500">
              {data.map((item, idx) => (
                <span key={idx}>{item.day}</span>
              ))}
            </div>
          </div>
        </div>

        {/* B2B CRM Pipeline panel in col-4 */}
        <div className="lg:col-span-4 bg-slate-950/20 border border-slate-800/60 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
            <Users size={14} className="text-emerald-400" />
            Входящие Лиды из видео
          </h3>

          <div className="space-y-3.5 max-h-[220px] overflow-y-auto">
            {simulatedLeads.map((lead, idx) => (
              <div key={idx} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-bold text-slate-200 leading-none">{lead.name}</h4>
                  <span className="text-[8px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                    {lead.source}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-none">{lead.company}</p>
                
                <div className="border-t border-slate-800/60 pt-2 mt-1.5 flex justify-between items-center text-[9px]">
                  <span className="text-violet-300 font-sans italic">{lead.type}</span>
                  <span className="text-emerald-400 font-mono font-medium">{lead.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
