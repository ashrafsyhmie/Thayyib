import OpenAI from "openai";
import type { AiFinding, AiSource } from "@/lib/data/types";
import type { AnalysisResult, IngredientRiskKnowledge } from "./risk-analyzer";

type OpenAiRiskLevel = "low" | "medium" | "high" | "unknown";

type OpenAiFinding = {
  item: string;
  risk: string;
  recommendation: string;
  risk_level: OpenAiRiskLevel;
};

type OpenAiSource = {
  title: string;
  url?: string;
};

type OpenAiAnalysis = {
  risk_level: OpenAiRiskLevel;
  confidence: number;
  summary: string;
  findings: OpenAiFinding[];
  recommended_actions: string[];
  sources: OpenAiSource[];
};

const safetyRecommendation =
  "Potential risk detected. Please verify with a qualified halal compliance officer.";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "risk_level",
    "confidence",
    "summary",
    "findings",
    "recommended_actions",
    "sources",
  ],
  properties: {
    risk_level: {
      type: "string",
      enum: ["low", "medium", "high", "unknown"],
    },
    confidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    summary: {
      type: "string",
    },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["item", "risk", "recommendation", "risk_level"],
        properties: {
          item: { type: "string" },
          risk: { type: "string" },
          recommendation: { type: "string" },
          risk_level: {
            type: "string",
            enum: ["low", "medium", "high", "unknown"],
          },
        },
      },
    },
    recommended_actions: {
      type: "array",
      items: { type: "string" },
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title"],
        properties: {
          title: { type: "string" },
          url: { type: "string" },
        },
      },
    },
  },
} as const;

export function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function analyzeWithOpenAi({
  documentText,
  knowledge,
}: {
  documentText: string;
  knowledge: IngredientRiskKnowledge[];
}): Promise<AnalysisResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content:
            "You are Thayyib AI, a halal compliance assistant for food manufacturers. Identify potential compliance risks clearly. Do not make final halal rulings. Say uncertain when uncertain. Always recommend qualified human verification when risk is detected.",
        },
        {
          role: "user",
          content: buildPrompt(documentText, knowledge),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "halal_compliance_risk_analysis",
          strict: true,
          schema: responseSchema,
        },
      },
    });
    const parsed = JSON.parse(response.output_text) as OpenAiAnalysis;

    return normalizeOpenAiResult(parsed);
  } catch (error) {
    console.error("OpenAI analysis failed", error);
    return null;
  }
}

function buildPrompt(
  documentText: string,
  knowledge: IngredientRiskKnowledge[],
) {
  const knowledgeSummary = knowledge
    .map(
      (item) =>
        `- ${item.name}${item.eCode ? ` (${item.eCode})` : ""}: ${item.riskLevel} risk. ${item.riskReason} Source: ${item.sourceName}${item.sourceUrl ? ` ${item.sourceUrl}` : ""}`,
    )
    .join("\n");

  return `Analyze the following document text for potential halal compliance risks.

Rules:
- Do not decide whether the product is halal or non-halal.
- Flag only potential risks and evidence gaps.
- Use the provided knowledge as supporting context.
- Include "Uploaded document text" as a source when relevant.
- Keep recommendations practical for a compliance officer.

Known ingredient risk context:
${knowledgeSummary}

Document text:
${documentText}`;
}

function normalizeOpenAiResult(result: OpenAiAnalysis): AnalysisResult {
  const findings: AiFinding[] = result.findings.map((finding) => ({
    item: finding.item,
    risk: finding.risk,
    recommendation: finding.recommendation,
    riskLevel: formatRiskLevel(finding.risk_level),
  }));
  const sources: AiSource[] = dedupeSources([
    { title: "Uploaded document text" },
    ...result.sources,
  ]);

  return {
    detectedIngredients: result.findings.map((finding) => ({
      name: finding.item,
      matchedTerm: finding.item,
      risk_level: finding.risk_level,
      risk_reason: finding.risk,
    })),
    findings,
    sources,
    riskLevel: result.risk_level,
    riskSummary: result.summary,
    recommendationText:
      result.risk_level === "unknown" || result.risk_level === "low"
        ? "No final halal status is provided. Please verify the document with a qualified halal compliance officer."
        : safetyRecommendation,
    confidenceScore: Math.min(0.95, Math.max(0, result.confidence)),
  };
}

function formatRiskLevel(value: OpenAiRiskLevel): AiFinding["riskLevel"] {
  if (value === "low") {
    return "Low";
  }

  if (value === "medium") {
    return "Medium";
  }

  if (value === "high") {
    return "High";
  }

  return "Unknown";
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
