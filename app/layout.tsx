import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yanpeng Qi — AI Builder & SDE",
  description: "Software Development Engineer at Amazon. Building AI systems with RAG, multi-agent orchestration, and LLM integrations at scale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
