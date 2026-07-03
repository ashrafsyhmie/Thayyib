import { describe, expect, it } from "vitest";
import { extractTextFromUpload } from "./text-extraction";

describe("extractTextFromUpload", () => {
  it("extracts normalized text from a plain text upload", async () => {
    const file = new File(["Ingredients:\n gelatin, flour, sugar"], "ingredients.txt", {
      type: "text/plain",
    });

    const result = await extractTextFromUpload(file);

    expect(result).toMatchObject({
      method: "plain-text",
      text: "Ingredients: gelatin, flour, sugar",
    });
  });
});
