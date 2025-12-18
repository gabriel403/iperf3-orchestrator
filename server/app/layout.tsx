import React from "react";
import "./globals.css";

export const metadata = {
  title: "iperf Orchestrator",
  description: "Schedule and view distributed iperf3 tests"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">iperf Orchestrator</h1>
        </header>
        <main className="px-6 py-4 max-w-5xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
