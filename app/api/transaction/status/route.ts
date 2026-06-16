import { NextResponse } from 'next/server';
import { getSolanaTransactionStatus } from '@/lib/realApi';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const txHash = searchParams.get('txHash');
    const rpc = searchParams.get('rpc');

    if (!txHash) {
      return NextResponse.json(
        { error: 'Missing txHash parameter' },
        { status: 400 }
      );
    }

    const status = await getSolanaTransactionStatus(txHash, rpc || undefined);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
