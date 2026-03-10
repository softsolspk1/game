"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight } from "lucide-react";

export default function SetupPage() {
    const router = useRouter();
    const [teams, setTeams] = useState([
        { id: 1, name: "Team 1", color: "#7b1fa2" },
        { id: 2, name: "Team 2", color: "#f8c8dc" },
        { id: 3, name: "Team 3", color: "#d4af37" },
        { id: 4, name: "Team 4", color: "#4a148c" },
    ]);

    const handleStartGame = () => {
        // Save to local storage for offline use
        localStorage.setItem("ladder-teams", JSON.stringify(teams));

        // Initialize session state
        const sessionState = {
            status: "ROUND1",
            currentRound: 1,
            teams: teams.map(t => ({
                ...t,
                scoreRound1: 0,
                position: 0,
                positionRound2: 0,
                totalScore: 0,
                used5050: false,
                usedSkip: false,
            }))
        };
        localStorage.setItem("ladder-session", JSON.stringify(sessionState));

        router.push("/game/round1");
    };

    const updateTeamName = (id: number, newName: string) => {
        setTeams(teams.map(t => (t.id === id ? { ...t, name: newName } : t)));
    };

    const updateTeamColor = (id: number, newColor: string) => {
        setTeams(teams.map(t => (t.id === id ? { ...t, color: newColor } : t)));
    };

    const colors = ["#7b1fa2", "#f8c8dc", "#d4af37", "#4a148c", "#e91e63", "#9c27b0", "#ffeb3b"];

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
            {/* Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[400px] bg-accent-gold/5 blur-[100px] rounded-full -z-10" />

            <div className="space-y-6 relative">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                    <Users size={14} /> System Configuration
                </div>
                <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-gradient-gold female-glow italic uppercase leading-tight">
                    Expedition Setup
                </h1>
                <p className="text-zinc-400 text-lg font-light italic max-w-2xl mx-auto">Establish the <span className="text-white font-medium">competitive medical teams</span> for this phase of the journey</p>
            </div>

            <div className="glass p-10 md:p-14 max-w-5xl w-full text-left glow-magenta grid grid-cols-1 md:grid-cols-2 gap-10 border-t-2 border-white/5">
                {teams.map((team, index) => (
                    <div key={team.id} className="group bg-white/5 border border-white/10 p-8 rounded-3xl space-y-6 transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 relative overflow-hidden">
                        {/* Team Accent Line */}
                        <div className="absolute top-0 left-0 w-1 h-full opacity-60 transition-all duration-500 group-hover:w-2" style={{ backgroundColor: team.color }} />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-2xl border-2 border-white/20 shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-12"
                                    style={{ backgroundColor: team.color, boxShadow: `0 0 20px ${team.color}40` }}
                                >
                                    <span className="text-white font-black text-xl">{index + 1}</span>
                                </div>
                                <h3 className="text-2xl font-bold tracking-tight text-white italic">Team {index + 1}</h3>
                            </div>
                            <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Active ID: {team.id}</div>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-accent-pink" /> Team Name
                            </label>
                            <input
                                type="text"
                                value={team.name}
                                onChange={(e) => updateTeamName(team.id, e.target.value)}
                                className="w-full bg-black/40 border-2 border-white/5 rounded-xl p-4 text-white font-bold outline-none focus:border-accent-pink/50 focus:bg-black/60 transition-all placeholder:text-zinc-700 shadow-inner"
                                placeholder="Enter team designation..."
                            />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-black flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-accent-gold" /> Identity Color
                            </label>
                            <div className="flex gap-3 flex-wrap">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => updateTeamColor(team.id, c)}
                                        className={`w-9 h-9 rounded-xl border-2 transition-all duration-300 ${team.color === c ? 'border-white scale-110 shadow-lg rotate-3' : 'border-transparent opacity-40 hover:opacity-100 hover:scale-105'}`}
                                        style={{ backgroundColor: c, boxShadow: team.color === c ? `0 0 15px ${c}80` : 'none' }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleStartGame}
                className="button-premium w-full max-w-md flex items-center justify-center gap-6 text-2xl py-6 rounded-2xl group shadow-2xl relative z-10"
            >
                <span className="italic font-black tracking-widest uppercase">ENTER ROUND 1</span>
                <div className="p-1 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                    <ChevronRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </div>
            </button>
        </div>
    );
}
