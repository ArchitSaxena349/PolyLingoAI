<div align="center">

# 🌐 PolyLingo AI

### *Build & Deploy Intelligent Multilingual AI Apps Without Writing Code*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

[🚀 **Live Demo**](https://poly-lingo-ai.vercel.app/) &nbsp;|&nbsp;
[✨ **Key Features**](#-key-features) &nbsp;|&nbsp;
[⚡ **Quick Start**](#-quick-start) &nbsp;|&nbsp;
[🔌 **API Integrations**](#-api-integrations) &nbsp;|&nbsp;
[📖 **Documentation**](#-project-structure)

---

</div>

<br/>

## 📌 Overview

**PolyLingo AI** is a state-of-the-art visual app builder platform that empowers creators, developers, and businesses to design, configure, and publish AI-powered applications effortlessly. With a drag-and-drop workflow canvas, real-time preview engine, multi-language localization, and voice cloning capabilities, PolyLingo AI turns complex AI integrations into seamless visual blocks.

> [!NOTE]
> PolyLingo AI handles frontend UI generation, AI prompt engineering, state management, voice synthesis, and deployment orchestration out-of-the-box.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| ⚡ **Visual Drag & Drop Builder** | Design full-featured web app interfaces on an interactive grid canvas using pre-built AI components. |
| 🤖 **AI Chatbot Engine** | Configure custom conversational AI agents with dynamic system prompts, context awareness, and instant response streaming. |
| 🎙️ **Voice Cloning & Speech** | Integrate **ElevenLabs API** to synthesize natural voice audio or clone custom voice profiles for audio apps. |
| 🌍 **Multilingual Localization** | Translate apps and conversations across 50+ languages instantly with **Lingo API** integration. |
| 💸 **Built-in Monetization** | Set up paywalls, digital products, and subscription tiers using **RevenueCat**. |
| 🚀 **One-Click Publishing** | Export and host deployed web apps instantly on Netlify or the PolyLingo Cloud runner. |
| 🔒 **Authentication & Database** | Full user management and data persistence powered by **Supabase Auth & PostgreSQL**. |
| 🎨 **Modern Sleek Aesthetics** | Dark-mode, glassmorphism UI built with **Tailwind CSS** and smooth **Framer Motion** micro-interactions. |

---

## 🏗️ Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────┐
 │                   PolyLingo AI Web App                  │
 │          React 18  •  TypeScript  •  Tailwind           │
 └──────────┬───────────────────────────┬──────────────────┘
            │                           │
            ▼                           ▼
 ┌──────────────────────┐    ┌─────────────────────────────┐
 │    Supabase Cloud    │    │      API Proxy Server       │
 │ Auth & PostgreSQL DB │    │       Node.js (Port 8787)   │
 └──────────────────────┘    └──────────┬──────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
   ┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
   │  ElevenLabs API   │      │    Lingo API      │      │   RevenueCat API  │
   │ (Voice Synthesis) │      │  (Translation)    │      │  (Monetization)   │
   └───────────────────┘      └───────────────────┘      └───────────────────┘
```

### Core Technologies
- **Frontend Core**: React 18.3.1, TypeScript 5.5, Vite 7.3
- **State & Drag-and-Drop**: React DnD (HTML5 Backend), React Context API
- **Styling & UI**: Tailwind CSS 3.4, Framer Motion 10, Lucide React Icons
- **Backend & Storage**: Supabase (PostgreSQL, Row Level Security, Auth)
- **Node API Proxy Server**: Express-style Node.js runner (`server/api-server.mjs`)
- **Testing & Quality**: Vitest 4.1, Testing Library, ESLint 9

---

## ⚡ Quick Start

### Prerequisites
Make sure you have installed on your local machine:
- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### 1. Clone the Repository
```bash
git clone https://github.com/ArchitSaxena349/PolyLingoAI.git
cd PolyLingoAI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Supabase Client Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API Endpoint (Optional - defaults to http://localhost:8787/api)
VITE_BACKEND_API_URL=http://localhost:8787/api
```

> [!IMPORTANT]
> Provider secrets (e.g. ElevenLabs, Lingo, RevenueCat, Netlify) must be kept secure on your server or backend environment and **never** prefixed with `VITE_` in client bundles.
> Add server secrets to your `.env` for the local backend proxy server:
> ```env
> ELEVENLABS_API_KEY=your_elevenlabs_key
> LINGO_API_KEY=your_lingo_key
> REVENUECAT_API_KEY=your_revenuecat_key
> NETLIFY_ACCESS_TOKEN=your_netlify_token
> ```

### 4. Run Development Servers

Run frontend and backend simultaneously with one command:
```bash
npm start
```

Or run them individually in separate terminal windows:
```bash
# Terminal 1: Start Frontend Dev Server (http://localhost:5173)
npm run dev

# Terminal 2: Start Backend API Proxy (http://localhost:8787)
npm run backend
```

---

## 📁 Project Structure

```
PolyLingoAI/
├── server/                    # Node.js backend proxy server
│   └── api-server.mjs         # API integration endpoints & deployment handlers
├── src/
│   ├── components/            # Reusable UI & App Builder components
│   │   ├── AIComponentGenerator.tsx  # Dynamic component generator
│   │   ├── AppPreview.tsx            # Live app renderer
│   │   ├── ComponentLibrary.tsx      # Sidebar component palette
│   │   ├── DraggableComponent.tsx    # Drag container element
│   │   ├── DroppableCanvas.tsx       # Visual workspace grid
│   │   ├── VoiceCloner.tsx           # ElevenLabs voice clone utility
│   │   └── Navbar.tsx                # App navigation bar
│   ├── contexts/              # React Context Providers
│   │   ├── AppBuilderContext.tsx     # Canvas state, history & undo/redo
│   │   └── AuthContext.tsx           # Supabase user authentication
│   ├── lib/                   # Integrations & client configuration
│   │   ├── supabase.ts           # Supabase JS client instantiation
│   │   └── integrations.ts       # External API client services
│   ├── pages/                 # Main Application Pages
│   │   ├── AppBuilder.tsx        # Drag-and-drop workspace page
│   │   ├── AuthPage.tsx          # Login & registration page
│   │   ├── Dashboard.tsx         # User projects dashboard
│   │   ├── LandingPage.tsx       # High-converting marketing landing page
│   │   └── SetupPage.tsx         # Initial setup & configuration page
│   ├── App.tsx                # React Router root component
│   └── main.tsx               # DOM entry point
├── supabase/                  # Database migrations & schemas
│   └── migrations/
├── vite.config.ts             # Vite & Vitest configuration
└── package.json               # Package dependencies & scripts
```

---

## 🛠️ How It Works

```
 ┌──────────────────────┐      ┌──────────────────────┐      ┌──────────────────────┐
 │  1. Select & Drag   │ ---> │ 2. Configure & Tune  │ ---> │  3. Preview & Deploy │
 │ Components to Canvas │      │ Prompts, Voice & AI  │      │ Instant Cloud Host   │
 └──────────────────────┘      └──────────────────────┘      └──────────────────────┘
```

1. **Build Canvas**: Drag components like Chat Interfaces, Voice Players, Translators, and Text Cards directly onto the responsive grid workspace.
2. **Configure Props**: Customize properties, prompt behaviors, voice parameters, and UI themes in the real-time configuration sidebar.
3. **Interactive Testing**: Switch between **Edit Mode** and **Preview Mode** to interact with your live app before publishing.
4. **Publish & Share**: Deploy with a single click to generate a shareable web link.

---

## 🔌 API Integrations

### 1. Supabase (Auth & Database)
Provides identity management and data storage for saved app projects, custom prompt flows, and user profiles.
- **SQL Migrations**: Located under `supabase/migrations/`
- **Documentation**: [Supabase Docs](https://supabase.com/docs)

### 2. ElevenLabs (Voice Synthesis)
Powers text-to-speech rendering and custom voice clone generation.
- **Endpoints**: Proxied through `/api/integrations/elevenlabs`
- **Documentation**: [ElevenLabs API Docs](https://elevenlabs.io/docs/api-reference/quick-start)

### 3. Lingo API (Localization)
Translates interface strings and live chat conversations across languages.
- **Endpoints**: Proxied through `/api/integrations/lingo`

### 4. RevenueCat (Monetization)
Enables subscription access control and digital product paywalls for deployed apps.
- **Documentation**: [RevenueCat Docs](https://www.revenuecat.com/docs)

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm start` | Launches **both** frontend dev server and backend API proxy concurrently. |
| `npm run dev` | Runs the Vite frontend development server (`http://localhost:5173`). |
| `npm run backend` | Runs the Node.js API integration proxy server (`http://localhost:8787`). |
| `npm run build` | Compiles and bundles production static assets into `dist/`. |
| `npm run test` | Executes unit tests using Vitest (`vitest run`). |
| `npm run test:watch` | Runs Vitest in interactive watch mode. |
| `npm run lint` | Performs ESLint code quality checks across the codebase. |

---

## 🚀 Deployment

### Deploying to Vercel

1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Configure environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the Vercel Project Settings.
4. Vercel automatically detects Vite and deploys your frontend application.

### Deploying to Netlify

1. Link your GitHub repository to [Netlify](https://www.netlify.com).
2. Set build command to `npm run build` and output directory to `dist`.
3. Add required environment variables in Netlify Dashboard.
4. Deploy!

---

## 🧪 Testing

PolyLingo AI features automated unit tests covering key context providers, integration libraries, and UI boundary components:

```bash
# Run test suite
npm run test
```

Tests use **Happy DOM** for rapid DOM simulation and **Vitest** for fast execution.

---

## 🗺️ Roadmap

- [x] Drag-and-Drop visual canvas builder
- [x] AI Chatbot, Voice Synthesizer & Translator components
- [x] Supabase Authentication & PostgreSQL persistence
- [x] ElevenLabs voice synthesis & cloning integration
- [x] Netlify & live runner deployment pipeline
- [ ] Real-time multi-user canvas collaboration
- [ ] Custom domain mapping for published apps
- [ ] Pre-built community template marketplace
- [ ] Advanced analytics & user engagement dashboard

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for more information.

---

## 👨‍💻 Author

**Archit Saxena**
- GitHub: [@ArchitSaxena349](https://github.com/ArchitSaxena349)

<div align="center">
  <br/>
  <sub>Built with ❤️ using React, Vite, TypeScript & Supabase</sub>
</div>
