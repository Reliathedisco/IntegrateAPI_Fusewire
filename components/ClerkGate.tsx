"use client";

import { ClerkProvider } from "@clerk/nextjs";
import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

const ClerkUiContext = createContext(false);

export function useClerkUiEnabled(): boolean {
  return useContext(ClerkUiContext);
}

type Props = {
  children: ReactNode;
  /** When false, children render without ClerkProvider (no remote Clerk on this host). */
  enabled: boolean;
  publishableKey?: string;
};

export function ClerkGate({ children, enabled, publishableKey }: Props) {
  if (!enabled || !publishableKey) {
    return (
      <ClerkUiContext.Provider value={false}>{children}</ClerkUiContext.Provider>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <ClerkUiContext.Provider value={true}>
        {children}
      </ClerkUiContext.Provider>
    </ClerkProvider>
  );
}
