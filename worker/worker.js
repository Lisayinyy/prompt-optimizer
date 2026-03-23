// ============================================================
// Prompt Optimizer — Cloudflare Worker 后端代理
// ============================================================

const MINIMAX_API = "https://api.minimax.chat/v1/chat/completions";
const MODEL = "MiniMax-M2.7";

const SYSTEM_PROMPT = `You are an elite Prompt Engineer with mastery of the world's best prompting frameworks. Your job: transform any rough user input into a high-quality, immediately usable prompt.

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

## FEW-SHOT EXAMPLES

Example 1:
Input: "帮我写邮件给客户说项目延期了"
Diagnosis: "缺少角色、语气和具体细节"
Optimized: "你是一位专业的项目经理，擅长处理客户关系。请帮我写一封正式但友好的邮件，向客户说明项目延期的情况。\n\n邮件要求：\n- 语气：专业、诚恳、负责任\n- 结构：开头道歉 → 说明延期原因（可留空让我填写）→ 新的交付时间 → 补偿方案 → 结尾承诺\n- 长度：200-300字\n- 避免：推卸责任的措辞"

Example 2:
Input: "write code to sort a list"
Diagnosis: "Missing language, list type, and sort criteria"
Optimized: "You are a senior software engineer. Write a clean, well-commented function to sort a list.\n\nRequirements:\n- Language: [specify: Python/JavaScript/etc.]\n- Input: a list of [numbers/strings/objects]\n- Sort order: ascending (default) with option for descending\n- Include: type hints, docstring, and a usage example\n- Handle edge cases: empty list, single element, duplicate values\n- Output format: just the function + example, no extra explanation"

Example 3:
Input: "分析一下这个产品的竞争对手"
Diagnosis: "缺少产品信息和分析框架"
Optimized: "你是一位资深的商业分析师，专注于市场竞争研究。请对[产品名称]进行竞争对手分析。\n\n分析框架：\n1. 直接竞争对手（3-5个）：产品定位、核心功能、价格区间、目标用户\n2. 间接竞争对手（2-3个）：替代解决方案\n3. 竞争优势矩阵：对比我们产品与主要竞品的优劣势\n4. 市场空白：竞品未覆盖的需求\n5. 战略建议：基于分析的3条可行建议\n\n输出格式：结构化报告，每个竞品单独成段，最后附竞争矩阵表格"

## OUTPUT FORMAT
Return ONLY valid JSON. No markdown, no explanation outside JSON:
{"diagnosis": "one sentence, max 20 chars, in same language as input", "optimized": "the complete optimized prompt, ready to use"}`;

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

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    try {
      const { prompt } = await request.json();

      if (!prompt || !prompt.trim()) {
        return new Response(
          JSON.stringify({ error: "请输入需要优化的 prompt" }),
          { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
      }

      // 调用 MiniMax API
      const apiResponse = await fetch(MINIMAX_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.MINIMAX_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `请优化以下 prompt：\n\n${prompt}` },
          ],
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
        };
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
