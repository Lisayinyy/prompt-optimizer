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
];

const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "zh", label: "中文", flag: "中" },
];

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
        redirectTo: "https://vyuzkbdxsweaqftyqifh.supabase.co",
      },
    });
    if (!data?.url) return;

    if (typeof chrome !== "undefined" && chrome?.tabs) {
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
            try { chrome.tabs.remove(tabId); } catch {}
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
    } catch (err) {
      setOptimizedText(
        lang === "zh" ? "优化失败，请稍后重试" : "Optimization failed, please try again"
      );
    } finally {
      setIsOptimizing(false);
    }
  };

  const [fillStatus, setFillStatus] = useState("");

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
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <User size={11} className="text-white" />
              </div>
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
              <div className="flex flex-col gap-2.5">
                {historyItems.map((item, i) => {
                  const isExpanded = expandedHistory === i;
                  return (
                    <motion.div
                      key={i}
                      layout
                      className="rounded-xl border border-[#e8e8ec] bg-white hover:border-[#d0d0d8] transition-colors overflow-hidden"
                    >
                      {/* Header - always visible */}
                      <button
                        onClick={() =>
                          setExpandedHistory(isExpanded ? null : i)
                        }
                        className="text-left w-full p-3.5 group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11.5px] text-[#8b8b9e]">
                              {item.time}
                            </span>
                            <span className="text-[10px] text-[#8b8b9e] bg-[#f4f4f6] px-1.5 py-0.5 rounded">
                              {item.model}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[11px] text-emerald-500"
                              style={{ fontWeight: 500 }}
                            >
                              {item.score}
                            </span>
                            <motion.div
                              animate={{ rotate: isExpanded ? 90 : 0 }}
                              transition={{ duration: 0.15 }}
                            >
                              <ArrowRight
                                size={12}
                                className="text-[#c0c0cc] group-hover:text-[#18181b] transition-colors"
                              />
                            </motion.div>
                          </div>
                        </div>
                        <p
                          className="text-[13px] text-[#18181b]"
                          style={{ fontWeight: 500 }}
                        >
                          {item.original}
                        </p>
                        {!isExpanded && (
                          <p className="text-[12px] text-[#8b8b9e] truncate mt-1">
                            → {item.optimized.split("\n")[0]}
                          </p>
                        )}
                      </button>

                      {/* Expanded content */}
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
                                {/* Optimized label */}
                                <div className="flex items-center justify-between mb-2">
                                  <span
                                    className="text-[11px] text-[#8b8b9e] uppercase tracking-[0.3px]"
                                    style={{ fontWeight: 500 }}
                                  >
                                    {t("optimized")}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(item.optimized);
                                    }}
                                    className="flex items-center gap-1 text-[10.5px] text-[#8b8b9e] hover:text-[#18181b] bg-[#f4f4f6] hover:bg-[#ebebf0] px-2 py-0.5 rounded transition-colors"
                                  >
                                    <Copy size={10} />
                                    {t("copy")}
                                  </button>
                                </div>
                                <div className="relative">
                                  <div className="absolute top-0 left-0 w-[2.5px] h-full bg-[#18181b] rounded-full" />
                                  <div
                                    className="pl-3 text-[12.5px] text-[#2a2a30] whitespace-pre-wrap"
                                    style={{ lineHeight: "1.7" }}
                                  >
                                    {item.optimized}
                                  </div>
                                </div>
                                {/* Use again */}
                                <button
                                  onClick={() => {
                                    setInputText(item.original);
                                    setActiveTab("optimize");
                                  }}
                                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#e8e8ec] text-[12px] text-[#5a5a72] hover:text-[#18181b] hover:border-[#c8c8d4] transition-colors"
                                >
                                  <RotateCcw size={11} />
                                  {lang === "zh"
                                    ? "重新优化"
                                    : "Re-optimize"}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
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
              ) : (
                /* ── Analytics Dashboard ── */
                <div className="flex flex-col gap-5">
                  {/* Monthly summary card */}
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
                          247
                        </span>
                        <span className="text-[12px] text-white/60">
                          {t("promptsThisMonth")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-emerald-400" />
                        <span className="text-[12px] text-emerald-400">
                          +23% {t("moreProductive")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: t("totalPrompts"), value: "1,247", icon: MessageSquare },
                      { label: t("totalHours"), value: "68h", icon: Clock },
                      { label: t("avgScore"), value: "91", icon: Target },
                      { label: t("streak"), value: "14", icon: Zap },
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

                  {/* Usage Over Time */}
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
                          data={
                            lang === "zh"
                              ? usageTrendDataZh
                              : usageTrendData
                          }
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

                  {/* Model Usage */}
                  <div>
                    <label
                      className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block"
                      style={{ fontWeight: 500 }}
                    >
                      {t("modelUsage")}
                    </label>
                    <div className="bg-[#fafafa] border border-[#e8e8ec] rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-[100px] h-[100px] flex-shrink-0">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={modelData}
                                innerRadius={28}
                                outerRadius={46}
                                paddingAngle={3}
                                dataKey="value"
                                strokeWidth={0}
                              >
                                {modelData.map((entry) => (
                                  <Cell
                                    key={entry.name}
                                    fill={entry.color}
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-2 flex-1">
                          {modelData.map((m) => (
                            <div
                              key={m.name}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ background: m.color }}
                                />
                                <span className="text-[12px] text-[#2a2a30]">
                                  {m.name}
                                </span>
                              </div>
                              <span
                                className="text-[12px] text-[#18181b]"
                                style={{ fontWeight: 500 }}
                              >
                                {m.value}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Breakdown */}
                  <div>
                    <label
                      className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block"
                      style={{ fontWeight: 500 }}
                    >
                      {t("taskBreakdown")}
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {taskData.map((task) => (
                        <div
                          key={task.name}
                          className="flex items-center gap-3 bg-[#fafafa] border border-[#e8e8ec] rounded-lg px-3 py-2.5"
                        >
                          <task.icon size={14} className="text-[#8b8b9e] flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12.5px] text-[#2a2a30]">
                                {task.name}
                              </span>
                              <span
                                className="text-[12px] text-[#18181b]"
                                style={{ fontWeight: 500 }}
                              >
                                {task.value}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-[#e8e8ec] rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: task.color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${task.value}%` }}
                                transition={{
                                  duration: 0.8,
                                  delay: 0.1,
                                  ease: "easeOut",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Peak Hours */}
                  <div>
                    <label
                      className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block"
                      style={{ fontWeight: 500 }}
                    >
                      {t("peakHours")}
                    </label>
                    <div className="bg-[#fafafa] border border-[#e8e8ec] rounded-xl p-3">
                      <ResponsiveContainer width="100%" height={100}>
                        <BarChart
                          data={
                            lang === "zh"
                              ? peakHoursDataZh
                              : peakHoursData
                          }
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f4"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="hour"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fill: "#8b8b9e" }}
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
                          />
                          <Bar
                            dataKey="count"
                            fill="#18181b"
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Top Topics */}
                  <div>
                    <label
                      className="text-[11.5px] text-[#8b8b9e] tracking-[0.3px] uppercase mb-3 block"
                      style={{ fontWeight: 500 }}
                    >
                      {t("topTopics")}
                    </label>
                    <div className="flex flex-col gap-1.5">
                      {topTopics.map((topic, i) => (
                        <div
                          key={topic.topic}
                          className="flex items-center gap-3 px-3 py-2.5 bg-[#fafafa] border border-[#e8e8ec] rounded-lg"
                        >
                          <span
                            className="w-5 h-5 rounded-full bg-[#18181b] text-white flex items-center justify-center text-[10px] flex-shrink-0"
                            style={{ fontWeight: 600 }}
                          >
                            {i + 1}
                          </span>
                          <span className="text-[12.5px] text-[#2a2a30] flex-1">
                            {topic.topic}
                          </span>
                          <span className="text-[12px] text-[#8b8b9e]">
                            {topic.count}
                            {lang === "zh" ? " 次" : "x"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                        <User size={14} className="text-white" />
                      </div>
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
