import { NextRequest, NextResponse } from 'next/server';

// This is a stub status endpoint for job polling. Always returns 404 (not found) for now.
// You can extend this to check job status from a store or queue if you implement async jobs.

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  // Optionally: check a job store or queue for status by id
  return NextResponse.json({ status: 'not_found', id }, { status: 404 });
}
