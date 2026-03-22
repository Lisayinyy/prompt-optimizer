// ============================================================
// Prompt Optimizer — Cloudflare Worker 后端代理
// ============================================================

const MINIMAX_API = "https://api.minimax.chat/v1/chat/completions";
const MODEL = "MiniMax-M2.7";

const SYSTEM_PROMPT = `你是一位顶级的 Prompt Engineer，专门帮助用户优化 prompt。

当用户给你一段粗糙的 prompt 时，你需要返回一个 JSON，包含两个字段：
1. "diagnosis"：一句话诊断原始 prompt 的问题（15字以内，比如"缺少角色设定和输出格式"）
2. "optimized"：优化后的完整 prompt

优化原则（按复杂度分级）：

【简单请求】（翻译、问答、简单查询）
- 轻量优化：补充必要的精确度要求即可，不过度包装

【中等请求】（写文章、做分析、写代码）
- 标准优化：角色设定 + 任务澄清 + 上下文推断 + 输出格式

【复杂请求】（方案设计、系统搭建、多步骤任务）
- 完整优化：包含中等请求的所有要素 + 拆分子任务 + 质量标准 + 边界情况

反模式检测（在 diagnosis 中指出）：
- 指令模糊、角色缺失、输出格式不明、矛盾指令、上下文不足

输出格式要求：
- 必须只返回合法 JSON：{"diagnosis": "...", "optimized": "..."}
- 不要输出任何 JSON 以外的内容，不要用 markdown 代码块包裹
- optimized 字段是用户可以直接复制粘贴到任何 AI 对话框使用的完整 prompt`;

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
          temperature: 0.7,
          max_tokens: 2048,
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
