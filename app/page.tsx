"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  computeDiffHtml,
  calculateWer,
  calculateDer,
  extractSubstitutions,
  type WerMetrics,
  type DerMetrics,
  type Substitution,
  stripSpeakerTags,
} from "@/lib/diff";
import { cn } from "@/lib/utils";
import { Pencil, EyeOff, Save } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWordMap, type WordMap } from "@/hooks/use-word-map";
import { usePanelState, defaultPanels } from "@/hooks/use-panel-state";
import { useSuggestedMaps } from "@/hooks/use-suggested-maps";

const normalizeText = (text: string, applyWordMap: any, wordMap: WordMap) => {
  const mappedText = applyWordMap(text, wordMap);
  return mappedText
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\[[^\]]+\]\s*)?([^:]+:\s*)(.*)$/);
      if (!match) {
        // No speaker tag, normalize whole line
        return line
          .toLowerCase()
          .replace(/[^\w\s]|_/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }

      const timestampAndSpeaker = match[1]
        ? `${match[1]}${match[2]}`
        : match[2];
      const utterance = match[3];

      const normalizedUtterance = utterance
        .toLowerCase()
        .replace(/[^\w\s]|_/g, "")
        .replace(/\s+/g, " ")
        .trim();

      return `${timestampAndSpeaker}${normalizedUtterance}`;
    })
    .join("\n");
};

export default function TranscriptionComparer() {
  const { panels, setPanels } = usePanelState();
  const [debouncedPanels, setDebouncedPanels] = useState(panels);
  const [diffMode, setDiffMode] = useState<"word" | "char">("word");
  const [isNormalized, setIsNormalized] = useState(true);
  const { wordMap, applyWordMap } = useWordMap();
  const { setAllSuggestions } = useSuggestedMaps();

  const [editStates, setEditStates] = useState<{ [key: number]: boolean }>({});

  const groundTruthText = panels[0].text;
  const visiblePanels = panels.filter((p) => p.isVisible);
  const hiddenPanel = panels.find((p) => !p.isVisible);
  const hiddenPanelIndex = panels.findIndex((p) => !p.isVisible);
  const canHidePanel = visiblePanels.length > 2;

  const handleTextReset = () => {
    setPanels(defaultPanels);
    setEditStates({});
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPanels(panels);
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [panels]);

  useEffect(() => {
    const allSubs: Substitution[] = [];
    const gtText = debouncedPanels[0].text;

    // Normalize and strip speaker tags for substitution analysis
    const normalizedGt = stripSpeakerTags(
      normalizeText(gtText, applyWordMap, wordMap)
    );

    debouncedPanels.slice(1).forEach((panel) => {
      if (panel.isVisible) {
        const normalizedHyp = stripSpeakerTags(
          normalizeText(panel.text, applyWordMap, wordMap)
        );
        const subs = extractSubstitutions(normalizedGt, normalizedHyp);
        allSubs.push(...subs);
      }
    });
    setAllSuggestions(allSubs);
  }, [debouncedPanels, setAllSuggestions, applyWordMap, wordMap]);

  const gridColsClass =
    {
      1: "md:grid-cols-1",
      2: "md:grid-cols-2",
      3: "md:grid-cols-3",
    }[visiblePanels.length] || "md:grid-cols-3";

  const handleVisibilityChange = (index: number) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      isVisible: i === index ? !panel.isVisible : panel.isVisible,
    }));
    setPanels(newPanels);
  };

  const handleTextChange = (index: number, newText: string) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      text: i === index ? newText : panel.text,
    }));
    setPanels(newPanels);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const newPanels = panels.map((panel, i) => ({
      ...panel,
      title: i === index ? newTitle : panel.title,
    }));
    setPanels(newPanels);
  };

  const handleSetGroundTruth = (panelId: number) => {
    setPanels((currentPanels) => {
      const panelIndex = currentPanels.findIndex((p) => p.id === panelId);
      if (panelIndex === 0 || panelIndex === -1) {
        return currentPanels;
      }

      const panelToMove = currentPanels[panelIndex];
      const remainingPanels = currentPanels.filter((p) => p.id !== panelId);
      return [panelToMove, ...remainingPanels];
    });
  };

  const handleSaveGroundTruth = (newText: string) => {
    setPanels((currentPanels) => {
      const newPanels = [...currentPanels];
      newPanels[0] = { ...newPanels[0], text: newText };
      return newPanels;
    });
  };

  const handleToggleEdit = (panelId: number) => {
    setEditStates((prev) => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans p-4 gap-4">
      <header className="flex-shrink-0 bg-white border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-amber-700">RabuSore Diff</h1>
          <span className="text-slate-300">|</span>
          <Link
            href="/about"
            className="text-sm text-slate-500 hover:text-amber-700 transition-colors"
          >
            About
          </Link>
          <Link
            href="/wordmap"
            className="text-sm text-slate-500 hover:text-amber-700 transition-colors"
          >
            Word Map
          </Link>
          <Button
            variant="link"
            className="text-sm text-slate-500 hover:text-amber-700 transition-colors p-0 h-auto"
            onClick={handleTextReset}
          >
            Reset
          </Button>
        </div>
        <div className="flex items-center gap-4">
          {hiddenPanel && (
            <Button
              variant="outline"
              onClick={() => handleVisibilityChange(hiddenPanelIndex)}
            >
              Show "{hiddenPanel.title}"
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="normalized-mode"
                    className="font-normal cursor-pointer"
                  >
                    Normalized
                  </Label>
                  <Switch
                    id="normalized-mode"
                    checked={isNormalized}
                    onCheckedChange={setIsNormalized}
                    className="data-[state=checked]:bg-amber-700"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ignore case, punctuation, and apply word map.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* <Separator orientation="vertical" className="h-6" />
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
          </RadioGroup> */}
        </div>
      </header>
      <main
        className={`flex-1 grid grid-cols-1 ${gridColsClass} gap-4 min-h-0`}
      >
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
                onSaveGroundTruth={handleSaveGroundTruth}
                groundTruthText={groundTruthText}
                diffMode={diffMode}
                canHide={canHidePanel}
                isNormalized={isNormalized}
                normalizeFn={(text: string) =>
                  normalizeText(text, applyWordMap, wordMap)
                }
                isEditing={!!editStates[panel.id]}
                onToggleEdit={() => handleToggleEdit(panel.id)}
                isGTEditing={!!editStates[panels[0].id]}
              />
            )
        )}
      </main>
    </div>
  );
}

interface TextPanelProps {
  panel: any; // PanelState
  isGroundTruth: boolean;
  onTextChange: (newText: string) => void;
  onTitleChange: (newTitle: string) => void;
  onVisibilityChange: () => void;
  onSetAsGroundTruth: () => void;
  onSaveGroundTruth: (newText: string) => void;
  groundTruthText: string;
  diffMode: "word" | "char";
  canHide: boolean;
  isNormalized: boolean;
  normalizeFn: (text: string) => string;
  isEditing: boolean;
  onToggleEdit: () => void;
  isGTEditing: boolean;
}

function TextPanel({
  panel,
  isGroundTruth,
  onTextChange,
  onTitleChange,
  onVisibilityChange,
  onSetAsGroundTruth,
  onSaveGroundTruth,
  groundTruthText,
  diffMode,
  canHide,
  isNormalized,
  normalizeFn,
  isEditing,
  onToggleEdit,
  isGTEditing,
}: TextPanelProps) {
  const [editedText, setEditedText] = useState(panel.text);

  useEffect(() => {
    if (!isEditing) {
      setEditedText(panel.text);
    }
  }, [isEditing, panel.text]);

  const textForDisplay = useMemo(
    () => (isNormalized ? normalizeFn(panel.text) : panel.text),
    [isNormalized, normalizeFn, panel.text]
  );
  const groundTruthForDisplay = useMemo(
    () => (isNormalized ? normalizeFn(groundTruthText) : groundTruthText),
    [isNormalized, normalizeFn, groundTruthText]
  );

  const diffHtml = useMemo(() => {
    if (isGroundTruth) return null;

    // Always use the display-ready texts which include speaker tags
    // and are normalized if the mode is on.
    return computeDiffHtml(groundTruthForDisplay, textForDisplay, diffMode);
  }, [isGroundTruth, groundTruthForDisplay, textForDisplay, diffMode]);

  const showMetrics = !isGroundTruth && !isEditing && !isGTEditing;

  const werMetrics: WerMetrics | null = useMemo(() => {
    if (!showMetrics) return null;

    // Always calculate WER on content only
    const refContent = stripSpeakerTags(groundTruthText);
    const hypContent = stripSpeakerTags(panel.text);

    // Apply normalization if the mode is on
    const finalRef = isNormalized ? normalizeFn(refContent) : refContent;
    const finalHyp = isNormalized ? normalizeFn(hypContent) : hypContent;

    return calculateWer(finalRef, finalHyp);
  }, [showMetrics, isNormalized, groundTruthText, panel.text, normalizeFn]);

  const derMetrics: DerMetrics | null = useMemo(() => {
    if (!showMetrics) return null;
    // DER is always calculated on the original, non-normalized text.
    return calculateDer(groundTruthText, panel.text);
  }, [groundTruthText, panel.text, showMetrics]);

  return (
    <Card className="flex flex-col h-full w-full transition-all bg-white shadow-sm">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-center gap-2">
          <Input
            value={panel.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={cn(
              "text-lg font-bold border-none focus-visible:ring-1 focus-visible:ring-ring p-1 h-auto bg-transparent",
              isGroundTruth && "text-emerald-700"
            )}
          />
          <div className="flex items-center gap-1">
            {isGroundTruth && (
              <Button
                size="icon"
                variant={isEditing ? "secondary" : "ghost"}
                onClick={() => {
                  if (isEditing) {
                    onSaveGroundTruth(editedText);
                  }
                  onToggleEdit();
                }}
                title={isEditing ? "Save" : "Edit"}
              >
                {isEditing ? (
                  <Save className="h-4 w-4" />
                ) : (
                  <Pencil className="h-4 w-4" />
                )}
              </Button>
            )}
            {!isGroundTruth && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSetAsGroundTruth}
                >
                  Set as GT
                </Button>
                <Button
                  size="icon"
                  variant={isEditing ? "secondary" : "ghost"}
                  onClick={() => {
                    if (isEditing) {
                      onTextChange(editedText);
                    }
                    onToggleEdit();
                  }}
                  title={
                    isEditing ? "Switch to Diff View" : "Switch to Edit Mode"
                  }
                >
                  {isEditing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onVisibilityChange}
                  disabled={!canHide}
                  title="Hide Panel"
                >
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
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full flex-1 resize-none text-base"
            spellCheck={false}
          />
        ) : (
          <div
            className="w-full flex-1 overflow-y-auto p-2 border rounded-md bg-slate-50 text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: isGroundTruth
                ? textForDisplay.replace(/\n/g, "<br />")
                : diffHtml?.replace(/\n/g, "<br />") ||
                  '<span class="text-gray-400">No difference.</span>',
            }}
          />
        )}
      </CardContent>
      <CardFooter className="flex-shrink-0 flex flex-col items-start gap-4 pt-4 border-t">
        {isGroundTruth ? (
          <div className="text-sm text-gray-400">
            This is the Ground Truth text.
          </div>
        ) : (
          <>
            {werMetrics && (
              <div className="text-sm text-gray-700 w-full">
                <p className="font-semibold">Word Error Rate (WER):</p>
                <div className="grid grid-cols-4 gap-4 text-xs mt-1">
                  <span>
                    WER:{" "}
                    <span className="font-bold">
                      {(werMetrics.wer * 100).toFixed(2)}%
                    </span>
                  </span>
                  <span>
                    Substitutions:{" "}
                    <span className="font-bold text-orange-500">
                      {werMetrics.subs}
                    </span>
                  </span>
                  <span>
                    Insertions:{" "}
                    <span className="font-bold text-blue-500">
                      {werMetrics.ins}
                    </span>
                  </span>
                  <span>
                    Deletions:{" "}
                    <span className="font-bold text-red-500">
                      {werMetrics.dels}
                    </span>
                  </span>
                </div>
              </div>
            )}
            {derMetrics && (
              <div className="text-sm text-gray-700 w-full">
                <p className="font-semibold">Diarization Error Rate (DER):</p>
                <div className="grid grid-cols-4 gap-4 text-xs mt-1">
                  <span>
                    DER:{" "}
                    <span className="font-bold">
                      {(derMetrics.der * 100).toFixed(2)}%
                    </span>
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
