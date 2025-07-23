"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "rabusore-panel-state";

export interface PanelState {
  id: number;
  title: string;
  text: string;
  isVisible: boolean;
}

export const defaultPanels: PanelState[] = [
  {
    id: 1,
    title: "Ground Truth",
    text: `[00:00:00] SPEAKER_01: Hey, what is this RabuSore Diff tool about?
[00:00:04] SPEAKER_02: It's a tool for comparing transcription texts. You can use it to see the differences between multiple transcriptions and a ground truth text.
[00:00:12] SPEAKER_01: That sounds useful! So it's for people who work with speech-to-text?
[00:00:17] SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to evaluate the accuracy of transcription services.
[00:00:24] SPEAKER_01: What are the advanced features?
[00:00:26] SPEAKER_02: It offers advanced metrics like Word Error Rate and Diarization Error Rate.
[00:00:30] SPEAKER_01: I see.
[00:00:31] SPEAKER_02: You can also switch between word and character diffing, and even use a normalized mode that ignores case and punctuation. There's also a word map for collections of different writing for some words that you want to ignore from errors, and you can easily add items to it.
[00:00:44] SPEAKER_01: Hmm, nice.`,
    isVisible: true,
  },
  {
    id: 2,
    title: "Text B",
    text: `[00:00:00] SPEAKER_01: Hey, what is this RabuSore Diff tool about?
[00:00:04] SPEAKER_02: It is a tool for comparing transcription texts. You can use it to see the differences between multiply transcriptions and a ground truth text.
[00:00:12] SPEAKER_01: That sounds useful! So it's for people who work with speech-to-text?
[00:00:17] SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to valuate the accuracy of transcription services.
[00:00:24] SPEAKER_01: What are the advanced features?
[00:00:26] SPEAKER_02: It offers advanced metrics like Word Error Rate and Diarization Error Rate.
[00:00:30] SPEAKER_01: I see.
[00:00:31] SPEAKER_02: You can also switch between word and character diffing, and even use a normalized mode that ignores case and punctuation. There's also a word map for collections of different writing for some words that you want to ignore from errors, and you can easily add items tweet.`,
    isVisible: true,
  },
  {
    id: 3,
    title: "Text C",
    text: `[00:00:00] SPEAKER_01: Hey, what is this RabuSore Diff tool about?
[00:00:05] SPEAKER_02: It's a tool for comparing transcription texts. You can use it to see the differences between multiple transcriptions and a ground truth text.
[00:00:12] SPEAKER_01: That sounds useful! So it's for people who work with speech-to-text?
[00:00:18] SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to evaluate the accuracy of transcription services.
[00:00:24] SPEAKER_01: What are the advanced features?
[00:00:26] SPEAKER_02: It offers advanced metrics like Word Error Rate and Diarization Error Rate. You can also switch between word and character diffing, and even use a normalized mode that ignores case and punctuation. There's also a word map for collections of different writing for some words that you want to ignore from errors, and you can easily add items to it.
[00:00:44] SPEAKER_01: Hmm, nice.`,
    isVisible: true,
  },
];

export function usePanelState() {
  const [panels, setPanels] = useState<PanelState[]>(defaultPanels);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on initial client render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      if (item) {
        const parsedPanels = JSON.parse(item);
        // Basic validation to ensure it's an array of panels
        if (
          Array.isArray(parsedPanels) &&
          parsedPanels.length > 0 &&
          "text" in parsedPanels[0]
        ) {
          setPanels(parsedPanels);
        }
      }
    } catch (error) {
      console.error("Failed to read panel state from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever panels change, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panels));
      } catch (error) {
        console.error("Failed to save panel state to localStorage", error);
      }
    }
  }, [panels, isLoaded]);

  return { panels, setPanels };
}
