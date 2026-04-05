import { diffLines } from "diff";

export type ChangeCategory = "pricing" | "feature" | "copy" | "design" | "other";
export type Importance = "high" | "medium" | "low";

interface DiffResult {
  readonly category: ChangeCategory;
  readonly importance: Importance;
  readonly summary: string;
  readonly diff: string;
  readonly addedLines: number;
  readonly removedLines: number;
}

const PRICING_PATTERNS = [
  /\$\d+/,
  /\d+\/mo/i,
  /pricing/i,
  /price/i,
  /plan/i,
  /free tier/i,
  /enterprise/i,
  /per\s*(user|seat|month)/i,
];

const FEATURE_PATTERNS = [
  /new feature/i,
  /now available/i,
  /introducing/i,
  /launch/i,
  /beta/i,
  /integration/i,
  /api/i,
];

function categorize(diffText: string): ChangeCategory {
  if (PRICING_PATTERNS.some((p) => p.test(diffText))) return "pricing";
  if (FEATURE_PATTERNS.some((p) => p.test(diffText))) return "feature";
  return "copy";
}

function assessImportance(
  category: ChangeCategory,
  addedLines: number,
  removedLines: number,
): Importance {
  if (category === "pricing") return "high";
  if (category === "feature") return "medium";
  const totalChanges = addedLines + removedLines;
  if (totalChanges > 20) return "medium";
  return "low";
}

function generateSummary(
  category: ChangeCategory,
  addedLines: number,
  removedLines: number,
): string {
  const action =
    addedLines > removedLines
      ? "added"
      : removedLines > addedLines
        ? "removed"
        : "modified";

  const categoryLabels: Record<ChangeCategory, string> = {
    pricing: "Pricing change",
    feature: "Feature update",
    copy: "Content update",
    design: "Design change",
    other: "Page update",
  };

  return `${categoryLabels[category]}: ${action} ${addedLines + removedLines} lines`;
}

export function computeDiff(
  oldContent: string,
  newContent: string,
): DiffResult | null {
  const changes = diffLines(oldContent, newContent);

  let addedLines = 0;
  let removedLines = 0;
  const diffParts: string[] = [];

  for (const part of changes) {
    const lines = part.value.split("\n").filter(Boolean);
    if (part.added) {
      addedLines += lines.length;
      diffParts.push(...lines.map((l) => `+ ${l}`));
    } else if (part.removed) {
      removedLines += lines.length;
      diffParts.push(...lines.map((l) => `- ${l}`));
    }
  }

  if (addedLines === 0 && removedLines === 0) return null;

  const diffText = diffParts.join("\n");
  const category = categorize(diffText);
  const importance = assessImportance(category, addedLines, removedLines);
  const summary = generateSummary(category, addedLines, removedLines);

  return {
    category,
    importance,
    summary,
    diff: diffText.slice(0, 5000),
    addedLines,
    removedLines,
  };
}
