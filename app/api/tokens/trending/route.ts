// Backend API Routes - Tokens
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/services';

/**
 * GET /api/tokens/trending
 * Get trending tokens
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const chain = searchParams.get('chain') || 'solana';

    const tokens = await TokenService.getTrendingTokens(limit, chain);
    return NextResponse.json(tokens);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
