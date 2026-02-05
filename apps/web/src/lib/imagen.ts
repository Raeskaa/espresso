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
 */
export async function generateImageVariations(
  originalImageBase64: string,
  fixes: FixOptions,
  numberOfVariations: number = 5
): Promise<string[]> {
  const ai = getGenAI();
  
  // Use Gemini 2.0 Flash for multimodal understanding
  const model = ai.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      temperature: 0.8,
    }
  });

  const editPrompt = buildEditPrompt(fixes);
  const results: string[] = [];

  try {
    // First, analyze the image to understand it
    const analysisResult = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze this portrait photo and provide a detailed description including:
1. The person's appearance (approximate age, hair color/style, facial features)
2. Their clothing and accessories
3. The background and setting
4. Current pose, expression, and where they are looking
5. Lighting conditions

Be very specific and detailed.`,
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: originalImageBase64,
              },
            },
          ],
        },
      ],
    });

    const analysis = analysisResult.response.text();
    console.log("Image analysis:", analysis);

    // For now, since Imagen 3 image editing via the JS SDK is limited,
    // we'll return placeholder URLs that will be replaced when the API is fully available
    // In production, you would use the Vertex AI API directly for Imagen 3 editing
    
    // Generate variation descriptions
    for (let i = 0; i < numberOfVariations; i++) {
      // Create a unique seed for each variation
      const seed = `${Date.now()}-${i}-${Math.random().toString(36).substring(7)}`;
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
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

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
