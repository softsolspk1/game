"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, ShieldCheck } from "lucide-react";

export default function Home() {
  const [playerCount, setPlayerCount] = useState(2);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    router.push(`/game/setup`);
  };

  if (!verified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center animate-in fade-in duration-1000">
        <div className="space-y-4">
          <ShieldCheck size={64} className="text-accent-gold mx-auto mb-4 animate-float" />
          <h1 className="text-4xl md:text-5xl font-black text-gradient-gold">Professional Access Required</h1>
          <p className="max-w-xl text-zinc-400 leading-relaxed mx-auto italic">
            "This educational experience is designed for registered medical professionals only.
            Clinical scenarios are simulated for learning purposes and do not replace clinical judgment."
          </p>
        </div>

        <button
          onClick={() => setVerified(true)}
          className="button-premium px-16 py-4 text-xl"
        >
          ENTER EXPERIENCE
        </button>

        <div className="text-[10px] text-zinc-500 uppercase tracking-[0.5em] font-black opacity-30">
          Secure Professional Gateway
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-4 relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-accent-gold to-transparent opacity-50" />
        <h1 className="text-7xl md:text-9xl font-extrabold tracking-tighter text-gradient-gold female-glow">
          DUFOGEN
        </h1>
        <h2 className="text-xl md:text-2xl font-light tracking-[0.4em] text-accent-pink uppercase pl-4">
          Ladder & Snake Expedition
        </h2>
      </div>

      <div className="glass p-10 md:p-16 max-w-3xl w-full flex flex-col gap-12 glow-magenta relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-magenta to-accent-gold opacity-30" />

        <div className="space-y-2">
          <h3 className="text-2xl font-semibold tracking-tight">Select Participant Teams</h3>
          <p className="text-zinc-400 text-sm">Organize medical teams for this clinical simulation</p>
        </div>

        <div className="flex justify-center gap-6 md:gap-10">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setPlayerCount(count)}
              className={`group relative w-16 h-16 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 border overflow-hidden ${playerCount === count
                ? "border-accent-gold bg-accent-magenta/20 glow-gold scale-110"
                : "border-glass-border hover:border-accent-pink/40 bg-zinc-900/40"
                }`}
            >
              <Users size={32} className={`transition-colors duration-300 ${playerCount === count ? "text-accent-gold" : "text-zinc-500 group-hover:text-zinc-300"}`} />
              <span className={`text-[10px] mt-2 font-black tracking-widest ${playerCount === count ? "text-accent-gold" : "text-zinc-600"}`}>
                {count} TEAMS
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="button-premium w-full max-w-sm mx-auto flex items-center justify-center gap-4 text-lg"
        >
          <span>INITIATE CASE STUDY</span>
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-4 pt-12">
        <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase">
          Evidence-Based Journey to Stability
        </p>
      </div>
    </div>
  );
}
