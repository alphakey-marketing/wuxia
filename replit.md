# 重生江湖 · Rebirth of Jianghu (Wuxia)

## Project Overview

A Wuxia/Jianghu-themed game built with React, Vite, and Phaser 3. This is a pure frontend application with no backend server.

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Game Engine**: Phaser 3
- **Language**: JavaScript (JSX)
- **Package Manager**: npm

## Project Structure

```
src/
  App.jsx / App.css   - Root React component
  main.jsx            - Entry point
  index.css           - Global styles
  components/         - React UI components
  game/               - Phaser game logic
  data/               - Game data (items, characters, etc.)
  store/              - State management
  utils/              - Utility functions
  assets/             - Images, audio, etc.
public/               - Static public assets
```

## Development

- **Dev server**: `npm run dev` (runs on port 5000, host 0.0.0.0)
- **Build**: `npm run build` (outputs to `dist/`)
- **Lint**: `npm run lint`

## Deployment

- **Type**: Static site
- **Build command**: `npm run build`
- **Public directory**: `dist`
