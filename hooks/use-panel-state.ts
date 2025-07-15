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
    text: `SPEAKER_01: Hi, how are you today?
SPEAKER_02: I'm doing great, thanks for asking! How about you?
SPEAKER_01: I'm well. I went to the park this morning.
SPEAKER_02: Oh, that sounds lovely. Was it busy?`,
    isVisible: true,
  },
  {
    id: 2,
    title: "Text B",
    text: `SPEAKER_01: Hi, how are you today?
SPEAKER_01: I'm doing great, thanks for asking! How about you?
SPEAKER_01: I'm well. I went to the store this morning.
SPEAKER_02: Oh, that sounds lovely. Was it busy there?`,
    isVisible: true,
  },
  {
    id: 3,
    title: "Text C",
    text: `SPEAKER_02: Hi, how are you?
SPEAKER_02: I'm doing great, thanks for asking!
SPEAKER_01: I am well. I went to the park this morning.`,
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
