
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMissionUpdate = async (score: number, health: number, distance: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are 'Nova', the onboard AI for a space runner ship. 
      The player current stats: Score: ${score}, Health: ${health}%, Distance: ${distance} light-years.
      Provide a very short (max 15 words) tactical or witty update. 
      If health is low, be urgent. If score is high, be impressed. 
      Otherwise, mention cosmic phenomena. Do not use markdown formatting.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text || "Scanning cosmic debris... stay sharp, pilot.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Interference detected in comms. Maintain course.";
  }
};
