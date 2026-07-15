// Backend API Routes - Swap Quote
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SwapService } from '@/lib/services';

/**
 * GET /api/quote
 * Get swap quote from Jupiter or 1inch
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const inputMint = url.searchParams.get('inputMint');
    const outputMint = url.searchParams.get('outputMint');
    const amount = url.searchParams.get('amount');
    const chain = url.searchParams.get('chain') || 'solana';

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing parameters' },
        { status: 400 }
      );
    }

    if (chain === 'solana') {
      const quote = await SwapService.getJupiterQuote(
        inputMint,
        outputMint,
        parseInt(amount)
      );
      return NextResponse.json(quote);
    } else {
      // For EVM chains, use 1inch
      const quote = await SwapService.get1inchQuote(
        inputMint,
        outputMint,
        amount,
        1 // Ethereum
      );
      return NextResponse.json(quote);
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
