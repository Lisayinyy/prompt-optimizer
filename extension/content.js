// ============================================================
// Prompt Optimizer — Content Script
// 在 AI 对话网站上注入「✨ 优化」浮动按钮
// ============================================================

(function () {
  "use strict";

  // 后端 API 地址（和 config.js 保持一致）
  const API_URL = "https://prompt-optimizer-api.prompt-optimizer.workers.dev";

  // 支持的 AI 网站及其输入框选择器
  const SITE_CONFIGS = [
    {
      name: "ChatGPT",
      match: /chat\.openai\.com|chatgpt\.com/,
      inputSelector: "#prompt-textarea, [data-testid='text-input'] textarea, div[contenteditable='true'][id='prompt-textarea']",
      isContentEditable: true,
    },
    {
      name: "Claude",
      match: /claude\.ai/,
      inputSelector: "div[contenteditable='true'].ProseMirror, fieldset div[contenteditable]",
      isContentEditable: true,
    },
    {
      name: "Kimi",
      match: /kimi\.moonshot\.cn/,
      inputSelector: "div[contenteditable='true'], textarea[placeholder]",
      isContentEditable: true,
    },
    {
      name: "豆包",
      match: /www\.doubao\.com/,
      inputSelector: "textarea, div[contenteditable='true']",
      isContentEditable: false,
    },
    {
      name: "DeepSeek",
      match: /chat\.deepseek\.com/,
      inputSelector: "textarea#chat-input, textarea",
      isContentEditable: false,
    },
    {
      name: "Gemini",
      match: /gemini\.google\.com/,
      inputSelector: "div[contenteditable='true'].ql-editor, rich-textarea div[contenteditable]",
      isContentEditable: true,
    },
    {
      name: "海螺AI",
      match: /hailuoai\.com/,
      inputSelector: "textarea, div[contenteditable='true']",
      isContentEditable: false,
    },
    {
      name: "通义千问",
      match: /tongyi\.aliyun\.com/,
      inputSelector: "textarea, div[contenteditable='true']",
      isContentEditable: false,
    },
  ];

  // 当前站点配置
  const currentSite = SITE_CONFIGS.find((s) => s.match.test(location.hostname));
  if (!currentSite) return;

  let floatBtn = null;
  let activeInput = null;

  // ========= 创建浮动按钮 =========
  function createFloatBtn() {
    const btn = document.createElement("button");
    btn.className = "po-float-btn";
    btn.innerHTML = "✨ 优化";
    btn.title = "Prompt Optimizer - 一键优化你的提问";
    btn.addEventListener("click", handleOptimize);
    document.body.appendChild(btn);
    return btn;
  }

  // ========= 获取输入框文本 =========
  function getInputText(el) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      return el.value;
    }
    // contenteditable
    return el.innerText || el.textContent || "";
  }

  // ========= 设置输入框文本 =========
  function setInputText(el, text) {
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      // 用原生 setter 触发 React 的 onChange
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype, "value"
      )?.set || Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, "value"
      )?.set;

      if (nativeSetter) {
        nativeSetter.call(el, text);
      } else {
        el.value = text;
      }
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // contenteditable
      el.focus();
      el.innerHTML = "";

      // 用 insertText 命令来触发框架的事件监听
      document.execCommand("selectAll", false, null);
      document.execCommand("insertText", false, text);

      // 备用：直接设置
      if (!el.textContent) {
        el.textContent = text;
      }

      el.dispatchEvent(new InputEvent("input", { bubbles: true, data: text }));
    }
  }

  // ========= 定位浮动按钮 =========
  function positionBtn(inputEl) {
    if (!floatBtn) floatBtn = createFloatBtn();

    const rect = inputEl.getBoundingClientRect();
    floatBtn.style.top = (window.scrollY + rect.top - 30) + "px";
    floatBtn.style.left = (window.scrollX + rect.right - 70) + "px";
    floatBtn.style.display = "flex";
  }

  function hideBtn() {
    if (floatBtn) floatBtn.style.display = "none";
  }

  // ========= 优化逻辑 =========
  async function handleOptimize(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!activeInput) return;

    const text = getInputText(activeInput).trim();
    if (!text) {
      showToast("⚠️ 请先输入内容再优化");
      return;
    }

    // loading 状态
    floatBtn.classList.add("po-loading");
    floatBtn.innerHTML = '<span class="po-spinner"></span> 优化中';

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!res.ok) throw new Error("服务异常");

      const data = await res.json();
      const optimized = data.optimized || data.error;

      if (optimized) {
        setInputText(activeInput, optimized);
        showToast("✅ Prompt 已优化");
      }
    } catch (err) {
      showToast("❌ 优化失败，请重试");
      console.error("[Prompt Optimizer]", err);
    } finally {
      floatBtn.classList.remove("po-loading");
      floatBtn.innerHTML = "✨ 优化";
    }
  }

  // ========= Toast 提示 =========
  function showToast(msg) {
    const toast = document.createElement("div");
    toast.className = "po-toast";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("po-fade-out");
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // ========= 监听输入框 focus =========
  function watchInputs() {
    document.addEventListener("focusin", (e) => {
      const el = e.target;
      // 检查是否匹配当前站点的输入框选择器
      if (el.matches && el.matches(currentSite.inputSelector)) {
        activeInput = el;
        positionBtn(el);
      }
    }, true);

    document.addEventListener("focusout", (e) => {
      // 延迟隐藏，防止点击按钮时按钮先消失
      setTimeout(() => {
        if (!document.activeElement?.matches?.(currentSite.inputSelector)) {
          // 不立即隐藏——如果鼠标在按钮上就保留
        }
      }, 200);
    }, true);

    // 滚动时重新定位
    window.addEventListener("scroll", () => {
      if (activeInput && floatBtn?.style.display !== "none") {
        positionBtn(activeInput);
      }
    }, { passive: true });
  }

  // ========= 用 MutationObserver 等待输入框出现 =========
  function init() {
    // 先检查页面上已有的输入框
    const existing = document.querySelector(currentSite.inputSelector);
    if (existing) {
      watchInputs();
      return;
    }

    // SPA 应用：等输入框动态加载
    const observer = new MutationObserver(() => {
      const el = document.querySelector(currentSite.inputSelector);
      if (el) {
        observer.disconnect();
        watchInputs();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // 兜底：5秒后强制开始监听
    setTimeout(() => {
      observer.disconnect();
      watchInputs();
    }, 5000);
  }

  // 等 DOM 就绪后初始化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
