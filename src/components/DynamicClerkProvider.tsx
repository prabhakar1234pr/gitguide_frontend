"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const ClerkProvider = dynamic(
  () => import('@clerk/nextjs').then(mod => ({ default: mod.ClerkProvider })),
  { 
    ssr: false,
    loading: () => <div>Loading...</div>
  }
);

export default function DynamicClerkProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
