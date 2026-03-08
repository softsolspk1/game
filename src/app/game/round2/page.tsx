"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dices, Trophy, ChevronRight } from "lucide-react";

type Team = {
    id: number;
    name: string;
    color: string;
    scoreRound1: number;
    positionRound2: number;
    totalScore: number;
};

export default function RoundTwo() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [diceValue, setDiceValue] = useState(1);
    const [rolesCount, setRolesCount] = useState(0);

    useEffect(() => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            setTeams(data.teams || []);
        } else {
            router.push("/game/setup");
        }
    }, [router]);

    const currentTeam = teams[currentTeamIndex];

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);

        // Animation effect
        let counter = 0;
        const interval = setInterval(() => {
            setDiceValue(Math.floor(Math.random() * 6) + 1);
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                movePlayer(finalValue);
                setIsRolling(false);
            }
        }, 100);
    };

    const movePlayer = (steps: number) => {
        const updated = [...teams];
        const currentPos = updated[currentTeamIndex].positionRound2 || 0;
        let newPos = currentPos + steps;
        if (newPos > 100) newPos = 100;

        updated[currentTeamIndex].positionRound2 = newPos;
        updated[currentTeamIndex].totalScore = updated[currentTeamIndex].scoreRound1 + (newPos * 2);

        setTeams(updated);

        // Save state correctly
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = updated;
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }

        setTimeout(() => {
            if (currentTeamIndex === teams.length - 1) {
                if (rolesCount >= 2) {
                    endGame(updated);
                    return;
                }
                setRolesCount(c => c + 1);
                setCurrentTeamIndex(0);
            } else {
                setCurrentTeamIndex(c => c + 1);
            }
        }, 2000);
    };

    const endGame = (finalTeams: Team[]) => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = finalTeams;
            data.status = "COMPLETED";
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }
        router.push("/game/leaderboard");
    };

    if (!currentTeam) return <div className="min-h-screen grid place-items-center">Loading...</div>;

    // Generate 20 squares for the track visualization
    const trackLength = 20;

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto py-8 text-center animate-in fade-in duration-500">

            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black text-gradient-gold female-glow uppercase tracking-widest">
                    The Final Ascent
                </h1>
                <p className="text-zinc-400">Roll the dice to move your piece. 100 max positions.</p>
            </div>

            <div className="flex gap-4 justify-center">
                {teams.map((t, i) => (
                    <div
                        key={t.id}
                        className={`px-6 py-3 rounded-lg border-2 transition-all ${currentTeamIndex === i ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-50 border-transparent'}`}
                        style={{ borderColor: currentTeamIndex === i ? t.color : 'transparent' }}
                    >
                        <div className="text-[10px] font-bold" style={{ color: t.color }}>{t.name}</div>
                        <div className="text-xl font-black">{t.positionRound2} / 100</div>
                    </div>
                ))}
            </div>

            {/* The Dice */}
            <div className="glass p-12 max-w-md w-full mx-auto glow-magenta relative" style={{ borderColor: `${currentTeam.color}50` }}>
                <div className="text-sm font-bold uppercase tracking-widest mb-8" style={{ color: currentTeam.color }}>
                    {currentTeam.name}'s Turn
                </div>

                <div className={`w-32 h-32 mx-auto bg-black border-4 rounded-3xl flex items-center justify-center text-7xl font-black shadow-2xl transition-all ${isRolling ? 'animate-spin-slow scale-110' : ''}`} style={{ borderColor: currentTeam.color, color: currentTeam.color }}>
                    {diceValue}
                </div>

                <button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="mt-12 w-full button-premium text-2xl py-4 flex items-center justify-center gap-4"
                >
                    <Dices size={28} /> {isRolling ? 'ROLLING...' : 'ROLL DICE'}
                </button>
            </div>

            <div className="mt-8">
                <button onClick={() => endGame(teams)} className="text-sm text-zinc-500 hover:text-white flex items-center gap-2 mx-auto">
                    SKIP TO LEADERBOARD <ChevronRight size={16} />
                </button>
            </div>

        </div>
    );
}
