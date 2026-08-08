import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// ==================== 多源 AI 降级引擎 ====================
async function callAIProvider(systemInstruction: string, promptMessage: string, responseSchema?: any) {
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const siliconKey = process.env.SILICONFLOW_API_KEY || process.env.SILICON_API_KEY;

  // 1. 优先使用 Cerebras API
  if (cerebrasKey) {
    try {
      console.log("[AI Provider] 正在使用 Cerebras API...");
      const res = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cerebrasKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b",
          messages: [
            { role: "system", content: `${systemInstruction}\n\n重要：请严格直接返回标准纯 JSON 字符串，不要带 markdown 代码块标记。` },
            { role: "user", content: promptMessage }
          ],
          temperature: 0.7,
        })
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.choices?.[0]?.message?.content || "{}";
        return content.replace(/^```json\s*/i, '').replace(/```$/s, '').trim();
      }
    } catch (e: any) {
      console.warn("[Cerebras Failed] 尝试降级其他服务:", e.message);
    }
  }

  // 2. 其次使用 Google Gemini API
  if (geminiKey) {
    try {
      console.log("[AI Provider] 正在使用 Gemini API...");
      const ai = new GoogleGenAI({ apiKey: geminiKey.trim() });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // 修正为官方合法稳定模型
        contents: promptMessage,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          ...(responseSchema ? { responseSchema } : {}),
        },
      });
      return response.text || "{}";
    } catch (e: any) {
      console.warn("[Gemini Failed] 尝试降级其他服务:", e.message);
    }
  }

  // 3. 最后备选 SiliconFlow (硅基流动) API
  if (siliconKey) {
    try {
      console.log("[AI Provider] 正在使用 硅基流动 API...");
      const res = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${siliconKey.trim()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-72B-Instruct", // 修正：使用硅基流动实际支持的模型名字
          messages: [
            { role: "system", content: `${systemInstruction}\n\n重要：请直接返回标准纯 JSON 格式。` },
            { role: "user", content: promptMessage }
          ],
          temperature: 0.7,
        })
      });

      if (res.ok) {
        const data = await res.json();
        let content = data.choices?.[0]?.message?.content || "{}";
        return content.replace(/^```json\s*/i, '').replace(/```$/s, '').trim();
      }
    } catch (e: any) {
      console.warn("[SiliconFlow Failed]:", e.message);
    }
  }

  throw new Error("Vercel 环境变量中未检测到任何有效的 API Key！请配置 CEREBRAS_API_KEY、GEMINI_API_KEY 或 SILICONFLOW_API_KEY 其中至少一个。");
}

// API Route 1: Generate DELE Article & Professional Analysis
app.post("/api/generate-article", async (req, res) => {
  try {
    const {
      words,
      deleLevel = "B2",
      style = "formal",
      topicKey = "auto",
      customPrompt = "",
      coreWordList = [],
    } = req.body;

    let wordList: string[] = [];
    if (Array.isArray(words)) {
      wordList = words.map((w: string) => w.trim()).filter(Boolean);
    } else if (typeof words === "string") {
      wordList = words
        .split(/[,;\n，；]+/)
        .map((w: string) => w.trim())
        .filter(Boolean);
    }

    if (!wordList || wordList.length === 0) {
      return res.status(400).json({ error: "请至少输入一个备考单词或短语。" });
    }

    const coreSet = new Set(
      Array.isArray(coreWordList) ? coreWordList.map((w: string) => w.trim()) : []
    );

    const systemInstruction = "你是一位权威的 DELE 西班牙语考官。你输出的西班牙语文章必须零语法错误、零拼写错误、完全符合西班牙皇家语言学院 (RAE) 规范，且绝对符合对应 DELE 等级 (A1-C2) 的评价标准。";

    const promptMessage = `
你是一位 DELE 西班牙语官方考试前任主考官兼高级西语教学专家。请根据以下考生的备考要求，撰写一篇严格对标 DELE 考试标准的原创西班牙语文章，并提供深度配套教学解析。

【备考参数硬性要求】：
1. 目标 DELE 等级：${deleLevel}
2. 行文风格：${style === "formal" ? "DELE 官方考试标准议论/书面风格 (Examen Oficial)" : "西班牙本土地道日常风格 (Cotidiano y Fluido)"}
3. 写作主题/场景：${topicKey === "auto" ? "根据词汇特征自动匹配最适合的 DELE 高频考题场景" : topicKey}
4. 考生输入的必用词汇列表 (${wordList.length}个)：
${wordList.map((w, idx) => `   - ${idx + 1}. ${w} ${coreSet.has(w) ? "[重点强调词汇]" : ""}`).join("\n")}
${customPrompt ? `5. 额外补充要求：${customPrompt}` : ""}

请严格返回包含了 titleSpanish, titleChinese, topicName, paragraphs, targetWordsUsed, clozeItems, grammarBreakdowns, deleScoreHighlights, pitfallsAndTips, recommendedVocabulary 的标准 JSON 对象。
`;

    const responseText = await callAIProvider(systemInstruction, promptMessage);
    const parsedData = JSON.parse(responseText);

    const result = {
      id: "dele_art_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      deleLevel,
      style,
      ...parsedData,
    };

    return res.json(result);
  } catch (err: any) {
    console.error("Error generating DELE article:", err);
    return res.status(500).json({
      error: "AI 生成文章时发生错误：" + (err?.message || "网络请求超时或参数解析异常"),
    });
  }
});

// API Route 2: On-demand Word Deep Analysis
app.post("/api/analyze-word", async (req, res) => {
  try {
    const { word, formInArticle, contextSentence, deleLevel = "B2" } = req.body;
    if (!word) {
      return res.status(400).json({ error: "缺少查询单词参数" });
    }

    const systemInstruction = "你是一位专业 DELE 西班牙语考官与辞书编纂专家。";
    const promptMessage = `
请对西班牙语单词或短语 "${word}" (在文中形式可能为 "${formInArticle || word}") 进行深度学术与 DELE 备考解析。

【背景例句】：${contextSentence || "无特定例句"}
【DELE 目标等级】：${deleLevel}

请返回包含 phonetic, partOfSpeech, chineseMeaning, multiPosDefinitions, deleCollocations, examExamples, confusedWords, usageTip 的 JSON 数据。
`;

    const responseText = await callAIProvider(systemInstruction, promptMessage);
    const parsed = JSON.parse(responseText);

    return res.json({
      original: word,
      formInArticle: formInArticle || word,
      level: deleLevel,
      contextSentence: contextSentence || "",
      ...parsed,
    });
  } catch (err: any) {
    console.error("Error analyzing word:", err);
    return res.status(500).json({ error: "单词解析失败：" + (err?.message || "网络异常") });
  }
});

// 必须导出 Express 实例，供 Vercel Serverless Function 识别
export default app;

// 本地开发环境启动
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`DELE Exam Assistant App listening on http://localhost:${PORT}`);
    });
  }

  startServer();
}
