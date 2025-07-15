"use client"

import { useMemo, useState } from "react"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  computeDiffHtml,
  calculateWer,
  calculateDer,
  type WerMetrics,
  type DerMetrics,
  stripSpeakerTags,
} from "@/lib/diff"
import { cn } from "@/lib/utils"
import { Pencil, EyeOff, FileDiff } from "lucide-react"
import Link from "next/link"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useWordMap, type WordMap } from "@/hooks/use-word-map"
import { usePanelState } from "@/hooks/use-panel-state"

const normalizeText = (text: string, applyWordMap: any, wordMap: WordMap) => {
  const mappedText = applyWordMap(text, wordMap)
  return mappedText
    .split("\n")
    .map((line) => {
      const colonIndex = line.indexOf(":")
      if (colonIndex === -1) {
        // No speaker tag, normalize whole line
        return line
          .toLowerCase()
          .replace(/[^\w\s]|_/g, "")
          .replace(/\s+/g, " ")
          .trim()
      }

      const speaker = line.substring(0, colonIndex + 1)
      const utterance = line.substring(colonIndex + 1)

      const normalizedUtterance = utterance
        .toLowerCase()
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .trim()

      return `${speaker} ${normalizedUtterance}`
    })
    .join("\n")
}

export default function TranscriptionComparer() {
  const { panels, setPanels } = usePanelState()
  const [diffMode, setDiffMode] = useState<"word" | "char">("word")
  const [isNormalized, setIsNormalized] = useState(false)
  const { wordMap, applyWordMap } = useWordMap()

  const groundTruthText = panels[0].text
  const visiblePanels = panels.filter((p) => p.isVisible)
  const hiddenPanel = panels.find((p) => !p.isVisible)
  const hiddenPanelIndex = panels.findIndex((p) => !p.isVisible)
  const canHidePanel = visiblePanels.length > 2

  const gridColsClass =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
    }[visiblePanels.length] || "md:grid-cols-3"

  const handleVisibilityChange = (index: number) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      isVisible: i === index ? !panel.isVisible : panel.isVisible,
    }))
    setPanels(newPanels)
  }

  const handleTextChange = (index: number, newText: string) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      text: i === index ? newText : panel.text,
    }))
    setPanels(newPanels)
  }

  const handleTitleChange = (index: number, newTitle: string) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      title: i === index ? newTitle : panel.title,
    }))
    setPanels(newPanels)
  }

  const handleSetGroundTruth = (panelId: number) => {
    setPanels((currentPanels) => {
      const panelIndex = currentPanels.findIndex((p) => p.id === panelId)
      if (panelIndex === 0 || panelIndex === -1) {
        return currentPanels
      }

      const panelToMove = currentPanels[panelIndex]
      const remainingPanels = currentPanels.filter((p) => p.id !== panelId)
      return [panelToMove, ...remainingPanels]
    })
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans p-4 gap-4">
      <header className="flex-shrink-0 bg-white border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-amber-700">RabuSore Diff</h1>
          <span className="text-slate-300">|</span>
          <Link href="/about" className="text-sm text-slate-500 hover:text-amber-700 transition-colors">
            About
          </Link>
          <Link href="/wordmap" className="text-sm text-slate-500 hover:text-amber-700 transition-colors">
            Word Map
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {hiddenPanel && (
            <Button variant="outline" onClick={() => handleVisibilityChange(hiddenPanelIndex)}>
              Show "{hiddenPanel.title}"
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="normalized-mode" className="font-normal cursor-pointer">
                    Normalized
                  </Label>
                  <Switch id="normalized-mode" checked={isNormalized} onCheckedChange={setIsNormalized} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ignore case, punctuation, and apply word map.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Separator orientation="vertical" className="h-6" />
          <Label>Diff Mode:</Label>
          <RadioGroup
            defaultValue="word"
            onValueChange={(value: "word" | "char") => setDiffMode(value)}
            className="flex items-center"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="word" id="r-word" />
              <Label htmlFor="r-word">Word</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="char" id="r-char" />
              <Label htmlFor="r-char">Character</Label>
            </div>
          </RadioGroup>
        </div>
      </header>
      <main className={`flex-1 grid grid-cols-1 ${gridColsClass} gap-4 min-h-0`}>
        {panels.map(
          (panel, index) =>
            panel.isVisible && (
              <TextPanel
                key={panel.id}
                panel={panel}
                isGroundTruth={index === 0}
                onTextChange={(newText) => handleTextChange(index, newText)}
                onTitleChange={(newTitle) => handleTitleChange(index, newTitle)}
                onVisibilityChange={() => handleVisibilityChange(index)}
                onSetAsGroundTruth={() => handleSetGroundTruth(panel.id)}
                groundTruthText={groundTruthText}
                diffMode={diffMode}
                canHide={canHidePanel}
                isNormalized={isNormalized}
                normalizeFn={(text: string) => normalizeText(text, applyWordMap, wordMap)}
              />
            ),
        )}
      </main>
    </div>
  )
}

interface TextPanelProps {
  panel: any // PanelState
  isGroundTruth: boolean
  onTextChange: (newText: string) => void
  onTitleChange: (newTitle: string) => void
  onVisibilityChange: () => void
  onSetAsGroundTruth: () => void
  groundTruthText: string
  diffMode: "word" | "char"
  canHide: boolean
  isNormalized: boolean
  normalizeFn: (text: string) => string
}

function TextPanel({
  panel,
  isGroundTruth,
  onTextChange,
  onTitleChange,
  onVisibilityChange,
  onSetAsGroundTruth,
  groundTruthText,
  diffMode,
  canHide,
  isNormalized,
  normalizeFn,
}: TextPanelProps) {
  const [isEditMode, setIsEditMode] = useState(false)

  const textForDisplay = useMemo(
    () => (isNormalized ? normalizeFn(panel.text) : panel.text),
    [isNormalized, normalizeFn, panel.text],
  )
  const groundTruthForDisplay = useMemo(
    () => (isNormalized ? normalizeFn(groundTruthText) : groundTruthText),
    [isNormalized, normalizeFn, groundTruthText],
  )

  const diffHtml = useMemo(() => {
    if (isGroundTruth) return null

    // Always use the display-ready texts which include speaker tags
    // and are normalized if the mode is on.
    return computeDiffHtml(groundTruthForDisplay, textForDisplay, diffMode)
  }, [isGroundTruth, groundTruthForDisplay, textForDisplay, diffMode])

  const werMetrics: WerMetrics | null = useMemo(() => {
    if (isGroundTruth) return null

    // Always calculate WER on content only
    const refContent = stripSpeakerTags(groundTruthText)
    const hypContent = stripSpeakerTags(panel.text)

    // Apply normalization if the mode is on
    const finalRef = isNormalized ? normalizeFn(refContent) : refContent
    const finalHyp = isNormalized ? normalizeFn(hypContent) : hypContent

    return calculateWer(finalRef, finalHyp)
  }, [isGroundTruth, isNormalized, groundTruthText, panel.text, normalizeFn])

  const derMetrics: DerMetrics | null = useMemo(() => {
    if (isGroundTruth) return null
    // DER is always calculated on the original, non-normalized text.
    return calculateDer(groundTruthText, panel.text)
  }, [groundTruthText, panel.text, isGroundTruth])

  const isEditing = !isNormalized && (isGroundTruth || isEditMode)

  return (
    <Card className="flex flex-col h-full w-full transition-all bg-white shadow-sm">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-center gap-2">
          <Input
            value={panel.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cn(
              "text-lg font-bold border-none focus-visible:ring-1 focus-visible:ring-ring p-1 h-auto bg-transparent",
              isGroundTruth && "text-emerald-700",
            )}
          />
          <div className="flex items-center gap-1">
            {!isGroundTruth && (
              <>
                <Button size="sm" variant="outline" onClick={onSetAsGroundTruth}>
                  Set as GT
                </Button>
                <Button
                  size="icon"
                  variant={isEditMode ? "secondary" : "ghost"}
                  onClick={() => setIsEditMode(!isEditMode)}
                  title={isEditMode ? "Switch to Diff View" : "Switch to Edit Mode"}
                  disabled={isNormalized}
                >
                  {isEditMode ? <FileDiff className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={onVisibilityChange} disabled={!canHide} title="Hide Panel">
                  <EyeOff className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isEditing ? (
          <Textarea
            value={panel.text}
            onChange={(e) => onTextChange(e.target.value)}
            className="w-full flex-1 resize-none text-base"
            spellCheck={false}
          />
        ) : (
          <div
            className="w-full flex-1 overflow-y-auto p-2 border rounded-md bg-slate-50 text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: isGroundTruth
                ? textForDisplay.replace(/\n/g, "<br />")
                : diffHtml?.replace(/\n/g, "<br />") || '<span class="text-gray-400">No difference.</span>',
            }}
          />
        )}
      </CardContent>
      <CardFooter className="flex-shrink-0 flex flex-col items-start gap-4 pt-4 border-t">
        {!isGroundTruth && werMetrics ? (
          <div className="text-sm text-gray-700 w-full">
            <p className="font-semibold">Word Error Rate (WER):</p>
            <div className="grid grid-cols-4 gap-4 text-xs mt-1">
              <span>
                WER: <span className="font-bold">{(werMetrics.wer * 100).toFixed(2)}%</span>
              </span>
              <span>
                Substitutions: <span className="font-bold text-orange-500">{werMetrics.subs}</span>
              </span>
              <span>
                Insertions: <span className="font-bold text-blue-500">{werMetrics.ins}</span>
              </span>
              <span>
                Deletions: <span className="font-bold text-red-500">{werMetrics.dels}</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">This is the Ground Truth text.</div>
        )}
        {!isGroundTruth && derMetrics && (
          <div className="text-sm text-gray-700 w-full">
            <p className="font-semibold">Diarization Error Rate (DER):</p>
            <div className="grid grid-cols-4 gap-4 text-xs mt-1">
              <span>
                DER: <span className="font-bold">{(derMetrics.der * 100).toFixed(2)}%</span>
              </span>
              <span>
                Speaker Error: <span className="font-bold text-purple-500">{derMetrics.speakerError}</span>
              </span>
              <span>
                False Alarm: <span className="font-bold text-blue-500">{derMetrics.falseAlarm}</span>
              </span>
              <span>
                Missed Speech: <span className="font-bold text-red-500">{derMetrics.missedSpeech}</span>
              </span>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
