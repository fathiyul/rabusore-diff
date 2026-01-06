# RabuSore Diff - Transcription Comparison Tool

A Next.js application for comparing transcription texts and evaluating transcription accuracy.

## Live Demo

Visit the hosted version at: **[diff.rabusore.com](https://diff.rabusore.com)**

## Features

- Compare multiple transcription outputs against a ground truth
- Calculate Word Error Rate (WER) and Diarization Error Rate (DER)
- Word-level and character-level diff visualization
- Customizable word mapping for variant normalization
- Text normalization options (case, punctuation, whitespace)
- Support for speaker-tagged transcriptions
- Local storage persistence of all data

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- diff-match-patch for text comparison
