import { GoogleGenAI, Type } from "@google/genai";
import { TaxInfo, MetalType } from "../types";

/**
 * Fetches tax information for precious metals using Gemini with Search Grounding.
 * Optimized to only fetch the percentage to minimize token consumption.
 */
export const getTaxInfo = async (metal: MetalType, country: string): Promise<TaxInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the total estimated tax percentage (Import Duty + GST/VAT) for buying physical ${metal} in ${country}? Provide only the number.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            percentage: { type: Type.NUMBER, description: "Total percentage surcharge (e.g. 15)" },
            country: { type: Type.STRING }
          },
          required: ["percentage", "country"]
        }
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Tax Error:", error);
    return {
      percentage: 0,
      country: country
    };
  }
};