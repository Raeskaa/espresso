import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FixOptions } from "@espresso/utils";

const apiKey = process.env.GOOGLE_AI_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_AI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Imagen 3 model for image generation
const imagenModel = genAI.getGenerativeModel({
  model: "imagen-3.0-generate-002",
});

/**
 * Build a prompt based on the fix options selected by the user
 */
function buildPrompt(fixes: FixOptions, description?: string): string {
  const parts: string[] = [];

  // Base description
  parts.push("Generate a professional, high-quality portrait photo of a person.");

  // Add fix-specific instructions
  if (fixes.fixEyeContact) {
    parts.push(
      "The person should be looking directly at the camera with natural, engaging eye contact. Eyes should be open and alert."
    );
  }

  if (fixes.improvePosture) {
    parts.push(
      "The person should have confident, upright posture with shoulders back and chin slightly raised. Natural and relaxed body language."
    );
  }

  if (fixes.adjustAngle) {
    parts.push(
      "The photo should be taken from a flattering angle, slightly above eye level. The face should be well-proportioned in the frame."
    );
  }

  if (fixes.enhanceLighting) {
    parts.push(
      "Use soft, warm golden hour lighting that flatters skin tones. Avoid harsh shadows. The lighting should feel natural and inviting."
    );
  }

  // Additional context if provided
  if (description) {
    parts.push(`Additional context: ${description}`);
  }

  // Quality instructions
  parts.push(
    "The image should be photorealistic, high resolution, with natural colors and professional quality suitable for social media profiles."
  );

  return parts.join(" ");
}

/**
 * Generate image variations using Imagen 3
 */
export async function generateImageVariations(
  originalImageBase64: string,
  fixes: FixOptions,
  numberOfVariations: number = 5
): Promise<string[]> {
  const prompt = buildPrompt(fixes);

  try {
    const results: string[] = [];

    // Generate multiple variations
    // Note: Imagen 3 API may have specific parameters - adjust as needed
    for (let i = 0; i < numberOfVariations; i++) {
      const result = await imagenModel.generateContent({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt,
              },
              // Include reference image if the model supports it
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

      const response = result.response;
      
      // Extract generated image data
      // Note: This structure may vary based on actual API response
      if (response.candidates && response.candidates[0]) {
        const candidate = response.candidates[0];
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              results.push(part.inlineData.data);
            }
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error("Failed to generate image variations");
  }
}

/**
 * Alternative: Use Gemini for image understanding + Imagen for generation
 * This approach analyzes the original image first, then generates based on that
 */
export async function analyzeAndGenerate(
  imageBase64: string,
  fixes: FixOptions
): Promise<{ analysis: string; generatedImages: string[] }> {
  // Use Gemini to analyze the original image
  const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const analysisResult = await geminiModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this portrait photo and describe:
1. The person's appearance (hair color, clothing, accessories)
2. The background and setting
3. The current pose and expression
4. Lighting conditions

Be specific and detailed so this description can be used to recreate a similar image with improvements.`,
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

  const analysis = analysisResult.response.text();

  // Build enhanced prompt using the analysis
  const enhancedPrompt = buildPrompt(fixes, analysis);

  // Generate variations using Imagen
  const generatedImages = await generateWithPrompt(enhancedPrompt);

  return {
    analysis,
    generatedImages,
  };
}

/**
 * Generate images with a specific prompt
 */
async function generateWithPrompt(prompt: string): Promise<string[]> {
  try {
    const result = await imagenModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const images: string[] = [];
    const response = result.response;

    if (response.candidates) {
      for (const candidate of response.candidates) {
        if (candidate.content?.parts) {
          for (const part of candidate.content.parts) {
            if ("inlineData" in part && part.inlineData?.data) {
              images.push(part.inlineData.data);
            }
          }
        }
      }
    }

    return images;
  } catch (error) {
    console.error("Error generating with prompt:", error);
    throw error;
  }
}

export { buildPrompt };
