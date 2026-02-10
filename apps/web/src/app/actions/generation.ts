'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb, users, generations, creditTransactions, datingPhotoHistory } from '@espresso/db';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@/lib/supabase';
import { generateImageVariations } from '@/lib/imagen';
import { analyze } from '@/lib/imagen/analyzer';
import { getDefaultTemplate } from '@/lib/imagen/templates';
import { generateDatingProfilePhotos } from '@/lib/imagen/dating-studio';
import type { FixOptions } from '@espresso/utils';
import type { PipelineProgress, VariationResult, FixSelection } from '@/lib/imagen';
import type { AnalysisResult } from '@/lib/imagen/types';

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get or create user in database
async function getOrCreateUser(clerkUserId: string): Promise<typeof users.$inferSelect> {
  const db = getDb();

  // Try to find existing user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUserId),
  });

  if (existingUser) {
    return existingUser;
  }

  // Get user email from Clerk
  const clerkUser = await currentUser();
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@espresso.app`;

  // Create new user with 3 free credits
  const [newUser] = await db.insert(users).values({
    id: clerkUserId,
    email,
    credits: 3,
    subscriptionTier: 'free',
  }).returning();

  return newUser;
}

export async function createGeneration(
  imageBase64: string,
  fixes: FixOptions
): Promise<{ success: boolean; generationId?: string; error?: string; creditsRemaining?: number }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const db = getDb();
    const user = await getOrCreateUser(userId);

    // Check credits
    if (user.credits <= 0) {
      return { success: false, error: 'Insufficient credits. Please purchase more credits to continue.' };
    }

    const generationId = generateId('gen');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    // Upload original image to Supabase Storage
    const supabase = createServerClient();
    const imagePath = `originals/${userId}/${generationId}.jpg`;

    // Decode base64 and upload
    const imageBuffer = Buffer.from(imageBase64, 'base64');
    const { error: uploadError } = await supabase.storage
      .from('generations')
      .upload(imagePath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // Continue anyway, we'll use a placeholder URL
    }

    const originalImageUrl = uploadError
      ? `data:image/jpeg;base64,${imageBase64.substring(0, 100)}...`
      : supabase.storage.from('generations').getPublicUrl(imagePath).data.publicUrl;

    // Create generation record
    await db.insert(generations).values({
      id: generationId,
      userId,
      originalImageUrl,
      generatedImageUrls: [],
      fixEyeContact: fixes.fixEyeContact,
      improvePosture: fixes.improvePosture,
      adjustAngle: fixes.adjustAngle,
      enhanceLighting: fixes.enhanceLighting,
      status: 'processing',
      expiresAt,
    });

    // Deduct credit
    await db.update(users)
      .set({ credits: user.credits - 1, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Record credit transaction
    await db.insert(creditTransactions).values({
      id: generateId('txn'),
      userId,
      amount: -1,
      reason: 'generation',
      generationId,
    });

    // Generate images asynchronously (in background)
    processGeneration(generationId, imageBase64, fixes, userId).catch(console.error);

    return {
      success: true,
      generationId,
      creditsRemaining: user.credits - 1,
    };
  } catch (error) {
    console.error('Error creating generation:', error);
    return { success: false, error: 'Failed to create generation. Please try again.' };
  }
}

// Background processing function
async function processGeneration(generationId: string, imageBase64: string, fixes: FixOptions, userId: string) {
  const db = getDb();

  try {
    // Progress callback to save real-time updates to database
    const onProgress = async (progress: PipelineProgress): Promise<void> => {
      await db.update(generations)
        .set({
          pipelineStage: progress.stage,
          pipelineProgress: progress as unknown as Record<string, unknown>,
        })
        .where(eq(generations.id, generationId));
    };

    // Convert boolean FixOptions to FixSelection array for sequential pipeline
    const fixSelections: FixSelection[] = [
      { editType: 'eyeContact', enabled: fixes.fixEyeContact, template: getDefaultTemplate('eyeContact') },
      { editType: 'posture', enabled: fixes.improvePosture, template: getDefaultTemplate('posture') },
      { editType: 'angle', enabled: fixes.adjustAngle, template: getDefaultTemplate('angle') },
      { editType: 'lighting', enabled: fixes.enhanceLighting, template: getDefaultTemplate('lighting') },
    ];

    // Generate image variations using the new agentic pipeline
    const result = await generateImageVariations({
      originalImageBase64: imageBase64,
      fixes,
      fixSelections,
      userId,
      generationId,
      onProgress,
    });

    // Extract successful image URLs from variations
    const generatedUrls = result.variations
      .filter((v: VariationResult) => v.success && v.imageUrl)
      .map((v: VariationResult) => v.imageUrl as string);

    // Update generation with results
    await db.update(generations)
      .set({
        generatedImageUrls: generatedUrls,
        variationResults: result.variations as unknown as Record<string, unknown>[],
        pipelineStage: result.success ? 'complete' : 'failed',
        status: result.success ? 'completed' : 'failed',
        errorMessage: result.success ? null : 'No successful variations generated',
      })
      .where(eq(generations.id, generationId));
  } catch (error) {
    console.error('Error processing generation:', error);

    // Mark as failed
    await db.update(generations)
      .set({
        status: 'failed',
        pipelineStage: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(generations.id, generationId));
  }
}

export async function getGeneration(id: string) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const db = getDb();
    const generation = await db.query.generations.findFirst({
      where: eq(generations.id, id),
    });

    if (!generation || generation.userId !== userId) {
      return null;
    }

    return {
      id: generation.id,
      originalImageUrl: generation.originalImageUrl,
      generatedImageUrls: generation.generatedImageUrls || [],
      fixes: {
        fixEyeContact: generation.fixEyeContact,
        improvePosture: generation.improvePosture,
        adjustAngle: generation.adjustAngle,
        enhanceLighting: generation.enhanceLighting,
      },
      status: generation.status,
      pipelineStage: generation.pipelineStage,
      pipelineProgress: generation.pipelineProgress as PipelineProgress | null,
      variationResults: generation.variationResults as VariationResult[] | null,
      errorMessage: generation.errorMessage,
      createdAt: generation.createdAt,
    };
  } catch (error) {
    console.error('Error getting generation:', error);
    return null;
  }
}

export async function getCredits() {
  const { userId } = await auth();

  if (!userId) {
    return 0;
  }

  try {
    const user = await getOrCreateUser(userId);
    return user.credits;
  } catch (error) {
    console.error('Error getting credits:', error);
    return 0;
  }
}

export async function getUserGenerations() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const db = getDb();
    const userGenerations = await db.query.generations.findMany({
      where: eq(generations.userId, userId),
      orderBy: (generations, { desc }) => [desc(generations.createdAt)],
      limit: 20,
    });

    return userGenerations.map(g => ({
      id: g.id,
      originalImageUrl: g.originalImageUrl,
      generatedImageUrls: g.generatedImageUrls || [],
      status: g.status,
      createdAt: g.createdAt,
    }));
  } catch (error) {
    console.error('Error getting user generations:', error);
    return [];
  }
}

// Analyze an image without starting a generation
export async function analyzeImage(imageBase64: string): Promise<{
  success: boolean;
  analysis?: AnalysisResult;
  error?: string;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const analysis = await analyze(imageBase64);
    return { success: true, analysis };
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed'
    };
  }
}

// Dating Studio generation
export async function createDatingProfileGeneration(
  selfies: string[], // Array of base64 images
  references: string[], // Array of base64 reference images
  targetApp: string
): Promise<{ success: boolean; generationId?: string; error?: string; creditsRemaining?: number }> {
  const { userId } = await auth();

  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const db = getDb();
    const user = await getOrCreateUser(userId);

    // Dating studio costs 5 credits
    const creditCost = 5;

    if (user.credits < creditCost) {
      return { success: false, error: `Insufficient credits. Dating Profile Studio requires ${creditCost} credits.` };
    }

    const generationId = generateId('dating');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Upload selfies to Supabase Storage
    const supabase = createServerClient();
    const uploadedSelfieUrls: string[] = [];

    for (let i = 0; i < selfies.length; i++) {
      const imagePath = `dating/${userId}/${generationId}/selfie_${i}.jpg`;
      const imageBuffer = Buffer.from(selfies[i], 'base64');

      const { error: uploadError } = await supabase.storage
        .from('generations')
        .upload(imagePath, imageBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadError) {
        const url = supabase.storage.from('generations').getPublicUrl(imagePath).data.publicUrl;
        uploadedSelfieUrls.push(url);
      }
    }

    // Create generation record
    await db.insert(generations).values({
      id: generationId,
      userId,
      originalImageUrl: uploadedSelfieUrls[0] || '',
      generatedImageUrls: [],
      status: 'processing',
      pipelineStage: 'analyzing',
      expiresAt,
      // Store dating studio metadata in pipeline progress
      pipelineProgress: {
        type: 'dating_studio',
        targetApp,
        selfieCount: selfies.length,
        referenceCount: references.length,
        stage: 'analyzing',
        message: 'Analyzing your photos...',
      } as unknown as Record<string, unknown>,
    });

    // Deduct credits
    await db.update(users)
      .set({ credits: user.credits - creditCost, updatedAt: new Date() })
      .where(eq(users.id, userId));

    // Record credit transaction
    await db.insert(creditTransactions).values({
      id: generateId('txn'),
      userId,
      amount: -creditCost,
      reason: 'dating_studio',
      generationId,
    });

    // Process in background
    processDatingGeneration(generationId, selfies, references, targetApp, userId).catch(console.error);

    return {
      success: true,
      generationId,
      creditsRemaining: user.credits - creditCost,
    };
  } catch (error) {
    console.error('Error creating dating profile generation:', error);
    return { success: false, error: 'Failed to create generation. Please try again.' };
  }
}

// Background processing for dating studio
async function processDatingGeneration(
  generationId: string,
  selfies: string[],
  references: string[],
  targetApp: string,
  userId: string
) {
  const db = getDb();
  const supabase = createServerClient();

  try {
    // Update progress - analyzing
    await db.update(generations)
      .set({
        pipelineStage: 'analyzing',
        pipelineProgress: {
          type: 'dating_studio',
          targetApp,
          stage: 'analyzing',
          message: 'Analyzing your photos and inspiration images...',
          progress: 10,
        } as unknown as Record<string, unknown>,
      })
      .where(eq(generations.id, generationId));

    // Update progress - generating
    await db.update(generations)
      .set({
        pipelineStage: 'generating',
        pipelineProgress: {
          type: 'dating_studio',
          targetApp,
          stage: 'generating',
          message: 'Creating your dating profile photos with AI...',
          progress: 30,
        } as unknown as Record<string, unknown>,
      })
      .where(eq(generations.id, generationId));

    // Use the new dating studio module to generate photos
    console.log('[Dating Generation] Starting with', selfies.length, 'selfies and', references.length, 'references');

    const result = await generateDatingProfilePhotos(selfies, references, 4);

    console.log('[Dating Generation] Result:', result.imageUrls.length, 'images,', result.errors.length, 'errors');

    // Upload generated images to Supabase and get URLs
    const uploadedUrls: string[] = [];

    for (let i = 0; i < result.imageUrls.length; i++) {
      const dataUrl = result.imageUrls[i];
      const base64Data = dataUrl.split(',')[1];

      if (base64Data) {
        const imagePath = `dating/${userId}/${generationId}/generated_${i}.png`;
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('generations')
          .upload(imagePath, imageBuffer, {
            contentType: 'image/png',
            upsert: true,
          });

        if (!uploadError) {
          const url = supabase.storage.from('generations').getPublicUrl(imagePath).data.publicUrl;
          uploadedUrls.push(url);

          // Save to dating photo history
          try {
            await db.insert(datingPhotoHistory).values({
              id: generateId('dating_photo'),
              userId,
              imageUrl: url,
              prompt: `Dating Studio - ${targetApp}`,
              customization: { targetApp } as unknown as Record<string, unknown>,
              score: 0,
              approved: 1,
              createdAt: new Date(),
            });
          } catch (historyError) {
            console.error('[Dating Generation] Failed to save to history:', historyError);
          }
        } else {
          console.error('Upload error:', uploadError);
          // Still use the data URL as fallback
          uploadedUrls.push(dataUrl);
        }
      }

      // Update progress
      await db.update(generations)
        .set({
          pipelineProgress: {
            type: 'dating_studio',
            targetApp,
            stage: 'generating',
            message: `Generated ${i + 1}/${result.imageUrls.length} photos...`,
            progress: 30 + ((i + 1) / result.imageUrls.length) * 60,
          } as unknown as Record<string, unknown>,
        })
        .where(eq(generations.id, generationId));
    }

    // Update generation with results
    await db.update(generations)
      .set({
        generatedImageUrls: uploadedUrls,
        pipelineStage: uploadedUrls.length > 0 ? 'complete' : 'failed',
        status: uploadedUrls.length > 0 ? 'completed' : 'failed',
        pipelineProgress: {
          type: 'dating_studio',
          targetApp,
          stage: 'complete',
          message: uploadedUrls.length > 0
            ? `Generated ${uploadedUrls.length} dating profile photos!`
            : 'Generation failed',
          progress: 100,
          errors: result.errors,
        } as unknown as Record<string, unknown>,
        errorMessage: uploadedUrls.length > 0 ? null : result.errors.join(', ') || 'No photos could be generated',
      })
      .where(eq(generations.id, generationId));

  } catch (error) {
    console.error('Error processing dating generation:', error);

    await db.update(generations)
      .set({
        status: 'failed',
        pipelineStage: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(generations.id, generationId));
  }
}
