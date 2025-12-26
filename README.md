# 🎮 PACSEC — AI-Powered Security Command Center

<div align="center">

![PACSEC Banner](https://img.shields.io/badge/PACSEC-Security%20Toolkit-F2C94C?style=for-the-badge&logo=pac-man&logoColor=black)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2?style=flat-square&logo=google)](https://ai.google.dev)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Zero-Knowledge • Client-Side • AI-Driven**

[Live Demo](#) • [Features](#-features) • [Quick Start](#-quick-start) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Components Reference](#-components-reference)
- [Security Model](#-security-model)
- [Customization](#-customization)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

PACSEC is a **100% client-side** cryptographic security toolkit powered by Google's Gemini 2.5 Flash AI. It generates passwords, API keys, RSA keypairs, hashes, and more—all without ever sending your secrets to a server.

### Key Differentiators

| Feature | PACSEC | Traditional Tools |
|---------|--------|-------------------|
| Server Storage | ❌ None | ✅ Required |
| AI-Powered | ✅ Natural Language | ❌ Forms Only |
| Self-Destruct Messages | ✅ Configurable TTL | ❌ No |
| Bundle Generation | ✅ Loot Crates | ❌ One at a time |
| PWA Support | ✅ Installable | ❌ Web only |

---

## ✨ Features

### 🔐 Password Generation
- **Strong Passwords** — 24+ chars with full entropy
- **Memorable Passwords** — Human-readable patterns
- **WiFi Passwords** — Alphanumeric, no symbols
- **Secure PINs** — Cryptographically random digits

### 🛠️ Developer Keys
- **JWT Secrets** — HMAC-SHA256 compatible
- **API Keys** — Configurable length/format
- **Framework Keys** — Laravel APP_KEY, Django SECRET_KEY
- **UUID v4** — RFC 4122 compliant

### 🔒 Cryptographic Tools
- **RSA Key Forge** — 2048/4096-bit keypairs (client-side)
- **Ghost Hasher** — SHA-256/SHA-512/MD5
- **AES Enigma** — AES-256-GCM encryption/decryption
- **HTML Decon** — XSS sanitization
- **Breach Radar** — HIBP integration (k-Anonymity)
- **QR Forge** — Canvas-based QR generation
- **Diceware** — Passphrase generator with entropy calculation
- **Encoder** — Base64/Hex/URL/HTML encoding
- **TOTP Authenticator** — RFC 6238 2FA code generator
- **JWT Debugger** — Decode and validate JWT tokens
- **Regex Tester** — Live pattern matching with highlighting
- **CSP Builder** — Content Security Policy generator
- **CORS Builder** — Cross-Origin configuration generator

### 📦 Loot Crates (Bundles)
- **OAuth Stack** — Client ID + Client Secret
- **Cloud Credentials** — Access Key + Secret Key
- **Web App Starter** — DB Password + JWT + API Key
- **Webhook Security** — Signing Secret + Verification Token

### 📝 Secure Notes
- **Zero-Knowledge Notes** — Self-destructing with TTL
- **Ghost Links** — E2E encrypted URL sharing
- **Configurable TTL** — 30s, 1m, 5m, 1h

### 🎨 UX Features
- **PWA Installable** — Works offline
- **Theme Switcher** — 6 custom themes (CRT Green, Cyberpunk, Matrix, Neon, Retro Amber)
- **Command Palette** — Quick access with `Ctrl+K` or `/`
- **Keyboard Shortcuts** — Full keyboard navigation (`Shift+?` for help)
- **Sound Effects** — Retro arcade sounds (toggleable)
- **Chat Export** — JSON/Text/Markdown/HTML download
- **Toast Notifications** — Real-time feedback system

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | React 19, TypeScript 5.x |
| **Build** | Vite 6.x (ESBuild + Rollup) |
| **AI Engine** | Google Gemini 2.5 Flash via `@google/genai` |
| **Styling** | Tailwind CSS 3.x (CDN) |
| **Crypto** | Web Crypto API (SubtleCrypto) |
| **Font** | Press Start 2P (Arcade) |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 4+
- Google AI API Key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone repository
git clone https://github.com/ZYNIQ-AI-Driven-Development-Firm/ZYNIQ-PACSEC.git
cd pacsec

# Install dependencies
npm install

# Create environment file
echo "API_KEY=your_gemini_api_key_here" > .env

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `localhost:5173` |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler |

---

## 📁 Project Structure

```
ZYNIQ-PACSEC/
├── index.html              # Entry HTML with meta tags, PWA manifest
├── index.tsx               # React root with ErrorBoundary + ToastProvider
├── App.tsx                 # Main application logic, state, routing
├── types.ts                # TypeScript type definitions
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
│
├── components/
│   ├── AesCard.tsx         # AES encryption/decryption UI
│   ├── BreachRadarCard.tsx # HIBP breach checker
│   ├── ChatMessage.tsx     # Message renderer with TTL countdown
│   ├── EncoderCard.tsx     # Base64/Hex/URL/HTML encoder
│   ├── ErrorBoundary.tsx   # React error boundary with retry
│   ├── ExportButton.tsx    # File export (TXT/JSON/MD)
│   ├── GhostLinkCard.tsx   # E2E encrypted link generator
│   ├── HashCard.tsx        # SHA-256/512/MD5 hasher
│   ├── IntegrationsGrid.tsx# External security tools grid
│   ├── LandingPage.tsx     # Marketing/onboarding page
│   ├── Loader.tsx          # Boot animation loader
│   ├── LootCrate.tsx       # Multi-key bundle generator
│   ├── NewsCard.tsx        # Security news widget
│   ├── NoteCard.tsx        # Secure note creation
│   ├── PacThinking.tsx     # Loading animation
│   ├── PassphraseCard.tsx  # Diceware passphrase generator
│   ├── QRCodeCard.tsx      # QR code generator
│   ├── RsaCard.tsx         # RSA keypair generator
│   ├── SanitizeCard.tsx    # HTML/XSS sanitizer
│   ├── SecretCard.tsx      # Single secret display
│   ├── ToastProvider.tsx   # Toast notification system
│   └── TrustBadges.tsx     # Security trust badges
│
├── services/
│   └── geminiService.ts    # Gemini AI integration + function calling
│
├── utils/
│   └── cryptoUtils.ts      # Web Crypto API wrappers
│
└── public/
    ├── manifest.json       # PWA manifest
    ├── sw.js               # Service worker (cache-first)
    └── favicon.ico         # App icon
```

---

## 🏗️ Architecture

### Application Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Loader    │ ──▶ │ LandingPage │ ──▶ │    Chat     │
│  (Boot Seq) │     │ (Features)  │     │ (Main App)  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
              ┌───────────┐            ┌───────────┐            ┌───────────┐
              │ User Input│            │   Menu    │            │Integrations│
              │  Natural  │            │ Prompts   │            │   Grid    │
              │  Language │            │           │            │           │
              └─────┬─────┘            └─────┬─────┘            └───────────┘
                    │                        │
                    ▼                        ▼
              ┌─────────────────────────────────────┐
              │          geminiService.ts           │
              │   Gemini 2.5 Flash + Tool Calling   │
              └─────────────────┬───────────────────┘
                                │
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
    ┌───────────┐        ┌───────────┐        ┌───────────┐
    │ SecretCard│        │ LootCrate │        │ Tool Cards│
    │ (Single)  │        │ (Bundle)  │        │ RSA/Hash/ │
    └───────────┘        └───────────┘        │ AES/etc.  │
                                              └───────────┘
```

### State Management

State is managed via React hooks at the `App.tsx` level:

```typescript
// Core States
const [appState, setAppState] = useState<AppState>('BOOT_LOADER');
const [messages, setMessages] = useState<Message[]>([]);
const [theme, setTheme] = useState<'dark' | 'light'>('dark');

// Message includes TTL for self-destruct
interface Message {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  toolCall?: SecretConfig;
  expiresAt?: number;      // Unix timestamp
  originalTTL?: number;    // Duration in ms
}
```

### AI Integration (Gemini Function Calling)

The Gemini service uses **Tool Calling** to route user requests to appropriate generators:

```typescript
// services/geminiService.ts
const tools: Tool[] = [{
  functionDeclarations: [{
    name: "configure_generator",
    parameters: {
      properties: {
        type: {
          type: Type.STRING,
          enum: ["password", "jwt", "uuid", "apiKey", "recipe", 
                 "note", "rsa", "hash", "aes", "sanitize", 
                 "ghostLink", "breachRadar", "qrCode", 
                 "passphrase", "encoder"]
        },
        length: { type: Type.INTEGER },
        bits: { type: Type.INTEGER },
        format: { type: Type.STRING, enum: ["hex", "base64"] },
        // ...more params
      }
    }
  }]
}];
```

### Cryptographic Implementation

All crypto operations use the **Web Crypto API** with proper security practices:

```typescript
// utils/cryptoUtils.ts

// Rejection sampling for unbiased randomness
export function getSecureRandomInt(max: number): number {
  const randomBuffer = new Uint32Array(1);
  const maxValid = Math.floor(0xFFFFFFFF / max) * max;
  
  do {
    crypto.getRandomValues(randomBuffer);
  } while (randomBuffer[0] >= maxValid);
  
  return randomBuffer[0] % max;
}

// AES-256-GCM encryption
export async function encryptAES(plaintext: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  
  return encodeResult(salt, iv, encrypted);
}
```

---

## 📚 Components Reference

### SecretCard

Renders a single generated secret with copy/regenerate actions.

```tsx
<SecretCard config={{
  type: 'password',
  length: 24,
  useSymbols: true,
  useNumbers: true,
  useUppercase: true
}} />
```

### LootCrate

Renders a bundle of multiple secrets.

```tsx
<LootCrate config={{
  type: 'recipe',
  recipeItems: [
    { label: 'Client ID', config: { type: 'apiKey', length: 32 } },
    { label: 'Client Secret', config: { type: 'jwt', bits: 256 } }
  ]
}} />
```

### HashCard

Interactive SHA-256/512/MD5 hasher.

```tsx
<HashCard />
// User enters text, selects algorithm, gets hash
```

### RsaCard

Client-side RSA keypair generation.

```tsx
<RsaCard bits={2048} />
// Generates public/private PEM keys in browser
```

### QRCodeCard

Canvas-based QR code generator.

```tsx
<QRCodeCard />
// User enters data, generates downloadable QR
```

### PassphraseCard

Diceware-style passphrase generator with entropy calculation.

```tsx
<PassphraseCard />
// Options: word count, separator, capitalize, add number
```

### EncoderCard

Multi-format encoder/decoder.

```tsx
<EncoderCard />
// Modes: Base64, Hex, URL, HTML
// Direction: Encode/Decode
```

---

## 🔐 Security Model

### Zero-Knowledge Architecture

```
┌────────────────────────────────────────────────────────┐
│                     USER'S BROWSER                     │
│                                                        │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │ React App   │    │ Web Crypto  │    │ IndexedDB │  │
│  │ (Rendering) │    │ (Secrets)   │    │ (Local)   │  │
│  └─────────────┘    └─────────────┘    └───────────┘  │
│                                                        │
│        All cryptographic operations happen HERE        │
└────────────────────────────────────────────────────────┘
                          │
                          │ Only prompts sent (no secrets)
                          ▼
              ┌─────────────────────┐
              │   Gemini API        │
              │   (Function Calls)  │
              │   Returns: config   │
              │   NOT actual keys   │
              └─────────────────────┘
```

### Security Features

| Feature | Implementation |
|---------|----------------|
| **CSPRNG** | `crypto.getRandomValues()` with rejection sampling |
| **Key Derivation** | PBKDF2 with 100,000 iterations |
| **Encryption** | AES-256-GCM with random IV |
| **Hashing** | SHA-256/512 via SubtleCrypto |
| **XSS Prevention** | DOMPurify-style HTML sanitization |
| **Breach Check** | k-Anonymity (only first 5 chars of hash sent) |
| **No Persistence** | LocalStorage for theme only, no secrets stored |

### HIBP Integration (k-Anonymity)

```typescript
// Only first 5 chars of SHA-1 hash sent to API
const sha1 = await hashSHA1(password);
const prefix = sha1.slice(0, 5);
const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
// Check if full hash exists in response (client-side)
```

---

## 🎨 Customization

### Theme Variables

Edit CSS variables in `index.html`:

```css
:root {
  --bg-color: #0a0a0f;
  --text-color: #e4e4e7;
  --accent-color: #7f8c8d;
  --pac-blue-custom: #1e3a8a;
  --card-bg: #18181b;
  --border-color: #3f3f46;
}

body.light-mode {
  --bg-color: #f4f4f5;
  --text-color: #18181b;
  --accent-color: #52525b;
}
```

### Adding New Tools

1. Create component in `components/NewToolCard.tsx`
2. Add type to `types.ts`:
   ```typescript
   export type SecretType = '...' | 'newTool';
   ```
3. Register in `geminiService.ts`:
   ```typescript
   enum: ["...", "newTool"]
   ```
4. Add to switch in `ChatMessage.tsx`:
   ```tsx
   case 'newTool': return <NewToolCard />;
   ```
5. Add to menu in `App.tsx`:
   ```typescript
   { id: 'cmd_newtool', label: 'NEW TOOL', cmd: 'Open new tool', type: 'command' }
   ```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variable
vercel env add API_KEY
```

### Netlify

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `API_KEY` | ✅ | Google Gemini API Key |

---

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- Functional components with hooks
- Component files use PascalCase
- Utility files use camelCase

### Commit Convention

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: component name, service, config, etc.

Example: feat(PassphraseCard): add entropy calculation
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💛 by [ZYNIQ](https://zyniq.solutions)**

[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=flat-square&logo=twitter)](https://twitter.com/zyniq)
[![GitHub](https://img.shields.io/badge/GitHub-Star-181717?style=flat-square&logo=github)](https://github.com/ZYNIQ-AI-Driven-Development-Firm/ZYNIQ-PACSEC)

</div>
