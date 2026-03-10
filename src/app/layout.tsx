import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";

export const metadata: Metadata = {
  title: "DUFOGEN | Ladder and Snake Expedition",
  description: "A premium clinical pathway journey for healthcare professionals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden bg-[#0f172a]">
        <div className="h-screen flex flex-col overflow-hidden relative">
          {/* Simplified Background */}
          <div className="fixed inset-0 z-0 bg-primary-dark">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#4a148c_0%,transparent_50%)] opacity-40" />
          </div>

          <header className="glass shrink-0 w-full z-50 px-6 py-3 flex justify-between items-center border-b border-white/5 relative bg-black/20">
            <div className="flex items-center gap-4">
              <Image
                src="/logo.png"
                alt="DUFOGEN Logo"
                width={120}
                height={38}
                className="img-contain"
                priority
              />
            </div>
            <div className="hidden md:flex gap-6 items-center">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Clinical Portal</span>
              <div className="w-[1px] h-4 bg-white/10" />
              <div className="text-xs font-bold tracking-tight text-gradient-gold">
                EXPEDITION SYSTEM v2.0
              </div>
            </div>
          </header>

          <main className="flex-1 min-h-0 relative z-10 overflow-hidden">
            <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>

          <footer className="shrink-0 glass border-t border-white/10 py-2 px-8 flex justify-between items-center bg-black/60 relative z-40">
            <div className="flex items-center gap-4">
              <Image
                src="/martindowlogo.png"
                alt="Martindow Logo"
                width={90}
                height={28}
                className="img-contain opacity-70"
              />
              <div className="hidden sm:block">
                <div className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">
                  Scientific Innovation Group
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <p className="text-[10px] font-bold text-gradient-gold tracking-wider">
                Developed by Softsols - Digital AI Solution
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
