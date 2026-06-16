import { NextResponse } from 'next/server';
import { getJupiterQuote, formatTokenAmount } from '@/lib/realApi';

export async function POST(req: Request) {
  try {
    const { inputMint, outputMint, amount, slippageBps } = await req.json();

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const quote = await getJupiterQuote({
      inputMint,
      outputMint,
      amount,
      slippageBps: slippageBps || 100,
    });

    return NextResponse.json(quote);
  } catch (error: any) {
    console.error('Quote error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
