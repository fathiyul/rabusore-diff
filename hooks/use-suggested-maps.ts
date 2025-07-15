"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "rabusore-suggested-maps"

export interface Suggestion {
  source: string
  target: string
}

export function useSuggestedMaps() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      if (item) {
        setSuggestions(JSON.parse(item))
      }
    } catch (error) {
      console.error("Failed to read suggestions from localStorage", error)
    }
  }, [])

  const updateSuggestionsInStorage = (newSuggestions: Suggestion[]) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSuggestions))
      setSuggestions(newSuggestions)
    } catch (error) {
      console.error("Failed to save suggestions to localStorage", error)
    }
  }

  const setAllSuggestions = useCallback((allNewSuggestions: Suggestion[]) => {
    const uniqueMap = new Map<string, Suggestion>()
    allNewSuggestions.forEach((s) => {
      const key = `${s.source.toLowerCase()}|${s.target.toLowerCase()}`
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, s)
      }
    })
    const uniqueSuggestions = Array.from(uniqueMap.values())
    updateSuggestionsInStorage(uniqueSuggestions)
  }, [])

  const removeSuggestion = useCallback(
    (suggestionToRemove: Suggestion) => {
      const newSuggestions = suggestions.filter(
        (s) =>
          s.source.toLowerCase() !== suggestionToRemove.source.toLowerCase() ||
          s.target.toLowerCase() !== suggestionToRemove.target.toLowerCase(),
      )
      updateSuggestionsInStorage(newSuggestions)
    },
    [suggestions],
  )

  return { suggestions, setAllSuggestions, removeSuggestion }
}
