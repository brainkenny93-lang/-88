import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API Route: Generate DELE Article & Professional Analysis
app.post("/api/generate-article", async (req, res) => {
  try {
    const {
      words, // string[] or string
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

    const promptMessage = `
你是一位 DELE 西班牙语官方考试前任主考官兼高级西语教学专家。请根据以下考生的备考要求，撰写一篇严格对标 DELE 考试标准的原创西班牙语文章，并提供深度配套教学解析。

【备考参数硬性要求】：
1. 目标 DELE 等级：${deleLevel} (必须严格符合 ${deleLevel} 的词汇量、句式复杂度、时态语法规范与篇幅长短)
2. 行文风格：${style === "formal" ? "DELE 官方考试标准议论/书面风格 (Examen Oficial)" : "西班牙本土地道日常风格 (Cotidiano y Fluido)"}
3. 写作主题/场景：${topicKey === "auto" ? "根据词汇特征自动匹配最适合的 DELE 高频考题场景" : topicKey}
4. 考生输入的必用词汇列表 (${wordList.length}个)：
${wordList.map((w, idx) => `   - ${idx + 1}. ${w} ${coreSet.has(w) ? "[重点强调词汇]" : ""}`).join("\n")}
${customPrompt ? `5. 额外补充要求：${customPrompt}` : ""}

【撰写与解析规则】：
- 文章必须完全融入上述所有 ${wordList.length} 个目标词汇，做到自然顺畅、逻辑严密、无遗漏、无生硬堆砌。
- 文章必须分段列出西班牙语原文与高品质中文翻译。
- 对 ${wordList.length} 个目标词汇在文中的具体出现形式（原形、变位、衍生）、词性、文中含义与高分用法进行逐一剖析。
- 为这些目标词汇生成【填空自测题目 (Cloze Items)】，指出词汇所在的段落、在文章中的准确变位或拼写格式 (targetAnswer)，并给出语法/时态提示 (hint)，用于用户进行互动拼写测试。
- 总结 3-4 个文中的高分句式拆解与 DELE 加分亮点（任务完成度、逻辑衔接词用法、词汇丰富度、语法准确度）。
- 总结 3 个该 DELE 等级常见的写作语法误区与规避技巧。
- 推荐 5 个与本主题相关的 DELE 高频延伸拓展词汇。
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptMessage,
      config: {
        systemInstruction:
          "你是一位权威的 DELE 西班牙语考官。你输出的西班牙语文章必须零语法错误、零拼写错误、完全符合西班牙皇家语言学院 (RAE) 规范，且绝对符合对应 DELE 等级 (A1-C2) 的评价标准。",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            titleSpanish: { type: Type.STRING, description: "文章西班牙语标题" },
            titleChinese: { type: Type.STRING, description: "文章中文译名" },
            topicName: { type: Type.STRING, description: "匹配到的 DELE 考试主题" },
            paragraphs: {
              type: Type.ARRAY,
              description: "文章段落列表",
              items: {
                type: Type.OBJECT,
                properties: {
                  spanish: { type: Type.STRING, description: "该段西班牙语原文" },
                  chinese: { type: Type.STRING, description: "该段中文翻译" },
                },
                required: ["spanish", "chinese"],
              },
            },
            targetWordsUsed: {
              type: Type.ARRAY,
              description: "输入词汇在文中的活用解析与详尽词典信息",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "用户输入的原始词汇" },
                  formInArticle: { type: Type.STRING, description: "文章中使用的准确拼写或变位形式" },
                  partOfSpeech: { type: Type.STRING, description: "词性 (如 sustantivo, verbo, adjetivo, locución)" },
                  level: { type: Type.STRING, description: "词汇等级 (A1-C2)" },
                  contextSentence: { type: Type.STRING, description: "包含该词的原文例句" },
                  chineseMeaning: { type: Type.STRING, description: "在文中的中文含义" },
                  usageTip: { type: Type.STRING, description: "DELE 考试应用建议或用法提醒" },
                  phonetic: { type: Type.STRING, description: "国际音标 IPA，如 /sostenibiliˈdað/" },
                  multiPosDefinitions: {
                    type: Type.ARRAY,
                    description: "多词性释义",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        pos: { type: Type.STRING, description: "词性缩写如 sust. f. / adj. / v. tr." },
                        meaning: { type: Type.STRING, description: "对应释义" },
                      },
                      required: ["pos", "meaning"],
                    },
                  },
                  deleCollocations: {
                    type: Type.ARRAY,
                    description: "DELE 适配搭配或固定词组 (2-3个)",
                    items: { type: Type.STRING },
                  },
                  examExamples: {
                    type: Type.ARRAY,
                    description: "DELE 考试例句 (1-2个)",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        sentenceEs: { type: Type.STRING, description: "西班牙语例句" },
                        sentenceCn: { type: Type.STRING, description: "中文例句翻译" },
                      },
                      required: ["sentenceEs", "sentenceCn"],
                    },
                  },
                  confusedWords: { type: Type.STRING, description: "易混辨析 (近义词对比或易错点说明)" },
                },
                required: ["original", "formInArticle", "partOfSpeech", "contextSentence", "chineseMeaning", "usageTip"],
              },
            },
            clozeItems: {
              type: Type.ARRAY,
              description: "填空自测题目",
              items: {
                type: Type.OBJECT,
                properties: {
                  paragraphIndex: { type: Type.INTEGER, description: "所在段落的索引 (0, 1, 2...)" },
                  originalWord: { type: Type.STRING, description: "原始考察词汇" },
                  targetAnswer: { type: Type.STRING, description: "文中的正确填空答案 (需完全匹配文中的词汇形式)" },
                  hint: { type: Type.STRING, description: "语法提示 (如: 动词 present de subjuntivo 3a pers. sing.)" },
                  sentenceContextSpanish: { type: Type.STRING, description: "挖空后的西班牙语例句" },
                  sentenceContextChinese: { type: Type.STRING, description: "对应中文翻译" },
                },
                required: ["paragraphIndex", "originalWord", "targetAnswer", "hint", "sentenceContextSpanish", "sentenceContextChinese"],
              },
            },
            grammarBreakdowns: {
              type: Type.ARRAY,
              description: "核心句式与语法拆解",
              items: {
                type: Type.OBJECT,
                properties: {
                  spanishPattern: { type: Type.STRING, description: "文中出现的高阶句式/语法结构" },
                  chineseMeaning: { type: Type.STRING, description: "句式中文意思" },
                  explanation: { type: Type.STRING, description: "语法与逻辑拆解说明" },
                  deleScoreHighlight: { type: Type.STRING, description: "DELE 考官打分亮点" },
                },
                required: ["spanishPattern", "chineseMeaning", "explanation", "deleScoreHighlight"],
              },
            },
            deleScoreHighlights: {
              type: Type.OBJECT,
              description: "DELE 四维打分加分点",
              properties: {
                taskFulfillment: { type: Type.STRING, description: "任务完成度亮点" },
                coherenceCohesion: { type: Type.STRING, description: "文章连贯性与逻辑衔接词亮点" },
                lexicalRichness: { type: Type.STRING, description: "词汇多样性与准确性" },
                grammaticalAccuracy: { type: Type.STRING, description: "语法多样性与控错率" },
              },
              required: ["taskFulfillment", "coherenceCohesion", "lexicalRichness", "grammaticalAccuracy"],
            },
            pitfallsAndTips: {
              type: Type.ARRAY,
              description: "常见语法陷阱与避坑指南",
              items: { type: Type.STRING },
            },
            recommendedVocabulary: {
              type: Type.ARRAY,
              description: "延伸拓展推荐高频词汇",
              items: {
                type: Type.OBJECT,
                properties: {
                  spanish: { type: Type.STRING, description: "推荐单词/短语" },
                  chinese: { type: Type.STRING, description: "中文释义" },
                  level: { type: Type.STRING, description: "DELE 等级" },
                  example: { type: Type.STRING, description: "例句" },
                },
                required: ["spanish", "chinese", "level", "example"],
              },
            },
          },
          required: [
            "titleSpanish",
            "titleChinese",
            "topicName",
            "paragraphs",
            "targetWordsUsed",
            "clozeItems",
            "grammarBreakdowns",
            "deleScoreHighlights",
            "pitfallsAndTips",
            "recommendedVocabulary",
          ],
        },
      },
    });

    const jsonText = response.text || "";
    const parsedData = JSON.parse(jsonText);

    // Attach metadata ID and timestamp
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

// API Route: On-demand Word Deep Analysis for Modal
app.post("/api/analyze-word", async (req, res) => {
  try {
    const { word, formInArticle, contextSentence, deleLevel = "B2" } = req.body;
    if (!word) {
      return res.status(400).json({ error: "缺少查询单词参数" });
    }

    const prompt = `
你是一位专业 DELE 西班牙语考官与辞书编纂专家。请对西班牙语单词或短语 "${word}" (在文中形式可能为 "${formInArticle || word}") 进行深度学术与 DELE 备考解析。

【背景例句】：${contextSentence || "无特定例句"}
【DELE 目标等级】：${deleLevel}

请按要求返回 JSON：
1. phonetic: 国际音标 (IPA)
2. partOfSpeech: 主要词性
3. chineseMeaning: 核心中文释义
4. multiPosDefinitions: 多词性释义数组 (每个包含 pos, meaning)
5. deleCollocations: 2-3 个 DELE 常见搭配固定连用
6. examExamples: 1-2 个 DELE 考试级别的高质量双语例句
7. confusedWords: 易混辨析说明
8. usageTip: DELE 备考高分应用提醒
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            phonetic: { type: Type.STRING },
            partOfSpeech: { type: Type.STRING },
            chineseMeaning: { type: Type.STRING },
            multiPosDefinitions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pos: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                },
                required: ["pos", "meaning"],
              },
            },
            deleCollocations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            examExamples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentenceEs: { type: Type.STRING },
                  sentenceCn: { type: Type.STRING },
                },
                required: ["sentenceEs", "sentenceCn"],
              },
            },
            confusedWords: { type: Type.STRING },
            usageTip: { type: Type.STRING },
          },
          required: [
            "phonetic",
            "partOfSpeech",
            "chineseMeaning",
            "multiPosDefinitions",
            "deleCollocations",
            "examExamples",
            "confusedWords",
            "usageTip",
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
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
