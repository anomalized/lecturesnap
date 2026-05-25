import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are an expert academic note-taker. You are given an image of study material (whiteboard, handwritten notes, textbook page, slides, or diagrams). Your job is to extract and organize the content.

Respond ONLY with this exact JSON structure and nothing else — no markdown fences, no explanation:
{
  "subject": "detected or provided subject name",
  "title": "a short descriptive title for this content",
  "notes": {
    "summary": "2-3 sentence overview of what this material covers",
    "key_concepts": [
      { "term": "concept name", "definition": "clear explanation" }
    ],
    "detailed_notes": "full markdown notes with headers, bullet points, and any formulas or important details",
    "important_formulas": ["formula1", "formula2"]
  },
  "flashcards": [
    { "question": "...", "answer": "..." }
  ],
  "difficulty_level": "Beginner / Intermediate / Advanced",
  "estimated_study_time": "e.g. 15 minutes"
}

Generate at least 5 flashcards, up to 15 if the content is rich.
If there are mathematical formulas, write them in LaTeX notation wrapped in $...$ for inline or $$...$$ for block.
If the image is unclear or unreadable, return a JSON with an additional "error" field explaining why.`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType, subject } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Missing image data" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const subjectHint =
      subject && subject !== "auto"
        ? `The subject of this material is: ${subject}.`
        : "Auto-detect the subject from the image content.";

    const prompt = `${SYSTEM_PROMPT}\n\n${subjectHint}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const rawText = result.response.text();

    // Strip markdown fences if present
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        {
          error:
            "Could not parse AI response. The image may be unclear — try better lighting or a closer shot.",
          raw: cleaned,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `API error: ${message}` },
      { status: 500 }
    );
  }
}