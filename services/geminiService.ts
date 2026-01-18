
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, DENIAL_MESSAGE } from "../constants.ts";
import { PedagogicalResponse, ResponseMode } from "../types.ts";

export class GeminiService {
  async processQuery(query: string, overrideApiKey?: string): Promise<PedagogicalResponse> {
    // Prefer the key from settings, fallback to environment variable
    const apiKey = overrideApiKey || process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              simpleExplanation: { type: Type.STRING },
              hindiExplanation: { type: Type.STRING },
              correctExamples: { type: Type.ARRAY, items: { type: Type.STRING } },
              commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
              practiceSuggestion: { type: Type.STRING },
              suggestions: {
                type: Type.OBJECT,
                properties: {
                  improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tips: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["improvements", "alternatives", "tips"],
              },
              recommendedMode: { type: Type.STRING },
              audioScript: { type: Type.STRING },
              videoMetadata: {
                type: Type.OBJECT,
                properties: {
                  scene: { type: Type.STRING },
                  subtitles: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
              },
              isInvalidTopic: { type: Type.BOOLEAN }
            },
            required: [
              "simpleExplanation", 
              "hindiExplanation", 
              "correctExamples", 
              "commonMistakes", 
              "practiceSuggestion", 
              "suggestions", 
              "recommendedMode", 
              "isInvalidTopic"
            ],
          },
        },
      });

      const resultText = response.text || "{}";
      const result: PedagogicalResponse = JSON.parse(resultText);

      if (result.isInvalidTopic) {
        return this.getInvalidTopicResponse();
      }

      return result;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to reach the AI expert. Please check your API key.");
    }
  }

  private getInvalidTopicResponse(): PedagogicalResponse {
    return {
      simpleExplanation: DENIAL_MESSAGE,
      hindiExplanation: "मैं केवल अंग्रेजी संचार कौशल में मदद करने के लिए बनाया गया हूं।",
      correctExamples: [],
      commonMistakes: [],
      practiceSuggestion: "",
      suggestions: { improvements: [], alternatives: [], tips: [] },
      recommendedMode: ResponseMode.TEXT,
      isInvalidTopic: true
    };
  }
}
