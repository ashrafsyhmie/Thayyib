import { afterEach, describe, expect, it } from "vitest";
import { analyzeWithOpenAi, hasOpenAiKey } from "./openai-analyzer";
import { getFallbackIngredientKnowledge } from "./risk-analyzer";

const originalApiKey = process.env.OPENAI_API_KEY;

afterEach(() => {
  process.env.OPENAI_API_KEY = originalApiKey;
});

describe("openai analyzer configuration", () => {
  it("reports disabled when no OpenAI API key is configured", () => {
    delete process.env.OPENAI_API_KEY;

    expect(hasOpenAiKey()).toBe(false);
  });

  it("returns null instead of failing when no OpenAI API key is configured", async () => {
    delete process.env.OPENAI_API_KEY;

    await expect(
      analyzeWithOpenAi({
        documentText: "Ingredients: gelatin, flour, sugar.",
        knowledge: getFallbackIngredientKnowledge(),
      }),
    ).resolves.toBeNull();
  });
});
