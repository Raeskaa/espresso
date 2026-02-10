import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { uploadToSupabase } from '@/lib/imagen/utils';

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_AI_API_KEY environment variable');
  }
  return new GoogleGenerativeAI(apiKey);
}

interface PhotoCustomization {
  keepOriginalClothes: boolean;
  environment: string;
  lighting: string;
  style: string;
}

interface GenerationRequest {
  selfies: string[];
  references: string[];
  prompt: string;
  customization: PhotoCustomization;
  profileTone: string;
}

// Build a detailed prompt for dating photo generation
export function buildDatingPrompt(customization: PhotoCustomization, profileTone: string): string {
  const environmentDescriptions: Record<string, string> = {
    'keep': 'maintaining the original background',
    'outdoor': 'in a beautiful outdoor nature setting with trees, mountains, or a scenic park',
    'urban': 'in a stylish urban city environment with interesting architecture',
    'cafe': 'in a cozy, aesthetic coffee shop or restaurant with warm ambiance',
    'gym': 'in a modern gym or fitness setting showing an active lifestyle',
    'beach': 'at a beautiful beach or near water with natural sunlight',
    'travel': 'at an interesting travel destination or landmark',
  };

  const lightingDescriptions: Record<string, string> = {
    'natural': 'with natural, flattering daylight',
    'golden-hour': 'with warm golden hour lighting that creates a romantic glow',
    'studio': 'with professional studio lighting for a polished look',
    'moody': 'with moody, atmospheric lighting for an artistic vibe',
  };

  const styleDescriptions: Record<string, string> = {
    'casual': 'wearing stylish casual clothes',
    'smart-casual': 'dressed in smart casual attire',
    'formal': 'in elegant formal wear',
    'athletic': 'in athletic or fitness wear',
    'creative': 'in creative, artistic clothing',
  };

  const toneDescriptions: Record<string, string> = {
    'witty': 'with a playful, confident expression',
    'sincere': 'with a warm, genuine smile',
    'adventurous': 'with an energetic, adventurous vibe',
    'intellectual': 'with a thoughtful, intriguing expression',
    'laid-back': 'with a relaxed, easygoing demeanor',
  };

  const environment = environmentDescriptions[customization.environment] || environmentDescriptions['keep'];
  const lighting = lightingDescriptions[customization.lighting] || lightingDescriptions['natural'];
  const outfit = customization.keepOriginalClothes ? 'keeping their original clothing' : (styleDescriptions[customization.style] || '');
  const tone = toneDescriptions[profileTone] || toneDescriptions['sincere'];

  return `Create a stunning dating profile photo of this person ${environment}, ${lighting}. 
The person should be ${outfit}, ${tone}.

CRITICAL REQUIREMENTS:
- PRESERVE the person's exact face, facial features, skin tone, and identity
- The face must be clearly visible and not distorted
- Natural, photorealistic result that looks like an actual photo
- Flattering angles and composition suitable for a dating profile
- High quality, sharp focus on the face
- The person should look approachable and attractive

DO NOT:
- Change the person's fundamental facial features
- Create an obviously AI-generated or synthetic look
- Distort proportions or create uncanny appearances
- Make the person unrecognizable from the reference photos`;
}

// Analyze a generated image for quality
async function validateGeneratedPhoto(
  originalBase64: string,
  generatedBase64: string
): Promise<{ score: number; approved: boolean; feedback: string }> {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const response = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: originalBase64,
            },
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: generatedBase64,
            },
          },
          {
            text: `Compare these two images. The first is the original person, the second is a generated dating profile photo.

Score the generated photo on these criteria (0-100 each):
1. Identity Preservation: Does it look like the same person? Are facial features preserved?
2. Quality: Is it high quality, sharp, and photorealistic?
3. Attractiveness: Is it flattering for a dating profile?
4. Naturalness: Does it look like a real photo, not AI-generated?

Return ONLY a JSON object:
{
  "identityScore": <number>,
  "qualityScore": <number>,
  "attractivenessScore": <number>,
  "naturalnessScore": <number>,
  "overallScore": <number>,
  "approved": <boolean - true if overallScore >= 75>,
  "feedback": "<brief feedback>"
}`
          }
        ],
      }],
    });

    const text = response.response.text() || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        score: result.overallScore || 0,
        approved: result.approved || result.overallScore >= 90,
        feedback: result.feedback || '',
      };
    }
  } catch (error) {
    console.error('[Validation] Error:', error);
  }

  return { score: 70, approved: false, feedback: 'Validation failed' };
}

// Generate a single dating photo with quality check
async function generateSinglePhoto(
  selfieBase64: string,
  referenceBase64: string | null,
  prompt: string,
  maxRetries: number = 3
): Promise<{ base64: string; score: number; approved: boolean } | null> {
  const genAI = getGenAI();

  // Use Gemini 2.5 Flash Image (Nano Banana) for image generation
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-image',
    generationConfig: {
      // @ts-expect-error - responseModalities is supported but not in types yet
      responseModalities: ['image', 'text'],
    },
  });

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`[Dating] Generating photo (attempt ${attempt + 1}/${maxRetries})`);

      // Build the prompt text
      let promptText = prompt;
      if (referenceBase64) {
        promptText = `${prompt}\n\nUse the second image only as style/pose reference. Generate a NEW photo of the person from the first image with that style/pose. The face must be the person from the FIRST image.`;
      }

      // Build content with proper typing
      const contentParts = referenceBase64
        ? [
          { inlineData: { mimeType: 'image/jpeg', data: selfieBase64 } },
          { inlineData: { mimeType: 'image/jpeg', data: referenceBase64 } },
          { text: promptText },
        ]
        : [
          { inlineData: { mimeType: 'image/jpeg', data: selfieBase64 } },
          { text: promptText },
        ];

      const response = await model.generateContent({
        contents: [{
          role: 'user',
          parts: contentParts,
        }],
      });

      // Extract generated image
      let generatedBase64: string | null = null;
      const responseParts = response.response.candidates?.[0]?.content?.parts;
      if (responseParts) {
        for (const part of responseParts) {
          if ('inlineData' in part && part.inlineData?.data) {
            generatedBase64 = part.inlineData.data;
            break;
          }
        }
      }

      if (!generatedBase64) {
        console.log('[Dating] No image generated, retrying...');
        continue;
      }

      // Validate the generated photo
      const validation = await validateGeneratedPhoto(selfieBase64, generatedBase64);
      console.log(`[Dating] Validation: score=${validation.score}, approved=${validation.approved}`);

      if (validation.approved || attempt === maxRetries - 1) {
        return {
          base64: generatedBase64,
          score: validation.score,
          approved: validation.approved,
        };
      }

      console.log(`[Dating] Score too low (${validation.score}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`[Dating] Generation error (attempt ${attempt + 1}):`, error);
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: GenerationRequest = await request.json();
    const { selfies, references, customization, profileTone } = body;

    if (!selfies || selfies.length === 0) {
      return NextResponse.json({ error: 'No selfies provided' }, { status: 400 });
    }

    console.log('[Dating] Starting generation for user:', userId);
    console.log('[Dating] Selfies:', selfies.length, 'References:', references?.length || 0);

    const prompt = buildDatingPrompt(customization, profileTone);
    const photos: Array<{ url: string; prompt: string; score: number; approved: boolean }> = [];

    // Generate 5 variations
    const numberOfPhotos = 5;
    const primarySelfie = selfies[0];

    for (let i = 0; i < numberOfPhotos; i++) {
      console.log(`[Dating] Generating photo ${i + 1}/${numberOfPhotos}`);

      // Cycle through references if available
      const reference = references && references.length > 0
        ? references[i % references.length]
        : null;

      const result = await generateSinglePhoto(primarySelfie, reference, prompt, 3);

      if (result) {
        // Upload to Supabase
        try {
          const url = await uploadToSupabase(result.base64, userId, i);
          photos.push({
            url,
            prompt: `Photo ${i + 1}`,
            score: result.score,
            approved: result.approved,
          });

          // Save to history table
          try {
            const db = (await import('@/lib/db/index')).getDb();
            const { datingPhotoHistory } = await import('@/lib/db/schema');
            const { v4: uuidv4 } = await import('uuid');
            await db.insert(datingPhotoHistory).values({
              id: uuidv4(),
              userId,
              imageUrl: url,
              prompt: `Photo ${i + 1}`,
              customization,
              score: result.score,
              approved: result.approved ? 1 : 0,
              createdAt: new Date(),
            });
          } catch (dbError) {
            console.error('[Dating] Failed to save photo to history:', dbError);
          }
        } catch (uploadError) {
          console.error(`[Dating] Upload error for photo ${i + 1}:`, uploadError);
          // Return base64 as data URL if upload fails
          photos.push({
            url: `data:image/png;base64,${result.base64}`,
            prompt: `Photo ${i + 1}`,
            score: result.score,
            approved: result.approved,
          });
        }
      }

      // Small delay between generations
      if (i < numberOfPhotos - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[Dating] Generation complete: ${photos.length} photos`);

    return NextResponse.json({
      success: true,
      photos,
    });

  } catch (error) {
    console.error('[Dating] Fatal error:', error);
    return NextResponse.json(
      { error: 'Failed to generate photos' },
      { status: 500 }
    );
  }
}

export { generateSinglePhoto };
