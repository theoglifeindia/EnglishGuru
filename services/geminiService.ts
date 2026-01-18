
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, DENIAL_MESSAGE } from "../constants.ts";
import { PedagogicalResponse, ResponseMode } from "../types.ts";

export class GeminiService {
  async processQuery(query: string, overrideApiKey?: string, userName?: string, userGoal?: string): Promise<PedagogicalResponse> {
    // Prefer the key from settings, fallback to environment variable
    const apiKey = overrideApiKey || process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    // Inject user name and goal into the prompt context if available
    let contextHeader = '';
    if (userName) contextHeader += `User Name: ${userName}\n`;
    if (userGoal) contextHeader += `User Learning Goal: ${userGoal}\n`;

    const finalPrompt = contextHeader 
      ? `${contextHeader}\nQuery: ${query}` 
      : query;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: finalPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              simpleExplanation: { type: Type.STRING },
              hindiExplanation: { type: Type.STRING },
              grammarFocus: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING },
                  rule: { type: Type.STRING }
                },
                required: ["topic", "rule"]
              },
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
              "grammarFocus",
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

  async validatePracticeInput(userSentence: string, topic: string, context: string, overrideApiKey?: string): Promise<{ isCorrect: boolean; feedback: string; correctedSentence?: string }> {
    const apiKey = overrideApiKey || process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Task: Act as an English Grammar Teacher.
      Topic: ${topic}
      Context/Drill: ${context}
      Student Input: "${userSentence}"

      Analyze the Student Input.
      1. Is it grammatically correct?
      2. Does it make sense in the context of the drill?
      
      Return JSON:
      {
        "isCorrect": boolean,
        "feedback": "string (Short, helpful explanation of the mistake or praise)",
        "correctedSentence": "string (The corrected version if incorrect, otherwise null)"
      }
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCorrect: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
              correctedSentence: { type: Type.STRING, nullable: true }
            },
            required: ["isCorrect", "feedback"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Validation Error:", error);
      // Fallback if API fails
      return { isCorrect: false, feedback: "Could not validate at the moment. Please double check your grammar.", correctedSentence: undefined };
    }
  }

  async fetchStarterPrompts(userGoal?: string, overrideApiKey?: string): Promise<Array<{ label: string; query: string }>> {
    const apiKey = overrideApiKey || process.env.API_KEY;
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      Generate 4 short, engaging, and diverse English learning queries for a student.
      Student Goal: ${userGoal || "General Spoken English Improvement"}
      
      Requirements:
      1. 'label': Short, catchy title (max 3 words). e.g., "Fix Grammar", "Job Interview".
      2. 'query': The actual full question the student would ask an AI tutor. e.g., "Check this sentence for grammar mistakes..."
      
      Return strictly a JSON array:
      [
        { "label": "string", "query": "string" },
        ...
      ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
             type: Type.ARRAY,
             items: {
                type: Type.OBJECT,
                properties: {
                   label: { type: Type.STRING },
                   query: { type: Type.STRING }
                },
                required: ["label", "query"]
             }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.warn("Failed to fetch prompts", e);
      // Fallback
      return [
        { label: "Describe Picture", query: "Describe a busy market scene in English." },
        { label: "Job Interview", query: "Help me prepare for a job interview introduction." },
        { label: "Email Writing", query: "How to write a formal leave application?" },
        { label: "Idioms", query: "Teach me 3 popular business idioms." }
      ];
    }
  }

  private getInvalidTopicResponse(): PedagogicalResponse {
    return {
      simpleExplanation: DENIAL_MESSAGE,
      hindiExplanation: "मैं केवल अंग्रेजी संचार कौशल में मदद करने के लिए बनाया गया हूं।",
      grammarFocus: { topic: "Invalid Topic", rule: "N/A" },
      correctExamples: [],
      commonMistakes: [],
      practiceSuggestion: "",
      suggestions: { improvements: [], alternatives: [], tips: [] },
      recommendedMode: ResponseMode.TEXT,
      isInvalidTopic: true
    };
  }
}
