"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "rabusore-word-map"

export type WordMap = Record<string, string>

export function useWordMap() {
  const [wordMap, setWordMap] = useState<WordMap>({})

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY)
      if (item) {
        setWordMap(JSON.parse(item))
      }
    } catch (error) {
      console.error("Failed to read word map from localStorage", error)
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
      if (!source || !target || source === target) return
      const newMap = { ...wordMap, [source.toLowerCase()]: target.toLowerCase() }
      setWordMap(newMap)
      updateLocalStorage(newMap)
    },
    [wordMap],
  )

  const removeMapping = useCallback(
    (source: string) => {
      const newMap = { ...wordMap }
      delete newMap[source.toLowerCase()]
      setWordMap(newMap)
      updateLocalStorage(newMap)
    },
    [wordMap],
  )

  return { wordMap, addMapping, removeMapping }
}
