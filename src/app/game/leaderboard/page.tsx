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
};

export default function Leaderboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [gameStatus, setGameStatus] = useState<string>("");

    useEffect(() => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            setGameStatus(data.status || "");
            // Sort primarily by totalScore, then position/positionRound2 if tied
            const sorted = (data.teams || []).sort((a: Team, b: Team) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                const posA = a.positionRound2 || a.position || 0;
                const posB = b.positionRound2 || b.position || 0;
                return posB - posA;
            });
            setTeams(sorted);
        }
    }, []);

    if (teams.length === 0) return <div className="min-h-screen grid place-items-center">Loading...</div>;

    const winner = teams[0];

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0f172a] text-white">

            {/* Top Bar */}
            <div className="flex justify-between items-center glass p-4 shrink-0 mx-4 mt-4 rounded-2xl">
                <div className="flex items-center gap-4">
                    <Trophy className="text-accent-gold" size={24} />
                    <h1 className="text-xl font-black tracking-[0.2em] uppercase text-gradient-gold">
                        Expedition Leaderboard
                    </h1>
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
                    className="button-premium flex items-center gap-2 px-6 py-2 text-xs tracking-widest"
                >
                    {gameStatus === "ROUND1_COMPLETE" ? <ChevronRight size={14} /> : <Home size={14} />}
                    {gameStatus === "ROUND1_COMPLETE" ? "START ROUND 2" : "NEW GAME"}
                </button>
            </div>

            {/* Main Content Area: Side-by-Side */}
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden p-6 gap-6">

                {/* Left Side: Final Board Path */}
                <div className="flex-[3] flex flex-col items-center justify-center relative glass p-6 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full p-4 border-b border-white/5 bg-white/5 z-20">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">The Path Taken</h3>
                    </div>
                    <GameBoard
                        teams={teams.map(t => ({ id: t.id, name: t.name, color: t.color, position: t.positionRound2 || t.position || 1 }))}
                        containerClassName="h-full w-full max-h-full aspect-square p-2"
                    />
                </div>

                {/* Right Side: Champions & Standings */}
                <div className="flex-[2] flex flex-col gap-6 overflow-y-auto">

                    {/* Top Spot / Winner */}
                    <div className="glass p-8 relative overflow-hidden shrink-0 flex flex-col items-center text-center border-b-4" style={{ borderColor: winner.color }}>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent-gold/10 blur-[80px] rounded-full pointer-events-none" />
                        <Trophy size={64} className="text-accent-gold mb-4 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-float" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-gold mb-2">Grand Champion</span>
                        <h2 className="text-5xl font-black female-glow" style={{ color: winner.color }}>
                            {winner.name}
                        </h2>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-3xl font-black text-white">{winner.totalScore}</span>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total XP</span>
                        </div>
                    </div>

                    {/* Full Standings List */}
                    <div className="glass p-6 flex-1 flex flex-col overflow-hidden">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 pb-2 border-b border-white/5">Final Standings</h3>
                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                            {teams.map((team, index) => (
                                <div
                                    key={team.id}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${index === 0 ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-inner`} style={{ backgroundColor: team.color, color: 'white' }}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold leading-tight" style={{ color: team.color }}>{team.name}</h4>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Pos: {team.positionRound2 || team.position || 1} • XP: {team.totalScore}</p>
                                        </div>
                                    </div>
                                    <div className="text-2xl font-black text-white">
                                        {team.totalScore}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
