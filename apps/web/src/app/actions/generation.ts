'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb, users, generations, creditTransactions } from '@espresso/db';
import { eq } from 'drizzle-orm';
import { createServerClient } from '@/lib/supabase';
import { generateImageVariations } from '@/lib/imagen';
import type { FixOptions } from '@espresso/utils';

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
    // For now, we simulate with mock images after a delay
    processGeneration(generationId, imageBase64, fixes).catch(console.error);

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
async function processGeneration(generationId: string, imageBase64: string, fixes: FixOptions) {
  const db = getDb();
  
  try {
    // Generate image variations
    const generatedUrls = await generateImageVariations(imageBase64, fixes, 5);

    // Update generation with results
    await db.update(generations)
      .set({
        generatedImageUrls: generatedUrls,
        status: 'completed',
      })
      .where(eq(generations.id, generationId));
  } catch (error) {
    console.error('Error processing generation:', error);
    
    // Mark as failed
    await db.update(generations)
      .set({
        status: 'failed',
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
