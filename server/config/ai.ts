import { GoogleGenAI } from "@google/genai";
import { env } from "./env";

export const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY || "MOCK_KEY",
  httpOptions: {
    headers: { "User-Agent": "aistudio-build" },
  },
});
