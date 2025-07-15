"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "rabusore-panel-state"

export interface PanelState {
  id: number
  title: string
  text: string
  isVisible: boolean
}

const defaultPanels: PanelState[] = [
  {
    id: 1,
    title: "Ground Truth",
    text: "The quick brown fox jumps over the lazy dog.",
    isVisible: true,
  },
  {
    id: 2,
    title: "Hypothesis A",
    text: "The quick brown fox jumped over the lazy cat.",
    isVisible: true,
  },
  {
    id: 3,
    title: "Hypothesis B",
    text: "A quick brown fox leaps over the lazy dog.",
    isVisible: true,
  },
]

export function usePanelState() {
  const [panels, setPanels] = useState<PanelState[]>(defaultPanels)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on initial client render
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      if (item) {
        const parsedPanels = JSON.parse(item)
        // Basic validation to ensure it's an array of panels
        if (Array.isArray(parsedPanels) && parsedPanels.length > 0 && "text" in parsedPanels[0]) {
          setPanels(parsedPanels)
        }
      }
    } catch (error) {
      console.error("Failed to read panel state from localStorage", error)
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever panels change, but only after initial load
  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(panels))
      } catch (error) {
        console.error("Failed to save panel state to localStorage", error)
      }
    }
  }, [panels, isLoaded])

  return { panels, setPanels }
}
