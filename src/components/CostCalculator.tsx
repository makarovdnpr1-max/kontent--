import React, { useState } from "react";
import { DollarSign, Award, ArrowRight, TrendingUp, Sliders, Settings2, HelpCircle } from "lucide-react";

export default function CostCalculator() {
  const [videoCount, setVideoCount] = useState(30); // videos per month
  const [freelancerWage, setFreelancerWage] = useState(1500); // rubles per edited video

  // Calculations
  const traditionalCost = (videoCount * freelancerWage) + 20000 + 15000; // salary + rent + writer
  const aiCost = Math.round((videoCount * 25) + 3500); // 25 rubles in tokens per video + VPS automation subscription
  const savings = traditionalCost - aiCost;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
          <DollarSign size={20} />
        </div>
        <div>
          <h2 id="costs-header" className="text-xl font-bold font-sans text-slate-100">Расчет Стоимости & Окупаемости</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Сравнение бюджетов: Студийный монтаж vs Автоматический Контент-завод</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Comparison Tables (Col-7) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Сравнительная калькуляция себестоимости:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Traditional Production Card */}
            <div className="bg-slate-950/50 border border-red-950/30 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-red-950/20 pb-2">
                <span className="text-xs font-bold text-red-400 font-sans uppercase">Классическая Студия</span>
                <span className="text-xs font-mono text-slate-400">Люди + Аренда</span>
              </div>
              
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                <li className="flex justify-between">
                  <span>Сценарист (написание SEO-тем):</span>
                  <span className="text-slate-400">~₽15,000 / мес</span>
                </li>
                <li className="flex justify-between">
                  <span>Монтажер коротких видео:</span>
                  <span className="text-slate-400">~₽45,000 / мес</span>
                </li>
                <li className="flex justify-between">
                  <span>Аренда студии, света, камер:</span>
                  <span className="text-slate-400">~₽20,000 / мес</span>
                </li>
                <li className="flex justify-between font-bold border-t border-slate-800/80 pt-2 text-red-300">
                  <span>Итого под ключ:</span>
                  <span>~₽{traditionalCost.toLocaleString()} ₽/мес</span>
                </li>
              </ul>
            </div>

            {/* AI Automated Content Factory Card */}
            <div className="bg-slate-950/80 border border-emerald-950/60 rounded-xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-center border-b border-emerald-950/40 pb-2">
                <span className="text-xs font-bold text-emerald-400 font-sans uppercase flex items-center gap-1">
                  AI Контент-завод
                  <Award size={12} />
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono uppercase">Рекомендуем</span>
              </div>
              
              <ul className="space-y-2 text-xs font-sans text-slate-300">
                <li className="flex justify-between">
                  <span>Токены Gemini API (сценарий + TTS):</span>
                  <span className="text-slate-400">~₽1,500 / мес</span>
                </li>
                <li className="flex justify-between">
                  <span>Отрисовка Imagen / Изображения:</span>
                  <span className="text-slate-400">~₽1,200 / мес</span>
                </li>
                <li className="flex justify-between">
                  <span>Интеграция кросс-постинга (API):</span>
                  <span className="text-slate-400">~₽2,000 / мес</span>
                </li>
                <li className="flex justify-between font-bold border-t border-slate-800/80 pt-2 text-emerald-400">
                  <span>Итого под ключ:</span>
                  <span>~₽{aiCost.toLocaleString()} ₽/мес</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/10 rounded-xl border border-indigo-500/15 space-y-2">
            <h4 className="text-xs font-bold text-slate-200">Как устроена система кросс-постинга?</h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Монтажный скрипт выгружает собранные сцены (видеодорожку с озвучкой цифрового двойника + SRT субтитры) на 
              защищенный облачный сервер/диск, откуда через API интеграцию (Webhooks / Telegram Bot API / Meta Graph API / YouTube API) 
              видеоролики автоматически публикуются по заданному таймлайну каждый день в Instagram Reels, YouTube Shorts и TG Stories без Вашего ручного участия.
            </p>
          </div>
        </div>

        {/* Interactive Slider Tool (Col-5) */}
        <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
              <Sliders size={14} className="text-violet-400" />
              Калькулятор окупаемости B2B
            </h3>

            {/* Slider 1: Videos Count */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Количество видео в месяц:</span>
                <span className="font-bold font-mono text-violet-400">{videoCount} видео</span>
              </div>
              <input
                id="slider-video-count"
                type="range"
                min="5"
                max="90"
                step="5"
                value={videoCount}
                onChange={(e) => setVideoCount(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <span className="block text-[10px] text-slate-500">Автопубликация: {(videoCount / 30).toFixed(1)} ролика в день</span>
            </div>

            {/* Slider 2: Average Freelancer Cost */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Ставка монтажника за 1 видео:</span>
                <span className="font-bold font-mono text-violet-400">{freelancerWage.toLocaleString()} ₽</span>
              </div>
              <input
                id="slider-freelancer-wage"
                type="range"
                min="500"
                max="5000"
                step="250"
                value={freelancerWage}
                onChange={(e) => setFreelancerWage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Суммарная чистая выгода:</span>
              <span className="text-base font-extrabold text-emerald-400 font-sans">₽{savings.toLocaleString()} / мес</span>
            </div>
            
            <div className="flex gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 items-center justify-center">
              <TrendingUp size={15} className="text-emerald-400" />
              <span className="text-[11px] text-emerald-300 font-sans font-bold">Окупаемость: сразу со 2-го дня интеграции!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
