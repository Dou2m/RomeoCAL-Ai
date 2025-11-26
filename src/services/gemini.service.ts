
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../models/nutrition.model';

// This is a type declaration to inform TypeScript about the process global.
// It assumes `process.env.API_KEY` is set in the execution environment.
declare var process: any;

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public error = signal<string | null>(null);

  constructor() {
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        } else {
            this.error.set('API key not found. Please ensure it is configured in your environment.');
        }
    } catch(e: any) {
        this.error.set(`Error initializing Gemini: ${e.message}`);
        this.ai = null;
    }
  }

  async analyzeImage(imageDataBase64: string): Promise<AnalysisResult | null> {
    if (!this.ai) {
        console.error("Gemini AI client is not initialized.");
        this.error.set("Gemini AI client is not initialized.");
        return null;
    }

    this.error.set(null);

    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageDataBase64,
      },
    };

    const textPart = {
      text: `Analyze the image of this meal and provide a detailed nutritional breakdown for a standard serving size.
      Estimate the following: calories, protein in grams, carbohydrates in grams, fat in grams, and sugar in grams.
      Also provide a short, descriptive name for the meal.`
    };

    try {
        const response = await this.ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        mealName: { type: Type.STRING, description: 'A descriptive name for the meal.' },
                        calories: { type: Type.NUMBER, description: 'Estimated total calories.' },
                        protein: { type: Type.NUMBER, description: 'Estimated protein in grams.' },
                        carbohydrates: { type: Type.NUMBER, description: 'Estimated carbohydrates in grams.' },
                        fat: { type: Type.NUMBER, description: 'Estimated fat in grams.' },
                        sugar: { type: Type.NUMBER, description: 'Estimated sugar in grams.' },
                    },
                    required: ["mealName", "calories", "protein", "carbohydrates", "fat", "sugar"],
                }
            }
        });

        const jsonString = response.text.trim();
        const result: AnalysisResult = JSON.parse(jsonString);
        return result;

    } catch (e: any) {
      console.error('Error analyzing image with Gemini:', e);
      this.error.set(`Failed to analyze image. ${e.message}`);
      return null;
    }
  }
}
