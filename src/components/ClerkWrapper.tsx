"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { ReactNode } from 'react';

export default function ClerkWrapper({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
}
