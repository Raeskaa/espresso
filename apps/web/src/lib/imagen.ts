import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FixOptions } from "@espresso/utils";

// Lazy initialization to avoid errors during build
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Build a prompt based on the fix options selected by the user
 */
function buildEditPrompt(fixes: FixOptions): string {
  const instructions: string[] = [];

  if (fixes.fixEyeContact) {
    instructions.push("adjust the person's gaze so they are looking directly at the camera with natural, engaging eye contact");
  }

  if (fixes.improvePosture) {
    instructions.push("improve the person's posture to be more confident and upright with shoulders back");
  }

  if (fixes.adjustAngle) {
    instructions.push("adjust the photo angle to be more flattering, as if taken from slightly above eye level");
  }

  if (fixes.enhanceLighting) {
    instructions.push("enhance the lighting to be softer and more flattering with warm tones, reducing harsh shadows");
  }

  if (instructions.length === 0) {
    return "Enhance this portrait photo to look more professional while keeping the person's identity and appearance exactly the same.";
  }

  return `Edit this portrait photo: ${instructions.join(", ")}. Keep the person's identity, clothing, and background exactly the same. Make the edits look natural and photorealistic.`;
}

/**
 * Generate enhanced image variations using Gemini with image generation
 * Uses Gemini 2.0 Flash for image understanding and editing
 * 
 * NOTE: Currently using mock URLs while Gemini API integration is being configured.
 * TODO: Replace with actual Gemini/Imagen API calls once API access is confirmed.
 */
export async function generateImageVariations(
  originalImageBase64: string,
  fixes: FixOptions,
  numberOfVariations: number = 5
): Promise<string[]> {
  const results: string[] = [];

  try {
    // Simulate a small delay to mimic processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log("Generating mock variations for fixes:", fixes);
    console.log("Image size:", Math.round(originalImageBase64.length / 1024), "KB");

    // For now, return placeholder URLs
    // TODO: Integrate with actual Gemini/Imagen API when available
    for (let i = 0; i < numberOfVariations; i++) {
      // Create a unique seed for each variation
      const seed = `espresso-${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`;
      results.push(`https://picsum.photos/seed/${seed}/400/500`);
    }

    return results;
  } catch (error) {
    console.error("Error in generateImageVariations:", error);
    throw new Error("Failed to generate image variations");
  }
}

/**
 * Analyze image and return description
 */
export async function analyzeImage(imageBase64: string): Promise<string> {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this portrait photo and describe:
1. The person's appearance (hair, clothing, accessories)
2. The background and setting
3. The current pose and expression
4. Lighting conditions
5. Any issues with eye contact, posture, angle, or lighting

Be specific and detailed.`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ],
  });

  return result.response.text();
}

export { buildEditPrompt };
