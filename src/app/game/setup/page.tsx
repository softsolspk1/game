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
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 text-center animate-in fade-in duration-700">
            <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-gradient-gold">
                    Configure Teams
                </h1>
                <p className="text-zinc-400">Establish the 4 competitive teams for the expedition</p>
            </div>

            <div className="glass p-8 max-w-4xl w-full text-left glow-magenta grid grid-cols-1 md:grid-cols-2 gap-8">
                {teams.map((team, index) => (
                    <div key={team.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-4">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-8 h-8 rounded-full border-2 border-white/20 shadow-lg"
                                style={{ backgroundColor: team.color }}
                            />
                            <h3 className="text-xl font-bold">Team {index + 1}</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Team Name</label>
                            <input
                                type="text"
                                value={team.name}
                                onChange={(e) => updateTeamName(team.id, e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-accent-pink transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Team Color</label>
                            <div className="flex gap-2 flex-wrap">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => updateTeamColor(team.id, c)}
                                        className={`w-8 h-8 rounded-full border-2 transition-all ${team.color === c ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleStartGame}
                className="button-premium w-full max-w-sm flex items-center justify-center gap-4 text-xl py-4"
            >
                <span>ENTER ROUND 1</span>
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
}
