import { NextResponse } from 'next/server';
import { getTrendingTokens } from '@/lib/realApi';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const chain = searchParams.get('chain') || 'solana';

    const tokens = await getTrendingTokens(limit, chain);
    return NextResponse.json(tokens);
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
