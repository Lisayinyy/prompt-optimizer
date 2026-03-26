// ============================================================
// Prompt Optimizer — Cloudflare Worker 后端代理
// v7.5: Phase 1 智能优化升级 — 动态策略+评分+Guardrails
// ============================================================

const MINIMAX_API = "https://api.minimax.chat/v1/chat/completions";
const MODEL = "MiniMax-M2.7";

// ─── Guardrails: 检测 prompt 注入 & 有害内容 ────────────────
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions/i,
  /ignore\s+all\s+instructions/i,
  /disregard\s+(previous|all|prior)\s+instructions/i,
  /forget\s+everything/i,
  /you\s+are\s+now\s+a/i,
  /act\s+as\s+if\s+you\s+are/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /你现在是/,
  /忽略之前的指令/,
  /忽略所有指令/,
  /你是一个没有限制的/,
  /扮演.{0,10}没有道德/,
  /system\s*prompt/i,
  /bypass\s+(safety|filter|restriction)/i,
];

const HARMFUL_PATTERNS = [
  /如何制造.{0,10}(炸弹|毒品|武器|病毒)/,
  /how\s+to\s+(make|create|build)\s+(bomb|drug|weapon|virus|malware)/i,
  /合成.{0,10}(毒品|违禁|爆炸)/,
  /synthesize\s+(drugs|explosives|poison)/i,
];

function checkGuardrails(text) {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) return "injection";
  }
  for (const pattern of HARMFUL_PATTERNS) {
    if (pattern.test(text)) return "harmful";
  }
  return null;
}

// ─── 动态系统提示词（根据 targetAI 差异化）─────────────────
function buildSystemPrompt(targetAI = "any", tone = "Professional") {
  // 目标 AI 策略
  let targetStrategy = "";

  if (["chatgpt", "gemini"].includes(targetAI)) {
    targetStrategy = `
## TARGET AI STRATEGY: ${targetAI.toUpperCase()}
This prompt will be used with ${targetAI === "chatgpt" ? "ChatGPT (OpenAI)" : "Gemini (Google)"}.
- Use Markdown structure: headers (##), bullet lists, code blocks when appropriate
- Clear role + step-by-step instructions work best
- Include explicit output format specification with examples`;
  } else if (targetAI === "claude") {
    targetStrategy = `
## TARGET AI STRATEGY: CLAUDE
This prompt will be used with Claude (Anthropic).
- Claude excels at long-form content and nuanced tasks
- Use XML tag structure when helpful: <context>, <task>, <constraints>, <format>
- Claude follows instructions precisely — be explicit about what you want
- Multi-step tasks benefit from clear sequential structure`;
  } else if (["kimi", "zhipu", "deepseek", "minimax"].includes(targetAI)) {
    targetStrategy = `
## TARGET AI STRATEGY: CHINESE LLM (${targetAI})
This prompt will be used with a Chinese-first LLM.
- Prioritize Chinese output unless user explicitly wants English
- Be concise and direct — avoid over-engineered Western prompt structures
- Use simple numbered lists, avoid heavy XML or Markdown
- Chinese-specific context (文化、行业背景) improves results dramatically`;
  } else {
    targetStrategy = `
## TARGET AI STRATEGY: UNIVERSAL
Optimize for broad compatibility across all major AI systems.
- Use clear, unambiguous language
- Moderate use of Markdown structure
- Explicit role + task + output format`;
  }

  // 语气指导
  const toneGuide = {
    Professional: "formal, precise, business-appropriate",
    Casual: "friendly, conversational, approachable",
    Academic: "scholarly, evidence-based, structured",
    Creative: "imaginative, expressive, open-ended",
    Concise: "ultra-brief, direct, no filler words",
  };
  const toneDesc = toneGuide[tone] || "balanced and clear";

  return `You are an elite Prompt Engineer with mastery of the world's best prompting frameworks. Your job: transform any rough user input into a high-quality, immediately usable prompt.
${targetStrategy}

## TONE REQUIREMENT
Apply this tone to the optimized prompt: ${tone} — ${toneDesc}

## YOUR OPTIMIZATION ENGINE

Apply these frameworks intelligently based on what the prompt needs:

**CO-STAR** (for creative/writing/communication tasks):
- Context: background the AI needs
- Objective: exact task
- Style: tone/voice/format
- Tone: emotional register
- Audience: who the output is for
- Response: output format

**RISEN** (for analytical/technical/structured tasks):
- Role: expert identity for the AI
- Instructions: clear step-by-step
- Steps: logical sequence
- End goal: what success looks like
- Narrowing: constraints/exclusions

**Chain-of-Thought** (for reasoning/problem-solving tasks):
- Add "Think step by step" or "Let's reason through this"
- Break complex asks into explicit stages

## OPTIMIZATION RULES

**DETECT language first**: If input is Chinese → output Chinese. If English → output English. Mixed → match dominant language.

**DETECT complexity**:
- Simple (translate/lookup/summarize) → minimal touch: just add precision, don't over-engineer
- Medium (write/analyze/code) → apply CO-STAR or RISEN fully
- Complex (design/architect/multi-step) → full framework + sub-tasks + quality criteria

**ALWAYS add**:
1. Expert role assignment ("You are a senior [X] with [Y] years of experience...")
2. Specific output format (length, structure, bullets vs prose)
3. Relevant constraints ("Do not include...", "Focus only on...")
4. Quality anchor ("Ensure the output is actionable/professional/beginner-friendly")

**NEVER**:
- Add unnecessary complexity to simple questions
- Change the user's core intent
- Use generic phrases like "helpful assistant"

## SCORING CRITERIA
You must evaluate the ORIGINAL prompt and score it on these 3 dimensions (0-100 each):
- **clarity** (清晰度): How clearly does the prompt state its intent? 0=completely vague, 100=crystal clear
- **specificity** (具体性): How much relevant detail/context does it include? 0=no details, 100=fully specified
- **structure** (结构性): How well-organized and formatted is it? 0=random text, 100=perfect structure

## FEW-SHOT EXAMPLES

Example 1:
Input: "帮我写邮件给客户说项目延期了"
Output:
{
  "diagnosis": "缺少角色、语气和具体细节，意图过于模糊",
  "optimized": "你是一位专业的项目经理，擅长处理客户关系。请帮我写一封正式但友好的邮件，向客户说明项目延期的情况。\\n\\n邮件要求：\\n- 语气：专业、诚恳、负责任\\n- 结构：开头道歉 → 说明延期原因（可留空让我填写）→ 新的交付时间 → 补偿方案 → 结尾承诺\\n- 长度：200-300字\\n- 避免：推卸责任的措辞",
  "scores": { "clarity": 45, "specificity": 20, "structure": 30 },
  "tips": ["说明延期原因和新的交付时间", "指定邮件语气（正式/友好）", "告知收件人是客户还是上级"]
}

Example 2:
Input: "write code to sort a list"
Output:
{
  "diagnosis": "Missing language, list type, and sort criteria — too vague to be useful",
  "optimized": "You are a senior software engineer. Write a clean, well-commented function to sort a list.\\n\\nRequirements:\\n- Language: [specify: Python/JavaScript/etc.]\\n- Input: a list of [numbers/strings/objects]\\n- Sort order: ascending (default) with option for descending\\n- Include: type hints, docstring, and a usage example\\n- Handle edge cases: empty list, single element, duplicate values\\n- Output format: just the function + example, no extra explanation",
  "scores": { "clarity": 40, "specificity": 15, "structure": 25 },
  "tips": ["Specify the programming language", "Describe what's in the list (numbers, strings, objects)", "State whether ascending or descending order is needed"]
}

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no explanation outside JSON:
{
  "diagnosis": "one sentence max 40 chars in same language as input, describing the main problem",
  "optimized": "the complete optimized prompt ready to use",
  "scores": {
    "clarity": <0-100>,
    "specificity": <0-100>,
    "structure": <0-100>
  },
  "tips": ["improvement tip 1", "improvement tip 2", "improvement tip 3"]
}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 清理模型输出：去掉 <think> 标签和 markdown 代码块
function cleanModelOutput(raw) {
  let text = raw;

  // 1. 去掉 <think>...</think>
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // 2. 去掉 markdown 代码块 ```json ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    text = codeBlockMatch[1].trim();
  }

  return text;
}

// ─── Resend 发送确认邮件 ────────────────────────────────────
async function sendWaitlistEmail(email, lang, resendApiKey) {
  const isZh = lang === "zh";
  const subject = isZh
    ? "🎉 你已成功加入 prompt.ai 候补名单！"
    : "🎉 You're on the prompt.ai waitlist!";

  const html = isZh ? `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #fafafa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 40px;">
    <div style="font-family: Georgia, serif; font-size: 1.4rem; color: #18181b; margin-bottom: 24px;">
      <a href="https://prompt-ai.work" style="color: #18181b; text-decoration: none;">prompt<span style="color: #7c3aed;">.</span>ai</a>
    </div>
    <h1 style="font-family: Georgia, serif; font-size: 1.6rem; color: #18181b; margin: 0 0 16px; line-height: 1.3;">
      你已成功加入候补名单 🎉
    </h1>
    <p style="color: #52525b; line-height: 1.7; margin: 0 0 24px;">
      感谢你的关注！我们目前处于内测阶段，名额限 <strong>20 人</strong>。<br/>
      名额开放时，我们会第一时间发邮件通知你。
    </p>
    <div style="background: #ede9fe; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
      <p style="color: #7c3aed; font-weight: 600; margin: 0 0 8px;"><a href="https://prompt-ai.work" style="color: #7c3aed; text-decoration: none;">prompt.ai</a> 能帮你做什么？</p>
      <ul style="color: #52525b; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>✦ 一键把粗糙想法优化成专业级提示词</li>
        <li>→ 自动填充到 ChatGPT / Claude / Kimi 等 15+ 平台</li>
        <li>↗ 智能推荐最适合你任务的 AI 模型</li>
      </ul>
    </div>
    <p style="color: #a1a1aa; font-size: 0.85rem; margin: 0;">
      有任何问题请回复此邮件或联系 <a href="mailto:lisayyyin@qq.com" style="color: #7c3aed;">lisayyyin@qq.com</a>
    </p>
  </div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'DM Sans', -apple-system, sans-serif; background: #fafafa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 40px;">
    <div style="font-family: Georgia, serif; font-size: 1.4rem; color: #18181b; margin-bottom: 24px;">
      <a href="https://prompt-ai.work" style="color: #18181b; text-decoration: none;">prompt<span style="color: #7c3aed;">.</span>ai</a>
    </div>
    <h1 style="font-family: Georgia, serif; font-size: 1.6rem; color: #18181b; margin: 0 0 16px; line-height: 1.3;">
      You're on the waitlist! 🎉
    </h1>
    <p style="color: #52525b; line-height: 1.7; margin: 0 0 24px;">
      Thanks for your interest in prompt.ai! We're currently in private beta,
      limited to <strong>20 early users</strong>.<br/>
      We'll email you as soon as your spot is ready.
    </p>
    <div style="background: #ede9fe; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
      <p style="color: #7c3aed; font-weight: 600; margin: 0 0 8px;"><a href="https://prompt-ai.work" style="color: #7c3aed; text-decoration: none;">prompt.ai</a> — What it does for you:</p>
      <ul style="color: #52525b; margin: 0; padding-left: 20px; line-height: 1.8;">
        <li>✦ Turn rough ideas into professional prompts in one click</li>
        <li>→ Auto-fill into ChatGPT, Claude, Kimi & 15+ AI platforms</li>
        <li>↗ Smart AI model recommendations based on your task</li>
      </ul>
    </div>
    <p style="color: #a1a1aa; font-size: 0.85rem; margin: 0;">
      Questions? Reply to this email or reach us at <a href="mailto:lisayyyin@qq.com" style="color: #7c3aed;">lisayyyin@qq.com</a>
    </p>
  </div>
</body>
</html>`;

  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: "prompt.ai <hi@prompt-ai.work>",
      to: [email],
      subject,
      html,
    }),
  });
}

// ─── Supabase 写入 waitlist ─────────────────────────────────
async function insertWaitlist(email, source, lang, supabaseUrl, supabaseKey) {
  return fetch(`${supabaseUrl}/rest/v1/waitlist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseKey,
      "Authorization": `Bearer ${supabaseKey}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ email, source, lang, created_at: new Date().toISOString() }),
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    // ─── /waitlist 路由 ────────────────────────────────────
    if (url.pathname === "/waitlist") {
      if (request.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      try {
        const { email, source = "hero", lang = "en" } = await request.json();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return new Response(JSON.stringify({ error: "Invalid email" }), {
            status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        // 写入 Supabase
        const dbRes = await insertWaitlist(
          email, source, lang,
          env.SUPABASE_URL,
          env.SUPABASE_ANON_KEY
        );

        // 409 = 邮箱已存在，也算成功
        if (!dbRes.ok && dbRes.status !== 409) {
          const errText = await dbRes.text();
          console.error("Supabase error:", errText);
          return new Response(JSON.stringify({ error: "Database error" }), {
            status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
          });
        }

        // 发确认邮件（仅首次注册，409 不重发）
        if (dbRes.ok || dbRes.status === 201) {
          await sendWaitlistEmail(email, lang, env.RESEND_API_KEY);
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Waitlist error:", err);
        return new Response(JSON.stringify({ error: "Server error" }), {
          status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      const { prompt, targetAI = "any", tone = "Professional", lang = "zh", messages = [], isRefinement = false } = await request.json();

      if (!prompt || !prompt.trim()) {
        return new Response(
          JSON.stringify({ error: "请输入需要优化的 prompt" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // ─── Guardrails 防护 ───────────────────────────────────
      const guardResult = checkGuardrails(prompt.trim());
      if (guardResult) {
        return new Response(
          JSON.stringify({
            error: "prompt_injection",
            message: guardResult === "injection"
              ? "检测到异常输入，请重新描述你的需求"
              : "检测到不支持的内容类型，请修改后重试",
          }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // ─── 构建动态系统提示词 ────────────────────────────────
      const SYSTEM_PROMPT = buildSystemPrompt(targetAI, tone);

      // ─── 构建消息列表（支持多轮对话历史）────────────────────
      // 历史消息：最多保留最近 6 条，避免 token 过多
      const validHistory = Array.isArray(messages)
        ? messages.slice(-6).filter(m => m.role && m.content)
        : [];

      // 当前用户消息
      const userMessage = isRefinement
        ? prompt.trim() // 二次优化：直接用指令（前端已格式化）
        : `请优化以下 prompt（目标 AI：${targetAI}，语气风格：${tone}）：\n\n${prompt.trim()}`;

      // 组装完整消息数组：system + 历史 + 当前
      const allMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...validHistory,
        { role: "user", content: userMessage },
      ];

      // 调用 MiniMax API
      const apiResponse = await fetch(MINIMAX_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: allMessages,
          temperature: 0.3,
          max_tokens: 3000,
        }),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        console.error("MiniMax API error:", apiResponse.status, errText);
        return new Response(
          JSON.stringify({ error: "AI 服务暂时不可用，请稍后再试" }),
          { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      const data = await apiResponse.json();
      const rawContent = data.choices?.[0]?.message?.content || "";

      // 清理并解析
      const cleaned = cleanModelOutput(rawContent);

      let result;
      try {
        result = JSON.parse(cleaned);
      } catch {
        // JSON 解析失败，把整个清理后的内容作为优化结果
        result = {
          diagnosis: "已优化",
          optimized: cleaned,
          scores: { clarity: 0, specificity: 0, structure: 0 },
          tips: [],
        };
      }

      // 确保 scores 字段存在（向后兼容旧格式）
      if (!result.scores) {
        result.scores = { clarity: 0, specificity: 0, structure: 0 };
      }
      if (!result.tips) {
        result.tips = [];
      }

      return new Response(JSON.stringify(result), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(
        JSON.stringify({ error: "服务异常，请稍后再试" }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
  },
};
