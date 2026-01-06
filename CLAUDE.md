# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RabuSore Diff is a transcription comparison tool built with Next.js that calculates Word Error Rate (WER) and Diarization Error Rate (DER) for evaluating transcription accuracy. The app supports both web deployment and standalone desktop executables via Electron.

## Development Commands

### Web Development
```bash
npm run dev          # Start Next.js dev server on http://localhost:3000
npm run build        # Build for production (Next.js SSR)
npm start            # Start production Next.js server
npm run lint         # Run ESLint
```

### Static Export (for both hosting and Electron)
```bash
npm run export       # Build static export to out/ directory (same as npm run build)
npm run serve        # Serve static files from out/ on http://localhost:3000
```

### Desktop Application (Electron)
```bash
npm run electron                 # Run Electron app locally (must build static export first)
npm run electron:build-linux     # Build Linux executable to dist/
npm run electron:build-win       # Build Windows installer to dist/
npm run electron:build-mac       # Build macOS .dmg to dist/
./run-app.sh                     # Quick launcher for built Linux app
```

**Important**: Always run `npm run export` before building Electron executables. The Electron app serves files from the `out/` directory via an embedded HTTP server.

## Architecture

### Dual Deployment Model

The app supports two deployment targets with a shared codebase:

1. **Web (Static Export)**: Next.js configured with `output: 'export'` generates static HTML/CSS/JS to `out/`
2. **Desktop (Electron)**: `electron-main.js` runs an embedded HTTP server (serve-handler) on port 8273 to serve the `out/` directory, ensuring proper asset loading with absolute paths

### Core State Management Pattern

The app uses **localStorage-based hooks** for persistence across all state:

- `hooks/use-panel-state.ts` - Manages 3 transcription comparison panels (Ground Truth + 2 outputs)
- `hooks/use-word-map.ts` - Stores word mapping rules for normalization (e.g., "behaviour" → "behavior")
- `hooks/use-suggested-maps.ts` - Tracks auto-suggested mappings from substitution errors

All hooks follow the pattern:
1. Load from localStorage on mount
2. Update localStorage on every state change
3. Handle migration of legacy data formats

### Text Processing Pipeline

The comparison flow (app/page.tsx) follows this sequence:

1. **Raw Text Input** → User enters transcriptions with optional speaker tags `[HH:MM:SS] SPEAKER_01: text`
2. **Normalization** (optional, toggled by user):
   - Apply word map replacements (use-word-map.ts)
   - Lowercase, remove punctuation, collapse whitespace
   - Preserve speaker tags and timestamps during normalization
3. **Diff Calculation** (lib/diff.ts):
   - Uses `diff-match-patch-ts` for word-level or character-level diffs
   - Generates HTML with color-coded insertions/deletions/substitutions
4. **Metrics Calculation**:
   - **WER**: Computed on content only (speaker tags stripped via `stripSpeakerTags()`)
   - **DER**: Computed on original text (requires speaker tags)
5. **Display**:
   - Debounced updates (500ms) to avoid re-calculating on every keystroke
   - Edit mode vs Diff view mode toggle per panel

### Speaker Tag Format

Text can include speaker diarization in this format:
```
[00:00:04] SPEAKER_02: its a tool for comparing transcription texts
[00:00:12] SPEAKER_01: that sounds useful
```

Pattern: `[timestamp] SPEAKER_ID: utterance` or `SPEAKER_ID: utterance` (timestamp optional)

### Diff Calculation Details (lib/diff.ts)

- `computeDiffHtml()`: Main entry point, supports "word" or "char" mode
- `computeWordDiff()`: Uses diff-match-patch line-based algorithm (each word is a "line")
- `calculateWer()`: Levenshtein distance on word arrays → (subs + ins + dels) / total_words
- `calculateDer()`: Compares speaker assignments across aligned segments
- `extractSubstitutions()`: Finds word pairs where reference ≠ hypothesis for word map suggestions

## Important Implementation Notes

### Electron Asset Loading

Next.js static exports use absolute paths (`/_next/static/...`) which don't work with `file://` protocol. Solution:

- `electron-main.js` starts HTTP server on localhost:8273
- Loads `http://localhost:8273/index.html` instead of `file://` URLs
- Server config uses `cleanUrls: true` to automatically resolve `/` to `/index.html`

### State Persistence

All user data (panels, word maps, suggestions) persists in localStorage. There is **no backend**. When resetting or clearing data, use the provided hook methods (`setPanels(defaultPanels)`, `replaceWordMap({})`, etc.) which handle localStorage sync.

### Word Map Migration

`use-word-map.ts` auto-migrates from legacy format:
- **Old**: `{ "source": "target" }` (one-to-one)
- **New**: `{ "target": ["source1", "source2"] }` (one-to-many)

Migration runs on load if string values detected instead of arrays.

## File Structure

```
app/
  page.tsx              # Main transcription comparison UI
  wordmap/page.tsx      # Word map editor
  about/page.tsx        # About page
  layout.tsx            # Root layout with theme provider

lib/
  diff.ts               # Core diff/WER/DER calculation logic
  utils.ts              # Tailwind cn() utility

hooks/
  use-panel-state.ts    # Panel text & visibility state
  use-word-map.ts       # Word mapping normalization rules
  use-suggested-maps.ts # Auto-suggested word mappings

electron-main.js        # Electron entry point with HTTP server
next.config.mjs         # Next.js config (output: 'export')
```

## Common Gotchas

1. **Electron builds require static export**: Always `npm run export` before `npm run electron:build-*`
2. **WER vs DER**: WER strips speaker tags, DER requires them. Don't mix up the inputs.
3. **Normalization is per-comparison**: Word map and normalization toggle affect all panels simultaneously
4. **debouncing**: Diff calculations are debounced 500ms to avoid lag during typing
5. **Panel management**: At least 2 panels must be visible (1 GT + 1 comparison). Hide logic enforced in UI.

## Tech Stack

- **Next.js 15** (App Router, static export mode)
- **TypeScript** with relaxed config (ignoreBuildErrors: true)
- **Tailwind CSS** + **shadcn/ui** components (Radix UI primitives)
- **diff-match-patch-ts** for text diffing
- **Electron + electron-builder** for desktop builds
- **serve-handler** (embedded in Electron for static file serving)
