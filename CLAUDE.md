# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Initial setup (ONLY RUN ONCE on fresh template)
npm run remix-setup

# Development server with mobile QR code
npm run dev

# Development server on specific ports
npm run dev:3001     # Use port 3001 if 3000 is busy
npm run dev:any      # Use random available port

# Production build (creates single dist/index.html file)
npm run build

# Preview built game locally
npm run preview
```

## Architecture Overview

This is a **Phaser.js + TypeScript** game template designed for the **Remix/Farcade platform** with a mobile-first approach using a **5:9 aspect ratio** (1000x1800).

### Key Architecture Points

- **Phaser.js is loaded via CDN**: Phaser is globally available through `index.html` - **never import Phaser in TypeScript files**
- **Single-file deployment**: The build process creates a single `dist/index.html` file containing the entire game
- **Mobile-optimized**: Built for vertical mobile screens with touch controls
- **Remix SDK integration**: Uses `@farcade/game-sdk` for platform features

### Project Structure

```
src/
├── main.ts              # Game entry point - creates Phaser game instance
├── config/
│   └── GameSettings.ts  # Canvas size, debug settings, game parameters
├── scenes/
│   └── GameScene.ts     # Main game scene (contains demo bouncing balls)
├── utils/
│   └── RemixUtils.ts    # Remix/Farcade SDK integration utilities
├── objects/             # Game objects and entities
├── systems/             # Game systems (physics, input, etc.)
└── types.ts            # TypeScript type definitions
```

### Core Files

- **`src/main.ts`**: Configures and creates the Phaser game instance with WebGL renderer, arcade physics, and scene setup
- **`src/config/GameSettings.ts`**: Centralized configuration for canvas dimensions (1000x1800) and debug settings
- **`src/scenes/GameScene.ts`**: Main game scene with demo content (bouncing balls) - replace with actual game logic
- **`src/utils/RemixUtils.ts`**: Handles Remix SDK initialization, ready state, mute/unmute, and play_again events

### Build System

- **Development**: Uses Vite dev server with hot reload and mobile QR code generation
- **Production**: Custom esbuild script that:
  - Bundles TypeScript with Phaser marked as external
  - Inlines the bundled JS into the HTML template
  - Creates a single deployable `dist/index.html` file
  - Minifies code and removes development scripts

### Development Workflow

1. **Start development**: `npm run dev` (includes QR code for mobile testing)
2. **Edit game logic**: Modify files in `src/` (auto-reload enabled)
3. **Test on mobile**: Scan QR code (ensure same Wi-Fi network)
4. **Build for deployment**: `npm run build`
5. **Deploy**: Copy `dist/index.html` content to Remix platform

### Important Constraints

- **No Phaser imports**: Phaser is loaded globally - importing it will break the build
- **Mobile aspect ratio**: Game must work within 1000x1800 canvas (5:9 ratio)
- **Single file output**: All assets and code must be bundled into one HTML file
- **Remix SDK**: Must call `FarcadeSDK.singlePlayer.actions.ready()` when game is initialized

### Removing Demo Content

The template includes bouncing balls demo in `GameScene.ts`. To start building a real game, remove the demo content and implement actual game mechanics while maintaining the scene structure and Remix SDK integration.