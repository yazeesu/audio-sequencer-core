"use client";

import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export default function QueryClientProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TanstackQueryClientProvider client={queryClient}>
      {children}
    </TanstackQueryClientProvider>
  );
}
