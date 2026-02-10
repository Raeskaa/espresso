import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db/index';
import { datingPhotoHistory } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const history = await db
      .select()
      .from(datingPhotoHistory)
      .where(eq(datingPhotoHistory.userId, userId))
      .orderBy(desc(datingPhotoHistory.createdAt));

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[History] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
