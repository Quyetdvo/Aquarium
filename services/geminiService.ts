import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AnalysisMode } from "../types";

// Initialize API Client
// Note: API_KEY is assumed to be in process.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (
  base64Image: string,
  mode: AnalysisMode
): Promise<AnalysisResult> => {
  // Clean base64 string if it has the header
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "");

  const modelName = "gemini-2.5-flash"; // Good balance of speed and vision capabilities

  let promptText = "";
  if (mode === AnalysisMode.CM_SCALE) {
    promptText = `
      Analyze this image effectively. 
      Task: Identify and count all distinct biological individuals or objects that appear to be roughly 2-3cm in size relative to the frame.
      Action:
      1. Draw a bounding box around each individual.
      2. Assign a unique ID to each.
      3. Count the total number.
      Ignore very tiny specks or background noise. Focus on the main subjects.
    `;
  } else {
    promptText = `
      Analyze this image effectively.
      Task: Identify and count all distinct micro-individuals or small objects (millimeter scale).
      Action:
      1. Draw a bounding box around each small individual.
      2. Assign a unique ID to each.
      3. Count the total number.
      Be precise with small details.
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            count: { type: Type.INTEGER, description: "Total number of individuals counted" },
            estimatedSizeCategory: { type: Type.STRING, description: "A brief description of the size category detected" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER, description: "Sequential ID number" },
                  label: { type: Type.STRING, description: "Short label, e.g., 'Fish', 'Shrimp', 'Object'" },
                  box_2d: {
                    type: Type.ARRAY,
                    items: { type: Type.NUMBER },
                    description: "Bounding box coordinates [ymin, xmin, ymax, xmax] normalized 0-1",
                  },
                },
                required: ["id", "box_2d"],
              },
            },
          },
          required: ["count", "items"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI model");
    }

    const data = JSON.parse(resultText) as AnalysisResult;
    return data;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
