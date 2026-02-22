import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getDb, users, generations } from "@espresso/db";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();

    // Load user and generations in parallel
    const [userRows, userGenerations] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.query.generations.findMany({
        where: eq(generations.userId, userId),
        orderBy: (generations, { desc }) => [desc(generations.createdAt)],
        limit: 20,
      }),
    ]);

    const dbUser = userRows[0];

    return NextResponse.json({
      credits: dbUser?.credits ?? 0,
      subscriptionTier: dbUser?.subscriptionTier ?? "free",
      generations: userGenerations.map((g) => ({
        id: g.id,
        originalImageUrl: g.originalImageUrl,
        generatedImageUrls: g.generatedImageUrls ?? [],
        status: g.status,
        createdAt: g.createdAt,
      })),
    });
  } catch (error) {
    console.error("[mobile/generations] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
