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
    title: "Text A",
    text: `SPEAKER_01: Hey, what is this RabuSore Diff tool?
SPEAKER_02: It's a tool for comparing transcription texts. You can use it to see the differences between multiple transcriptions and a ground truth text.
SPEAKER_01: That sounds useful! So it's for people who work with speech-to-text?
SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to evaluate the accuracy of transcription services.
SPEAKER_03: What are the advanced features?
SPEAKER_02: It offers advanced metrics like Word Error Rate and Diarization Error Rate. You can also switch between word and character diffing, and even use a normalized mode that ignores case and punctuation. There's also a word map for collections of different writing for some words that you want to ignore from errors, and you can easily add items to it.`,
    isVisible: true,
  },
  {
    id: 2,
    title: "Text B",
    text: `SPEAKER_01: Hey, what is this RabuSore Diff tool about?
SPEAKER_02: It is a tool for comparing transcription texts. You can use it to see the differences between many transcriptions and a ground truth text.
SPEAKER_01: That sounds helpful! So it's for people who work with speech-to-text?
SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to check the accuracy of transcription services.
SPEAKER_03: What are the advanced features?
SPEAKER_02: It provides advanced metrics such as Word Error Rate and Diarization Error Rate. You can switch between word and character diffing, or use a normalized mode to ignore case and punctuation. Plus, there's a word map to collect different spellings of words you want to exclude from errors, and adding new items is simple.`,
    isVisible: true,
  },
  {
    id: 3,
    title: "Text C",
    text: `SPEAKER_01: What is this RabuSore Diff tool?
SPEAKER_02: It's a tool for comparing transcription texts. You can use it to see the differences between multiple transcriptions and a ground truth text.
SPEAKER_01: That sounds useful! So it's for people who work with speech-to-text?
SPEAKER_02: Exactly. Researchers, linguists, and developers can use it to evaluate the accuracy of transcription services.
SPEAKER_03: What are the advanced features?
SPEAKER_02: It has advanced metrics like Word Error Rate and Diarization Error Rate. You can also toggle between word and character diffing, and use a normalized mode that disregards case and punctuation. It also features a word map for grouping word variations you want to ignore as errors, and you can add to it with ease.`,
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
