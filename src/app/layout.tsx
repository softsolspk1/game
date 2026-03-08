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
      <body className="antialiased">
        {/* Simplified Background */}
        <div className="fixed inset-0 z-0 bg-primary-dark">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,#4a148c_0%,transparent_50%)] opacity-40" />
        </div>

        <header className="glass fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="DUFOGEN Logo"
              width={140}
              height={44}
              className="img-contain"
              priority
            />
          </div>
          <div className="hidden md:flex gap-6 items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Clinical Portal</span>
            <div className="w-[1px] h-4 bg-white/10" />
            <div className="text-sm font-bold tracking-tight text-gradient-gold">
              EXPEDITION SYSTEM v2.0
            </div>
          </div>
        </header>

        <main className="relative z-10 pt-24 pb-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <footer className="glass border-t border-white/5 py-4 px-8 flex justify-between items-center bg-black/50 relative z-40">
          <div className="flex items-center gap-4">
            <Image
              src="/martindowlogo.png"
              alt="Martindow Logo"
              width={100}
              height={32}
              className="img-contain"
            />
            <div className="hidden sm:block text-[9px] text-zinc-500 uppercase tracking-tighter">
              Creating Distinction for Life
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
            © 2026 DUFOGEN CLINICAL PATHWAYS
          </p>
        </footer>
      </body>
    </html>
  );
}
