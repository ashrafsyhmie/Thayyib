import { describe, expect, it } from "vitest";
import {
  analyzeIngredientRisk,
  getFallbackIngredientKnowledge,
} from "./risk-analyzer";

describe("analyzeIngredientRisk", () => {
  it("flags high-risk ingredient terms with the required human review wording", () => {
    const result = analyzeIngredientRisk(
      "Ingredients: wheat flour, cocoa, gelatin, colour E120.",
      getFallbackIngredientKnowledge(),
    );

    expect(result.riskLevel).toBe("high");
    expect(result.detectedIngredients.map((item) => item.name)).toEqual([
      "Gelatin",
      "Carmine",
    ]);
    expect(result.recommendationText).toBe(
      "Potential risk detected. Please verify with a qualified halal compliance officer.",
    );
  });

  it("does not claim halal status when no known risk term is found", () => {
    const result = analyzeIngredientRisk(
      "Ingredients: wheat flour, salt, sugar, water.",
      getFallbackIngredientKnowledge(),
    );

    expect(result.riskLevel).toBe("unknown");
    expect(result.findings).toEqual([]);
    expect(result.riskSummary).toContain("This does not confirm halal status");
  });
});
