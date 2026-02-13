# PolyLingo AI

<div align="center">
  <img src="https://img.shields.io/badge/TypeScript-93.2%25-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18.3.1-61dafb" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.3.1-646cff" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</div>

<p align="center">
  <strong>Build Intelligent Multilingual AI Applications Without Code</strong>
</p>

<p align="center">
  A visual app builder platform for creating AI-powered chatbots, voice synthesis apps, and multilingual applications with drag-and-drop simplicity.
</p>

<p align="center">
  🌐 <a href="https://poly-lingo-ai.vercel.app/">Live Demo</a> | 
  📚 <a href="#features">Features</a> | 
  🚀 <a href="#getting-started">Getting Started</a>
</p>

---

## 📑 Table of Contents

- [📸 Screenshots](#-screenshots)
- [🌟 Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [📁 Project Structure](#-project-structure)
- [🎯 Usage](#-usage)
- [🔌 API Integrations](#-api-integrations)
- [📜 Available Scripts](#-available-scripts)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [🐛 Known Issues & Troubleshooting](#-known-issues--troubleshooting)
- [🗺️ Roadmap](#️-roadmap)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)
- [🙏 Acknowledgments](#-acknowledgments)
- [📞 Support](#-support)

---

## 📸 Screenshots

> **Note**: Replace these placeholders with actual application screenshots for a better representation of the platform.

<div align="center">
  <img src="https://via.placeholder.com/800x450/4ade80/ffffff?text=Landing+Page" alt="Landing Page" width="800">
  <p><em>Modern landing page with gradient design</em></p>
</div>

<div align="center">
  <img src="https://via.placeholder.com/800x450/3b82f6/ffffff?text=App+Builder" alt="App Builder" width="800">
  <p><em>Drag-and-drop visual app builder</em></p>
</div>

<div align="center">
  <img src="https://via.placeholder.com/800x450/a855f7/ffffff?text=Dashboard" alt="Dashboard" width="800">
  <p><em>User dashboard with app management</em></p>
</div>

---

## 🌟 Features

### 🤖 AI-Powered Chatbots
Build intelligent conversational AI with advanced natural language processing capabilities. Create sophisticated bots that understand context and provide meaningful responses.

### 🎙️ Voice Synthesis & Cloning
Integrate ElevenLabs API to clone and customize voices for realistic speech output. Perfect for accessibility features, audiobooks, and voice assistants.

### 🌍 Multi-Language Support
Automatic translation and localization using Lingo API. Deploy your applications to global audiences with seamless language switching.

### ⚡ Drag & Drop Builder
Intuitive visual interface to build complex applications without writing code. Simply drag components onto the canvas and configure them.

### 💰 Monetization Ready
Built-in payment processing and subscription management with RevenueCat integration. Start generating revenue from day one.

### 📱 Mobile Export
Generate React Native applications and deploy to app stores automatically. Build once, deploy everywhere.

---

## 🏗️ Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS 3.4.1 with custom gradient themes
- **UI Components**: Headless UI, Framer Motion for animations
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Drag & Drop**: React DnD (HTML5 Backend)
- **Routing**: React Router DOM v6
- **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArchitSaxena349/PolyLingoAI.git
   cd PolyLingoAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Supabase Configuration (Required)
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Backend API base URL (Optional - defaults to /api)
   VITE_BACKEND_API_URL=http://localhost:8787/api
   ```
   
   > **Security note**: Do not expose provider API keys in `VITE_` variables. Keep ElevenLabs/Lingo/RevenueCat/Tavus keys on your backend or Supabase Edge Functions.
   >
   > Add provider secrets to your backend environment (non-`VITE_`), for example:
   > `ELEVENLABS_API_KEY`, `MAGIC_AI_API_KEY`, `LINGO_API_KEY`, `REVENUECAT_API_KEY`, `DAPPIER_API_KEY`, `TAVUS_API_KEY`, `RIVER_API_KEY`, `NETLIFY_ACCESS_TOKEN`.

4. **Set up Supabase database**
   
   Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```
   
   Then run the migrations:
   ```bash
   supabase db reset
   # or
   supabase migration up
   ```
   
   Alternatively, you can manually execute the SQL migrations in your Supabase project dashboard.

5. **Start the backend API server**
   ```bash
   npm run backend
   ```

6. **Start the frontend development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

---

## 📁 Project Structure

```
PolyLingoAI/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── AIComponentGenerator.tsx
│   │   ├── AppPreview.tsx
│   │   ├── ComponentLibrary.tsx
│   │   ├── DraggableComponent.tsx
│   │   ├── DroppableCanvas.tsx
│   │   ├── VoiceCloner.tsx
│   │   └── ...
│   ├── pages/             # Page components
│   │   ├── LandingPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AppBuilder.tsx
│   │   └── SetupPage.tsx
│   ├── contexts/          # React context providers
│   │   ├── AuthContext.tsx
│   │   └── AppBuilderContext.tsx
│   ├── lib/               # Utility libraries and configurations
│   │   ├── supabase.ts
│   │   └── integrations.ts
│   ├── App.tsx            # Main application component
│   └── main.tsx           # Application entry point
├── supabase/              # Supabase migrations and config
│   └── migrations/
├── public/                # Static assets
└── ...
```

---

## 🎯 Usage

### Creating Your First App

1. **Sign up or log in** to your account
2. Navigate to the **Dashboard**
3. Click **"Create New App"**
4. Use the **drag-and-drop builder** to add components
5. Configure each component's properties in the settings panel
6. **Preview** your app in real-time
7. **Publish** when ready

### Building an AI Chatbot

1. Drag the **Chat** component onto the canvas
2. Configure the AI model settings
3. Add conversation flows and response templates
4. Test the chatbot in the preview pane
5. Deploy to production

### Adding Voice Synthesis

1. Navigate to the **Voice Cloner** section
2. Upload voice samples or select from the library
3. Integrate the voice into your app components
4. Configure speech synthesis settings
5. Test and fine-tune the voice output

---

## 🔌 API Integrations

### Supabase

PolyLingo AI uses Supabase for:
- **Authentication**: User sign-up, login, and session management
- **Database**: PostgreSQL for storing app configurations, user data, and voice clones
- **Real-time**: Live updates and collaboration features

**Setup**:
1. Create a [Supabase account](https://supabase.com)
2. Create a new project
3. Copy your project URL and anon key to the `.env` file
4. Run the migrations to set up the database schema

### ElevenLabs API

Voice synthesis and cloning capabilities:
- Clone voices from audio samples
- Generate natural-sounding speech
- Customize voice parameters
- Multiple language support

**Setup**:
1. Sign up at [ElevenLabs](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Store the key on your backend (not in frontend env vars)
4. Expose a backend endpoint under `VITE_BACKEND_API_URL` for voice operations
5. [API Documentation](https://docs.elevenlabs.io/)

### Lingo API

Translation and localization:
- Automatic content translation
- Multi-language support
- Context-aware translations
- Real-time language switching

**Setup**:
1. Register for Lingo API access
2. Obtain your API key
3. Store the key on your backend and expose translation endpoints to the frontend

### RevenueCat

Monetization and subscription management:
- In-app purchases
- Subscription plans (Free/Pro)
- Payment processing
- Revenue analytics

**Setup**:
1. Create an account at [RevenueCat](https://www.revenuecat.com/)
2. Configure your products and subscription plans
3. Get your API key
4. Store the key on your backend and proxy requests from authenticated clients
5. [Integration Guide](https://docs.revenuecat.com/)

---

## 📜 Available Scripts

- **`npm run dev`** - Start development server
- **`npm run backend`** - Start backend integration proxy server (`/api`)
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint for code quality checks

---

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all required variables from your `.env` file
4. Enable automatic deployments (optional):
   - Go to Project Settings > Git
   - Enable "Automatic Deployments" for your branch
5. Deploy - Vercel will automatically deploy on every push if enabled

### Deploy to Netlify

1. Connect your GitHub repository to [Netlify](https://www.netlify.com)
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

Please ensure your code follows the existing code style and includes appropriate tests.

---

## 🐛 Known Issues & Troubleshooting

### Common Issues

**Issue**: Environment variables not loading
- **Solution**: Ensure `.env` file is in the root directory and variables are prefixed with `VITE_`

**Issue**: Supabase connection errors
- **Solution**: Verify your Supabase URL and anon key are correct and your Supabase project is active

**Issue**: Build errors
- **Solution**: Clear `node_modules` and run `npm install` again

---

## 🗺️ Roadmap

- [x] Core drag-and-drop app builder
- [x] Supabase authentication and database integration
- [x] Voice synthesis integration (ElevenLabs)
- [x] Multi-language support (Lingo API)
- [x] Component library with AI, chat, and voice components
- [ ] Real-time collaboration features
- [ ] Advanced AI model customization
- [ ] Template marketplace
- [ ] Mobile app builder enhancements
- [ ] Analytics dashboard
- [ ] Team management and permissions
- [ ] Custom domain support
- [ ] A/B testing capabilities

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Archit Saxena**
- GitHub: [@ArchitSaxena349](https://github.com/ArchitSaxena349)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Supabase](https://supabase.com/) - Backend infrastructure
- [ElevenLabs](https://elevenlabs.io/) - Voice synthesis
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

## 📞 Support

For support, questions, or feedback:
- Open an issue on [GitHub Issues](https://github.com/ArchitSaxena349/PolyLingoAI/issues)
- Visit the [Live Demo](https://poly-lingo-ai.vercel.app/)

---

<div align="center">
  <p>Made with ❤️ by Archit Saxena</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
