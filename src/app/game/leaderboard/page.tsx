"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, Home, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import GameBoard from "@/components/GameBoard";

type Team = {
    id: number;
    name: string;
    color: string;
    scoreRound1: number;
    position: number;
    positionRound2: number;
    totalScore: number;
    finishedRank?: number;
};

export default function Leaderboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [gameStatus, setGameStatus] = useState<string>("");

    useEffect(() => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            const currentStatus = data.status || "";
            setGameStatus(currentStatus);

            // Consolidate positions for display and board
            const loadedTeams = (data.teams || []).map((t: Team) => ({
                ...t,
                displayPosition: t.positionRound2 || t.position || 1
            }));

            // Sort primarily by finishedRank (1, 2, 3), then totalScore
            const sorted = loadedTeams.sort((a: Team, b: Team) => {
                const rankA = a.finishedRank || 999;
                const rankB = b.finishedRank || 999;
                if (rankA !== rankB) return rankA - rankB;
                return b.totalScore - a.totalScore;
            });
            setTeams(sorted);
        }
    }, [router]);

    if (teams.length === 0) return <div className="min-h-screen grid place-items-center">Loading...</div>;

    const winner = teams[0];

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0f172a] text-white">

            {/* Top Bar */}
            <div className="flex justify-between items-center glass p-5 shrink-0 mx-6 mt-6 rounded-[2rem] border-b-2 border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-magenta/5 via-transparent to-accent-gold/5" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="p-3 bg-accent-gold/10 rounded-2xl border border-accent-gold/20 shadow-lg">
                        <Trophy className="text-accent-gold animate-float" size={28} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter uppercase text-gradient-gold italic leading-none">
                            {gameStatus === "ROUND1_COMPLETE" ? "Expedition Results" : "Final Standings"}
                        </h1>
                        <span className="text-[10px] text-zinc-500 font-bold tracking-[0.4em] uppercase opacity-60">Phase Integrity Verification</span>
                    </div>
                </div>
                <button
                    onClick={() => {
                        if (gameStatus === "ROUND1_COMPLETE") {
                            router.push("/game/round2");
                        } else {
                            localStorage.removeItem("ladder-session");
                            router.push("/");
                        }
                    }}
                    className="button-premium flex items-center gap-3 px-8 py-4 text-xs tracking-[0.2em] relative z-10 rounded-2xl"
                >
                    {gameStatus === "ROUND1_COMPLETE" ? <ChevronRight size={18} /> : <Home size={18} />}
                    <span className="font-black italic uppercase">{gameStatus === "ROUND1_COMPLETE" ? "START ROUND 2" : "NEW EXPEDITION"}</span>
                </button>
            </div>

            {/* Main Content Area: Side-by-Side */}
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden p-8 gap-8">

                {/* Left Side: Final Board Path */}
                <div className="flex-[3] flex flex-col items-center justify-center relative glass rounded-[2.5rem] bg-black/20 border-white/5 p-8 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full p-6 border-b border-white/5 bg-white/5 z-20 flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Chronological Progression</h3>
                        <div className="flex gap-2">
                            {teams.map((t) => (
                                <div key={t.id} className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: t.color }} />
                            ))}
                        </div>
                    </div>
                    <GameBoard
                        teams={teams.map(t => ({ id: t.id, name: t.name, color: t.color, position: (t as any).displayPosition }))}
                        containerClassName="h-[85%] w-[85%] max-h-full aspect-square relative z-10"
                    />

                    {/* Subtle Overlay Decoration */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />
                </div>

                {/* Right Side: Champions & Standings */}
                <div className="flex-[2] flex flex-col gap-4 overflow-y-auto custom-scrollbar">

                    {/* Top Spot / Winner */}
                    <div className="glass p-6 relative overflow-hidden shrink-0 flex flex-col items-center text-center border-b-[6px] rounded-[2rem] bg-black/40 shadow-xl" style={{ borderColor: winner.color }}>
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                        <Trophy size={48} className="text-accent-gold mb-3 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-float" />
                        <div className="space-y-1 relative z-10">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-accent-gold opacity-80 block">Grand Champion</span>
                            <h2 className="text-4xl font-black female-glow italic uppercase tracking-tighter" style={{ color: winner.color }}>
                                {winner.name}
                            </h2>
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white italic tracking-tighter">{winner.totalScore}</span>
                                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">XP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Standings List */}
                    <div className="glass p-6 flex-1 flex flex-col overflow-hidden rounded-[2rem] bg-black/30 border-white/5 shadow-lg">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500 italic">Historical Standings</h3>
                            <Medal size={14} className="text-zinc-600" />
                        </div>

                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                            {teams.map((team, index) => (
                                <div
                                    key={team.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 group ${index === 0 ? 'bg-white/10 border-white/20 shadow-md transform scale-[1.01]' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner`} style={{ backgroundColor: team.color, color: 'white' }}>
                                            {index + 1}
                                        </div>
                                        <div className="space-y-0.5">
                                            <h4 className="text-lg font-black italic tracking-tight" style={{ color: team.color }}>{team.name}</h4>
                                            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest italic leading-none">
                                                {team.finishedRank ? `Rank: ${team.finishedRank}` : `Pos: ${(team as any).displayPosition}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black italic tracking-tighter text-white/90">
                                        {team.totalScore}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Prominent Proceed Button for Round 1 End */}
                        {gameStatus === "ROUND1_COMPLETE" && (
                            <div className="mt-4 pt-4 border-t border-white/10 shrink-0">
                                <button
                                    onClick={() => router.push("/game/round2")}
                                    className="button-premium w-full py-5 text-xl flex items-center justify-center gap-4 animate-pulse group rounded-2xl"
                                >
                                    <span className="font-black tracking-[0.1em] uppercase italic text-sm">Initiate Phase 02</span>
                                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
