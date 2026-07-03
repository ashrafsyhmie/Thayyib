export type TextExtractionResult = {
  text: string;
  method:
    | "plain-text"
    | "pdf-text"
    | "pdf-image-ocr"
    | "docx-text"
    | "image-ocr";
  warning?: string;
};

const maxAnalysisCharacters = 30000;
const maxPdfOcrPages = 3;

export async function extractTextFromUpload(
  file: File,
): Promise<TextExtractionResult | null> {
  const lowerName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (file.type === "text/plain" || lowerName.endsWith(".txt")) {
    return buildResult(await file.text(), "plain-text");
  }

  if (file.type === "application/pdf" || lowerName.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return extractDocxText(buffer);
  }

  if (isImageFile(file)) {
    return extractImageText(buffer);
  }

  return null;
}

function buildResult(
  text: string,
  method: TextExtractionResult["method"],
): TextExtractionResult | null {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return null;
  }

  return {
    text: normalized.slice(0, maxAnalysisCharacters),
    method,
    warning:
      normalized.length > maxAnalysisCharacters
        ? "Text was shortened before AI analysis to keep the request manageable."
        : undefined,
  };
}

type PdfParser = {
  getText: () => Promise<{ text: string }>;
  getScreenshot: (params?: {
    first?: number;
    desiredWidth?: number;
    imageBuffer?: boolean;
    imageDataUrl?: boolean;
  }) => Promise<{ pages: Array<{ data?: Uint8Array }> }>;
  destroy: () => Promise<void>;
};

async function extractPdfText(buffer: Buffer) {
  let parser: PdfParser | null = null;

  try {
    const { PDFParse } = await import("pdf-parse");
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const textResult = buildResult(result.text, "pdf-text");

    if (textResult) {
      return textResult;
    }

    const screenshots = await parser.getScreenshot({
      first: maxPdfOcrPages,
      desiredWidth: 1400,
      imageBuffer: true,
      imageDataUrl: false,
    });
    const pageTexts = await Promise.all(
      screenshots.pages
        .map((page) => page.data)
        .filter((pageBuffer): pageBuffer is Buffer => Boolean(pageBuffer))
        .map((pageBuffer) => recognizeImageBuffer(Buffer.from(pageBuffer))),
    );

    return buildResult(
      pageTexts.filter(Boolean).join("\n"),
      "pdf-image-ocr",
    );
  } catch (error) {
    console.error("PDF text extraction failed", error);
    return null;
  } finally {
    await parser?.destroy();
  }
}

async function extractDocxText(buffer: Buffer) {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });

    return buildResult(result.value, "docx-text");
  } catch (error) {
    console.error("DOCX text extraction failed", error);
    return null;
  }
}

async function extractImageText(buffer: Buffer) {
  try {
    const text = await recognizeImageBuffer(buffer);

    return buildResult(text, "image-ocr");
  } catch (error) {
    console.error("Image OCR failed", error);
    return null;
  }
}

async function recognizeImageBuffer(buffer: Buffer) {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(buffer, "eng+msa");

  return result.data.text;
}

function isImageFile(file: File) {
  const lowerName = file.name.toLowerCase();

  return (
    file.type.startsWith("image/") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png")
  );
}
