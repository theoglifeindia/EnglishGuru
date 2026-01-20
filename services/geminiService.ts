
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, DENIAL_MESSAGE, DEFAULT_API_KEY } from "../constants";
import { PedagogicalResponse, ResponseMode } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // We instantiate lightly here, but the specific call uses the key
    // Fallback to DEFAULT_API_KEY if process.env.API_KEY is not set
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || DEFAULT_API_KEY });
  }

  async processQuery(query: string, apiKey: string, userName?: string, userGoal?: string): Promise<PedagogicalResponse> {
    // Use provided key, or fallback to default
    const effectiveKey = apiKey || DEFAULT_API_KEY;
    
    if (!effectiveKey) throw new Error("API Key is missing.");
    
    // Re-instantiate with the user-provided key
    const ai = new GoogleGenAI({ apiKey: effectiveKey });

    // Construct Contextual Prompt
    let contextInstruction = "";
    if (userName) {
      contextInstruction += `\nUSER CONTEXT - NAME: ${userName}. Address the user by name warmly in the introduction or tips.`;
    }
    if (userGoal) {
      contextInstruction += `\nUSER CONTEXT - LEARNING GOAL: "${userGoal}". \nCRITICAL: All examples, scenarios, and practice suggestions MUST be strictly aligned with this goal. For example, if the goal is 'Job Interview', do not give examples about 'Buying Vegetables'.`;
    }

    const fullSystemInstruction = SYSTEM_INSTRUCTION + contextInstruction;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: query,
        config: {
          systemInstruction: fullSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              simpleExplanation: { type: Type.STRING },
              hindiExplanation: { type: Type.STRING },
              grammarAnalysis: { type: Type.STRING, description: "Concise grammar rule or sentence structure formula." },
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
              "grammarAnalysis",
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
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to reach the AI expert. Please check your API key and connection.");
    }
  }
  
  // Helper to fetch starter prompts based on goal
  async fetchStarterPrompts(userGoal: string, apiKey: string): Promise<{label: string, query: string}[]> {
      if (!userGoal) return [];
      
      const effectiveKey = apiKey || DEFAULT_API_KEY;
      if (!effectiveKey) return [];

      const ai = new GoogleGenAI({ apiKey: effectiveKey });
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `The user has a specific goal for learning English: "${userGoal}".
            Generate 4 distinct, engaging practice scenarios or questions aligned with this goal.
            
            IMPORTANT:
            - Vary the topics slightly from generic ones.
            - Ensure they are practical and actionable.
            - Random Context ID: ${Date.now()}-${Math.random()} (Use this to ensure fresh output different from previous requests)
            
            Requirements:
            1. "label": A short, catchy title (max 4 words) including an emoji.
            2. "query": The FULL, detailed prompt the user would send to an AI to practice this. It should be specific.
               Example: If label is "Job Interview", query might be "Simulate a job interview for a software engineer role and ask me about my strengths."
            
            Format: JSON Array of objects.`,
            config: {
                temperature: 1.1, // Higher temperature for variety
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            label: {type: Type.STRING},
                            query: {type: Type.STRING}
                        },
                        required: ["label", "query"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
      } catch (e) {
          console.error("Error fetching prompts", e);
          return [];
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
