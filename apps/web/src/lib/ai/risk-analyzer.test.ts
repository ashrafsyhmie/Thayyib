import { describe, expect, it } from "vitest";
import {
  analyzeIngredientRisk,
  getFallbackIngredientKnowledge,
  mergeIngredientKnowledge,
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

  it("flags pork and alcoholic beverage terms as high risk", () => {
    const result = analyzeIngredientRisk(
      "Ingredients: wheat flour, pork extract, red wine, sugar.",
      getFallbackIngredientKnowledge(),
    );

    expect(result.riskLevel).toBe("high");
    expect(result.detectedIngredients.map((item) => item.name)).toEqual([
      "Pork",
      "Alcoholic beverage",
    ]);
    expect(result.recommendationText).toBe(
      "Potential risk detected. Please verify with a qualified halal compliance officer.",
    );
  });

  it("flags alcohol carriers and source-sensitive processing ingredients", () => {
    const result = analyzeIngredientRisk(
      "Ingredients: vanilla flavouring, ethanol, enzyme, vegetable shortening.",
      getFallbackIngredientKnowledge(),
    );

    expect(result.riskLevel).toBe("medium");
    expect(result.detectedIngredients.map((item) => item.name)).toEqual([
      "Alcohol",
      "Enzyme",
      "Shortening",
      "Vanilla extract",
    ]);
  });

  it("does not match short risky terms inside unrelated words", () => {
    const result = analyzeIngredientRisk(
      "Ingredients: turmeric, brown sugar, wheat flour.",
      getFallbackIngredientKnowledge(),
    );

    expect(result.detectedIngredients.map((item) => item.name)).not.toContain(
      "Alcoholic beverage",
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

  it("keeps fallback risk terms when database knowledge is incomplete", () => {
    const legacyDatabaseKnowledge = getFallbackIngredientKnowledge().filter(
      (item) => item.name !== "Pork",
    );
    const mergedKnowledge = mergeIngredientKnowledge(legacyDatabaseKnowledge);
    const result = analyzeIngredientRisk(
      "Ingredients: sugar, pork, salt.",
      mergedKnowledge,
    );

    expect(result.riskLevel).toBe("high");
    expect(result.detectedIngredients.map((item) => item.name)).toContain("Pork");
  });
});
