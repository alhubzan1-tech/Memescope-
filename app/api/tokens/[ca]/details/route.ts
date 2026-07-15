// Backend API Routes - Token Details
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/services';

/**
 * GET /api/tokens/[ca]/details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ca: string } }
) {
  try {
    const chainId = new URL(request.url).searchParams.get('chain') || 'solana';
    const details = await TokenService.getTokenDetails(params.ca, chainId);
    return NextResponse.json(details);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
