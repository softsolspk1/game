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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-12 text-center animate-in fade-in duration-1000 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-magenta/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="space-y-6 relative z-10">
          <div className="relative inline-block">
            <ShieldCheck size={80} className="text-accent-gold mx-auto mb-4 animate-float" />
            <div className="absolute inset-0 bg-accent-gold/20 blur-2xl rounded-full scale-150 -z-10 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gradient-gold tracking-tight italic">
            Professional Authorization
          </h1>
          <p className="max-w-2xl text-zinc-400 leading-relaxed mx-auto text-lg font-light">
            "This educational experience is <span className="text-white font-medium">exclusive to registered medical professionals</span>.
            Clinical scenarios are simulated for advanced medical learning and do not supersede professional clinical judgment."
          </p>
        </div>

        <button
          onClick={() => setVerified(true)}
          className="button-premium px-24 py-6 text-2xl group"
        >
          <span>ENTER EXPERIENCE</span>
          <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
        </button>

        <div className="flex items-center gap-4 opacity-50">
          <div className="h-px w-12 bg-white/20" />
          <div className="text-[10px] text-zinc-500 uppercase tracking-[1em] font-black">
            Secured Gateway
          </div>
          <div className="h-px w-12 bg-white/20" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-20 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
      <div className="space-y-6 relative">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-1.5 bg-gradient-to-r from-transparent via-accent-gold to-transparent opacity-60 rounded-full" />
        <h1 className="text-8xl md:text-11xl font-black tracking-tighter text-gradient-gold female-glow italic uppercase leading-none">
          DUFOGEN
        </h1>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3xl font-extralight tracking-[0.5em] text-accent-pink uppercase pl-4">
            Ladder & Snake Expedition
          </h2>
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-accent-pink/50 to-transparent mx-auto mt-2" />
        </div>
      </div>

      <div className="glass p-12 md:p-20 max-w-4xl w-full flex flex-col gap-16 glow-magenta relative overflow-hidden group border-t-2 border-white/5">
        {/* Animated Highlight */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent-magenta/10 blur-3xl rounded-full group-hover:bg-accent-magenta/20 transition-all duration-700" />

        <div className="space-y-3 relative z-10">
          <h3 className="text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-4">
            <Users size={28} className="text-accent-pink" />
            Select Participant Teams
          </h3>
          <p className="text-zinc-400 text-lg font-light italic">Organize professional medical teams for this clinical journey</p>
        </div>

        <div className="flex justify-center gap-8 md:gap-12 relative z-10">
          {[2, 3, 4].map((count) => (
            <button
              key={count}
              onClick={() => setPlayerCount(count)}
              className={`group relative w-20 h-20 md:w-28 md:h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 border-2 overflow-hidden ${playerCount === count
                ? "border-accent-gold bg-accent-magenta/20 scale-110 shadow-[0_0_40px_rgba(251,191,36,0.2)]"
                : "border-white/5 hover:border-accent-pink/30 bg-white/5"
                }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
              <Users size={36} className={`transition-all duration-300 relative z-10 ${playerCount === count ? "text-accent-gold scale-110" : "text-zinc-600 group-hover:text-zinc-300"}`} />
              <span className={`text-[11px] mt-3 font-black tracking-widest relative z-10 ${playerCount === count ? "text-accent-gold" : "text-zinc-500"}`}>
                {count} TEAMS
              </span>

              {playerCount === count && (
                <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold animate-progress" />
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleStart}
          className="button-premium w-full max-w-md mx-auto flex items-center justify-center gap-6 text-2xl py-6 rounded-2xl group shadow-2xl relative z-10"
        >
          <span className="italic font-black tracking-widest">INITIATE CASE STUDY</span>
          <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
            <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
          </div>
        </button>
      </div>

      <div className="max-w-xl mx-auto space-y-6 pt-16 relative">
        <p className="text-zinc-500 text-sm font-black tracking-[0.4em] uppercase italic opacity-40">
          Evidence-Based Journey to Stability
        </p>
      </div>
    </div>
  );
}
