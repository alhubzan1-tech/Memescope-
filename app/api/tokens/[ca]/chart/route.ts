// Backend API Routes - Charts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TokenService } from '@/lib/services';

/**
 * GET /api/tokens/[ca]/chart
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { ca: string } }
) {
  try {
    const url = new URL(request.url);
    const timeframe = (url.searchParams.get('timeframe') || '1h') as '1m' | '5m' | '1h' | '4h' | '1d';
    const chainId = url.searchParams.get('chain') || 'solana';
    
    const chart = await TokenService.getTokenChart(params.ca, timeframe, chainId);
    return NextResponse.json(chart);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
