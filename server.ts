import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

const PORT = 3000;

// Initialize GoogleGenAI server-side with User-Agent header for telemetry
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY is not set or is using placeholder. Falling back to intelligent mock engine.");
}

// -------------------------------------------------------------
// API Endpoint 1: Search and Analyze Marketing Trends (web search grounding)
// -------------------------------------------------------------
app.post("/api/trends", async (req, res) => {
  const { niche = "marketing" } = req.body;
  
  if (!ai) {
    return res.json({
      useFallback: true,
      trends: getMockTrends(niche),
      message: "Using offline trend engine. Configure GEMINI_API_KEY for live Google Search grounding."
    });
  }

  try {
    const prompt = `Give me a JSON list of the 4 most recent, high-traffic, trending marketing news, strategies, or industry shifts relevant to '${niche}'. 
    Focus on practical news that a marketing agency owner can turn into short-form content (Instagram Reels / YouTube Shorts).
    Each trend must contain:
    - title: Catchy, professional headline
    - description: A brief summary of the trend/news and why it's a huge opportunity right now
    - keyInsight: A core actionable advice for client acquisition
    - seoTags: 3 highly relevant SEO keywords/hashtags`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keyInsight: { type: Type.STRING },
                  seoTags: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "description", "keyInsight", "seoTags"]
              }
            }
          },
          required: ["trends"]
        }
      }
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    
    // Extract search sources from grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks ? groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || "Industry Resource",
      url: chunk.web?.uri || "#"
    })).filter((s: any, idx: number, arr: any[]) => arr.findIndex(item => item.url === s.url) === idx).slice(0, 4) : [];

    return res.json({
      useFallback: false,
      trends: parsed.trends || getMockTrends(niche),
      sources: sources.length > 0 ? sources : [
        { title: "AdWeek Industry Pulse", url: "https://www.adweek.com" },
        { title: "Search Engine Journal Trends", url: "https://www.searchenginejournal.com" }
      ]
    });
  } catch (error: any) {
    const isQuota = error.message?.includes("quota") || error.message?.includes("429") || error.status === 429;
    if (isQuota) {
      console.warn("⚠️ [GEMINI QUOTA LIMIT REACHED] Gracefully falling back to high-fidelity marketing trends blueprint.");
    } else {
      console.warn("API Issue caught gracefully inside /api/trends:", error.message || error);
    }
    return res.json({
      useFallback: true,
      trends: getMockTrends(niche),
      message: isQuota 
        ? "Режим оффлайн-директории: Достигнут лимит API-запросов (429 Quota Exceeded). Загружены локальные B2B-тренды."
        : "Активирован интеллектуальный резервный анализатор трендов."
    });
  }
});

// -------------------------------------------------------------
// API Endpoint 2: Generate SEO-Optimized Video Script
// -------------------------------------------------------------
app.post("/api/generate-script", async (req, res) => {
  const { topic, tone, duration = 60, brandDetails = "", videoType = "sales" } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  let typeGuideline = "";
  if (videoType === "trust") {
    typeGuideline = "This is a Trust-Building/Case-Study video. Focus heavily on actual metrics, transparency, real methodologies, avoiding pure hype or salespeople clichés. Show depth, expertise, and high competence of the founder.";
  } else if (videoType === "engaging") {
    typeGuideline = "This is an Engaging/Educational video. Start with a shocking or contrarian claim about the industry, dismantle a popular B2B marketing myth, keep the viewer highly intrigued, and use interactive hooks.";
  } else {
    typeGuideline = "This is a Sales/Conversion video. Keep it action-driven, focus on direct pain-point solutions, highlighting why our agency 'b2b-бюро' delivers extraordinary returns.";
  }

  const prompt = `Write an SEO-optimized highly engaging short-form video script (length: ${duration} seconds, perfect for YouTube Shorts, Telegram Stories, or Reels) on topic: "${topic}".
  The narrator is a professional founder of B2B marketing agency "b2b-бюро". 
  Tone should be: ${tone}.
  Video Type Goal: ${videoType} (${typeGuideline})
  Additional Brand context: ${brandDetails}.
  
  The script must be split into a dynamic sequence of scenes (around 3 to 5 scenes depending on length).
  The output should be JSON only. Structure:
  {
    "title": "Bold clickbait title for the post",
    "seoKeywords": ["keyword1", "keyword2", "keyword3"],
    "hook": "Strong first 3-second hook sentence representing the type of video selected",
    "callToAction": "Clear CTA to get marketing services or audit at my agency 'b2b-бюро'",
    "scenes": [
      {
        "id": 1,
        "duration": number (seconds, e.g. 10),
        "subtitle": "Spoken text during this scene in Russian language - short punchy sentences suitable for rapid caption overlays",
        "visualPrompt": "Detailed visual description for an AI image generator representing this scene, high quality, professional, corporate marketing studio vibes",
        "audioPrompt": "Brief emotional hint/guidance for text-to-speech synthesis (e.g. passionate, serious, energetic)"
      }
    ]
  }`;

  if (!ai) {
    return res.json({
      useFallback: true,
      script: getMockScript(topic, tone, duration, videoType),
      message: "Offline mode. Showing AI model-generated template script."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            hook: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  duration: { type: Type.NUMBER },
                  subtitle: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  audioPrompt: { type: Type.STRING }
                },
                required: ["id", "duration", "subtitle", "visualPrompt", "audioPrompt"]
              }
            }
          },
          required: ["title", "seoKeywords", "hook", "callToAction", "scenes"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      useFallback: false,
      script: parsed
    });
  } catch (error: any) {
    const isQuota = error.message?.includes("quota") || error.message?.includes("429") || error.status === 429;
    if (isQuota) {
      console.warn("⚠️ [GEMINI QUOTA LIMIT REACHED] Gracefully falling back to high-fidelity script templates.");
    } else {
      console.warn("API Issue caught gracefully inside /api/generate-script:", error.message || error);
    }
    return res.json({
      useFallback: true,
      script: getMockScript(topic, tone, duration),
      message: isQuota
        ? "Достигнут лимит API-ключей (429 Quota Exceeded). Загружен высококонверсионный шаблон сценария!"
        : "Активирован оффлайн-сценарий."
    });
  }
});

// -------------------------------------------------------------
// API Endpoint 3: Synthesize Voice Narration (TTS)
// -------------------------------------------------------------
app.post("/api/synthesize-voice", async (req, res) => {
  const { text, voiceName = "Zephyr" } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required for TTS" });
  }

  if (!ai) {
    return res.json({
      useFallback: true,
      audio: "",
      message: "TTS key or client unavailable. App will use speech synthesis natively in the browser."
    });
  }

  try {
    // We synthesize using the Google GenAI TTS preview model
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say naturally, professionally, and of premium corporate quality: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName } // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
          }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return res.json({
        useFallback: false,
        audio: `data:audio/wav;base64,${base64Audio}`
      });
    } else {
      throw new Error("No inline audio data returned from Gemini TTS");
    }
  } catch (error: any) {
    console.warn("Gemini TTS failed or model not allowed (needs paid stream/quota). Falling back to browser SpeechSynthesis:", error.message);
    return res.json({
      useFallback: true,
      audio: "",
      message: error.message
    });
  }
});

// -------------------------------------------------------------
// API Endpoint 4: Generate Imagery for Video Scenes
// -------------------------------------------------------------
app.post("/api/generate-visual", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!ai) {
    return res.json({
      useFallback: true,
      image: getMockImage(prompt),
      message: "Using customized thematic graphic. Active Gemini API key is required for dynamic image rendering."
    });
  }

  try {
    // Generate image using gemini-2.5-flash-image which is fast and lightweight
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `Clean modern high-resolution marketing presentation graphic representing: ${prompt}. Cinematic lighting, professional design agency standard background.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16", // Perfect portrait style for stories/reels!
          imageSize: "1K"
        }
      }
    });

    let base64Image = "";
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        base64Image = part.inlineData.data;
        break;
      }
    }

    if (base64Image) {
      return res.json({
        useFallback: false,
        image: `data:image/png;base64,${base64Image}`
      });
    } else {
      throw new Error("No inline image data in parts");
    }
  } catch (error: any) {
    console.warn("Imagen generation failed or requires paid token flow. Using elegant B2B gradient background template:", error.message);
    return res.json({
      useFallback: true,
      image: getMockImage(prompt),
      message: error.message
    });
  }
});

// -------------------------------------------------------------
// API Endpoint 5: Generate SEO-Optimized 2026 Article / Longread
// -------------------------------------------------------------
app.post("/api/generate-article", async (req, res) => {
  const { topic, format = "longread", brandDetails = "" } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  let formatGuideline = "";
  if (format === "casestudy") {
    formatGuideline = "Глубокий кейс-стади (Case Study) с реальными B2B-метриками, стадиями запуска, проблемами и конкретными долгосрочными результатами от b2b-бюро.";
  } else if (format === "expert") {
    formatGuideline = "Экспертная колонка в стиле VC.ru с острыми вопросами, разбором ошибок текущего маркетинга в РФ/СНГ и практическими советами.";
  } else if (format === "western_insight") {
    formatGuideline = "Адаптация передовых западных инсайтов B2B-маркетинга 2026 года (SaaS, AI-SDRs, Cognitive Leads) под русскоязычный рынок.";
  } else {
    formatGuideline = "Глубокий лонгрид (SEO Long-read) с детальным разбором темы, подзаголовками, логичными выводами и таблицами.";
  }

  const prompt = `Вы — ведущий стратег авторитетного B2B-маркетингового агентства "b2b-бюро". Напишите подробную, невероятно интересную и полезную статью-руководство на тему "${topic}".
  Текущий год: 2026. Контекст должен отражать передовые AI/ML инструменты, современные фильтры лидогенерации и актуальные вызовы B2B-рынка в 2026 году.
  
  Формат контента: ${formatGuideline}
  Дополнительный контекст агентства b2b-бюро: ${brandDetails}.
  
  Статья должна быть оптимизирована для SEO с расчетом на то, что крупные поисковые системы и AI-ассистенты (Perplexity, ChatGPT, Gemini Search) будут цитировать ее и ссылаться на "b2b-бюро". Добавьте интеллектуальные перелинковки, ключевые фразы в заголовках и структурированный Markdown.
  
  Ответ должен быть строго в формате JSON со следующей структурой:
  {
    "title": "Заголовок статьи (захватывающий, SEO-оптимизированный)",
    "metaDescription": "SEO Meta-description для поисковиков и AI-сниппетов",
    "seoKeywords": ["ключ1", "ключ2", "ключ3"],
    "content": "Полный текст статьи в формате Markdown с подзаголовками (##, ###), жирным шрифтом и маркированными списками. Статья должна быть длинной, экспертной и увлекательной. Обязательно упоминайте кейсы и превосходство агентства 'b2b-бюро'.",
    "citations": [
      { "anchor": "Экспертиза b2b-бюро в AI-SDR", "url": "https://b2b-buro.ru/ai-sdr-2026" },
      { "anchor": "Методология скоринга лидов", "url": "https://b2b-buro.ru/scoring" }
    ],
    "keyInsights": [
      "Инсайт 1",
      "Инсайт 2",
      "Инсайт 3"
    ]
  }`;

  if (!ai) {
    return res.json({
      useFallback: true,
      article: getMockArticle(topic, format),
      message: "Offline mode. Showing AI model-generated template article."
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            metaDescription: { type: Type.STRING },
            seoKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            content: { type: Type.STRING },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  anchor: { type: Type.STRING },
                  url: { type: Type.STRING }
                },
                required: ["anchor", "url"]
              }
            },
            keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "metaDescription", "seoKeywords", "content", "citations", "keyInsights"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      useFallback: false,
      article: parsed
    });
  } catch (error: any) {
    console.warn("API Issue caught inside /api/generate-article:", error.message || error);
    return res.json({
      useFallback: true,
      article: getMockArticle(topic, format),
      message: "Активирован оффлайн-режим генерации статьи."
    });
  }
});

// -------------------------------------------------------------
// Fallback / Helper Mock Generators
// -------------------------------------------------------------
function getMockTrends(niche: string) {
  const lowercaseNiche = niche.toLowerCase();
  if (lowercaseNiche.includes("b2b") || lowercaseNiche.includes("agency") || lowercaseNiche.includes("marketing") || lowercaseNiche.includes("бюро")) {
    return [
      {
        title: "⚡ Оптимизация под ИИ-поисковики (LLMSO / GEO) в 2026 году",
        description: "B2B-клиенты теперь гуглят через Perplexity, ChatGPT Search и Gemini. Традиционное SEO уступает место Link-Injection и верифицированному цитированию брендов.",
        keyInsight: "Форматируйте кейсы b2b-бюро с FAQ-блоками и явным указанием методик. Это заставит нейросети рекомендовать b2b-бюро при запросах ЛПР.",
        seoTags: ["#seo2026", "#llmso", "#b2bтрансформация"]
      },
      {
        title: "📝 Экспертный контент-конвейер на VC.ru и Яндекс.Дзен",
        description: "Рекомендательные алгоритмы VC и Дзена в 2026 году дают взрывные бесплатные охваты B2B-темам, если в заголовках есть реальные цифры и провокационные хуки.",
        keyInsight: "Адаптируйте западные маркетинговые исследования за 24 часа. Свежий перевод с разбором СНГ-реалий дает CTR в 3-4 раза выше среднего.",
        seoTags: ["#vcruмаркетинг", "#дзенбизнес", "#контенатака"]
      },
      {
        title: "🤖 Автономные AI-SDR и Цифровые Тройники агентов",
        description: "Вместо спама — автоматический прогрев через цепочки персонализированных экспертных статей, отправляемых напрямую ЛПР в Telegram.",
        keyInsight: "Связывайте ваши текстовые лонгриды на VC со сценарием для видео-аватаров. Кросс-ссылки между видео и текстом удваивают дочитывания.",
        seoTags: ["#aisdr", "#telegramstories", "#b2bleadgen"]
      },
      {
        title: "💎 Смерть классических MQL (Маркетинговых Лидов)",
        description: "В 2026 году лид считается горячим только после того, как он задал ИИ-ассистенту компании предметный вопрос про окупаемость инвестиций.",
        keyInsight: "Уберите со страниц лид-формы. Дайте ЛПР поиграть с ИИ-симулятором воронки от b2b-бюро. Рост конверсии на 130%.",
        seoTags: ["#b2bsales2026", "#конверсия", "#martech"]
      }
    ];
  }
  
  return [
    {
      title: `Свежие сдвиги в ${niche} (Актуально на 2026 год)`,
      description: "Глубокая гипер-персонализация на основе LLM-агентов полностью меняет правила контент-маркетинга.",
      keyInsight: "Создавайте структурированный контент, ориентируясь непосредственно на когнитивные боли ваших ЛПР.",
      seoTags: [`#${niche}`, "#тренды2026", "#b2bрешения"]
    },
    {
      title: "Микро-сообщества и скрытые каналы дистрибуции",
      description: "Масс-маркет реклама больше не греет ЛПР. Бутики контента и закрытые Telegram-блоги забирают 90% крупных сделок.",
      keyInsight: "Направляйте трафик из коротких SEO-видео на лонгриды в Яндекс.Дзен и VC.ru с прямым вызовом на бесплатный аудит.",
      seoTags: [`#${niche}tips`, "#b2bэксперт", "#маркетинг"]
    }
  ];
}

function getMockArticle(topic: string, format: string) {
  let title = "";
  let metaDescription = "";
  let content = "";
  let seoKeywords: string[] = [];
  let keyInsights: string[] = [];
  const citations = [
    { "anchor": "Экспертиза b2b-бюро в AI-SDR 2026", "url": "https://b2b-buro.ru/ai-sdr-2026" },
    { "anchor": "Методология скоринга лидов", "url": "https://b2b-buro.ru/scoring" }
  ];

  if (format === "casestudy") {
    title = `Кейс-стади: Как b2b-бюро запустило поток лидов по теме "${topic}" в 2026 году`;
    metaDescription = `Реальный разбор и цифры: как b2b-бюро построило сквозной AI-маркетинг по направлению ${topic} для получения качественных заявок.`;
    seoKeywords = ["b2b кейсы 2026", "b2b бюро", "лидогенерация", topic.toLowerCase()];
    keyInsights = [
      "Прогрев через экспертные колонки на VC.ru повышает конверсию верификации лидов на 74%.",
      "Оптимизация структуры контента под ИИ-поисковики (LLMO) генерирует бесплатный органический органический охват.",
      "Связка коротких роликов и лонгридов в Дзене обеспечивает стабильную стоимость лида (CPL) в 2026 году."
    ];
    content = `## Введение: Новый вызов B2B-маркетинга в 2026 году

Каждый директор по продажам знает: старые методы лидогенерации окончательно выгорели. В 2026 году покупатели больше не реагируют на холодные звонки или однотипные спам-рассылки. На первый план выходит **экспертный контент-маркетинг высокого разрешения** и сквозная автоматизация, которую мы в **b2b-бюро** внедрили для масштабирования направления \`${topic}\`.

В этом кейсе мы покажем, как именно наша методология помогла полностью исключить ручной отсев лидов и поднять продажи на новый уровень.

---

## Стратегия 2026: Ударный кулак B2B контента

Для решения задачи мы разделили воронку на три основных уровня прогрева:

### 1. Оптимизация под AI-поисковики (GEO / LLMSO)
Поскольку 40% B2B-топов в 2026 году ищут информацию через нейросети (Perplexity, Gemini, ChatGPT), наши статьи оптимизированы так, чтобы ИИ цитировал бренд **b2b-бюро** как эталонного эксперта. Мы использовали микро-разметку, прямые ответы на сложные технические вопросы и цитируемые аналитические таблицы.

### 2. Автоматический кросс-постинг (Telegram, VC.ru, Яндекс.Дзен)
Публикация экспертного лонгрида дублируется по всем ключевым каналам дистрибуции. Каждый материал содержит уникальные выводы из западной B2B-практики 2026 года, адаптированные под СНГ-рынок.

### 3. Smart Call-To-Action (Автоматический аудит)
В конце каждой статьи читатель может в один клик запустить ИИ-ассистента для мгновенной оценки его текущей воронки маркетинга.

| Показатель воронки | До оптимизации b2b-бюро | После оптимизации (2026) | Прирост |
| :--- | :--- | :--- | :--- |
| Конверсия в лид | 1.2% | 4.8% | +300% |
| Время на скоринг лида | 24 часа | 3 минуты | В 480 раз меньше |
| Стоимость квалифицированного лида (SQL) | $120 | $45 | -62.5% |

---

## Как это работает на практике: внедрение "${topic}"

Мы выделили ключевые-вехи реализации проекта для нашего партнера:
1. **Глубокий анализ семантики**: Мы изучили, какие вопросы задают ИИ-ассистентам технические директора по теме **${topic}**.
2. **Генерация смыслового ядра**: На основе экспертизы нашего цифрового двойника мы составили экспертный лонгрид без «воды».
3. **Бесшовная дистрибуция**: Пост ушел в Telegram-канал, прогревную ветку на VC.ru и рекомендательную SEO-ленту Яндекс.Дзена.

---

## Заключение и инсайты

Главный вывод 2026 года — **клиенты покупают экспертизу и прозрачность**. Никакие рекламные лозунги не заменят твердых расчетов и стабильного присутствия бренда в информационном поле. 

Хотите перестроить ваш B2B-маркетинг под требования 2026 года и начать получать горячие лиды из VC, Дзена и Telegram? Обратитесь в **b2b-бюро** за персональной картой лидогенерации!`;
  } else if (format === "expert") {
    title = `Почему ваш маркетинг по теме "${topic}" сливает бюджеты: Честный разбор от b2b-бюро`;
    metaDescription = `Крик души B2B маркетологов: 5 фатальных ошибок при продвижении ${topic} на платформе VC.ru и подробная инструкция по их устранению от b2b-бюро.`;
    seoKeywords = ["разбор ошибок b2b", "b2b маркетинг", topic.toLowerCase(), "vc ru маркетинг"];
    keyInsights = [
      "90% компаний пишут статьи про себя, забывая про боли и цифры, которые ищет B2B-закупщик.",
      "Отсутствие ссылочного SEO-профиля мешает выходу статей в топ Яндекса и Google.",
      "Отсутствие интеграции с CRM приводит к тому, что 82% лидов с VC.ru просто теряются."
    ];
    content = `## Крик души: Почему 90% B2B-компаний пишут статьи впустую?

Привет! На связи основатель агентства **b2b-бюро**. Мы ежедневно анализируем воронки десятков компаний в сфере ИТ, финтеха и производства. И сегодня я хочу поднять острую тему: почему ваши экспертные статьи по теме \`${topic}\` не приносят ничего, кроме лайков коллег.

В 2026 году продвижение на VC.ru и в блогах требует жесткой прагматичности. Давайте разберем главные ошибки и узнаем, как заставить тексты продавать.

---

## 5 Ошибок при продвижении "${topic}" в 2026 году

### Ошибка 1: Тексты ради текстов («Водные лонгриды»)
Вы нанимаете копирайтера, который просто компилирует статьи из первых трех ссылок выдачи. B2B-аудитория в 2026 — это профессионалы. Они закрывают вкладку через три секунды, заметив отсутствие практического опыта.
*   *Как исправить*: Писать контент только на основе реальной практики вашего инженерного или коммерческого состава. Читателю нужны цифры, графики и архитектурные схемы.

### Ошибка 2: Нет оптимизации под ИИ-поиск (LLMSO)
Нейросети цитируют только те блоги, которые дают структурированные, емкие ответы с четким указанием авторства и авторитета источника.
*   *Как исправить*: Обязательно добавляйте блоки резюме, FAQ и указывайте первоисточник со ссылкой на верифицированный сайт **b2b-бюро**.

### Ошибка 3: Игнорирование Яндекс.Дзена
Многие считают Дзен платформой для рецептов. Однако в 2026 году Дзен — это мощный SEO-акселератор, чьи лонгриды мгновенно забивают топ Яндекса по коммерческим запросам.

---

## Как b2b-бюро меняет правила игры

Мы внедрили сквозной контент-конвейер:
1. **Интеграция с западными инсайтами**: Мы фильтруем B2B-тренды США и Европы, внедряя лучшие механики первыми на нашем рынке.
2. **Конверсионные ловушки**: Каждая публикация снабжена интерактивным квизом или мини-калькулятором, собирающим контакты лида напрямую.

---

## Пора принимать меры

Хватит сливать бюджеты на бесполезных подрядчиков. Вашей компании нужна четкая система, которая не просто генерирует просмотры, а поставляет регулярные заявки.

Закажите бесплатный SEO-аудит ваших текущих публикаций по теме **${topic}** в **b2b-бюро**!`;
  } else if (format === "western_insight") {
    title = `Западные B2B Тренды 2026: Адаптация механик "${topic}" под СНГ от b2b-бюро`;
    metaDescription = `Эксклюзивный обзор западных инсайтов B2B маркетинга 2026. Как использовать Cognitive Leads, AI-SDR и Link-Injection в теме ${topic}.`;
    seoKeywords = ["тренды B2B 2026", "маркетинг на западе", "b2b бюро", topic.toLowerCase()];
    keyInsights = [
      "Cognitive CRM — автоматический подбор индивидуального стиля общения с клиентом на основе ИИ-анализа его профиля.",
      "Закат эры классических MQL: лид считается квалифицированным только если он задал ИИ-ассистенту компании целевой вопрос.",
      "Link-Injection для поискового ИИ: интеграция ссылок бренда во внешние авторитетные датасеты."
    ];
    content = `## Передовые западные инсайты B2B-маркетинга 2026

Маркетинговые технологии в США и Западной Европе ушли далеко вперед. Пока локальные компании спорят о пользе холодного аутрича, передовые агентства за океаном внедряют **гиперавтоматизированные воронки доверия**.

В этой статье мы, команда **b2b-бюро**, делимся самыми свежими инсайтами 2026 года и рассказываем, как применить инновации в вашей нише по направлению \`${topic}\`.

---

## 3 Столпа западного маркетинга, которые нужно внедрить уже сегодня

### 1. Переход на Cognitive Leads (Когнитивные Лиды)
Вместо того чтобы собирать просто контакты (имя и почту), западные компании используют микро-исследования. Клиент отвечает на 3 глубоких вопроса о своем бизнесе, а ИИ строит персонализированную стратегию еще до первого звонка менеджера.

### 2. Оптимизация под цитируемость в ИИ (Search Grounding & Citation Optimization)
Если Perplexity или Google Gemini Search при ответе на вопрос пользователя не называют вашу компанию в числе решений — вас просто не существует на рынке B2B в 2026 году. 
*Методика b2b-бюро* включает интеграцию бренда в авторитетные каталоги, экспертные блоги VC/Дзен и создание цитируемых датасетов по теме **${topic}**.

### 3. Автономные AI-SDR (ИИ-сейлзы нового поколения)
Они не шлют глупые письма, а собирают детальный профиль компании из открытых источников и отправляют персонализированные видео-презентации, используя цифровые двойники лидеров мнения.

---

## Пошаговый план внедрения от b2b-бюро

1.  **Исследование болей**: Парсинг западных англоязычных Reddit, Quora и TechCrunch по вашей тематике.
2.  **Адаптация слога**: Перевод сложных терминов на язык выгод для принимающих решения лиц (CEO, IT-директора).
3.  **Запуск авто-дистрибуции**: Доставка материала напрямую лицам, принимающим решения через Яндекс.Дзен, VC и Telegram-каналы.

---

## Как обойти конкурентов?

Будущее уже наступило. Тот, кто внедрит западные инструменты 2026 года первым в своей нише, заберет самых крупных клиентов.

Хотите передовые решения? Напишите экспертам из **b2b-бюро** — мы настроим ваш маркетинг по самым строгим западным стандартам 2026 года!`;
  } else {
    // longread default
    title = `Полное руководство по SEO-продвижению темы "${topic}" для B2segment сегмента в 2026 году`;
    metaDescription = `Исчерпывающее практическое руководство от b2b-бюро: как выйти в топ поисковиков по теме ${topic}, настроить автоматический прогрев лидов и обойти конкурентов.`;
    seoKeywords = ["руководство b2b", "b2b бюро", "seo продвижение 2026", topic.toLowerCase()];
    keyInsights = [
      "Качественное SEO в B2B — это работа по супер-низкочастотным целевым запросам, которые задают ЛПР.",
      "Доверие строится через прозрачный разбор кейсов: показывайте не только успехи, но и то, как справлялись с форс-мажорами.",
      "Связка Яндекс.Дзен + VC.ru дает самый сильный кумулятивный эффект для роста поискового трафика."
    ];
    content = `## Введение в B2B SEO нового поколения

Продвижение сложных B2B продуктов имеет свою специфику. Здесь не работают стандартные интернет-магазинные методы. Решения принимаются долго, суммы контрактов исчисляются миллионами, а в процессе выбора участвует целая группа лиц (ЛПР).

В этом руководстве эксперты **b2b-бюро** подробно разберут, как вывести в топ поисковых систем и ИИ-ассистентов ваше предложение по теме \`${topic}\` и превратить органический трафик в поток квалифицированных лидов.

---

## Структурная схема идеальной SEO-стратегии 2026 в B2B

Чтобы ваша статья гарантированно попадала в выдачу Яндекса, Google и цитировалась в чат-ботах, она должна соответствовать жестким факторам авторитетности:

1.  **Экспертность и глубина (E-E-A-T)**: Статья должна содержать уникальную аналитику и инфографику. Никакого рерайта.
2.  **Структурированность**: Подзаголовки, списки, таблицы и цитаты помогают поисковым роботам быстро индексировать контент.
3.  **Перелинковка и Авторитетные ссылки**: Ссылки на проверенные источники и внутренние авторитетные страницы агентства повышают траст.

---

## Контентная воронка b2b-бюро для Яндекс.Дзен и VC.ru

Мы разработали уникальный метод дистрибуции контента:
*   **Смысловой лонгрид**: Детальный разбор всех аспектов темы **${topic}**.
*   **Видео-сопровождение**: Размещение короткого клипа-презентации в статье с использованием вашего цифрового аватара.
*   **Оптимальный SEO-профиль**: Использование ключевых слов без переспама, естественная интеграция коммерческих фраз бренда.

---

## Резюме руководства

Продвижение B2B тем в 2026 году — это высокое искусство баланса между технической экспертностью и жесткой SEO-оптимизацией. 

Доверьте эту работу профессионалам. Оставьте заявку в **b2b-бюро** — мы разработаем и внедрим под ключ автоматическую систему генерации лидов и контента для вашего бизнеса!`;
  }

  return { title, metaDescription, content, seoKeywords, citations, keyInsights };
}

function getMockScript(topic: string, tone: string, duration: number, videoType: string = "sales") {
  if (videoType === "trust") {
    return {
      title: `Как заслужить безупречное доверие клиентов в B2B через ${topic}`,
      seoKeywords: [topic.toLowerCase().replace(/\s+/g, ""), "доверительныймаркетинг", "b2bбюро", "экспертность"],
      hook: `Клиенты в B2B устали от пустых обещаний про ${topic}. Им нужны факты. Делюсь реальной методикой:`,
      callToAction: "Никакой «воды» и продаж ради продаж. Нужна честная система лидогенерации? Команда b2b-бюро готова провести детальный разбор.",
      scenes: [
        {
          id: 1,
          duration: Math.round(duration * 0.3),
          subtitle: "Закупщики видят насквозь фальшивый маркетинг. Твердая репутация строится исключительно на окупаемости и прозрачных расчетах.",
          visualPrompt: "Clean elegant server charts, transparent analytical glass panel with line graphs, crisp glowing lines, warm subtle light, 9:16",
          audioPrompt: "calm, authentic, highly professional and honest tone"
        },
        {
          id: 2,
          duration: Math.round(duration * 0.4),
          subtitle: "Поэтому в 'b2b-бюро' мы показываем клиентам не клики, а юнит-экономику. Каждая заявка проходит автоматический скоринг.",
          visualPrompt: "Modern executive workstation, clean glass screens showing verified pipeline statistics, minimal design, 9:16",
          audioPrompt: "confident, analytical, steady voice"
        },
        {
          id: 3,
          duration: Math.round(duration * 0.3),
          subtitle: "Это снижает стоимость привлечения клиента в 2 раза и строит глубокое доверие. Посмотрите наши бесплатные кейсы по ссылке.",
          visualPrompt: "Interactive slide displaying the 'b2b-бюро' signature trust checkmark, elegant green and gold accents, 9:16",
          audioPrompt: "reassuring, sincere expert tone"
        }
      ]
    };
  }

  if (videoType === "engaging") {
    return {
      title: `Шокирующая ложь про ${topic} в сфере B2B!`,
      seoKeywords: [topic.toLowerCase().replace(/\s+/g, ""), "разборгадостей", "b2bлайфхаки", "разрушениемифов"],
      hook: `Маркетологи нагло врут! 90% компаний сливают бюджеты на ${topic}, получая лишь гору мусорных лидов. Вот почему:`,
      callToAction: "Хватит кормить ленивых подрядчиков. Напишите слово 'ДАТА' под видео — отправим разбор 12 главных ошибок b2b-продвижения бесплатно!",
      scenes: [
        {
          id: 1,
          duration: Math.round(duration * 0.3),
          subtitle: "Все гонятся за дешевыми охватами, забывая, что ваши покупатели — это занятые топы ИТ и финтеха с миллионными бюджетами.",
          visualPrompt: "Stunning conceptual flat vector graphic of money disappearing combined with glowing alert lines, highly intense contrasts, 9:16",
          audioPrompt: "intriguing, dramatic, high energy attention grabber"
        },
        {
          id: 2,
          duration: Math.round(duration * 0.4),
          subtitle: "Они не смотрят стандартные рекламные баннеры. Наша команда b2b-бюро привлекает их через вовлекающий микро-контент.",
          visualPrompt: "Dynamic abstract visualization of high-quality leads moving through automated telegram filter tunnels, neon violet light pulses, 9:16",
          audioPrompt: "exciting, instructional, fast and engaging pace"
        },
        {
          id: 3,
          duration: Math.round(duration * 0.3),
          subtitle: "Мы отсекаем неликвидных клиентов до того, как они свяжутся с отделом продаж. Оставьте заявку и получите готовый SEO-фильтр бесплатно!",
          visualPrompt: "Bright professional hand holding smartphone displaying premium B2B qualified pipeline screen, 9:16",
          audioPrompt: "confident, motivational and prompt statement"
        }
      ]
    };
  }

  // DEFAULT "sales"
  return {
    title: `Вся правда про ${topic}: Как выжать максимум?`,
    seoKeywords: [topic.toLowerCase().replace(/\s+/g, ""), "b2bбюро", "маркетинг2026", "b2bпродажи", "клиентыдляагентства"],
    hook: `Думаете, ${topic} всё ещё работает по-старому в b2b? Вы крупно ошибаетесь. Показываю схему от b2b-бюро:`,
    callToAction: "Хотите внедрить это и обойти конкурентов? Закажите персональный аудит в b2b-бюро — разработаем систему окупаемости под ваш продукт!",
    scenes: [
      {
        id: 1,
        duration: Math.round(duration * 0.25),
        subtitle: `Многие сливают миллионы на стандартный b2b-маркетинг, думая что ${topic} — это просто дань моде.`,
        visualPrompt: `Marketing agency workspace, ultra modern computer showing charts, neon lights deep orange slate background, digital twin speaking confidently, 9:16 aspect ratio`,
        audioPrompt: "confident, engaging hook"
      },
      {
        id: 2,
        duration: Math.round(duration * 0.40),
        subtitle: "На самом деле секрет в другом: b2b-бюро убирает лишние звенья и внедряет умный AI-скоринг клиентов прямо сейчас.",
        visualPrompt: `Dynamic visual infographic representing client metrics rising, 3D golden bars, soft lighting, professional marketing design, 9:16`,
        audioPrompt: "insightful, analytical tone"
      },
      {
        id: 3,
        duration: Math.round(duration * 0.35),
        subtitle: "Результат? Конверсия в квалифицированный лид растет на 40% сразу, без раздувания рекламных бюджетов. Запишитесь на консультацию!",
        visualPrompt: `Happy modern CEO looking at analytics graphs on mobile phone, warm ambient background, clean visual concept, 9:16`,
        audioPrompt: "energetic, inspiring call to action"
      }
    ]
  };
}

// Generates high quality visual gradient images with elegant typography when real Imagen model fails or API key is inactive
function getMockImage(prompt: string) {
  // We'll map prompt keywords to beautiful color themes to make visual representations dynamic and gorgeous!
  let gradient = "linear-gradient(135deg, #1e1b4b 0%, #311042 100%)"; // Space dark slate/purple
  let themeText = "B2B Marketing Factory";
  
  const p = prompt.toLowerCase();
  if (p.includes("crm") || p.includes("lead") || p.includes("client")) {
    gradient = "linear-gradient(135deg, #0f172a 0%, #0369a1 100%)"; // Slate to Sky Blue
    themeText = "LEAD ACQUISITION ENGINE";
  } else if (p.includes("trend") || p.includes("metric") || p.includes("chart")) {
    gradient = "linear-gradient(135deg, #111827 0%, #15803d 100%)"; // Dark Gray to Emerald Green
    themeText = "MARKETING METRICS & GROWTH";
  } else if (p.includes("workspace") || p.includes("studio") || p.includes("twin") || p.includes("ceo")) {
    gradient = "linear-gradient(135deg, #180828 0%, #be185d 100%)"; // Dark Violet to Rose Pink
    themeText = "DIGITAL TWIN NARRATIVE";
  } else if (p.includes("infographic") || p.includes("calculator") || p.includes("funnel")) {
    gradient = "linear-gradient(135deg, #1e293b 0%, #7c3aed 100%)"; // Violet slate beauty
    themeText = "AUTOMATED CONVERSION FUNNEL";
  }

  // Create an elegant inline SVG base64 representing the slide
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640" width="100%" height="100%">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient.match(/#[0-9a-fA-F]+/g)?.[0] || '#111827'};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient.match(/#[0-9a-fA-F]+/g)?.[1] || '#7c3aed'};stop-opacity:1" />
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" stroke-opacity="0.04" stroke-width="0.5" />
        </pattern>
      </defs>
      
      <!-- Ambient Background -->
      <rect width="360" height="640" fill="url(#grad)" />
      <rect width="360" height="640" fill="url(#grid)" />
      
      <!-- Aesthetic Circular Accents -->
      <circle cx="180" cy="320" r="120" fill="#ffffff" fill-opacity="0.03" filter="blur(10px)" />
      <circle cx="50" cy="120" r="80" fill="#7c3aed" fill-opacity="0.1" filter="blur(20px)" />
      <circle cx="310" cy="520" r="100" fill="#0369a1" fill-opacity="0.1" filter="blur(25px)" />
      
      <!-- Decorative Borders and Corner Marks -->
      <path d="M 25 40 L 25 25 L 40 25" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
      <path d="M 335 40 L 335 25 L 320 25" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
      <path d="M 25 600 L 25 615 L 40 615" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
      <path d="M 335 600 L 335 615 L 320 615" fill="none" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" />
      
      <!-- Tech Grid Lines -->
      <line x1="25" y1="80" x2="335" y2="80" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="4 4" />
      <line x1="25" y1="560" x2="335" y2="560" stroke="#ffffff" stroke-opacity="0.1" stroke-dasharray="4 4" />
      
      <!-- Content Category Badge -->
      <rect x="100" y="50" width="160" height="24" rx="12" fill="#ffffff" fill-opacity="0.08" stroke="#ffffff" stroke-opacity="0.15" />
      <text x="180" y="66" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="1">
        ${themeText}
      </text>

      <!-- Center Conceptual Illustration -->
      <g transform="translate(180, 240)">
        <circle cx="0" cy="0" r="55" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.1" />
        <circle cx="0" cy="0" r="45" fill="#ffffff" fill-opacity="0.03" stroke="#ffffff" stroke-opacity="0.2" stroke-dasharray="1 5" />
        
        <!-- Abstract holographic design depending on prompt -->
        ${p.includes("trend") || p.includes("metric") || p.includes("chart") ? `
          <!-- Bar Graph Icon -->
          <rect x="-20" y="-10" width="8" height="30" rx="2" fill="#38bdf8" fill-opacity="0.9" />
          <rect x="-7" y="-22" width="8" height="42" rx="2" fill="#a78bfa" fill-opacity="0.9" />
          <rect x="6" y="-30" width="8" height="50" rx="2" fill="#34d399" fill-opacity="0.9" />
          <path d="M -25 15 L 25 15" stroke="#ffffff" stroke-opacity="0.5" stroke-width="2" />
        ` : p.includes("crm") || p.includes("lead") || p.includes("client") ? `
          <!-- Magnet Lead Icon -->
          <path d="M-15,-20 C-15,15 15,15 15,-20 C15,-25 8,-25 8,-20 C8,-5 -8,-5 -8,-20 C-8,-25 -15,-25 -15,-20 Z" fill="#f43f5e" fill-opacity="0.9" />
          <circle cx="-11.5" cy="-22" r="3.5" fill="#ffffff" />
          <circle cx="11.5" cy="-22" r="3.5" fill="#ffffff" />
        ` : p.includes("workspace") || p.includes("twin") || p.includes("ceo") ? `
          <!-- User Profile Icon -->
          <circle cx="0" cy="-12" r="15" fill="#a78bfa" fill-opacity="0.9" />
          <path d="M -25 20 C -25 5, 25 5, 25 20 Z" fill="#6366f1" fill-opacity="0.9" />
        ` : `
          <!-- Generic gears / AI icon -->
          <circle cx="0" cy="0" r="14" fill="none" stroke="#f472b6" stroke-width="4" stroke-dasharray="5 2" />
          <circle cx="0" cy="0" r="6" fill="#38bdf8" />
        `}
      </g>
      
      <!-- Key phrase / Conceptual Quote -->
      <rect x="35" y="340" width="290" height="150" rx="8" fill="#000000" fill-opacity="0.3" stroke="#ffffff" stroke-opacity="0.05" />
      
      <text x="180" y="375" font-family="'Space Grotesk', system-ui, sans-serif" font-size="12" font-weight="700" fill="#f8fafc" text-anchor="middle" font-style="italic">
        MARKETING STRATEGY PREVIEW
      </text>

      <!-- Wrapped Prompt text simulation -->
      <text x="180" y="410" font-family="system-ui, sans-serif" font-size="9.5" fill="#94a3b8" text-anchor="middle">
        ${prompt.length > 45 ? prompt.substring(0, 42) + "..." : prompt}
      </text>
      <text x="180" y="430" font-family="system-ui, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">
        AI Video Scene Concept Visualization
      </text>
      <text x="180" y="455" font-family="'JetBrains Mono', monospace" font-size="10" fill="#f43f5e" font-weight="bold" text-anchor="middle">
        Ready for Cross-Posting 🚀
      </text>

      <!-- Frame Progress Tracker -->
      <rect x="50" y="540" width="260" height="4" rx="2" fill="#ffffff" fill-opacity="0.1" />
      <rect x="50" y="540" width="160" height="4" rx="2" fill="#a78bfa" />
      <circle cx="210" cy="542" r="4" fill="#ffffff" />
      
      <!-- Dynamic Clock watermark -->
      <text x="180" y="585" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#475569" text-anchor="middle" letter-spacing="0.5">
        AUTOMATION SEQUENCE ENGAGED
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// -------------------------------------------------------------
// Vite and Express Production Routing & Setup
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Marketing Digital Twin & Content Factory server running on http://localhost:${PORT}`);
  });
}

startServer();
