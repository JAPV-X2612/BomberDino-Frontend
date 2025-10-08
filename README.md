# 🎮 Bomber Dino Frontend

<div align="center">
  <img src="src/assets/images/bomber-dino-logo.png" alt="Bomber Dino Logo" width="70%">
</div>

<div align="center">

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Phaser](https://img.shields.io/badge/Phaser-3.80+-8B5CF6?style=for-the-badge&logo=phaser&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7+-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

</div>

---

## 📋 **Table of Contents**

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Game Development](#-game-development)
- [Testing](#-testing)
- [Building for Production](#-building-for-production)
- [Team Members](#-team-members)
- [License](#-license)
- [Additional Resources](#-additional-resources)

---

## 🌟 **Overview**

**Bomber Dino Frontend** is a modern, high-performance web application built with **React 18**, **TypeScript**, and **Phaser 3** for delivering an immersive real-time multiplayer gaming experience. The application features a responsive UI, seamless WebSocket integration, and optimized game rendering for smooth 60 FPS gameplay.

This frontend connects to the **Bomber Dino Backend API** to provide authentication, game management, and real-time player synchronization across multiple concurrent game sessions.

---

## ✨ **Features**

### 🎨 **User Interface**
- **Responsive design** with Tailwind CSS and Bootstrap components
- **Dark/Light theme support** with persistent user preferences
- **Smooth animations** and transitions for enhanced UX
- **Accessibility-compliant** (WCAG 2.1 Level AA)
- **Progressive Web App (PWA)** capabilities

### 🎮 **Game Features**
- **Real-time multiplayer gameplay** powered by Phaser 3
- **60 FPS** smooth rendering with optimized sprite management
- **Dynamic game maps** with destructible environments
- **Power-ups system** with visual feedback
- **Player customization** (skins, avatars, colors)
- **In-game chat** for player communication

### 🔐 **Authentication & Security**
- **JWT-based authentication** with secure token storage
- **Protected routes** for authenticated users only
- **Session management** with automatic token refresh
- **Remember me** functionality
- **Password strength validation**

### 🌐 **Real-Time Communication**
- **WebSocket integration** via Socket.IO client
- **Automatic reconnection** with exponential backoff
- **Latency optimization** for competitive gameplay
- **Event-driven architecture** for game state updates
- **Lobby system** with matchmaking

### 📊 **State Management**
- **Global state** with React Context API
- **Local state** optimization with React hooks
- **Persistent storage** with localStorage/sessionStorage
- **Form state management** with React Hook Form

---

## 🛠️ **Tech Stack**

### **Core Framework**
- **React** `18.3.1` - UI library with concurrent features
- **TypeScript** `5.5+` - Type-safe JavaScript
- **Vite** `5.4+` - Next-generation build tool

### **Game Engine**
- **Phaser** `3.80+` - 2D game framework
  - Canvas/WebGL rendering
  - Physics engine (Arcade Physics)
  - Animation system
  - Asset management

### **UI & Styling**
- **Tailwind CSS** `3.4+` - Utility-first CSS framework
- **Bootstrap** `5.3+` - Component library
- **CSS Modules** - Scoped component styling
- **PostCSS** - CSS transformations

### **HTTP & WebSocket**
- **Axios** `1.7+` - HTTP client with interceptors
- **Socket.IO Client** `4.7+` - Real-time bidirectional communication

### **State Management**
- **React Context API** - Global state management
- **Zustand** `4.5+` _(optional)_ - Lightweight state management
- **React Hook Form** `7.52+` - Form state management

### **Routing**
- **React Router DOM** `6.26+` - Client-side routing

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing

### **Build & Deployment**
- **Vite Build** - Optimized production bundles
- **Azure Static Web Apps** - Cloud hosting

---

## 🏗️ **Architecture**

The application follows a **component-based architecture** with clear separation between UI and game logic:

```
┌─────────────────────────────────────────────┐
│         Browser (User Interface)            │
│  ┌───────────────────────────────────────┐  │
│  │    React Components (UI Layer)        │  │
│  │  • Pages, Layouts, Common Components  │  │
│  └──────────────┬────────────────────────┘  │
│                 ↓                           │
│  ┌───────────────────────────────────────┐  │
│  │   Phaser Game (Canvas Rendering)      │  │
│  │  • Scenes, Entities, Game Logic       │  │
│  └──────────────┬────────────────────────┘  │
│                 ↓                           │
│  ┌───────────────────────────────────────┐  │
│  │    Services & State Management        │  │
│  │  • Context, Hooks, Custom Services    │  │
│  └──────────────┬────────────────────────┘  │
└─────────────────┼───────────────────────────┘
                  ↓
┌────────────────────────────────────────────┐
│         Communication Layer                │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Axios (HTTP)   │  │ Socket.IO (WS)  │  │
│  └────────┬────────┘  └────────┬────────┘  │
└───────────┼────────────────────┼───────────┘
            ↓                    ↓
┌───────────────────────────────────────────────┐
│         Backend API (Spring Boot)             │
│    REST Endpoints + WebSocket Server          │
└───────────────────────────────────────────────┘
```

### **Architecture Layers**

| Layer | Components | Purpose |
|-------|-----------|---------|
| **Presentation** | `pages/`, `components/` | UI rendering, user interactions |
| **Game Engine** | `phaser/scenes/`, `phaser/entities/` | Game logic, physics, rendering |
| **Business Logic** | `services/`, `hooks/` | API calls, state management, utilities |
| **Communication** | `api/`, `services/websocket.service.ts` | HTTP requests, WebSocket events |
| **State** | `context/`, `store/` | Global application state |
| **Routing** | `routes/` | Navigation and protected routes |

---

## 📦 **Prerequisites**

Before installation, ensure you have the following installed:

- **Node.js** `18.x` or higher - [Download](https://nodejs.org/)
- **npm** `9.x` or **pnpm** `8.x` - Package manager
- **Git** - [Download](https://git-scm.com/downloads)
- **Modern browser** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### **Recommended Tools**
- **Visual Studio Code** - [Download](https://code.visualstudio.com/)
  - Extensions:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - TypeScript Vue Plugin (Volar)
- **React Developer Tools** - Browser extension
- **Redux DevTools** - Browser extension (if using Redux)

---

## 🚀 **Installation**

### **1️⃣ Clone the Repository**

```bash
git clone https://github.com/your-org/BomberDino-Frontend.git
cd BomberDino-Frontend
```

### **2️⃣ Verify Node.js Installation**

```bash
node --version
# Expected output: v18.x.x or higher

npm --version
# Expected output: 9.x.x or higher
```

### **3️⃣ Install Dependencies**

**Using npm:**
```bash
npm install
```

**Using pnpm (faster alternative):**
```bash
npm install -g pnpm
pnpm install
```

This command will:
- Install all production dependencies
- Install development dependencies (testing, linting)
- Download type definitions
- Set up Git hooks (if configured)

### **4️⃣ Initialize Tailwind CSS**

If not already configured:

```bash
npx tailwindcss init -p
```

---

## ⚙️ **Configuration**

### **1️⃣ Create Environment Files**

Copy the example environment file:

```bash
cp .env.example .env.development
cp .env.example .env.production
```

### **2️⃣ Configure Environment Variables**

**File**: `.env.development`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1

# WebSocket Configuration
VITE_WS_URL=ws://localhost:8080
VITE_WS_PATH=/ws

# Authentication
VITE_JWT_STORAGE_KEY=bomber_dino_token
VITE_TOKEN_EXPIRY_MINUTES=30

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_SOUND=true

# Game Configuration
VITE_GAME_FPS=60
VITE_GAME_WIDTH=800
VITE_GAME_HEIGHT=600
```

**File**: `.env.production`

```bash
# API Configuration
VITE_API_BASE_URL=https://api.bomberdino.com
VITE_API_VERSION=v1

# WebSocket Configuration
VITE_WS_URL=wss://api.bomberdino.com
VITE_WS_PATH=/ws

# Authentication
VITE_JWT_STORAGE_KEY=bomber_dino_token
VITE_TOKEN_EXPIRY_MINUTES=30

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_SOUND=true

# Game Configuration
VITE_GAME_FPS=60
VITE_GAME_WIDTH=800
VITE_GAME_HEIGHT=600
```

### **3️⃣ Configure Tailwind CSS**

**File**: `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        game: ['Press Start 2P', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### **4️⃣ Configure Vite**

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@phaser': path.resolve(__dirname, './src/phaser'),
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'phaser-vendor': ['phaser'],
          'socket-vendor': ['socket.io-client'],
        },
      },
    },
  },
})
```

---

## ▶️ **Running the Application**

### **Development Mode**

Start the Vite development server with hot module replacement (HMR):

```bash
npm run dev
```

The application will be available at:
- **Local:** `http://localhost:5173`
- **Network:** `http://[your-ip]:5173`

### **Development with Backend**

Ensure the backend is running first:

```bash
# Terminal 1: Start backend (from backend directory)
cd ../BomberDino-Backend
mvn spring-boot:run

# Terminal 2: Start frontend (from frontend directory)
cd BomberDino-Frontend
npm run dev
```

### **Preview Production Build**

Build and preview the production version locally:

```bash
npm run build
npm run preview
```

### **TypeScript Type Checking**

Run type checking without building:

```bash
npm run type-check
```

### **Linting & Formatting**

**Lint code:**
```bash
npm run lint
```

**Fix linting issues:**
```bash
npm run lint:fix
```

**Format code with Prettier:**
```bash
npm run format
```

---

## 📂 **Project Structure**

```
frontend/
│
├── public/
│   ├── assets/
│   │   ├── audio/
│   │   │   ├── music/              # Background music
│   │   │   └── sfx/                # Sound effects
│   │   ├── images/
│   │   │   ├── sprites/            # Game sprites
│   │   │   │   ├── characters/     # Player/enemy sprites
│   │   │   │   ├── items/          # Items and power-ups
│   │   │   │   └── effects/        # Visual effects
│   │   │   ├── backgrounds/        # Background images
│   │   │   ├── ui/                 # UI elements
│   │   │   └── tiles/              # Tileset images
│   │   └── fonts/                  # Custom fonts
│   ├── favicon.ico
│   ├── index.html
│   └── manifest.json
│
├── src/
│   ├── api/
│   │   ├── axios.config.ts         # Axios instance setup
│   │   ├── interceptors.ts         # Request/response interceptors
│   │   └── endpoints/
│   │       ├── auth.api.ts         # Authentication endpoints
│   │       ├── game.api.ts         # Game-related endpoints
│   │       └── user.api.ts         # User management endpoints
│   │
│   ├── components/
│   │   ├── common/                 # Reusable components
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Modal/
│   │   │   ├── Loader/
│   │   │   └── ErrorBoundary/
│   │   ├── layout/                 # Layout components
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   ├── Sidebar/
│   │   │   └── Navbar/
│   │   └── game/                   # Game-specific components
│   │       ├── GameCanvas/         # Phaser game container
│   │       ├── GameUI/             # In-game UI overlays
│   │       ├── Lobby/              # Lobby components
│   │       └── Matchmaking/        # Matchmaking queue
│   │
│   ├── pages/
│   │   ├── Home/                   # Landing page
│   │   ├── Auth/                   # Login/Register pages
│   │   ├── Game/                   # Main game page
│   │   ├── Lobby/                  # Game lobby
│   │   ├── Profile/                # User profile
│   │   ├── Leaderboard/            # Rankings
│   │   ├── Settings/               # User settings
│   │   └── NotFound/               # 404 page
│   │
│   ├── phaser/
│   │   ├── game.config.ts          # Phaser game configuration
│   │   ├── scenes/
│   │   │   ├── BootScene.ts        # Initial boot scene
│   │   │   ├── PreloadScene.ts     # Asset preloading
│   │   │   ├── MenuScene.ts        # Main menu scene
│   │   │   ├── GameScene.ts        # Core gameplay scene
│   │   │   └── GameOverScene.ts    # Game over screen
│   │   ├── entities/
│   │   │   ├── Player.ts           # Player entity logic
│   │   │   ├── Enemy.ts            # Enemy entity logic
│   │   │   ├── Bomb.ts             # Bomb mechanics
│   │   │   └── Powerup.ts          # Power-up items
│   │   ├── managers/
│   │   │   ├── InputManager.ts     # Keyboard/gamepad input
│   │   │   ├── CollisionManager.ts # Collision detection
│   │   │   ├── SoundManager.ts     # Audio management
│   │   │   └── AnimationManager.ts # Animation control
│   │   └── utils/
│   │       ├── MapLoader.ts        # Load game maps
│   │       └── SpriteLoader.ts     # Load sprite sheets
│   │
│   ├── services/
│   │   ├── auth.service.ts         # Authentication logic
│   │   ├── game.service.ts         # Game state management
│   │   ├── websocket.service.ts    # WebSocket connection
│   │   ├── storage.service.ts      # LocalStorage wrapper
│   │   └── analytics.service.ts    # Analytics tracking
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useWebSocket.ts         # WebSocket hook
│   │   ├── useGame.ts              # Game state hook
│   │   ├── useLocalStorage.ts      # Persistent storage hook
│   │   └── useDebounce.ts          # Debounce utility hook
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # Auth state provider
│   │   ├── GameContext.tsx         # Game state provider
│   │   ├── WebSocketContext.tsx    # WebSocket provider
│   │   └── ThemeContext.tsx        # Theme state provider
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx           # Route definitions
│   │   ├── PrivateRoute.tsx        # Protected route wrapper
│   │   └── PublicRoute.tsx         # Public route wrapper
│   │
│   ├── store/                      # (Optional: Redux/Zustand)
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── gameSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── store.ts
│   │
│   ├── types/
│   │   ├── api.types.ts            # API response types
│   │   ├── game.types.ts           # Game-related types
│   │   ├── user.types.ts           # User types
│   │   └── websocket.types.ts      # WebSocket message types
│   │
│   ├── utils/
│   │   ├── constants.ts            # App-wide constants
│   │   ├── validators.ts           # Input validation
│   │   ├── formatters.ts           # Data formatters
│   │   └── helpers.ts              # Helper functions
│   │
│   ├── styles/
│   │   ├── global.css              # Global styles
│   │   ├── variables.css           # CSS variables
│   │   ├── tailwind.css            # Tailwind imports
│   │   └── bootstrap-overrides.css # Bootstrap customization
│   │
│   ├── assets/                     # Project assets
│   │   ├── docs/
│   │   ├── images/
│   │   └── videos/
│   │
│   ├── App.tsx                     # Root component
│   ├── App.test.tsx                # App tests
│   ├── App.module.css              # App styles
│   ├── main.tsx                    # Application entry point
│   └── vite-env.d.ts               # Vite type definitions
│
├── tests/
│   ├── unit/                       # Unit tests
│   ├── integration/                # Integration tests
│   └── e2e/                        # End-to-end tests
│
├── .env.example                    # Environment template
├── .env.development                # Development environment
├── .env.production                 # Production environment
├── .eslintrc.json                  # ESLint configuration
├── .prettierrc                     # Prettier configuration
├── .gitignore                      # Git ignore rules
├── index.html                      # HTML entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.node.json              # Node TypeScript config
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
└── README.md                       # This file
```

### **Key Files Explained**

| File | Purpose |
|------|---------|
| `main.tsx` | Application entry point, renders `<App />` |
| `App.tsx` | Root component, sets up providers and routing |
| `api/axios.config.ts` | Axios instance with base URL and interceptors |
| `services/websocket.service.ts` | Socket.IO client connection management |
| `phaser/game.config.ts` | Phaser game initialization and configuration |
| `context/AuthContext.tsx` | Global authentication state provider |
| `routes/AppRoutes.tsx` | React Router route definitions |
| `vite.config.ts` | Vite build tool configuration |

---

## 🎮 **Game Development**

### **Phaser Integration**

**Basic Phaser scene structure:**

**File**: `src/phaser/scenes/GameScene.ts`

```typescript
import Phaser from 'phaser';
import { Player } from '../entities/Player';

/**
 * Main gameplay scene
 * Handles player movement, collisions, and game state
 */
export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Initialize scene with data from previous scene
   */
  init(data: { playerName: string }): void {
    console.log('Game starting for player:', data.playerName);
  }

  /**
   * Preload game assets
   */
  preload(): void {
    this.load.image('player', '/assets/images/sprites/characters/player.png');
    this.load.image('tile', '/assets/images/tiles/ground.png');
  }

  /**
   * Create game objects and initialize scene
   */
  create(): void {
    // Create player
    this.player = new Player(this, 100, 100);
    
    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // Setup physics
    this.physics.world.setBounds(0, 0, 800, 600);
  }

  /**
   * Update game state (called every frame)
   */
  update(time: number, delta: number): void {
    this.player.update(this.cursors);
  }
}
```

### **React-Phaser Bridge**

**File**: `src/components/game/GameCanvas/GameCanvas.tsx`

```typescript
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '@phaser/game.config';

/**
 * GameCanvas component
 * Initializes and mounts Phaser game instance
 */
export const GameCanvas: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (parentRef.current && !gameRef.current) {
      // Initialize Phaser game
      gameRef.current = new Phaser.Game({
        ...gameConfig,
        parent: parentRef.current,
      });
    }

    // Cleanup on unmount
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={parentRef} 
      className="game-canvas-container"
      style={{ width: '800px', height: '600px' }}
    />
  );
};
```

### **WebSocket Game Synchronization**

**File**: `src/services/websocket.service.ts`

```typescript
import { io, Socket } from 'socket.io-client';

/**
 * WebSocket service for real-time game communication
 */
class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to WebSocket server
   */
  connect(token: string): void {
    const wsUrl = import.meta.env.VITE_WS_URL;
    
    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.setupListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('game:state-update', (data) => {
      // Handle game state updates
      console.log('Game state updated:', data);
    });
  }

  /**
   * Send player movement to server
   */
  sendPlayerMove(position: { x: number; y: number }): void {
    this.socket?.emit('player:move', position);
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const websocketService = new WebSocketService();
```

---

## 🧪 **Testing**

### **Run All Tests**

```bash
npm run test
```

### **Run Tests in Watch Mode**

```bash
npm run test:watch
```

### **Run Tests with Coverage**

```bash
npm run test:coverage
```

View coverage report at: `coverage/index.html`

### **Component Testing Example**

**File**: `src/components/common/Button/Button.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### **E2E Testing with Playwright** _(Optional)_

```bash
npm install -D @playwright/test
npx playwright install
npm run test:e2e
```

---

## 🏗️ **Building for Production**

### **Build the Application**

```bash
npm run build
```

This command:
- Compiles TypeScript to JavaScript
- Bundles all assets with Vite
- Minifies and optimizes code
- Outputs to `dist/` directory

### **Build Output Structure**

```
dist/
├── assets/
│   ├── index-[hash].js       # Main JavaScript bundle
│   ├── index-[hash].css      # Compiled CSS
│   └── [asset-name]-[hash]   # Optimized images/fonts
├── index.html                # Entry HTML file
└── manifest.json             # PWA manifest
```

### **Analyze Bundle Size**

```bash
npm run build -- --mode analyze
```

### **Production Checklist**

- ✅ Environment variables configured in `.env.production`
- ✅ API endpoints point to production backend
- ✅ Debug mode disabled (`VITE_ENABLE_DEBUG_MODE=false`)
- ✅ Analytics enabled
- ✅ Source maps disabled for security
- ✅ All tests passing
- ✅ No console errors or warnings
- ✅ Performance optimized (Lighthouse score 90+)
- ✅ Assets compressed and optimized
- ✅ CORS configured correctly

---

## 🚢 **Deployment**

### **Azure Static Web Apps**

**Prerequisites:**
- Azure CLI installed
- Azure subscription active
- GitHub repository connected

**Steps:**

1. **Install Azure Static Web Apps CLI:**
```bash
npm install -g @azure/static-web-apps-cli
```

2. **Build the application:**
```bash
npm run build
```

3. **Deploy via Azure CLI:**
```bash
az staticwebapp create \
  --name bomber-dino-frontend \
  --resource-group bomber-dino-rg \
  --source . \
  --location "West US 2" \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

4. **Configure custom domain** (optional):
```bash
az staticwebapp hostname set \
  --name bomber-dino-frontend \
  --resource-group bomber-dino-rg \
  --hostname www.bomberdino.com
```

### **GitHub Actions Deployment**

**File**: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Azure Static Web Apps

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy:
    if: github.event_name == 'push' || github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test

      - name: Build application
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_WS_URL: ${{ secrets.VITE_WS_URL }}

      - name: Deploy to Azure Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "dist"
```

### **Vercel Deployment** _(Alternative)_

**Install Vercel CLI:**
```bash
npm install -g vercel
```

**Deploy:**
```bash
vercel --prod
```

**Configuration file** (`vercel.json`):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "@api_base_url",
    "VITE_WS_URL": "@ws_url"
  }
}
```

### **Netlify Deployment** _(Alternative)_

**File**: `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

**Deploy via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

---

## 🔒 **Security Best Practices**

### **Implemented Security Measures**

- ✅ **No sensitive data in localStorage** - JWT tokens in memory or httpOnly cookies
- ✅ **Input sanitization** - All user inputs validated and sanitized
- ✅ **XSS prevention** - React's built-in escaping + DOMPurify for HTML content
- ✅ **CSRF protection** - Token validation on all state-changing requests
- ✅ **Secure headers** - Content-Security-Policy, X-Frame-Options configured
- ✅ **HTTPS only** - Force SSL in production
- ✅ **Dependency scanning** - Regular npm audit checks

### **Environment Variables Security**

**Never commit:**
- `.env.development`
- `.env.production`
- `.env.local`

**Always commit:**
- `.env.example` (template without secrets)

### **API Security**

**File**: `src/api/axios.config.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🐛 **Common Issues & Solutions**

### **Issue: Vite dev server not starting**

**Error:** `Error: Cannot find module 'vite'`

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Issue: Phaser game not rendering**

**Checklist:**
1. Verify Phaser is imported correctly: `import Phaser from 'phaser'`
2. Check game config has correct `type: Phaser.AUTO`
3. Ensure parent container exists in DOM before initialization
4. Verify assets are in `public/assets/` directory

**Solution:**
```typescript
// Wait for DOM to be ready
useEffect(() => {
  if (parentRef.current && !gameRef.current) {
    gameRef.current = new Phaser.Game({
      ...gameConfig,
      parent: parentRef.current,
    });
  }
}, []);
```

### **Issue: WebSocket connection fails**

**Error:** `WebSocket connection to 'ws://localhost:8080' failed`

**Solutions:**
1. Verify backend WebSocket server is running
2. Check CORS configuration on backend
3. Ensure WebSocket URL uses `ws://` (dev) or `wss://` (prod)
4. Check firewall/antivirus blocking WebSocket ports

**Test connection:**
```typescript
const socket = io('http://localhost:8080', {
  transports: ['websocket'],
  reconnection: false, // Disable to see immediate errors
});

socket.on('connect', () => console.log('Connected'));
socket.on('connect_error', (err) => console.error('Error:', err));
```

### **Issue: Environment variables not loading**

**Error:** `import.meta.env.VITE_API_BASE_URL is undefined`

**Solutions:**
1. Ensure variable starts with `VITE_` prefix
2. Restart dev server after changing `.env` files
3. Verify `.env` file is in project root (not `src/`)

**Correct usage:**
```typescript
// ✅ Correct
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// ❌ Wrong - won't work
const apiUrl = process.env.VITE_API_BASE_URL;
```

### **Issue: Tailwind styles not applying**

**Solutions:**
1. Verify `tailwind.css` is imported in `main.tsx`
2. Check `content` paths in `tailwind.config.js`
3. Restart dev server

**File**: `src/main.tsx`
```typescript
import './styles/tailwind.css'; // Must be imported
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### **Issue: Build fails with TypeScript errors**

**Error:** `Type 'X' is not assignable to type 'Y'`

**Solutions:**
1. Run type checking: `npm run type-check`
2. Fix type errors or use type assertions carefully
3. Check `tsconfig.json` is configured correctly

**Quick fix** (use sparingly):
```typescript
// Add type assertion if absolutely necessary
const value = someValue as ExpectedType;
```

---

## 📊 **Performance Optimization**

### **Code Splitting**

**Lazy load routes:**

```typescript
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load page components
const Home = lazy(() => import('@pages/Home/Home'));
const Game = lazy(() => import('@pages/Game/GamePage'));
const Profile = lazy(() => import('@pages/Profile/ProfilePage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### **Image Optimization**

**Use WebP format:**
```html
<picture>
  <source srcSet="/assets/images/hero.webp" type="image/webp" />
  <img src="/assets/images/hero.png" alt="Hero" />
</picture>
```

**Lazy load images:**
```typescript
<img 
  src="/assets/images/placeholder.png"
  data-src="/assets/images/hero.png"
  loading="lazy"
  alt="Hero"
/>
```

### **Memoization**

**Memoize expensive computations:**

```typescript
import { useMemo } from 'react';

function ExpensiveComponent({ data }) {
  const processedData = useMemo(() => {
    return data.map(item => complexCalculation(item));
  }, [data]);

  return <div>{processedData}</div>;
}
```

**Memoize components:**

```typescript
import { memo } from 'react';

export const PlayerCard = memo(({ player }) => {
  return (
    <div className="player-card">
      <h3>{player.name}</h3>
      <p>Score: {player.score}</p>
    </div>
  );
});
```

---

## 📱 **Progressive Web App (PWA)**

### **Configure PWA**

**File**: `public/manifest.json`

```json
{
  "name": "Bomber Dino",
  "short_name": "BomberDino",
  "description": "Real-time multiplayer bomber game",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "orientation": "landscape",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### **Service Worker** _(Optional)_

Install PWA plugin:
```bash
npm install -D vite-plugin-pwa
```

**Configure in `vite.config.ts`:**

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Bomber Dino',
        short_name: 'BomberDino',
        theme_color: '#0ea5e9',
      },
    }),
  ],
});
```

---

## 👥 **Team Members**

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/hakki17">
        <img src="https://github.com/hakki17.png" width="100px;" alt="Maria Paula Sánchez Macías"/>
        <br />
        <sub><b>Maria Paula Sánchez Macías</b></sub>
      </a>
      <br />
      <sub>Full-Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/JAPV-X2612">
        <img src="https://github.com/JAPV-X2612.png" width="100px;" alt="Jesús Alfonso Pinzón Vega"/>
        <br />
        <sub><b>Jesús Alfonso Pinzón Vega</b></sub>
      </a>
      <br />
      <sub>Backend Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/JuanEstebanMedina">
        <img src="https://github.com/JuanEstebanMedina.png" width="100px;" alt="Juan Esteban Medina Rivas"/>
        <br />
        <sub><b>Juan Esteban Medina Rivas</b></sub>
      </a>
      <br />
      <sub>Frontend Developer</sub>
    </td>
  </tr>
</table>

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🔗 **Additional Resources**

### **Official Documentation**
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)

### **Tools & Libraries**
- [React Router Documentation](https://reactrouter.com/en/main)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)

### **Game Development Resources**
- [Phaser Examples](https://phaser.io/examples)
- [Phaser Community Tutorials](https://phaser.io/community)
- [Game Dev Resources](https://github.com/ellisonleao/magictools)
- [OpenGameArt.org](https://opengameart.org/) - Free game assets

### **Best Practices & Patterns**
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)
- [Airbnb React Style Guide](https://airbnb.io/javascript/react/)

### **Performance & Optimization**
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### **Community**
- [React Discord](https://discord.gg/react)
- [Phaser Discord](https://discord.gg/phaser)
- [Stack Overflow - React](https://stackoverflow.com/questions/tagged/reactjs)
- [Stack Overflow - Phaser](https://stackoverflow.com/questions/tagged/phaser-framework)

---

<div align="center">
  <p>Made with ❤️ for multiplayer gaming enthusiasts</p>
  <p>🌟 Star this repository if you find it helpful!</p>
  <p>🎮 Happy Gaming! 🎮</p>
</div>
