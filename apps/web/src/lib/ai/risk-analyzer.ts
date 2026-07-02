import type { AiFinding, AiSource, HalalRiskLevel } from "@/lib/data/types";

export type IngredientRiskKnowledge = {
  name: string;
  commonNames: string[];
  eCode: string | null;
  riskLevel: "low" | "medium" | "high" | "unknown";
  riskReason: string;
  sourceName: string;
  sourceUrl: string | null;
  confidenceScore: number;
};

export type AnalysisResult = {
  detectedIngredients: Array<{
    name: string;
    matchedTerm: string;
    risk_level: string;
    risk_reason: string;
  }>;
  findings: AiFinding[];
  sources: AiSource[];
  riskLevel: "low" | "medium" | "high" | "unknown";
  riskSummary: string;
  recommendationText: string;
  confidenceScore: number;
};

const fallbackKnowledge: IngredientRiskKnowledge[] = [
  {
    name: "Gelatin",
    commonNames: ["gelatine", "hydrolyzed gelatin"],
    eCode: "E441",
    riskLevel: "high",
    riskReason:
      "Animal-derived ingredient that requires source and halal certificate verification.",
    sourceName: "Ingredient Risk Research Notes",
    sourceUrl: "context/research/ingredient-risk.md",
    confidenceScore: 0.8,
  },
  {
    name: "Lard",
    commonNames: ["pork fat"],
    eCode: null,
    riskLevel: "high",
    riskReason: "Pork-derived fat is a strong halal compliance risk.",
    sourceName: "Ingredient Risk Research Notes",
    sourceUrl: "context/research/ingredient-risk.md",
    confidenceScore: 0.86,
  },
  {
    name: "Alcohol",
    commonNames: ["ethanol", "wine", "rum"],
    eCode: null,
    riskLevel: "medium",
    riskReason:
      "Alcohol or alcohol-derived carriers require process and concentration verification.",
    sourceName: "Ingredient Risk Research Notes",
    sourceUrl: "context/research/ingredient-risk.md",
    confidenceScore: 0.7,
  },
  {
    name: "Mono- and diglycerides of fatty acids",
    commonNames: ["emulsifier", "mono-diglycerides", "E471"],
    eCode: "E471",
    riskLevel: "medium",
    riskReason:
      "May be plant-based or animal-derived, so supplier source evidence is needed.",
    sourceName: "Ingredient Risk Research Notes",
    sourceUrl: "context/research/ingredient-risk.md",
    confidenceScore: 0.72,
  },
  {
    name: "Carmine",
    commonNames: ["cochineal", "natural red 4"],
    eCode: "E120",
    riskLevel: "high",
    riskReason:
      "Animal/insect-derived colourant that should be escalated for qualified halal review.",
    sourceName: "Ingredient Risk Research Notes",
    sourceUrl: "context/research/ingredient-risk.md",
    confidenceScore: 0.78,
  },
];

const recommendationText =
  "Potential risk detected. Please verify with a qualified halal compliance officer.";

const riskRank: Record<string, number> = {
  unknown: 0,
  low: 1,
  medium: 2,
  high: 3,
};

export function getFallbackIngredientKnowledge() {
  return fallbackKnowledge;
}

export function analyzeIngredientRisk(
  documentText: string,
  knowledge: IngredientRiskKnowledge[],
): AnalysisResult {
  const normalizedText = normalize(documentText);
  const matches = knowledge
    .map((risk) => {
      const terms = [risk.name, risk.eCode, ...risk.commonNames].filter(
        (term): term is string => Boolean(term),
      );
      const matchedTerm = terms.find((term) =>
        normalizedText.includes(normalize(term)),
      );

      return matchedTerm ? { risk, matchedTerm } : null;
    })
    .filter((match): match is { risk: IngredientRiskKnowledge; matchedTerm: string } =>
      Boolean(match),
    );

  if (matches.length === 0) {
    return {
      detectedIngredients: [],
      findings: [],
      sources: [{ title: "Uploaded document text" }],
      riskLevel: "unknown",
      riskSummary:
        "No known high-risk ingredient terms were detected in the submitted text. This does not confirm halal status.",
      recommendationText:
        "No obvious risk term was detected. Please still verify the document with a qualified halal compliance officer.",
      confidenceScore: 0.45,
    };
  }

  const highestRisk = matches.reduce((highest, current) =>
    riskRank[current.risk.riskLevel] > riskRank[highest.risk.riskLevel]
      ? current
      : highest,
  ).risk.riskLevel;

  const findings = matches.map(({ risk }): AiFinding => ({
    item: risk.name,
    risk: risk.riskReason,
    recommendation: buildRecommendation(risk.riskLevel),
    riskLevel: formatRiskLevel(risk.riskLevel),
  }));

  const sources = dedupeSources([
    { title: "Uploaded document text" },
    ...matches.map(({ risk }) => ({
      title: risk.sourceName,
      url: risk.sourceUrl ?? undefined,
    })),
  ]);

  const averageConfidence =
    matches.reduce((total, { risk }) => total + risk.confidenceScore, 0) /
    matches.length;

  return {
    detectedIngredients: matches.map(({ risk, matchedTerm }) => ({
      name: risk.name,
      matchedTerm,
      risk_level: risk.riskLevel,
      risk_reason: risk.riskReason,
    })),
    findings,
    sources,
    riskLevel: highestRisk,
    riskSummary: buildSummary(matches.length, highestRisk),
    recommendationText,
    confidenceScore: Math.min(0.95, Math.max(0.5, Number(averageConfidence.toFixed(2)))),
  };
}

export function formatRiskLevel(value: string): HalalRiskLevel {
  const normalized = value.toLowerCase();

  if (normalized === "low") {
    return "Low";
  }

  if (normalized === "medium") {
    return "Medium";
  }

  if (normalized === "high") {
    return "High";
  }

  return "Unknown";
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function buildRecommendation(riskLevel: string) {
  if (riskLevel === "high") {
    return "Escalate this item and request supplier source evidence before relying on the ingredient.";
  }

  if (riskLevel === "medium") {
    return "Request clarification on source, processing aid, carrier, or halal certificate evidence.";
  }

  return "Keep the evidence on file and verify it during routine compliance review.";
}

function buildSummary(matchCount: number, riskLevel: string) {
  const label = formatRiskLevel(riskLevel).toLowerCase();

  return `${matchCount} potential ingredient risk ${
    matchCount === 1 ? "term was" : "terms were"
  } detected. Highest detected risk level: ${label}.`;
}

function dedupeSources(sources: AiSource[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = `${source.title}:${source.url ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
