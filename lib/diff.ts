import { DiffMatchPatch } from "diff-match-patch-ts";

interface DiffOp {
  type: "equal" | "delete" | "insert";
  items: string[];
}

export interface WerMetrics {
  wer: number;
  subs: number;
  ins: number;
  dels: number;
}

// At the top of the file, add the new Substitution interface
export interface Substitution {
  source: string; // from transcription output (new text)
  target: string; // from reference (base text)
}

const computeWordDiff = (oldWords: string[], newWords: string[]): DiffOp[] => {
  const m = oldWords.length;
  const n = newWords.length;

  const lcs: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldWords[i - 1] === newWords[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  const result: DiffOp[] = [];
  let i = m,
    j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      result.unshift({ type: "equal", items: [oldWords[i - 1]] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
      result.unshift({ type: "insert", items: [newWords[j - 1]] });
      j--;
    } else if (i > 0) {
      result.unshift({ type: "delete", items: [oldWords[i - 1]] });
      i--;
    }
  }

  const merged: DiffOp[] = [];
  for (const op of result) {
    const last = merged[merged.length - 1];
    if (last && last.type === op.type) {
      last.items.push(...op.items);
    } else {
      merged.push(op);
    }
  }

  return merged;
};

export const computeDiffHtml = (
  baseText: string,
  newText: string,
  mode: "char" | "word" = "char"
): string => {
  if (mode === "char") {
    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(baseText, newText);
    dmp.diff_cleanupSemantic(diffs);

    return diffs
      .map(([type, text]) => {
        if (type === -1)
          return `<span style="background-color: #fecaca;">${text}</span>`;
        if (type === 1)
          return `<span style="background-color: #bfdbfe;">${text}</span>`;
        return text;
      })
      .join("");
  } else {
    const splitIntoWords = (text: string): string[] =>
      text.split(/(\s+)/).filter((part) => part.length > 0);
    const oldWords = splitIntoWords(baseText);
    const newWords = splitIntoWords(newText);
    const diffs = computeWordDiff(oldWords, newWords);

    return diffs
      .map((diff) => {
        if (diff.type === "delete") {
          return `<span style="background-color: #fecaca;">${diff.items.join(
            ""
          )}</span>`;
        }
        if (diff.type === "insert") {
          return `<span style="background-color: #bfdbfe;">${diff.items.join(
            ""
          )}</span>`;
        }
        return diff.items.join("");
      })
      .join("");
  }
};

// After the computeDiffHtml function, add the new extractSubstitutions function
export const extractSubstitutions = (
  baseText: string,
  newText: string
): Substitution[] => {
  const splitIntoWords = (text: string): string[] =>
    text.split(/(\s+)/).filter((part) => part.length > 0);
  const oldWords = splitIntoWords(baseText);
  const newWords = splitIntoWords(newText);
  const diffs = computeWordDiff(oldWords, newWords);

  const substitutions: Substitution[] = [];
  for (let i = 0; i < diffs.length; i++) {
    const currentOp = diffs[i];
    const nextOp = diffs[i + 1];

    // Check for substitution: a delete followed by an insert
    if (currentOp.type === "delete" && nextOp && nextOp.type === "insert") {
      const deletedText = currentOp.items.join("").trim();
      const insertedText = nextOp.items.join("").trim();

      // Only create the interactive element if both parts are non-empty words
      if (
        deletedText &&
        insertedText &&
        !/\s/.test(deletedText) &&
        !/\s/.test(insertedText)
      ) {
        substitutions.push({
          source: insertedText,
          target: deletedText,
        });
        i++; // Skip the next operation as it's already processed
      }
    }
  }
  return substitutions;
};

export const calculateWer = (ref: string, hyp: string): WerMetrics => {
  const refWords = ref
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const hypWords = hyp
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
  const n = refWords.length;
  const m = hypWords.length;

  if (n === 0) {
    return {
      wer: m > 0 ? Number.POSITIVE_INFINITY : 0,
      subs: 0,
      ins: m,
      dels: 0,
    };
  }

  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(0));
  const ops: string[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(m + 1).fill(""));

  for (let i = 0; i <= n; i++) {
    dp[i][0] = i;
    ops[i][0] = "D";
  }
  for (let j = 0; j <= m; j++) {
    dp[0][j] = j;
    ops[0][j] = "I";
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = refWords[i - 1] === hypWords[j - 1] ? 0 : 1;
      const delCost = dp[i - 1][j] + 1;
      const insCost = dp[i][j - 1] + 1;
      const subCost = dp[i - 1][j - 1] + cost;

      if (subCost <= insCost && subCost <= delCost) {
        dp[i][j] = subCost;
        ops[i][j] = cost === 1 ? "S" : "M";
      } else if (insCost < delCost) {
        dp[i][j] = insCost;
        ops[i][j] = "I";
      } else {
        dp[i][j] = delCost;
        ops[i][j] = "D";
      }
    }
  }

  let i = n,
    j = m;
  let subs = 0,
    dels = 0,
    ins = 0;
  while (i > 0 || j > 0) {
    const op = ops[i]?.[j];
    if (op === "S") {
      subs++;
      i--;
      j--;
    } else if (op === "D") {
      dels++;
      i--;
    } else if (op === "I") {
      ins++;
      j--;
    } else {
      // Match or start of grid
      if (i > 0) i--;
      if (j > 0) j--;
    }
  }

  const wer = (subs + dels + ins) / n;
  return { wer: isFinite(wer) ? wer : 0, subs, ins, dels };
};

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3);
  return `[${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.padStart(6, "0")}]`;
};

const logSegments = (label: string, segments: DiarizationSegment[]) => {
  console.log(`\n--- ${label} ---`);
  for (const seg of segments) {
    console.log(
      `${formatTime(seg.start)} - ${formatTime(seg.end)}  ${seg.speaker}`
    );
  }
};

// --- DER Calculation ---

export interface DerMetrics {
  der: number;
}

interface DiarizationSegment {
  start: number;
  end: number;
  speaker: string;
}

// Helper to convert time string [HH:MM:SS.ms] or [HH:MM:SS] to seconds
const timeToSeconds = (timeStr: string): number => {
  const parts = timeStr.replace(/[\[\]]/g, "").split(":");
  if (parts.length === 3) {
    return (
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseFloat(parts[2])
    );
  }
  return 0;
};

// Parse diarization text into segment objects with start, end, and speaker
const parseDiarization = (
  text: string,
  totalDuration?: number
): DiarizationSegment[] => {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  const segments: { start: number; speaker: string }[] = [];

  for (const line of lines) {
    const match = line.match(/^(\[[^\]]+\])\s*([^:]+):/);
    if (match) {
      const timeStr = match[1];
      const speaker = match[2].trim();
      const start = timeToSeconds(timeStr);
      segments.push({ start, speaker });
    }
  }

  if (segments.length === 0) return [];

  const diarizationSegments: DiarizationSegment[] = [];
  for (let i = 0; i < segments.length; i++) {
    const start = segments[i].start;
    let end: number;
    if (i + 1 < segments.length) {
      end = segments[i + 1].start;
    } else {
      // This is the last segment
      if (totalDuration && start < totalDuration) {
        end = totalDuration;
      } else {
        // Fallback if no total duration or if last segment starts after total duration
        end = start + 5; // Default duration for last segment
      }
    }
    diarizationSegments.push({
      start,
      end,
      speaker: segments[i].speaker,
    });
  }

  return diarizationSegments;
};

// Main DER calculation function
export const calculateDer = (ref: string, hyp: string): DerMetrics => {
  const refSegments = parseDiarization(ref);

  const refTotalDuration = refSegments.reduce(
    (sum, seg) => sum + (seg.end - seg.start),
    0
  );

  if (refTotalDuration === 0) {
    const hypSegsForCheck = parseDiarization(hyp);
    const hasHypSpeech = hypSegsForCheck.reduce(
      (sum, seg) => sum + (seg.end - seg.start),
      0
    );
    return {
      der: hasHypSpeech > 0 ? 1 : 0,
    };
  }

  const audioDuration =
    refSegments.length > 0 ? Math.max(...refSegments.map((s) => s.end)) : 0;
  const hypSegments = parseDiarization(hyp, audioDuration);

  let totalOverlapDuration = 0;
  let correctSpeakerOverlapDuration = 0;

  for (const refSeg of refSegments) {
    for (const hypSeg of hypSegments) {
      const overlapStart = Math.max(refSeg.start, hypSeg.start);
      const overlapEnd = Math.min(refSeg.end, hypSeg.end);
      const overlap = Math.max(0, overlapEnd - overlapStart);

      if (overlap > 0) {
        totalOverlapDuration += overlap;
        if (refSeg.speaker === hypSeg.speaker) {
          correctSpeakerOverlapDuration += overlap;
        }
      }
    }
  }

  const hypTotalDuration = hypSegments.reduce(
    (sum, seg) => sum + (seg.end - seg.start),
    0
  );

  const speakerErrorDuration =
    totalOverlapDuration - correctSpeakerOverlapDuration;
  const missedSpeechDuration = refTotalDuration - totalOverlapDuration;
  const falseAlarmDuration = hypTotalDuration - totalOverlapDuration;

  const totalErrorDuration =
    speakerErrorDuration + missedSpeechDuration + falseAlarmDuration;

  const der = totalErrorDuration / refTotalDuration;

  return {
    der: isFinite(der) ? der : 0,
  };
};

// Utility to strip speaker and timestamps from transcript
export const stripSpeakerTags = (text: string): string => {
  return text
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\[[^\]]+\]\s*)?([^:]+):\s*(.*)$/);
      return match ? match[3].trim() : line;
    })
    .join(" ")
    .trim();
};
