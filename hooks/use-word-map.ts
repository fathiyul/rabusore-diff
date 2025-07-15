"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "rabusore-word-map"

// New structure: { target: [source1, source2] }
// e.g. { "behavior": ["behaviour", "behavier"] }
export type WordMap = Record<string, string[]>

export function useWordMap() {
  const [wordMap, setWordMap] = useState<WordMap>({})

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      if (item) {
        const parsedData = JSON.parse(item)
        if (Object.keys(parsedData).length === 0) {
          setWordMap({})
          return
        }

        // Check if data migration is needed from old {source: target} to new {target: [sources]}
        const firstValue = Object.values(parsedData)[0]
        if (typeof firstValue === "string") {
          console.log("Migrating word map to new format...")
          const newMap: WordMap = {}
          for (const source in parsedData) {
            const target = parsedData[source] as string
            const TGT = target.toLowerCase()
            const SRC = source.toLowerCase()
            if (!newMap[TGT]) {
              newMap[TGT] = []
            }
            if (!newMap[TGT].includes(SRC)) {
              newMap[TGT].push(SRC)
            }
          }
          // Save the newly formatted map back to localStorage
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap))
          setWordMap(newMap)
        } else {
          // Data is already in the new format or is empty
          setWordMap(parsedData)
        }
      }
    } catch (error) {
      console.error("Failed to read or migrate word map from localStorage", error)
      // If parsing fails, it might be corrupted, so we clear it.
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const updateLocalStorage = (newMap: WordMap) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap))
    } catch (error) {
      console.error("Failed to save word map to localStorage", error)
    }
  }

  const addMapping = useCallback(
    (source: string, target: string) => {
      if (!source || !target || source.toLowerCase() === target.toLowerCase()) return

      const newMap = { ...wordMap }
      const TGT = target.toLowerCase()
      const SRC = source.toLowerCase()

      // If target exists, add source to it if not already present
      if (newMap[TGT]) {
        if (!newMap[TGT].includes(SRC)) {
          newMap[TGT].push(SRC)
          newMap[TGT].sort()
        }
      } else {
        // Otherwise, create a new entry for the target
        newMap[TGT] = [SRC]
      }

      setWordMap(newMap)
      updateLocalStorage(newMap)
    },
    [wordMap],
  )

  const removeSource = useCallback(
    (sourceToRemove: string, fromTarget: string) => {
      const newMap = { ...wordMap }
      const TGT = fromTarget.toLowerCase()
      const SRC = sourceToRemove.toLowerCase()

      if (newMap[TGT]) {
        newMap[TGT] = newMap[TGT].filter((s) => s !== SRC)
        // If no sources are left, remove the target key itself
        if (newMap[TGT].length === 0) {
          delete newMap[TGT]
        }
        setWordMap(newMap)
        updateLocalStorage(newMap)
      }
    },
    [wordMap],
  )

  const removeTarget = useCallback(
    (targetToRemove: string) => {
      const newMap = { ...wordMap }
      delete newMap[targetToRemove.toLowerCase()]
      setWordMap(newMap)
      updateLocalStorage(newMap)
    },
    [wordMap],
  )

  return { wordMap, addMapping, removeSource, removeTarget }
}
