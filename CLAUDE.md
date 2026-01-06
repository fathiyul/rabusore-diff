# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RabuSore Diff is a Next.js application for comparing transcription texts. It allows users to evaluate transcription accuracy by comparing multiple transcription outputs against a ground truth, calculating metrics like Word Error Rate (WER) and Diarization Error Rate (DER).

## Development Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run Next.js linter
```

## Architecture

### Core Components Structure

The application is built with Next.js 15 using the App Router pattern with client-side state management:

**Main Page** (`app/page.tsx`)
- Primary comparison interface
- Manages multiple text panels for comparison
- Controls diff visualization modes (word/char)
- Handles normalized text comparison
- Integrates all hooks and calculations

**Diff Engine** (`lib/diff.ts`)
- `computeDiffHtml()`: Generates HTML-formatted diff visualization using diff-match-patch-ts
- `calculateWer()`: Computes Word Error Rate using dynamic programming (Levenshtein distance)
- `calculateDer()`: Computes Diarization Error Rate by comparing speaker segments
- `extractSubstitutions()`: Identifies word-level substitutions for word map suggestions
- `stripSpeakerTags()`: Removes speaker labels from transcription text

### State Management Pattern

The application uses a custom hook-based state management pattern with localStorage persistence:

**Panel State** (`hooks/use-panel-state.ts`)
- Manages multiple text panels (Ground Truth + comparison panels)
- Each panel has: id, title, text, isVisible
- Auto-saves to localStorage on changes
- Provides default example data on first load

**Word Map** (`hooks/use-word-map.ts`)
- Stores mappings of word variations to canonical forms
- Format: `{ target: [source1, source2, ...] }`
- Example: `{ "behavior": ["behaviour", "behavier"] }`
- `applyWordMap()`: Applies word replacements using regex
- `addMapping()`: Adds new source→target mappings
- Persists to localStorage with automatic migration from old format

**Suggested Maps** (`hooks/use-suggested-maps.ts`)
- Analyzes substitutions from diffs to suggest new word map entries
- Aggregates suggestions across all visible panels

### Text Processing Pipeline

1. **Input**: Raw transcription text with speaker tags like `[00:00:00] SPEAKER_01: text`
2. **Word Map Application**: Replace variants using user-defined mappings
3. **Normalization** (if enabled):
   - Convert to lowercase
   - Remove punctuation
   - Normalize whitespace
   - Preserve speaker tags and timestamps
4. **Diff Calculation**: Character-level or word-level diff using diff-match-patch
5. **Metric Calculation**: WER and DER computed on normalized text
6. **Visualization**: HTML output with color-coded insertions/deletions

### Speaker Tag Format

The application expects transcriptions with this format:
```
[HH:MM:SS] SPEAKER_ID: utterance text
```

- Timestamps are optional but used for DER calculation
- Speaker tags can be stripped for WER-only analysis
- Multiple speakers per transcription are supported

## Key Technical Details

### Diff Modes
- **Word Mode**: Splits on whitespace, treats each word as atomic unit
- **Char Mode**: Character-level comparison, more granular but noisier

### Normalization
When normalization is enabled, the comparison:
- Ignores case differences
- Ignores punctuation
- Normalizes whitespace
- Applies word map transformations
- Preserves speaker tags for diarization analysis

### Metrics Calculation
- **WER**: (Substitutions + Insertions + Deletions) / Total Reference Words
- **DER**: Based on time-weighted speaker attribution errors
- Both metrics work on speaker-tag-stripped text when appropriate

## UI Component Library

Built with shadcn/ui (Radix UI + Tailwind CSS):
- All UI components in `components/ui/`
- Configured via `components.json`
- Theme system via `next-themes` in `components/theme-provider.tsx`

## Data Persistence

All user data is stored in browser localStorage:
- `rabusore-panel-state`: Panel texts and visibility
- `rabusore-word-map`: Word mapping definitions
- No backend or database required
