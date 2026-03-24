import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";
import {
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  RotateCcw,
  Zap,
  Target,
  MessageSquare,
  Settings,
  History,
  ArrowRight,
  Wand2,
  Globe,
  Lightbulb,
  Languages,
  BarChart3,
  LogIn,
  LogOut,
  User,
  Clock,
  Brain,
  Code,
  FileText,
  PenTool,
  Search,
  TrendingUp,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

type Lang = "en" | "zh";
type Tab = "optimize" | "history" | "settings" | "insights";

// ─── i18n ───────────────────────────────────────────
const i18n: Record<Lang, Record<string, string>> = {
  en: {
    optimize: "Optimize",
    history: "History",
    settings: "Settings",
    insights: "Insights",
    targetAi: "TARGET AI",
    tone: "TONE",
    yourPrompt: "YOUR PROMPT",
    clear: "Clear",
    placeholder: "Type or paste your prompt here...",
    chars: "chars",
    tip: "Be specific for best results",
    optimizeBtn: "Optimize Prompt",
    optimizing: "Optimizing...",
    optimizedResult: "OPTIMIZED RESULT",
    copy: "Copy",
    copied: "Copied!",
    clarity: "Clarity",
    specificity: "Specificity",
    structure: "Structure",
    addContext: "Add context automatically",
    addContextDesc: "Include relevant context clues in prompts",
    includeExamples: "Include examples",
    includeExamplesDesc: "Add example outputs to guide AI responses",
    autoOptimize: "Auto-optimize on paste",
    autoOptimizeDesc: "Instantly optimize when text is pasted",
    language: "LANGUAGE",
    languageDesc: "Interface and output language",
    shortcuts: "SHORTCUTS",
    openSidebar: "Open sidebar",
    optimizePrompt: "Optimize prompt",
    copyResult: "Copy result",
    footerCount: "12 optimizations today",
    connected: "Connected",
    anyAi: "Any AI",
    Professional: "Professional",
    Casual: "Casual",
    Academic: "Academic",
    Creative: "Creative",
    Concise: "Concise",
    signIn: "Sign in",
    signOut: "Sign out",
    signInDesc: "Sign in to unlock usage insights and prompt analytics",
    totalPrompts: "Total Prompts",
    totalHours: "Hours Saved",
    avgScore: "Avg Score",
    streak: "Day Streak",
    usageOverTime: "USAGE OVER TIME",
    modelUsage: "MODEL USAGE",
    taskBreakdown: "TASK BREAKDOWN",
    topTopics: "TOP TOPICS",
    peakHours: "PEAK HOURS",
    monthlyReport: "Your monthly report",
    promptsThisMonth: "prompts this month",
    moreProductive: "more productive than last month",
    coding: "Coding",
    writing: "Writing",
    research: "Research",
    creative: "Creative",
    analysis: "Analysis",
    other: "Other",
    loginForInsights: "Sign in to view your insights",
    loginForInsightsDesc:
      "Track your AI usage patterns, discover your prompt habits, and get personalized optimization suggestions.",
    back: "Back",
    optimized: "Optimized",
    original: "Original",
  },
  zh: {
    optimize: "优化",
    history: "历史",
    settings: "设置",
    insights: "洞察",
    targetAi: "目标 AI",
    tone: "语气",
    yourPrompt: "你的提示词",
    clear: "清除",
    placeholder: "输入或粘贴你的提示词...",
    chars: "字符",
    tip: "越具体，效果越好",
    optimizeBtn: "优化提示词",
    optimizing: "优化中...",
    optimizedResult: "优化结果",
    copy: "复制",
    copied: "已复制!",
    clarity: "清晰度",
    specificity: "具体性",
    structure: "结构性",
    addContext: "自动添加上下文",
    addContextDesc: "在提示词中加入相关上下文线索",
    includeExamples: "包含示例",
    includeExamplesDesc: "添加示例输出来引导 AI 回答",
    autoOptimize: "粘贴时自动优化",
    autoOptimizeDesc: "粘贴文本时自动进行优化",
    language: "语言",
    languageDesc: "界面与输出语言",
    shortcuts: "快捷键",
    openSidebar: "打开侧栏",
    optimizePrompt: "优化提示词",
    copyResult: "复制结果",
    footerCount: "今日已优化 12 次",
    connected: "已连接",
    anyAi: "所有 AI",
    Professional: "专业",
    Casual: "日常",
    Academic: "学术",
    Creative: "创意",
    Concise: "简洁",
    signIn: "登录",
    signOut: "退出登录",
    signInDesc: "登录后可查看使用洞察与提示词分析",
    totalPrompts: "总提示词数",
    totalHours: "节省时长",
    avgScore: "平均分",
    streak: "连续天数",
    usageOverTime: "使用趋势",
    modelUsage: "模型使用分布",
    taskBreakdown: "任务类型分布",
    topTopics: "热门话题",
    peakHours: "活跃时段",
    monthlyReport: "你的月度报告",
    promptsThisMonth: "条提示词（本月）",
    moreProductive: "比上月效率提升",
    coding: "编程",
    writing: "写作",
    research: "研究",
    creative: "创意",
    analysis: "分析",
    other: "其他",
    loginForInsights: "登录查看你的洞察",
    loginForInsightsDesc:
      "追踪你的 AI 使用模式，发现提示词习惯，获取个性化优化建议。",
    back: "返回",
    optimized: "优化后",
    original: "原始",
  },
};

const TONES = ["Professional", "Casual", "Academic", "Creative", "Concise"];

// 按 Artificial Analysis Intelligence Index 排序
const AI_TARGETS = [
  { id: "any", name: "Any AI", icon: Globe },
  { id: "gemini", name: "Gemini", icon: Brain },           // AA #1: 57
  { id: "chatgpt", name: "ChatGPT", icon: MessageSquare }, // AA #2: 57
  { id: "claude", name: "Claude", icon: Sparkles },        // AA #3: 53
  { id: "zhipu", name: "GLM / 智谱", icon: Brain },        // AA #4: 50 (开源第一)
  { id: "minimax", name: "MiniMax", icon: Zap },           // AA ~50
  { id: "deepseek", name: "DeepSeek", icon: Search },      // AA ~48
  { id: "kimi", name: "Kimi", icon: Zap },                 // AA #6: 47
  { id: "grok", name: "Grok", icon: Zap },                 // AA ~46
  { id: "tongyi", name: "Qwen / 通义", icon: MessageSquare }, // AA #7: 45
  { id: "mistral", name: "Mistral", icon: Sparkles },      // AA ~44
  { id: "perplexity", name: "Perplexity", icon: Search },  // 搜索增强
  { id: "copilot", name: "Copilot", icon: Code },          // Microsoft
  { id: "doubao", name: "豆包", icon: MessageSquare },      // 字节跳动
  { id: "wenxin", name: "文心一言", icon: PenTool },         // 百度
  { id: "genspark", name: "Genspark", icon: Sparkles },     // Genspark AI
];

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "zh", label: "中文", flag: "中" },
];

// ─── Phase 4: 任务识别 + AI 推荐引擎（基于 AA 榜单）────────────────
type TaskType = "code" | "writing" | "reasoning" | "data" | "translation" | "agent" | "general";

type AIRecommendation = {
  id: string;
  name: string;
  reason: string;
  reasonZh: string;
  badge: string;
  badgeZh: string;
  url: string;
  color: string;
};

const TASK_KEYWORDS: Record<TaskType, string[]> = {
  code: ["代码","code","函数","function","bug","debug","api","接口","程序","python","javascript","typescript","react","vue","sql","git","算法","algorithm","编程","开发","报错","error","implement","写一个类","写一个函数"],
  writing: ["写一篇","写一封","邮件","email","文章","报告","总结","摘要","介绍","简历","cover letter","essay","blog","博客","新闻稿","公告","通知","说明书","文案","copywriting"],
  reasoning: ["分析","为什么","推理","逻辑","证明","论证","科学","数学","物理","化学","why","because","reason","explain","hypothesis","哲学","辩论"],
  data: ["数据","表格","excel","统计","图表","分析报告","data","chart","dashboard","可视化","趋势","增长率","转化率","同比","环比","指标"],
  translation: ["翻译","translate","英文","中文","日文","korean","french","german","spanish","把这段","用英语","用中文","改成英文","改成中文"],
  agent: ["自动化","workflow","流程","多步骤","agent","任务拆解","执行计划","帮我安排","帮我规划","step by step","分步"],
  general: [],
};

const AI_RECOMMENDATIONS: Record<TaskType, AIRecommendation[]> = {
  code: [
    { id: "minimax", name: "MiniMax M2.7", reason: "Code Arena Elo global #9, 1/10 cost of Claude", reasonZh: "Code Arena Elo 全球第9，成本仅 Claude 的 1/10", badge: "Best Value", badgeZh: "性价比最高", url: "https://agent.minimax.io", color: "#18181b" },
    { id: "claude", name: "Claude Sonnet", reason: "AA #3, top instruction following", reasonZh: "AA 第3，代码指令遵循最强", badge: "Top Quality", badgeZh: "质量最高", url: "https://claude.ai", color: "#6366f1" },
  ],
  writing: [
    { id: "claude", name: "Claude Sonnet", reason: "AA #3, best long-form writing & tone", reasonZh: "AA 第3，长文写作和语气最自然", badge: "Best Writing", badgeZh: "写作最强", url: "https://claude.ai", color: "#6366f1" },
    { id: "minimax", name: "MiniMax M2.7", reason: "AA ~50, great Chinese writing, 1/10 cost", reasonZh: "AA ~50，中文写作优秀，成本低", badge: "Best Value", badgeZh: "性价比最高", url: "https://agent.minimax.io", color: "#18181b" },
  ],
  reasoning: [
    { id: "gemini", name: "Gemini 2.5 Pro", reason: "AA #1 (57), top reasoning & science", reasonZh: "AA 第1（57分），推理和科学最强", badge: "AA #1", badgeZh: "AA 第一", url: "https://gemini.google.com", color: "#1a73e8" },
    { id: "chatgpt", name: "ChatGPT o3", reason: "AA #2 (57), advanced reasoning", reasonZh: "AA 第2（57分），复杂推理极强", badge: "AA #2", badgeZh: "AA 第二", url: "https://chat.openai.com", color: "#10a37f" },
  ],
  data: [
    { id: "chatgpt", name: "ChatGPT o3", reason: "AA #2, best data analysis + Code Interpreter", reasonZh: "AA 第2，数据分析+代码执行最强", badge: "AA #2", badgeZh: "AA 第二", url: "https://chat.openai.com", color: "#10a37f" },
    { id: "minimax", name: "MiniMax M2.7", reason: "GDPval-AA ELO1495, office tasks #1", reasonZh: "GDPval-AA ELO1495，办公场景第一", badge: "Office #1", badgeZh: "办公第一", url: "https://agent.minimax.io", color: "#18181b" },
  ],
  translation: [
    { id: "deepseek", name: "DeepSeek", reason: "AA ~48, excellent multilingual, very cheap", reasonZh: "AA ~48，多语言优秀，价格极低", badge: "Best Value", badgeZh: "性价比最高", url: "https://chat.deepseek.com", color: "#4d6bfe" },
    { id: "minimax", name: "MiniMax M2.7", reason: "Strong Chinese-English, low cost", reasonZh: "中英互译出色，成本低", badge: "CN Best", badgeZh: "中文最佳", url: "https://agent.minimax.io", color: "#18181b" },
  ],
  agent: [
    { id: "minimax", name: "MiniMax M2.7", reason: "Toolathon multi-agent top tier, 97% instruction follow", reasonZh: "Toolathon 多智能体第一梯队，指令遵从率97%", badge: "Agent #1", badgeZh: "Agent 最强", url: "https://agent.minimax.io", color: "#18181b" },
    { id: "claude", name: "Claude Sonnet", reason: "AA #3, excellent multi-step task handling", reasonZh: "AA 第3，多步骤任务处理出色", badge: "Top Quality", badgeZh: "质量最高", url: "https://claude.ai", color: "#6366f1" },
  ],
  general: [
    { id: "minimax", name: "MiniMax M2.7", reason: "AA ~50, best price-performance ratio", reasonZh: "AA ~50，性价比最高的全能模型", badge: "Best Value", badgeZh: "性价比最高", url: "https://agent.minimax.io", color: "#18181b" },
    { id: "gemini", name: "Gemini 2.5 Pro", reason: "AA #1, top overall intelligence", reasonZh: "AA 第1，综合能力最强", badge: "AA #1", badgeZh: "AA 第一", url: "https://gemini.google.com", color: "#1a73e8" },
  ],
};

const TASK_LABELS: Record<TaskType, { zh: string; en: string; icon: string }> = {
  code:        { zh: "写代码",   en: "Coding",      icon: "💻" },
  writing:     { zh: "写作",     en: "Writing",     icon: "✍️" },
  reasoning:   { zh: "推理分析", en: "Reasoning",   icon: "🔬" },
  data:        { zh: "数据分析", en: "Data",        icon: "📊" },
  translation: { zh: "翻译",     en: "Translation", icon: "🌐" },
  agent:       { zh: "自动化",   en: "Agent Task",  icon: "🤖" },
  general:     { zh: "通用问答", en: "General",     icon: "💬" },
};

function detectTaskType(text: string): TaskType {
  const lower = text.toLowerCase();
  for (const [task, keywords] of Object.entries(TASK_KEYWORDS) as [TaskType, string[]][]) {
    if (task === "general") continue;
    if (keywords.some(kw => lower.includes(kw))) return task;
  }
  return "general";
}

// ─── Mock Analytics Data ────────────────────────────
const usageTrendData = [
  { name: "Mon", count: 12 },
  { name: "Tue", count: 19 },
  { name: "Wed", count: 8 },
  { name: "Thu", count: 24 },
  { name: "Fri", count: 16 },
  { name: "Sat", count: 31 },
  { name: "Sun", count: 22 },
];
const usageTrendDataZh = [
  { name: "周一", count: 12 },
  { name: "周二", count: 19 },
  { name: "周三", count: 8 },
  { name: "周四", count: 24 },
  { name: "周五", count: 16 },
  { name: "周六", count: 31 },
  { name: "周日", count: 22 },
];

const modelData = [
  { name: "ChatGPT", value: 42, color: "#18181b" },
  { name: "Claude", value: 28, color: "#6366f1" },
  { name: "Kimi", value: 18, color: "#8b5cf6" },
  { name: "Gemini", value: 12, color: "#c4b5fd" },
];

const peakHoursData = [
  { hour: "6am", count: 2 },
  { hour: "8am", count: 8 },
  { hour: "10am", count: 18 },
  { hour: "12pm", count: 12 },
  { hour: "2pm", count: 22 },
  { hour: "4pm", count: 15 },
  { hour: "6pm", count: 9 },
  { hour: "8pm", count: 14 },
  { hour: "10pm", count: 20 },
];
const peakHoursDataZh = [
  { hour: "6时", count: 2 },
  { hour: "8时", count: 8 },
  { hour: "10时", count: 18 },
  { hour: "12时", count: 12 },
  { hour: "14时", count: 22 },
  { hour: "16时", count: 15 },
  { hour: "18时", count: 9 },
  { hour: "20时", count: 14 },
  { hour: "22时", count: 20 },
];

// ─── Component ──────────────────────────────────────
export default function Sidebar() {
  const [lang, setLang] = useState<Lang>("zh");
  const [activeTab, setActiveTab] = useState<Tab>("optimize");
  const [inputText, setInputText] = useState("");
  const [selectedTone, setSelectedTone] = useState("Professional");
  const [selectedTarget, setSelectedTarget] = useState("any");
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const [optimizedText, setOptimizedText] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addContext, setAddContext] = useState(true);
  const [addExamples, setAddExamples] = useState(false);
  const [autoOptimize, setAutoOptimize] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        skipBrowserRedirect: true,
        redirectTo: "https://vyuzkbdxsweaqftyqifh.supabase.co/auth/v1/callback",
        queryParams: {
          prompt: "select_account",
        },
      },
    });
    if (!data?.url) return;

    if (typeof chrome !== "undefined" && chrome?.tabs) {
      // 记录当前正在看的标签页，登录完回来
      const [currentTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const returnTabId = currentTab?.id;

      const tab = await chrome.tabs.create({ url: data.url });
      const tabId = tab.id!;

      // 轮询检查登录标签页的 URL（hash 部分 chrome.tabs.onUpdated 拿不到）
      const checkInterval = setInterval(async () => {
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => window.location.href,
          });
          const currentUrl = results?.[0]?.result || "";

          if (currentUrl.includes("access_token=")) {
            clearInterval(checkInterval);

            const hash = currentUrl.split("#")[1];
            if (hash) {
              const params = new URLSearchParams(hash);
              const accessToken = params.get("access_token");
              const refreshToken = params.get("refresh_token");
              if (accessToken && refreshToken) {
                await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });
              }
            }
            // 关闭登录标签页，切回原来的标签页
            setTimeout(() => {
              try { chrome.tabs.remove(tabId); } catch {}
              // 切回登录前正在看的标签页
              if (returnTabId) {
                setTimeout(() => {
                  try { chrome.tabs.update(returnTabId, { active: true }); } catch {}
                }, 200);
              }
            }, 500);
          }
        } catch {
          // 标签页可能已关闭或还在 Google 域名上（无权限），忽略
        }
      }, 1500);

      // 60 秒后停止检查（防止无限轮询）
      setTimeout(() => clearInterval(checkInterval), 60000);
    } else {
      window.open(data.url, "_blank");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
  };
  const [expandedHistory, setExpandedHistory] = useState<number | null>(null);

  // ── 真实历史记录 ──
  type PromptRecord = {
    id: string;
    original_text: string;
    optimized_text: string | null;
    diagnosis: string | null;
    platform: string | null;
    tone: string | null;
    created_at: string;
  };
  const [realHistory, setRealHistory] = useState<PromptRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("prompts")
      .select("id, original_text, optimized_text, diagnosis, platform, tone, task_type, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error && data) setRealHistory(data as PromptRecord[]);
    setHistoryLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn && activeTab === "history") fetchHistory();
  }, [isLoggedIn, activeTab]);

  const deleteHistory = async (id: string) => {
    await supabase.from("prompts").delete().eq("id", id);
    setRealHistory((prev) => prev.filter((r) => r.id !== id));
  };

  const formatRelativeTime = (isoStr: string) => {
    const diff = Date.now() - new Date(isoStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (lang === "zh") {
      if (mins < 1) return "刚刚";
      if (mins < 60) return `${mins} 分钟前`;
      if (hours < 24) return `${hours} 小时前`;
      if (days === 1) return "昨天";
      return `${days} 天前`;
    } else {
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return "yesterday";
      return `${days}d ago`;
    }
  };

  const filteredHistory = realHistory.filter(
    (r) =>
      r.original_text.toLowerCase().includes(historySearch.toLowerCase()) ||
      (r.optimized_text || "").toLowerCase().includes(historySearch.toLowerCase())
  );

  // 按日期分组
  const groupedHistory = (() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = todayStart - 6 * 86400000;
    const groups: { label: string; items: typeof filteredHistory }[] = [];
    const today = filteredHistory.filter(r => new Date(r.created_at).getTime() >= todayStart);
    const thisWeek = filteredHistory.filter(r => {
      const t = new Date(r.created_at).getTime();
      return t >= weekStart && t < todayStart;
    });
    const earlier = filteredHistory.filter(r => new Date(r.created_at).getTime() < weekStart);
    if (today.length) groups.push({ label: lang === "zh" ? "今天" : "Today", items: today });
    if (thisWeek.length) groups.push({ label: lang === "zh" ? "本周" : "This Week", items: thisWeek });
    if (earlier.length) groups.push({ label: lang === "zh" ? "更早" : "Earlier", items: earlier });
    return groups;
  })();

  // ── 真实统计数据 ──
  type RealStats = {
    totalPrompts: number;
    streak: number;
  };
  const [realStats, setRealStats] = useState<RealStats>({ totalPrompts: 0, streak: 0 });

  const fetchStats = async () => {
    if (!user) return;
    // 总数
    const { count } = await supabase
      .from("prompts")
      .select("*", { count: "exact", head: true });
    // 连续天数：读最近30天的记录，算连续有记录的天数
    const { data: recent } = await supabase
      .from("prompts")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    let streak = 0;
    if (recent && recent.length > 0) {
      const days = new Set(recent.map(r => new Date(r.created_at).toDateString()));
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (days.has(d.toDateString())) streak++;
        else break;
      }
    }
    setRealStats({ totalPrompts: count ?? 0, streak });
  };

  useEffect(() => {
    if (isLoggedIn) fetchStats();
  }, [isLoggedIn, realHistory]);

  const t = (key: string) => i18n[lang][key] ?? key;

  const historyItems = lang === "zh"
    ? [
        {
          original: "怎么学 React？",
          optimized:
            "作为一名前端开发专家，请为我提供2026年学习React.js最有效的路径。请包含：\n\n1. 推荐的学习资源（官方文档、课程、书籍）\n2. 循序渐进的学习计划\n3. 每个阶段的关键概念\n4. 实战项目建议\n5. 常见误区与最佳实践",
          time: "2 分钟前",
          model: "ChatGPT",
          score: 92,
        },
        {
          original: "帮我写一封邮件",
          optimized:
            "请以专业的语气撰写一封关于项目进度更新的客户邮件。邮件需要包含：\n\n- 项目当前完成进度\n- 本周已完成的关键里程碑\n- 下周的工作计划\n- 需要客户协助确认的事项\n\n语气要求：正式但友好，简洁明了",
          time: "15 分钟前",
          model: "Claude",
          score: 88,
        },
        {
          original: "解释量子计算",
          optimized:
            "请为具有基础物理知识的读者，结构化地解释量子计算的核心原理。请包含：\n\n1. 量子比特与经典比特的区别\n2. 量子叠加和量子纠缠的通俗解释\n3. 量子计算的实际应用场景\n4. 当前量子计算的发展阶段\n5. 使用生活化的类比帮助理解",
          time: "1 小时前",
          model: "ChatGPT",
          score: 95,
        },
        {
          original: "Python 爬虫怎么写",
          optimized:
            "作为 Python 开发专家，请教我如何编写一个网页爬虫。请涵盖：\n\n1. 推荐使用的库（requests, BeautifulSoup, Scrapy）\n2. 完整的代码示例（附注释）\n3. 反爬机制的应对策略\n4. 数据存储方案\n5. 合规与道德注意事项",
          time: "3 小时前",
          model: "Kimi",
          score: 90,
        },
        {
          original: "写一个产品需求文档",
          optimized:
            "请帮我撰写一份完整的产品需求文档（PRD），产品是一款AI提示词优化工具。请包含以下章节：\n\n1. 产品概述与目标用户\n2. 核心功能需求（按优先级排列）\n3. 用户故事与使用场景\n4. 非功能性需求\n5. 验收标准与成功指标",
          time: "昨天",
          model: "Claude",
          score: 94,
        },
      ]
    : [
        {
          original: "How to learn React?",
          optimized:
            "As a frontend development expert, please provide the most effective learning path for React.js in 2026. Please include:\n\n1. Recommended learning resources (docs, courses, books)\n2. A step-by-step learning plan\n3. Key concepts at each stage\n4. Hands-on project suggestions\n5. Common pitfalls and best practices",
          time: "2 min ago",
          model: "ChatGPT",
          score: 92,
        },
        {
          original: "Write me an email",
          optimized:
            "Draft a professional email regarding project progress updates. The email should include:\n\n- Current project completion status\n- Key milestones completed this week\n- Work plan for next week\n- Items requiring client confirmation\n\nTone: formal yet friendly, concise and clear",
          time: "15 min ago",
          model: "Claude",
          score: 88,
        },
        {
          original: "Explain quantum computing",
          optimized:
            "Provide a structured explanation of quantum computing principles for readers with basic physics knowledge. Please cover:\n\n1. Difference between qubits and classical bits\n2. Layman's explanation of superposition and entanglement\n3. Real-world application scenarios\n4. Current stage of quantum computing development\n5. Use everyday analogies to aid understanding",
          time: "1 hr ago",
          model: "ChatGPT",
          score: 95,
        },
        {
          original: "How to write a Python scraper",
          optimized:
            "As a Python development expert, teach me how to build a web scraper. Please cover:\n\n1. Recommended libraries (requests, BeautifulSoup, Scrapy)\n2. Complete code example with comments\n3. Anti-scraping countermeasures\n4. Data storage solutions\n5. Compliance and ethical considerations",
          time: "3 hrs ago",
          model: "Kimi",
          score: 90,
        },
        {
          original: "Write a product requirements doc",
          optimized:
            "Help me write a complete Product Requirements Document (PRD) for an AI prompt optimization tool. Include these sections:\n\n1. Product overview and target users\n2. Core feature requirements (prioritized)\n3. User stories and use cases\n4. Non-functional requirements\n5. Acceptance criteria and success metrics",
          time: "Yesterday",
          model: "Claude",
          score: 94,
        },
      ];

  const targetObj = AI_TARGETS.find((t) => t.id === selectedTarget)!;

  const [diagnosis, setDiagnosis] = useState("");

  const API_URL = "https://prompt-optimizer-api.prompt-optimizer.workers.dev";

  const handleOptimize = async () => {
    if (!inputText.trim()) return;
    setIsOptimizing(true);
    setOptimizedText("");
    setDiagnosis("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText.trim() }),
      });

      if (!res.ok) throw new Error("服务异常");

      const data = await res.json();
      if (data.diagnosis && data.diagnosis !== "已优化") {
        setDiagnosis(data.diagnosis);
      }
      setOptimizedText(data.optimized || data.error || "未返回结果");

      // 存入数据库（已登录时）
      if (user && data.optimized) {
        supabase.from("prompts").insert({
          user_id: user.id,
          original_text: inputText.trim(),
          optimized_text: data.optimized,
          diagnosis: data.diagnosis || null,
          platform: selectedTarget !== "any" ? selectedTarget : null,
          tone: selectedTone,
          task_type: detectedTask || "general",
        }).then(() => {}).catch(() => {});
      }
    } catch (err) {
      setOptimizedText(
        lang === "zh" ? "优化失败，请稍后重试" : "Optimization failed, please try again"
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const [fillStatus, setFillStatus] = useState("");

  // Phase 4: 任务检测
  const [detectedTask, setDetectedTask] = useState<TaskType | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(true);

  useEffect(() => {
    if (inputText.trim().length > 15) {
      const task = detectTaskType(inputText);
      setDetectedTask(task);
      setShowRecommendation(true);
    } else {
      setDetectedTask(null);
    }
  }, [inputText]);

  const handleFillToChat = async () => {
    if (!optimizedText) return;
    try {
      if (typeof chrome !== "undefined" && chrome?.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          // 方法1：通过 content script 消息通信（最可靠）
          try {
            const response = await chrome.tabs.sendMessage(tab.id, {
              type: "FILL_INPUT",
              text: optimizedText,
            });
            if (response?.ok) {
              setFillStatus("filled");
              setTimeout(() => setFillStatus(""), 2000);
              return;
            }
          } catch {
            // content script 没加载，尝试方法2
          }

          // 方法2：直接注入脚本
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (text: string) => {
                const sels = ["#prompt-textarea", "div.ProseMirror[contenteditable='true']", "div[contenteditable='true'][spellcheck]", "div[contenteditable='true']", "textarea"];
                let input: HTMLElement | null = null;
                for (const s of sels) { const el = document.querySelector<HTMLElement>(s); if (el && el.offsetHeight > 0) { input = el; break; } }
                if (!input) return;
                input.focus();
                if (input instanceof HTMLTextAreaElement) {
                  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
                  if (setter) setter.call(input, text); else input.value = text;
                  input.dispatchEvent(new Event("input", { bubbles: true }));
                } else {
                  input.textContent = "";
                  const sel = window.getSelection(); const range = document.createRange();
                  range.selectNodeContents(input); sel?.removeAllRanges(); sel?.addRange(range);
                  document.execCommand("insertText", false, text);
                  if (!input.textContent) input.textContent = text;
                  input.dispatchEvent(new InputEvent("input", { bubbles: true }));
                }
              },
              args: [optimizedText],
            });
            setFillStatus("filled");
            setTimeout(() => setFillStatus(""), 2000);
            return;
          } catch {}
        }
      }
      // 兜底：复制到剪贴板
      await navigator.clipboard.writeText(optimizedText);
      setFillStatus("copied");
      setTimeout(() => setFillStatus(""), 2000);
    } catch {
      try { await navigator.clipboard.writeText(optimizedText); setFillStatus("copied"); } catch { setFillStatus("error"); }
      setTimeout(() => setFillStatus(""), 2000);
    }
  };

  const handleCopy = (text?: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text || optimizedText;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText("");
    setOptimizedText("");
  };

  const Toggle = ({
    value,
    onChange,
  }: {
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-colors duration-200 relative flex-shrink-0 ${
        value ? "bg-[#18181b]" : "bg-[#d8d8e0]"
      }`}
    >
      <motion.div
        className="w-3.5 h-3.5 bg-white rounded-full absolute top-[3px] shadow-sm"
        animate={{ left: value ? 18 : 3 }}
        transition={{ duration: 0.15 }}
      />
    </button>
  );

  const taskData = [
    { name: t("coding"), value: 32, icon: Code, color: "#18181b" },
    { name: t("writing"), value: 25, icon: PenTool, color: "#6366f1" },
    { name: t("research"), value: 20, icon: Search, color: "#8b5cf6" },
    { name: t("creative"), value: 12, icon: Brain, color: "#a78bfa" },
    { name: t("analysis"), value: 8, icon: BarChart3, color: "#c4b5fd" },
    { name: t("other"), value: 3, icon: FileText, color: "#e2e2e8" },
  ];

  const topTopics =
    lang === "zh"
      ? [
          { topic: "React / 前端开发", count: 48 },
          { topic: "Python 编程", count: 36 },
          { topic: "产品设计", count: 28 },
          { topic: "数据分析", count: 22 },
          { topic: "邮件写作", count: 18 },
        ]
      : [
          { topic: "React / Frontend", count: 48 },
          { topic: "Python Programming", count: 36 },
          { topic: "Product Design", count: 28 },
          { topic: "Data Analysis", count: 22 },
          { topic: "Email Writing", count: 18 },
        ];

  // ─── Tabs config ──────────────────────────────────
  const tabs = [
    { key: "optimize" as Tab, icon: Sparkles },
    { key: "history" as Tab, icon: History },
    { key: "insights" as Tab, icon: BarChart3 },
    { key: "settings" as Tab, icon: Settings },
  ];

  return (
    <div className="w-[380px] h-screen bg-white flex flex-col border-r border-[#e8e8ec]">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#18181b] flex items-center justify-center">
              <Wand2 size={14} className="text-white" />
            </div>
            <span
              className="text-[15px] tracking-[-0.3px] text-[#18181b]"
              style={{ fontWeight: 600 }}
            >
              prompt<span className="text-violet-500">.</span>ai
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn && (
              user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} className="w-6 h-6 rounded-full" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                  <User size={11} className="text-white" />
                </div>
              )
            )}
            <span className="text-[11px] text-[#8b8b9e] bg-[#f4f4f6] px-2 py-0.5 rounded-full tracking-[-0.2px]">
              v1.2
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-[#f4f4f6] rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-[7px] rounded-md text-[12px] tracking-[-0.2px] transition-all duration-150 ${
                activeTab === tab.key
                  ? "bg-white text-[#18181b] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
                  : "text-[#8b8b9e] hover:text-[#5a5a72]"
              }`}
              style={{ fontWeight: activeTab === tab.key ? 500 : 400 }}
            >
              <tab.icon size={12} />
              {t(tab.key)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* ─── OPTIMIZE TAB ─── */}
          {activeTab === "optimize" && (
            <motion.div
              key="optimize"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-5 flex flex-col gap-4 pt-3"
            >
              {/* Target AI */}
              <div className="relative">
                <label
                  className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-1.5 block"
                  style={{ fontWeight: 500 }}
                >
                  {t("targetAi")}
                </label>
                <button
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                  className="w-full flex items-center justify-between px-3 py-[7px] rounded-lg border border-[#e8e8ec] bg-[#fafafa] text-[13px] text-[#18181b] hover:border-[#d0d0d8] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <targetObj.icon size={13} className="text-[#8b8b9e]" />
                    {targetObj.id === "any" ? t("anyAi") : targetObj.name}
                  </span>
                  <ChevronDown size={13} className="text-[#8b8b9e]" />
                </button>
                {showTargetDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e8e8ec] rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-10 overflow-hidden"
                  >
                    {AI_TARGETS.map((target) => (
                      <button
                        key={target.id}
                        onClick={() => {
                          setSelectedTarget(target.id);
                          setShowTargetDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-[#f4f4f6] transition-colors ${
                          selectedTarget === target.id
                            ? "text-[#18181b] bg-[#f4f4f6]"
                            : "text-[#5a5a72]"
                        }`}
                      >
                        <target.icon size={13} />
                        {target.id === "any" ? t("anyAi") : target.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Tone */}
              <div>
                <label
                  className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-1.5 block"
                  style={{ fontWeight: 500 }}
                >
                  {t("tone")}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TONES.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-3 py-[5px] rounded-md text-[12.5px] tracking-[-0.1px] transition-all duration-150 border ${
                        selectedTone === tone
                          ? "bg-[#18181b] text-white border-[#18181b]"
                          : "bg-white text-[#5a5a72] border-[#e8e8ec] hover:border-[#c8c8d4] hover:text-[#18181b]"
                      }`}
                    >
                      {t(tone)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase"
                    style={{ fontWeight: 500 }}
                  >
                    {t("yourPrompt")}
                  </label>
                  {inputText && (
                    <button
                      onClick={handleReset}
                      className="text-[11px] text-[#8b8b9e] hover:text-[#5a5a72] flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw size={10} />
                      {t("clear")}
                    </button>
                  )}
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t("placeholder")}
                  className="w-full h-[100px] px-3 py-2.5 rounded-lg border border-[#e8e8ec] bg-[#fafafa] text-[13px] text-[#18181b] placeholder:text-[#c0c0cc] resize-none focus:outline-none focus:border-[#b0b0c0] focus:ring-2 focus:ring-[#18181b]/5 transition-all"
                />
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[11px] text-[#c0c0cc]">
                    {inputText.length} {t("chars")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Lightbulb size={11} className="text-[#c0c0cc]" />
                    <span className="text-[11px] text-[#c0c0cc]">
                      {t("tip")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Phase 4: AI 推荐卡片 */}
              <AnimatePresence>
                {detectedTask && showRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl border border-[#e8e8ec] bg-[#fafafa] p-3">
                      {/* 任务类型标题 */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[13px]">{TASK_LABELS[detectedTask].icon}</span>
                          <span className="text-[12px] text-[#18181b]" style={{ fontWeight: 600 }}>
                            {lang === "zh"
                              ? `检测到：${TASK_LABELS[detectedTask].zh}任务`
                              : `Detected: ${TASK_LABELS[detectedTask].en} Task`}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowRecommendation(false)}
                          className="text-[11px] text-[#c0c0cc] hover:text-[#8b8b9e] transition-colors px-1"
                        >
                          ✕
                        </button>
                      </div>

                      {/* 推荐卡片列表 */}
                      <div className="flex flex-col gap-2">
                        {AI_RECOMMENDATIONS[detectedTask].map((rec, i) => (
                          <div
                            key={rec.id}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                              i === 0
                                ? "border-[#18181b]/20 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                                : "border-[#e8e8ec] bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {/* 排名 */}
                              <span
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white flex-shrink-0"
                                style={{ background: rec.color, fontWeight: 700 }}
                              >
                                {i + 1}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12.5px] text-[#18181b]" style={{ fontWeight: 500 }}>
                                    {rec.name}
                                  </span>
                                  <span
                                    className="text-[9.5px] px-1.5 py-0.5 rounded-full text-white"
                                    style={{ background: rec.color, fontWeight: 500 }}
                                  >
                                    {lang === "zh" ? rec.badgeZh : rec.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#8b8b9e] mt-0.5" style={{ lineHeight: "1.4" }}>
                                  {lang === "zh" ? rec.reasonZh : rec.reason}
                                </p>
                              </div>
                            </div>
                            <a
                              href={rec.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-[11px] text-[#18181b] bg-[#f4f4f6] hover:bg-[#18181b] hover:text-white px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 ml-2"
                              style={{ fontWeight: 500 }}
                            >
                              {lang === "zh" ? "去用" : "Open"}
                              <ArrowRight size={10} />
                            </a>
                          </div>
                        ))}
                      </div>

                      {/* AA 来源标注 */}
                      <p className="text-[10.5px] text-[#c0c0cc] mt-2 text-center">
                        {lang === "zh" ? "基于 Artificial Analysis 榜单" : "Based on Artificial Analysis rankings"}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Optimize Button */}
              <button
                onClick={handleOptimize}
                disabled={!inputText.trim() || isOptimizing}
                className={`w-full flex items-center justify-center gap-2 py-[10px] rounded-lg text-[13.5px] tracking-[-0.2px] transition-all duration-200 ${
                  inputText.trim() && !isOptimizing
                    ? "bg-[#18181b] text-white hover:bg-[#2a2a30] active:scale-[0.98] shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    : "bg-[#e8e8ec] text-[#b0b0be] cursor-not-allowed"
                }`}
                style={{ fontWeight: 500 }}
              >
                {isOptimizing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Sparkles size={14} />
                    </motion.div>
                    {t("optimizing")}
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    {t("optimizeBtn")}
                    <ArrowRight size={13} />
                  </>
                )}
              </button>

              {/* Output */}
              <AnimatePresence>
                {optimizedText && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Diagnosis card */}
                    {diagnosis && (
                      <div className="flex items-start gap-2 px-3 py-2.5 bg-[#fffbf0] border border-[#f0e4c8] rounded-lg mb-3">
                        <Lightbulb size={13} className="text-[#c09b3f] flex-shrink-0 mt-0.5" />
                        <span className="text-[12.5px] text-[#8a6d3b]">{diagnosis}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1.5">
                      <label
                        className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase flex items-center gap-1.5"
                        style={{ fontWeight: 500 }}
                      >
                        <Target size={11} />
                        {t("optimizedResult")}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleFillToChat}
                          className={`flex items-center gap-1 text-[11px] text-white px-2.5 py-1 rounded-md transition-colors ${
                            fillStatus === "filled" ? "bg-emerald-500" :
                            fillStatus === "copied" ? "bg-blue-500" :
                            fillStatus === "error" ? "bg-red-500" :
                            "bg-[#18181b] hover:bg-[#2a2a30]"
                          }`}
                        >
                          {fillStatus === "filled" ? (
                            <><Check size={10} />{lang === "zh" ? "已填入" : "Filled"}</>
                          ) : fillStatus === "copied" ? (
                            <><Check size={10} />{lang === "zh" ? "已复制" : "Copied"}</>
                          ) : (
                            <><ArrowRight size={10} />{lang === "zh" ? "填入对话框" : "Fill Chat"}</>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy()}
                          className="flex items-center gap-1 text-[11px] text-[#8b8b9e] hover:text-[#18181b] transition-colors bg-[#f4f4f6] hover:bg-[#ebebf0] px-2 py-1 rounded-md"
                        >
                          {copied ? (
                            <>
                              <Check size={11} className="text-emerald-500" />
                              <span className="text-emerald-500">
                                {t("copied")}
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              {t("copy")}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute top-0 left-0 w-[3px] h-full bg-[#18181b] rounded-full" />
                      <div
                        className="pl-4 pr-3 py-3 bg-[#fafafa] rounded-lg border border-[#e8e8ec] text-[13px] text-[#2a2a30] whitespace-pre-wrap max-h-[200px] overflow-y-auto"
                        style={{ lineHeight: "1.65" }}
                      >
                        {optimizedText}
                      </div>
                    </div>
                    <div className="flex gap-3 mt-3">
                      {[
                        {
                          label: t("clarity"),
                          value: "+85%",
                          color: "text-emerald-500",
                        },
                        {
                          label: t("specificity"),
                          value: "+72%",
                          color: "text-blue-500",
                        },
                        {
                          label: t("structure"),
                          value: "+90%",
                          color: "text-violet-500",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="flex-1 bg-[#fafafa] border border-[#e8e8ec] rounded-lg px-3 py-2 text-center"
                        >
                          <div
                            className={`text-[13px] ${stat.color}`}
                            style={{ fontWeight: 600 }}
                          >
                            {stat.value}
                          </div>
                          <div className="text-[10.5px] text-[#8b8b9e]">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ─── HISTORY TAB ─── */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-5 pt-3"
            >
              {/* 未登录 */}
              {!isLoggedIn ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f4f4f6] to-[#e8e8ec] flex items-center justify-center mb-5">
                    <History size={28} className="text-[#8b8b9e]" />
                  </div>
                  <h3 className="text-[15px] text-[#18181b] text-center mb-2">
                    {lang === "zh" ? "登录查看历史记录" : "Sign in to view history"}
                  </h3>
                  <p className="text-[12.5px] text-[#8b8b9e] text-center mb-6 px-4" style={{ lineHeight: "1.6" }}>
                    {lang === "zh"
                      ? "登录后可以查看所有优化过的 prompt 记录，随时复用"
                      : "Sign in to access all your optimized prompts anytime"}
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-2 bg-[#18181b] text-white px-6 py-2.5 rounded-lg text-[13px] hover:bg-[#2a2a30] active:scale-[0.98] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    style={{ fontWeight: 500 }}
                  >
                    <LogIn size={14} />
                    {t("signIn")}
                  </button>
                </div>
              ) : (
                <>
                  {/* 搜索框 */}
                  <div className="relative mb-3">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c0c0cc]" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder={lang === "zh" ? "搜索历史记录..." : "Search history..."}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#e8e8ec] bg-[#fafafa] text-[13px] text-[#18181b] placeholder:text-[#c0c0cc] focus:outline-none focus:border-[#b0b0c0] transition-colors"
                    />
                  </div>

                  {/* 加载中 */}
                  {historyLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={18} className="text-[#c0c0cc]" />
                      </motion.div>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    /* 空状态 */
                    <div className="flex flex-col items-center justify-center py-12">
                      <Clock size={28} className="text-[#e8e8ec] mb-3" />
                      <p className="text-[13px] text-[#8b8b9e]">
                        {historySearch
                          ? (lang === "zh" ? "没有找到匹配记录" : "No matching records")
                          : (lang === "zh" ? "还没有优化记录" : "No history yet")}
                      </p>
                      {!historySearch && (
                        <p className="text-[12px] text-[#c0c0cc] mt-1">
                          {lang === "zh" ? "去优化你的第一个 prompt 吧" : "Optimize your first prompt!"}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* 历史列表（按日期分组）*/
                    <div className="flex flex-col gap-4">
                      {groupedHistory.map((group) => (
                        <div key={group.label}>
                          {/* 分组标题 */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[11px] text-[#8b8b9e] uppercase tracking-[0.4px]" style={{ fontWeight: 600 }}>
                              {group.label}
                            </span>
                            <div className="flex-1 h-px bg-[#f0f0f4]" />
                            <span className="text-[11px] text-[#c0c0cc]">{group.items.length}</span>
                          </div>
                          <div className="flex flex-col gap-2.5">
                      {group.items.map((item, i) => {
                        const uid = `${group.label}-${i}`;
                        const isExpanded = expandedHistory === (groupedHistory.indexOf(group) * 1000 + i);
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            className="rounded-xl border border-[#e8e8ec] bg-white hover:border-[#d0d0d8] transition-colors overflow-hidden"
                          >
                            {/* Header */}
                            <button
                              onClick={() => setExpandedHistory(isExpanded ? null : (groupedHistory.indexOf(group) * 1000 + i))}
                              className="text-left w-full p-3.5 group"
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11.5px] text-[#8b8b9e]">
                                    {formatRelativeTime(item.created_at)}
                                  </span>
                                  {item.platform && item.platform !== "any" && (
                                    <span className="text-[10px] text-[#8b8b9e] bg-[#f4f4f6] px-1.5 py-0.5 rounded capitalize">
                                      {item.platform}
                                    </span>
                                  )}
                                </div>
                                <motion.div
                                  animate={{ rotate: isExpanded ? 90 : 0 }}
                                  transition={{ duration: 0.15 }}
                                >
                                  <ArrowRight size={12} className="text-[#c0c0cc] group-hover:text-[#18181b] transition-colors" />
                                </motion.div>
                              </div>
                              <p className="text-[13px] text-[#18181b]" style={{ fontWeight: 500 }}>
                                {item.original_text.length > 60
                                  ? item.original_text.slice(0, 60) + "…"
                                  : item.original_text}
                              </p>
                              {!isExpanded && item.optimized_text && (
                                <p className="text-[12px] text-[#8b8b9e] truncate mt-1">
                                  → {item.optimized_text.split("\n")[0]}
                                </p>
                              )}
                            </button>

                            {/* Expanded */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3.5 pb-3.5">
                                    <div className="border-t border-[#f0f0f4] pt-3">
                                      {/* Diagnosis */}
                                      {item.diagnosis && item.diagnosis !== "已优化" && (
                                        <div className="flex items-start gap-2 px-3 py-2 bg-[#fffbf0] border border-[#f0e4c8] rounded-lg mb-3">
                                          <Lightbulb size={12} className="text-[#c09b3f] flex-shrink-0 mt-0.5" />
                                          <span className="text-[12px] text-[#8a6d3b]">{item.diagnosis}</span>
                                        </div>
                                      )}

                                      {/* Original */}
                                      <div className="mb-3">
                                        <span className="text-[11px] text-[#8b8b9e] uppercase tracking-[0.3px] block mb-1.5" style={{ fontWeight: 500 }}>
                                          {t("original")}
                                        </span>
                                        <p className="text-[12.5px] text-[#8b8b9e] whitespace-pre-wrap" style={{ lineHeight: "1.6" }}>
                                          {item.original_text}
                                        </p>
                                      </div>

                                      {/* Optimized */}
                                      {item.optimized_text && (
                                        <div>
                                          <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] text-[#8b8b9e] uppercase tracking-[0.3px]" style={{ fontWeight: 500 }}>
                                              {t("optimized")}
                                            </span>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleCopy(item.optimized_text!); }}
                                              className="flex items-center gap-1 text-[10.5px] text-[#8b8b9e] hover:text-[#18181b] bg-[#f4f4f6] hover:bg-[#ebebf0] px-2 py-0.5 rounded transition-colors"
                                            >
                                              <Copy size={10} />
                                              {t("copy")}
                                            </button>
                                          </div>
                                          <div className="relative">
                                            <div className="absolute top-0 left-0 w-[2.5px] h-full bg-[#18181b] rounded-full" />
                                            <div className="pl-3 text-[12.5px] text-[#2a2a30] whitespace-pre-wrap max-h-[150px] overflow-y-auto" style={{ lineHeight: "1.7" }}>
                                              {item.optimized_text}
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Actions */}
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => { setInputText(item.original_text); setActiveTab("optimize"); }}
                                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#e8e8ec] text-[12px] text-[#5a5a72] hover:text-[#18181b] hover:border-[#c8c8d4] transition-colors"
                                        >
                                          <RotateCcw size={11} />
                                          {lang === "zh" ? "重新优化" : "Re-optimize"}
                                        </button>
                                        <button
                                          onClick={(e) => { e.stopPropagation(); deleteHistory(item.id); }}
                                          className="px-3 py-2 rounded-lg border border-[#e8e8ec] text-[12px] text-[#c0c0cc] hover:text-red-400 hover:border-red-200 transition-colors"
                                        >
                                          {lang === "zh" ? "删除" : "Delete"}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ─── INSIGHTS TAB ─── */}
          {activeTab === "insights" && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-5 pt-3"
            >
              {!isLoggedIn ? (
                /* ── Login CTA ── */
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f4f4f6] to-[#e8e8ec] flex items-center justify-center mb-5">
                    <BarChart3 size={28} className="text-[#8b8b9e]" />
                  </div>
                  <h3 className="text-[15px] text-[#18181b] text-center mb-2">
                    {t("loginForInsights")}
                  </h3>
                  <p className="text-[12.5px] text-[#8b8b9e] text-center mb-6 px-4" style={{ lineHeight: "1.6" }}>
                    {t("loginForInsightsDesc")}
                  </p>
                  <button
                    onClick={handleGoogleSignIn}
                    className="flex items-center gap-2 bg-[#18181b] text-white px-6 py-2.5 rounded-lg text-[13px] hover:bg-[#2a2a30] active:scale-[0.98] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    style={{ fontWeight: 500 }}
                  >
                    <LogIn size={14} />
                    {t("signIn")}
                  </button>
                </div>
              ) : realStats.totalPrompts === 0 ? (
                /* ── 空状态：还没有数据 ── */
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f4f4f6] to-[#e8e8ec] flex items-center justify-center mb-5">
                    <BarChart3 size={28} className="text-[#c0c0cc]" />
                  </div>
                  <h3 className="text-[15px] text-[#18181b] text-center mb-2" style={{ fontWeight: 500 }}>
                    {lang === "zh" ? "还没有使用数据" : "No data yet"}
                  </h3>
                  <p className="text-[12.5px] text-[#8b8b9e] text-center mb-6 px-4" style={{ lineHeight: "1.6" }}>
                    {lang === "zh"
                      ? "去优化几个 prompt，这里会自动生成你的使用洞察"
                      : "Optimize some prompts and your insights will appear here"}
                  </p>
                  <button
                    onClick={() => setActiveTab("optimize")}
                    className="flex items-center gap-2 bg-[#18181b] text-white px-5 py-2.5 rounded-lg text-[13px] hover:bg-[#2a2a30] transition-all"
                    style={{ fontWeight: 500 }}
                  >
                    <Sparkles size={13} />
                    {lang === "zh" ? "去优化 Prompt" : "Start Optimizing"}
                  </button>
                </div>
              ) : (
                /* ── Analytics Dashboard（有数据才显示）── */
                <div className="flex flex-col gap-5">
                  {/* Summary card */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#18181b] to-[#2d2d35] p-4 text-white">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Calendar size={12} className="text-violet-300" />
                        <span className="text-[11px] text-violet-300 tracking-[0.3px] uppercase" style={{ fontWeight: 500 }}>
                          {t("monthlyReport")}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className="text-[32px] tracking-[-1px]" style={{ fontWeight: 700 }}>
                          {realStats.totalPrompts}
                        </span>
                        <span className="text-[12px] text-white/60">
                          {t("promptsThisMonth")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap size={12} className="text-emerald-400" />
                        <span className="text-[12px] text-emerald-400">
                          {lang === "zh"
                            ? `连续 ${realStats.streak} 天使用`
                            : `${realStats.streak} day streak`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: t("totalPrompts"), value: realStats.totalPrompts.toLocaleString(), icon: MessageSquare },
                      { label: t("totalHours"), value: (() => {
                          const mins = realStats.totalPrompts * 5;
                          if (mins < 60) return `${mins}min`;
                          const h = (mins / 60).toFixed(1).replace(/\.0$/, "");
                          return `${h}h`;
                        })(), icon: Clock },
                      { label: t("streak"), value: `${realStats.streak}d`, icon: Zap },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col items-center py-2.5 px-1 bg-[#fafafa] border border-[#e8e8ec] rounded-lg"
                      >
                        <stat.icon
                          size={13}
                          className="text-[#8b8b9e] mb-1.5"
                        />
                        <span
                          className="text-[14px] text-[#18181b]"
                          style={{ fontWeight: 600 }}
                        >
                          {stat.value}
                        </span>
                        <span className="text-[9.5px] text-[#8b8b9e] mt-0.5 text-center" style={{ lineHeight: "1.2" }}>
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Usage Over Time — 真实数据 */}
                  <div>
                    <label
                      className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block"
                      style={{ fontWeight: 500 }}
                    >
                      {t("usageOverTime")}
                    </label>
                    <div className="bg-[#fafafa] border border-[#e8e8ec] rounded-xl p-3">
                      <ResponsiveContainer width="100%" height={120}>
                        <AreaChart
                          data={(() => {
                            // 从真实历史生成最近7天的使用趋势
                            const days = Array.from({ length: 7 }, (_, i) => {
                              const d = new Date();
                              d.setDate(d.getDate() - (6 - i));
                              return d;
                            });
                            return days.map(d => {
                              const label = lang === "zh"
                                ? ["周日","周一","周二","周三","周四","周五","周六"][d.getDay()]
                                : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
                              const count = realHistory.filter(r => {
                                const rd = new Date(r.created_at);
                                return rd.getFullYear() === d.getFullYear() &&
                                  rd.getMonth() === d.getMonth() &&
                                  rd.getDate() === d.getDate();
                              }).length;
                              return { name: label, count };
                            });
                          })()}
                        >
                          <defs>
                            <linearGradient
                              id="colorCount"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#18181b"
                                stopOpacity={0.15}
                              />
                              <stop
                                offset="95%"
                                stopColor="#18181b"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f4"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "#8b8b9e" }}
                          />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              background: "#18181b",
                              border: "none",
                              borderRadius: 8,
                              fontSize: 11,
                              color: "#fff",
                              padding: "6px 10px",
                            }}
                            itemStyle={{ color: "#fff" }}
                            labelStyle={{ color: "#8b8b9e", fontSize: 10 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#18181b"
                            strokeWidth={2}
                            fill="url(#colorCount)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Model Usage — 真实数据 */}
                  {(() => {
                    const colors = ["#18181b","#6366f1","#8b5cf6","#a78bfa","#c4b5fd","#e2e2e8"];
                    const countMap: Record<string, number> = {};
                    realHistory.forEach(r => {
                      const p = r.platform && r.platform !== "any" ? r.platform : (lang === "zh" ? "其他" : "Other");
                      countMap[p] = (countMap[p] || 0) + 1;
                    });
                    const total = realHistory.length;
                    const modelDataReal = Object.entries(countMap)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([name, count], i) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        value: Math.round((count / total) * 100),
                        color: colors[i] || colors[5],
                      }));
                    if (modelDataReal.length === 0) return null;
                    return (
                      <div>
                        <label className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block" style={{ fontWeight: 500 }}>
                          {t("modelUsage")}
                        </label>
                        <div className="bg-[#fafafa] border border-[#e8e8ec] rounded-xl p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-[100px] h-[100px] flex-shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie data={modelDataReal} innerRadius={28} outerRadius={46} paddingAngle={3} dataKey="value" strokeWidth={0}>
                                    {modelDataReal.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col gap-2 flex-1">
                              {modelDataReal.map((m) => (
                                <div key={m.name} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
                                    <span className="text-[12px] text-[#2a2a30]">{m.name}</span>
                                  </div>
                                  <span className="text-[12px] text-[#18181b]" style={{ fontWeight: 500 }}>{m.value}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Task Breakdown — 真实数据 */}
                  {(() => {
                    const taskCount: Record<string, number> = {};
                    realHistory.forEach(r => {
                      const t = (r as any).task_type || "general";
                      taskCount[t] = (taskCount[t] || 0) + 1;
                    });
                    const total = realHistory.length;
                    if (total === 0) return null;

                    const taskColors: Record<string, string> = {
                      code: "#18181b", writing: "#6366f1", reasoning: "#8b5cf6",
                      data: "#0ea5e9", translation: "#10b981", agent: "#f59e0b", general: "#d1d5db",
                    };
                    const taskEntries = Object.entries(taskCount)
                      .sort((a, b) => b[1] - a[1])
                      .map(([type, count]) => ({
                        type,
                        count,
                        pct: Math.round((count / total) * 100),
                        label: lang === "zh" ? TASK_LABELS[type as TaskType]?.zh || type : TASK_LABELS[type as TaskType]?.en || type,
                        icon: TASK_LABELS[type as TaskType]?.icon || "💬",
                        color: taskColors[type] || "#d1d5db",
                      }));

                    return (
                      <div>
                        <label className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block" style={{ fontWeight: 500 }}>
                          {lang === "zh" ? "任务类型分布" : "Task Breakdown"}
                        </label>
                        <div className="flex flex-col gap-2">
                          {taskEntries.map(task => (
                            <div key={task.type} className="flex items-center gap-3 bg-[#fafafa] border border-[#e8e8ec] rounded-lg px-3 py-2.5">
                              <span className="text-[14px] flex-shrink-0">{task.icon}</span>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[12.5px] text-[#2a2a30]">{task.label}</span>
                                  <span className="text-[12px] text-[#18181b]" style={{ fontWeight: 500 }}>{task.pct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-[#e8e8ec] rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: task.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${task.pct}%` }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                  />
                                </div>
                              </div>
                              <span className="text-[11px] text-[#8b8b9e] flex-shrink-0">{task.count}{lang === "zh" ? "次" : "x"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Peak Hours — 真实数据 */}
                  {(() => {
                    const hourMap: Record<number, number> = {};
                    realHistory.forEach(r => {
                      const h = new Date(r.created_at).getHours();
                      const slot = Math.floor(h / 2) * 2;
                      hourMap[slot] = (hourMap[slot] || 0) + 1;
                    });
                    const peakData = Array.from({ length: 8 }, (_, i) => {
                      const h = i * 3;
                      const label = lang === "zh" ? `${h}时` : `${h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h-12}pm`}`;
                      return { hour: label, count: hourMap[h] || hourMap[h+1] || hourMap[h+2] || 0 };
                    });
                    const hasAny = peakData.some(d => d.count > 0);
                    if (!hasAny) return null;
                    return (
                      <div>
                        <label className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block" style={{ fontWeight: 500 }}>
                          {t("peakHours")}
                        </label>
                        <div className="bg-[#fafafa] border border-[#e8e8ec] rounded-xl p-3">
                          <ResponsiveContainer width="100%" height={100}>
                            <BarChart data={peakData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f4" vertical={false} />
                              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#8b8b9e" }} />
                              <YAxis hide />
                              <Tooltip contentStyle={{ background: "#18181b", border: "none", borderRadius: 8, fontSize: 11, color: "#fff", padding: "6px 10px" }} />
                              <Bar dataKey="count" fill="#18181b" radius={[3, 3, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 发送周报按钮 */}
                  {(() => {
                    const handleSendReport = () => {
                      const now = new Date();
                      const weekStr = `${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()-6} - ${now.getFullYear()}/${now.getMonth()+1}/${now.getDate()}`;
                      const topPlatform = (() => {
                        const countMap: Record<string, number> = {};
                        realHistory.forEach(r => {
                          const p = r.platform && r.platform !== "any" ? r.platform : "其他";
                          countMap[p] = (countMap[p] || 0) + 1;
                        });
                        const sorted = Object.entries(countMap).sort((a,b) => b[1]-a[1]);
                        return sorted[0]?.[0] || "-";
                      })();

                      const peakHour = (() => {
                        const hourMap: Record<number, number> = {};
                        realHistory.forEach(r => {
                          const h = new Date(r.created_at).getHours();
                          hourMap[h] = (hourMap[h] || 0) + 1;
                        });
                        const sorted = Object.entries(hourMap).sort((a,b) => b[1]-a[1]);
                        const h = Number(sorted[0]?.[0] ?? 14);
                        return lang === "zh" ? `${h}:00 - ${h+1}:00` : `${h < 12 ? h+"am" : h === 12 ? "12pm" : (h-12)+"pm"}`;
                      })();

                      const recentPrompts = realHistory.slice(0, 3).map((r, i) =>
                        `${i+1}. ${r.original_text.slice(0, 50)}${r.original_text.length > 50 ? "..." : ""}`
                      ).join("\n");

                      const subject = lang === "zh"
                        ? `📊 prompt.ai 周报 | ${weekStr}`
                        : `📊 prompt.ai Weekly Report | ${weekStr}`;

                      const timeSaved = (() => {
                        const mins = realStats.totalPrompts * 5;
                        if (mins < 60) return lang === "zh" ? `${mins} 分钟` : `${mins} min`;
                        const h = (mins / 60).toFixed(1).replace(/\.0$/, "");
                        return lang === "zh" ? `${h} 小时` : `${h}h`;
                      })();

                      const body = lang === "zh" ? `
Hi ${user?.user_metadata?.full_name || "你"},

这是你本周的 prompt.ai 使用报告 👋

━━━━━━━━━━━━━━━━━━━━━━
📈 使用概览
━━━━━━━━━━━━━━━━━━━━━━
• 累计优化 Prompt：${realStats.totalPrompts} 条
• 节省时间（估算）：${timeSaved}
• 连续使用天数：${realStats.streak} 天
• 最常用 AI 平台：${topPlatform}
• 最活跃时段：${peakHour}

━━━━━━━━━━━━━━━━━━━━━━
🕐 最近优化的 Prompt
━━━━━━━━━━━━━━━━━━━━━━
${recentPrompts || "暂无记录"}

━━━━━━━━━━━━━━━━━━━━━━

继续加油！更好的 prompt = 更好的 AI 输出 🚀

— prompt.ai 团队
                      `.trim() : `
Hi ${user?.user_metadata?.full_name || "there"},

Here's your prompt.ai weekly report 👋

━━━━━━━━━━━━━━━━━━━━━━
📈 Usage Overview
━━━━━━━━━━━━━━━━━━━━━━
• Total Prompts Optimized: ${realStats.totalPrompts}
• Time Saved (est.): ${timeSaved}
• Day Streak: ${realStats.streak} days
• Most Used AI: ${topPlatform}
• Peak Hours: ${peakHour}

━━━━━━━━━━━━━━━━━━━━━━
🕐 Recent Prompts
━━━━━━━━━━━━━━━━━━━━━━
${recentPrompts || "No records yet"}

━━━━━━━━━━━━━━━━━━━━━━

Keep it up! Better prompts = Better AI outputs 🚀

— prompt.ai Team
                      `.trim();

                      const mailto = `mailto:${user?.email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      window.open(mailto);
                    };

                    return (
                      <button
                        onClick={handleSendReport}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#e8e8ec] text-[13px] text-[#5a5a72] hover:text-[#18181b] hover:border-[#18181b] hover:bg-[#fafafa] transition-all"
                        style={{ fontWeight: 500 }}
                      >
                        <MessageSquare size={13} />
                        {lang === "zh" ? "发送周报到邮箱" : "Send Weekly Report"}
                      </button>
                    );
                  })()}

                  {/* Sign out link */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center gap-1.5 py-2 text-[12px] text-[#c0c0cc] hover:text-[#8b8b9e] transition-colors"
                  >
                    <LogOut size={12} />
                    {t("signOut")}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-5 pt-3"
            >
              {/* Language Selector */}
              <div className="mb-5">
                <label
                  className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-2 block"
                  style={{ fontWeight: 500 }}
                >
                  <span className="flex items-center gap-1.5">
                    <Languages size={12} />
                    {t("language")}
                  </span>
                </label>
                <p className="text-[11.5px] text-[#8b8b9e] mb-3">
                  {t("languageDesc")}
                </p>
                <div className="flex gap-2">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex-1 flex items-center justify-center gap-2.5 py-2.5 rounded-lg border text-[13px] transition-all duration-150 ${
                        lang === l.code
                          ? "bg-[#18181b] text-white border-[#18181b] shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                          : "bg-white text-[#5a5a72] border-[#e8e8ec] hover:border-[#c8c8d4] hover:text-[#18181b]"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                          lang === l.code
                            ? "bg-white/20 text-white"
                            : "bg-[#f4f4f6] text-[#8b8b9e]"
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {l.flag}
                      </span>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-[#f0f0f4] mb-1" />

              {/* Toggle Settings */}
              <div className="flex flex-col gap-1">
                {[
                  {
                    label: t("addContext"),
                    desc: t("addContextDesc"),
                    value: addContext,
                    onChange: setAddContext,
                  },
                  {
                    label: t("includeExamples"),
                    desc: t("includeExamplesDesc"),
                    value: addExamples,
                    onChange: setAddExamples,
                  },
                  {
                    label: t("autoOptimize"),
                    desc: t("autoOptimizeDesc"),
                    value: autoOptimize,
                    onChange: setAutoOptimize,
                  },
                ].map((setting) => (
                  <div
                    key={setting.label}
                    className="flex items-center justify-between py-3 border-b border-[#f0f0f4] last:border-0"
                  >
                    <div className="pr-3">
                      <p
                        className="text-[13px] text-[#18181b]"
                        style={{ fontWeight: 500 }}
                      >
                        {setting.label}
                      </p>
                      <p className="text-[11.5px] text-[#8b8b9e] mt-0.5">
                        {setting.desc}
                      </p>
                    </div>
                    <Toggle value={setting.value} onChange={setting.onChange} />
                  </div>
                ))}
              </div>

              {/* Account section */}
              <div className="mt-5 pt-4 border-t border-[#f0f0f4]">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {user?.user_metadata?.avatar_url ? (
                        <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                          <User size={14} className="text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] text-[#18181b]" style={{ fontWeight: 500 }}>
                          {user?.user_metadata?.full_name || user?.email || "User"}
                        </p>
                        <p className="text-[11px] text-[#8b8b9e]">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-[11.5px] text-[#8b8b9e] hover:text-[#5a5a72] flex items-center gap-1 transition-colors"
                    >
                      <LogOut size={11} />
                      {t("signOut")}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#e8e8ec] rounded-lg text-[13px] text-[#5a5a72] hover:text-[#18181b] hover:border-[#c8c8d4] transition-colors"
                  >
                    <LogIn size={13} />
                    {t("signIn")}
                  </button>
                )}
              </div>

              {/* Keyboard shortcuts */}
              <div className="mt-5">
                <label
                  className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-2.5 block"
                  style={{ fontWeight: 500 }}
                >
                  {t("shortcuts")}
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { keys: ["⌘", "⇧", "O"], label: t("openSidebar") },
                    { keys: ["⌘", "↵"], label: t("optimizePrompt") },
                    { keys: ["⌘", "⇧", "C"], label: t("copyResult") },
                  ].map((shortcut) => (
                    <div
                      key={shortcut.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-[12.5px] text-[#5a5a72]">
                        {shortcut.label}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, ki) => (
                          <span
                            key={ki}
                            className="min-w-[22px] h-[22px] flex items-center justify-center bg-[#f4f4f6] border border-[#e8e8ec] rounded text-[11px] text-[#5a5a72] px-1"
                          >
                            {key}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#f0f0f4] flex-shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[#c0c0cc]">
            {t("footerCount")}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px] text-[#8b8b9e]">
              {t("connected")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
