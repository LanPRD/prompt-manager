import "@/styles/globals.css";

import { Sidebar } from "@/components/sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

export const metadata: Metadata = {
  title: "Prompt Manager",
  description: "Prompt Manager helps you manage prompts."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-gray-900 text-white`}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="relative flex-1 overflow-auto min-w-0">
            <div className="p-4 sm:p-6 md:p-5 max-w-full md:max-w-3xl mx-auto h-full">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
