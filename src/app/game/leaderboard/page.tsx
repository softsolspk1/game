"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, Home } from "lucide-react";
import { useRouter } from "next/navigation";

type Team = {
    id: number;
    name: string;
    color: string;
    scoreRound1: number;
    positionRound2: number;
    totalScore: number;
};

export default function Leaderboard() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            // Sort primarily by totalScore, then positionRound2 if tied, then scoreRound1
            const sorted = (data.teams || []).sort((a: Team, b: Team) => {
                if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
                if (b.positionRound2 !== a.positionRound2) return b.positionRound2 - a.positionRound2;
                return b.scoreRound1 - a.scoreRound1;
            });
            setTeams(sorted);
        }
    }, []);

    if (teams.length === 0) return <div className="min-h-screen grid place-items-center">Loading...</div>;

    const winner = teams[0];

    return (
        <div className="flex flex-col gap-12 max-w-5xl mx-auto py-12 text-center animate-in fade-in zoom-in duration-1000">

            {/* Winner Podium */}
            <div className="space-y-4 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-gold/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none" />
                <Trophy size={100} className="mx-auto text-accent-gold mb-6 drop-shadow-[0_0_30px_rgba(212,175,55,0.6)] animate-float" />
                <h1 className="text-4xl md:text-5xl tracking-[0.3em] font-light text-gradient-gold uppercase">
                    Expedition Complete
                </h1>
                <p className="text-xl text-zinc-300 font-bold uppercase tracking-widest mt-4">
                    Champions
                </p>
                <div className="text-6xl md:text-8xl font-black female-glow" style={{ color: winner.color }}>
                    {winner.name}
                </div>
                <p className="text-2xl text-accent-gold font-bold mt-2">{winner.totalScore} Points</p>
            </div>

            <div className="glass p-8 max-w-3xl w-full mx-auto relative overflow-hidden text-left mt-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-gold to-accent-magenta opacity-50" />
                <h3 className="text-xl font-bold mb-6 tracking-widest text-zinc-400">FINAL STANDINGS</h3>

                <div className="space-y-4">
                    {teams.map((team, index) => (
                        <div
                            key={team.id}
                            className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 transition-all hover:bg-white/10"
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg`} style={{ backgroundColor: team.color, color: 'white' }}>
                                    #{index + 1}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold" style={{ color: team.color }}>{team.name}</h4>
                                    <div className="text-xs text-zinc-500 font-bold tracking-wider">
                                        R1: {team.scoreRound1} pts • R2: Pos {team.positionRound2}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-white">
                                {team.totalScore}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => {
                    localStorage.removeItem("ladder-session");
                    router.push("/");
                }}
                className="mx-auto button-premium flex items-center gap-3 px-8 text-sm tracking-widest"
            >
                <Home size={18} /> BACK TO START
            </button>

        </div>
    );
}
