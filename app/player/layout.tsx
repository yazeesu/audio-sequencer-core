import QueryClientProvider from "@/src/shared/components/query-client-provider";

export default function PlayerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <QueryClientProvider>{children}</QueryClientProvider>;
}
