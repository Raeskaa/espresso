import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db/index';
import { datingPhotoHistory } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, prompt, customization, score, approved } = body;
    const db = getDb();
    await db.insert(datingPhotoHistory).values({
      id: `${userId}-${Date.now()}`,
      userId,
      imageUrl,
      prompt,
      customization,
      score,
      approved: approved ? 1 : 0,
      createdAt: new Date(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[SaveHistory] Error:', error);
    return NextResponse.json({ error: 'Failed to save history' }, { status: 500 });
  }
}
