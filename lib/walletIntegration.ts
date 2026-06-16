'use client';

import { PhantomProvider, MetaMaskProvider, WalletAdapterNetwork } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';

require('@solana/wallet-adapter-react-ui/styles.css');

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomProvider(),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} onError={() => {}}>
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  );
}

/**
 * Solana wallet integration
 */
export async function connectPhantom() {
  if (!window.solana) {
    throw new Error('Phantom wallet not installed');
  }

  try {
    const response = await window.solana.connect();
    return response.publicKey.toString();
  } catch (error) {
    console.error('Error connecting Phantom:', error);
    throw error;
  }
}

/**
 * Disconnect Phantom wallet
 */
export async function disconnectPhantom() {
  if (window.solana?.isConnected) {
    await window.solana.disconnect();
  }
}

/**
 * Check if Phantom is connected
 */
export function isPhantomConnected(): boolean {
  return window.solana?.isConnected || false;
}

/**
 * Get connected Phantom account
 */
export function getPhantomAccount(): string | null {
  return window.solana?.publicKey?.toString() || null;
}

/**
 * Sign transaction with Phantom
 */
export async function signTransactionWithPhantom(transaction: any) {
  if (!window.solana) {
    throw new Error('Phantom wallet not installed');
  }

  try {
    const signedTransaction = await window.solana.signTransaction(transaction);
    return signedTransaction;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}

/**
 * MetaMask wallet integration
 */
export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts[0];
  } catch (error) {
    console.error('Error connecting MetaMask:', error);
    throw error;
  }
}

/**
 * Get MetaMask account
 */
export async function getMetaMaskAccount(): Promise<string | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts[0] || null;
  } catch (error) {
    console.error('Error getting MetaMask account:', error);
    return null;
  }
}

/**
 * Sign transaction with MetaMask
 */
export async function signTransactionWithMetaMask(
  from: string,
  to: string,
  data: string,
  value: string = '0'
) {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to,
          data,
          value,
        },
      ],
    });
    return txHash;
  } catch (error) {
    console.error('Error signing transaction:', error);
    throw error;
  }
}

// Type declarations for wallet global objects
declare global {
  interface Window {
    solana?: {
      isConnected: boolean;
      publicKey: { toString(): string } | null;
      connect(): Promise<{ publicKey: { toString(): string } }>;
      disconnect(): Promise<void>;
      signTransaction(transaction: any): Promise<any>;
      signAllTransactions(transactions: any[]): Promise<any[]>;
      signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
    };
    ethereum?: any;
  }
}
