# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm i          # Install dependencies
npm run dev    # Start development server (Vite)
npm run build  # Production build
```

There is no test runner or linter configured in this project.

## Architecture

This is a Figma Make-generated React/TypeScript single-page application that simulates an AI agent-driven SDLC pipeline dashboard.

### State Management

All application state lives in a single custom hook in `src/app/lib/store.ts` via `useProjectStore()`. This is the core of the app — it manages a `ProjectRun` containing 6 `AgentNode` entries and drives the entire simulation. Key functions:

- `startRun()` — initializes and begins pipeline execution
- `simulateAgent(index)` — streams fake logs and progress for an agent
- `approveAndProceed()` — advances the pipeline in supervised mode (human-in-the-loop)
- `editAndRetry()` — re-executes the current agent after edits
- `toggleMode()` — switches between `"autonomous"` and `"supervised"` modes

Agent statuses: `"idle" | "processing" | "pending_approval" | "complete" | "error"`

### Component Hierarchy

```
App (RouterProvider)
└── AppLayout (header/nav)
    ├── DashboardPage (/) — main view, composes the panels below
    │   ├── PipelineVisualizer — horizontal flow diagram with status badges
    │   ├── AgentInspector — tabbed panel (logs, input schema, output preview)
    │   └── Control panels (approval/edit, MCP activity, progress)
    └── SettingsPage (/settings) — MCP integration configuration
```

### Agent Pipeline

6 agents run sequentially with an optional loopback from Support → Developer:

1. **Product Agent** → Requirements (ServiceNow)
2. **Architect Agent** → System Design (Confluence)
3. **Design Agent** → UI/UX (Figma)
4. **Developer Agent** → Implementation (GitHub)
5. **DevOps Agent** → Deployment (GitHub Actions)
6. **Support Agent** → Incident Response (ServiceNow)

### Tech Stack

- **Build:** Vite 6 + `@tailwindcss/vite` plugin
- **UI:** React 18, Tailwind CSS v4, shadcn/ui components (in `src/app/components/ui/`), Radix UI primitives, Recharts for data viz
- **Routing:** React Router (2 routes: `/` and `/settings`)
- **Path alias:** `@` → `src/`
- **Custom Vite plugin:** `figma-asset-resolver` handles `figma:asset/` imports

### Styling

Design tokens are defined in `src/styles/theme.css` as CSS variables (oklch color space). Primary color is indigo (`#6366F1`). Full dark mode support via CSS variable overrides. Do not use hardcoded colors — reference the CSS variables.
