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

// New helper function to extract speaker sequence
const extractSpeakerSequence = (text: string): string[] => {
  const lines = text.split("\n");
  const speakers: string[] = [];
  let lastSpeaker: string | null = null;

  for (const line of lines) {
    // Check for a colon to identify a speaker tag
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const speaker = line.substring(0, colonIndex).trim();
      // Add speaker to the sequence if it's a new speaker
      if (speaker !== lastSpeaker) {
        speakers.push(speaker);
        lastSpeaker = speaker;
      }
    }
  }
  return speakers;
};

export interface DerMetrics {
  der: number;
  speakerError: number; // Substitutions
  falseAlarm: number; // Insertions
  missedSpeech: number; // Deletions
}

// New calculateDer function based on speaker sequence comparison
export const calculateDer = (ref: string, hyp: string): DerMetrics => {
  const refSpeakers = extractSpeakerSequence(ref);
  const hypSpeakers = extractSpeakerSequence(hyp);

  const n = refSpeakers.length;
  const m = hypSpeakers.length;

  if (n === 0) {
    return {
      der: m > 0 ? Number.POSITIVE_INFINITY : 0,
      speakerError: 0,
      falseAlarm: m,
      missedSpeech: 0,
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
  ops[0][0] = "";

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = refSpeakers[i - 1] === hypSpeakers[j - 1] ? 0 : 1;
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
  let speakerError = 0,
    falseAlarm = 0,
    missedSpeech = 0;

  while (i > 0 || j > 0) {
    const op = ops[i]?.[j];
    if (op === "S") {
      speakerError++;
      i--;
      j--;
    } else if (op === "D") {
      missedSpeech++;
      i--;
    } else if (op === "I") {
      falseAlarm++;
      j--;
    } else {
      // Match or start of grid
      if (i > 0) i--;
      if (j > 0) j--;
    }
  }

  const totalErrors = speakerError + falseAlarm + missedSpeech;
  const der = n > 0 ? totalErrors / n : m > 0 ? Number.POSITIVE_INFINITY : 0;

  return {
    der: isFinite(der) ? der : 0,
    speakerError,
    falseAlarm,
    missedSpeech,
  };
};

export const stripSpeakerTags = (text: string): string => {
  return text
    .split("\n")
    .map((line) => {
      const colonIndex = line.indexOf(":");
      return colonIndex !== -1 ? line.substring(colonIndex + 1).trim() : line;
    })
    .join(" ")
    .trim();
};
