# prompt.ai

**AI Prompt Optimizer - powering AI prompts & agents**

> Type a rough idea → AI optimizes it into a professional prompt → Auto-fill into any AI chat

## Features

- **Prompt Optimizer** — One-click transform of rough ideas into structured, high-quality prompts
- **Auto-fill** — Directly injects optimized prompts into 15+ AI platforms (ChatGPT, Claude, Kimi, DeepSeek, Gemini, Genspark, and more)
- **AI Recommender** — Detects your task type and recommends the best model based on Artificial Analysis rankings
- **Insights Dashboard** — Analyzes your usage patterns and prompt history
- **History** — All your optimized prompts saved and searchable
- **Multilingual** — Full Chinese / English support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Build | Vite |
| Backend | Cloudflare Worker |
| AI Engine | MiniMax M2.7 |
| Database | Supabase (PostgreSQL) |
| Auth | Google OAuth via Supabase |
| Extension | Chrome Extension MV3 (Side Panel) |

## Project Structure

```
prompt.ai/
├── src/                    # Frontend source (React + TypeScript)
│   ├── app/
│   │   ├── App.tsx
│   │   ├── Sidebar.tsx
│   │   └── components/
│   ├── lib/                # Utilities and API clients
│   └── main.tsx
│
├── worker/                 # Backend (Cloudflare Worker)
│   ├── worker.js           # API proxy + prompt optimization engine
│   ├── wrangler.toml
│   └── README.md
│
├── supabase/               # Database schema
│   └── setup.sql
│
├── guidelines/             # Chrome Web Store submission guidelines
├── vite.config.ts
├── package.json
└── postcss.config.mjs
```

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Build for Chrome
```bash
npm run build
# Load dist/ as unpacked extension in Chrome
```

### Deploy Backend
```bash
cd worker
wrangler secret put MINIMAX_API_KEY
wrangler deploy
```

## License

MIT
