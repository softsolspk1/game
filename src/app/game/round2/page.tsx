"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dices, Trophy, ChevronRight, CheckCircle2, XCircle, HelpCircle, FastForward, Users, Play } from "lucide-react";
import GameBoard from "@/components/GameBoard";
import { SNAKES_AND_LADDERS, QUESTIONS_PER_ROUND } from "@/lib/gameConstants";

type Question = {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
};

type Team = {
    id: number;
    name: string;
    color: string;
    scoreRound1: number;
    position: number;
    positionRound2: number;
    totalScore: number;
    used5050: boolean;
    usedSkip: boolean;
    finishedRank?: number; // 0 if not finished, 1, 2, 3 etc.
};

export default function RoundTwo() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [diceValue, setDiceValue] = useState(1);
    const [rolesCount, setRolesCount] = useState(0);

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [showQuestion, setShowQuestion] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
    const [pointsAwarded, setPointsAwarded] = useState(0);
    const [startTime, setStartTime] = useState(0);

    // Audio helpers
    const playCorrect = () => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3");
        audio.play().catch(e => console.warn("Audio play blocked", e));
    };

    const playWrong = () => {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3");
        audio.play().catch(e => console.warn("Audio play blocked", e));
    };

    const [isRoundStarted, setIsRoundStarted] = useState(false);
    const [showTurnPopup, setShowTurnPopup] = useState(false);
    const [questionsAnsweredPerTeam, setQuestionsAnsweredPerTeam] = useState<Record<number, number>>({});

    useEffect(() => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const loadedTeams = (data.teams || []);
                if (loadedTeams.length > 0) {
                    setTeams(loadedTeams);
                } else {
                    router.push("/");
                }
            } catch (e) {
                console.error("Failed to parse ladder-session", e);
                router.push("/");
            }
        } else {
            router.push("/");
        }

        fetch("/api/questions?difficulty=2")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setQuestions(data.sort(() => 0.5 - Math.random()));
                } else {
                    console.error("Invalid questions data type:", typeof data);
                }
            })
            .catch(err => console.error("Questions fetch failed:", err));
    }, [router]);

    const currentTeam = teams[currentTeamIndex];

    const rollDice = () => {
        if (isRolling) return;
        setIsRolling(true);

        let counter = 0;
        const interval = setInterval(() => {
            const tempVal = Math.floor(Math.random() * 6) + 1;
            setDiceValue(tempVal);
            counter++;
            if (counter > 15) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                setDiceValue(finalValue);
                setIsRolling(false);

                // Trigger Question Phase
                setTimeout(() => {
                    const q = questions[Math.floor(Math.random() * questions.length)];
                    setCurrentQuestion(q);
                    setShowQuestion(true);
                    setSelectedOption(null);
                    setHiddenOptions([]);
                    setShowResult(false);
                    setStartTime(Date.now());
                }, 500);
            }
        }, 100);
    };

    const use5050 = () => {
        if (!currentTeam || currentTeam.used5050 || !currentQuestion) return;
        const updated = [...teams];
        updated[currentTeamIndex].used5050 = true;
        setTeams(updated);
        const incorrect = ['A', 'B', 'C', 'D'].filter(o => o !== currentQuestion.correctOption);
        setHiddenOptions(incorrect.sort(() => 0.5 - Math.random()).slice(0, 2));
    };

    const useSkip = () => {
        if (!currentTeam || currentTeam.usedSkip || !currentQuestion) return;
        const updated = [...teams];
        updated[currentTeamIndex].usedSkip = true;
        setTeams(updated);
        setShowQuestion(false);
        movePlayer(diceValue, 0);
    };

    const handleAnswer = (option: string) => {
        if (!currentQuestion) return;
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);
        const correct = option === currentQuestion.correctOption;
        setIsCorrect(correct);
        setSelectedOption(option);

        let pts = 0;
        if (correct) {
            playCorrect();
            pts = diceValue; // Dice-based scoring, no time bonus
        } else {
            playWrong();
            pts = -1; // Penalty for wrong answer
        }
        setPointsAwarded(pts);

        setShowResult(true);
    };

    const proceedWithMove = () => {
        setShowQuestion(false);
        setShowResult(false);
        if (isCorrect) {
            // "Proper as per numbers": Move based on points (10/6/3)
            movePlayer(pointsAwarded, pointsAwarded);
        } else {
            // Penalty: -1 point and -1 movement as per Round 1 rules
            movePlayer(-1, -1);
        }
    };

    const movePlayer = (steps: number, pts: number) => {
        const updated = [...teams];
        const team = updated[currentTeamIndex];

        team.totalScore += pts;
        const currentPos = team.position || 0;
        let newPos = currentPos + steps;

        if (newPos < 1) newPos = 1;
        if (newPos > 100) newPos = 100;

        const transitions = SNAKES_AND_LADDERS;
        if (newPos in transitions) {
            newPos = transitions[newPos];
        }

        const prevPos = team.position;
        team.position = newPos;
        team.positionRound2 = newPos;

        // Check for finish
        if (newPos >= 100 && prevPos < 100) {
            const winnersCount = updated.filter(t => (t.position || 0) >= 100).length;
            team.finishedRank = winnersCount;
        }

        setTeams(updated);
        console.log(`[ROUND 2] Team ${team.name} moved. Steps: ${steps}, Pts: ${pts}, New Pos: ${newPos}`);

        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = updated;
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }

        setTimeout(() => {
            const finishedTeamsCount = updated.filter(t => (t.position || 0) >= 100).length;
            const activeTeamsCount = updated.length - finishedTeamsCount;

            // End game if 3 teams finished, or if only 1 team is left active (and they already finished questions?)
            // Instructions: "continues untill 3 teams reach at 100"
            if (finishedTeamsCount >= 3 || activeTeamsCount === 0) {
                endGame(updated);
                return;
            }

            // Find next team that hasn't finished
            let nextIndex = (currentTeamIndex + 1) % updated.length;
            let checks = 0;
            while ((updated[nextIndex].position || 0) >= 100 && checks < updated.length) {
                nextIndex = (nextIndex + 1) % updated.length;
                checks++;
            }

            setCurrentTeamIndex(nextIndex);
            setShowTurnPopup(true);
        }, 1000);
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

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0f172a] text-white">

            {/* Top Bar - Compact HUD */}
            <div className="flex justify-between items-center glass p-3 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-gold tracking-widest hidden md:block uppercase">Final Expedition</h2>
                    <div className="flex gap-2">
                        {teams.map((t, i) => (
                            <div
                                key={t.id}
                                className={`px-4 py-1 rounded-lg border-2 transition-all ${currentTeamIndex === i ? 'bg-white/10 scale-105 shadow-lg' : 'opacity-40'}`}
                                style={{ borderColor: currentTeamIndex === i ? t.color : 'transparent' }}
                            >
                                <div className="text-[12px] font-black" style={{ color: t.color }}>{t.position || 0}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={() => endGame(teams)} className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full transition-all">
                        Skip to Results
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Q Asked</span>
                            <div className="text-xl font-black text-white">
                                {questionsAnsweredPerTeam[currentTeam.id] || 0} / {QUESTIONS_PER_ROUND}
                            </div>
                        </div>
                        <div className="text-sm font-bold uppercase tracking-widest px-4 py-1 bg-white/10 rounded-full" style={{ color: currentTeam.color }}>
                            {currentTeam.name}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Side-by-Side */}
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden p-6 gap-6">

                {/* Left Side: The Board (Full Height) */}
                <div className="flex-1 flex items-center justify-center relative">
                    <GameBoard
                        teams={teams.map(t => ({ id: t.id, name: t.name, color: t.color, position: t.position || 0 }))}
                        containerClassName="h-full w-full max-h-full aspect-square p-2"
                    />
                </div>

                {/* Right Side: Dice & Activity */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* Dice Station or Question Phase */}
                    <div className="glass flex-1 flex flex-col relative border-t-4 overflow-hidden" style={{ borderColor: currentTeam.color }}>
                        {!showQuestion ? (
                            <div className="flex flex-col items-center justify-center gap-10 w-full p-8 flex-1">
                                <div className="space-y-1 text-center">
                                    <span className="text-xs font-black uppercase tracking-widest opacity-40">Movement Phase</span>
                                    <h3 className="text-3xl font-black text-white italic">Roll for Propulsion</h3>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/10 blur-3xl rounded-full scale-150 group-hover:bg-accent-magenta/20 transition-all duration-700" />
                                    <div
                                        className={`w-48 h-48 bg-black/60 backdrop-blur-md border-8 rounded-[40px] flex items-center justify-center text-8xl font-black shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10 transition-all duration-300 ${isRolling ? 'animate-bounce' : ''}`}
                                        style={{ borderColor: currentTeam.color, color: currentTeam.color, boxShadow: `0 0 40px ${currentTeam.color}40` }}
                                    >
                                        {diceValue}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 w-full max-w-sm">
                                    <button
                                        onClick={rollDice}
                                        disabled={isRolling}
                                        className={`button-premium text-2xl py-8 px-10 flex items-center justify-center gap-4 ${isRolling ? 'opacity-30 grayscale pointer-events-none' : ''}`}
                                    >
                                        <Dices size={36} /> {isRolling ? 'ROLLING...' : 'INITIATE ROLL'}
                                    </button>
                                    <p className="text-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                                        Must confirm protocol after roll
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 p-8 space-y-8 animate-in slide-in-from-right duration-500 overflow-y-auto">
                                <div className="flex justify-between items-start border-b border-white/10 pb-6 shrink-0">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <Users size={18} style={{ color: currentTeam.color }} />
                                            <span className="text-xs font-black uppercase tracking-widest opacity-40">Confirmation Phase</span>
                                        </div>
                                        <h2 className="text-2xl font-black mt-1">
                                            {currentTeam.name}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="text-[10px] font-black text-accent-gold uppercase tracking-widest leading-none">Target</div>
                                        <div className="text-4xl font-black text-white">{diceValue}</div>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 rounded-2xl bg-white/5 border-2 shrink-0 animate-in zoom-in duration-700" style={{ borderColor: currentTeam.color, boxShadow: `0 0 20px ${currentTeam.color}20` }}>
                                            <Users size={28} style={{ color: currentTeam.color }} />
                                        </div>
                                        <h3 className="text-2xl font-bold leading-relaxed">
                                            {currentQuestion?.text}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3">
                                        {['A', 'B', 'C', 'D'].map((letter) => {
                                            if (hiddenOptions.includes(letter)) return <div key={letter} className="p-5 border-2 border-transparent" />;
                                            const isSelected = selectedOption === letter;
                                            const isRight = showResult && letter === currentQuestion?.correctOption;
                                            const isWrong = showResult && isSelected && !isRight;

                                            let bgClass = "bg-white/5 hover:bg-white/10 border-white/10";
                                            if (isSelected) bgClass = "bg-white/20 border-white";
                                            if (isRight) bgClass = "bg-green-500/30 border-green-500 text-green-100";
                                            if (isWrong) bgClass = "bg-red-500/30 border-red-500 text-red-100";

                                            return (
                                                <button
                                                    key={letter}
                                                    onClick={() => !showResult && handleAnswer(letter)}
                                                    disabled={showResult}
                                                    className={`p-5 rounded-2xl border-2 text-left transition-all ${bgClass} flex items-center gap-4 group`}
                                                >
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black bg-black/40 group-hover:scale-110 transition-transform">{letter}</div>
                                                    <div className="text-lg font-bold leading-snug">
                                                        {currentQuestion ? currentQuestion[`option${letter}` as keyof Question] : ''}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {!showResult && (
                                        <div className="flex gap-3 justify-start pt-4">
                                            <button onClick={use5050} disabled={currentTeam.used5050} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${currentTeam.used5050 ? 'opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:bg-accent-magenta'}`}>
                                                <HelpCircle size={16} /> 50:50
                                            </button>
                                            <button onClick={useSkip} disabled={currentTeam.usedSkip} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all ${currentTeam.usedSkip ? 'opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:bg-accent-gold hover:text-black hover:border-accent-gold'}`}>
                                                <FastForward size={16} /> SKIP
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {showResult && (
                                    <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 z-50 p-8 text-center">
                                        <div className="flex flex-col items-center gap-6">
                                            {isCorrect ? <CheckCircle2 size={100} className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" /> : <XCircle size={100} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />}
                                            <div>
                                                <h2 className={`text-5xl font-black ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                                    {isCorrect ? 'VERIFIED' : 'FAILED'}
                                                </h2>
                                                <p className="text-lg font-bold text-white/50 mt-2 uppercase tracking-widest">{isCorrect ? `Move forward ${pointsAwarded} units` : 'XP Penalty applied (-1)'}</p>
                                            </div>
                                            <button onClick={proceedWithMove} className="button-premium px-10 py-5 text-xl flex items-center gap-3 mt-4">
                                                PROCEED <ChevronRight />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Team Stats Summary */}
                    <div className="glass p-6 grid grid-cols-2 gap-4 h-32 shrink-0">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Progress</span>
                            <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-black text-accent-gold">{currentTeam.position || 0}</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Pos</div>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Accumulated XP</span>
                            <div className="flex items-baseline gap-2">
                                <div className="text-4xl font-black text-white">{currentTeam.totalScore}</div>
                                <div className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Pts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Round Start Popup */}
            {!isRoundStarted && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="max-w-xl w-full glass p-12 text-center space-y-8 animate-in zoom-in duration-500">
                        <div className="p-4 bg-accent-gold/20 rounded-full w-24 h-24 flex items-center justify-center mx-auto border-2 border-accent-gold shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                            <Trophy size={48} className="text-accent-gold" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Expedition Round 2</h2>
                            <p className="text-zinc-400 font-medium">Final Ascent. 5 Questions per team. Dice rolls are gated by medical inquiries. Correct answer moves you by dice value. Penalty of -1 for wrong answers.</p>
                        </div>
                        <button onClick={() => { setIsRoundStarted(true); setShowTurnPopup(true); }} className="button-premium px-12 py-5 text-xl flex items-center gap-3 mx-auto">
                            <Play size={24} fill="currentColor" /> START FINAL ROUND
                        </button>
                    </div>
                </div>
            )}

            {/* Team Turn Popup */}
            {isRoundStarted && showTurnPopup && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="max-w-lg w-full glass p-10 text-center space-y-6 border-b-8 animate-in slide-in-from-bottom-12 duration-500" style={{ borderColor: currentTeam.color }}>
                        <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 flex items-center justify-center mx-auto" style={{ borderColor: currentTeam.color }}>
                            <Users size={40} style={{ color: currentTeam.color }} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-4xl font-black uppercase text-white">{currentTeam.name}</h3>
                            <p className="text-lg font-bold text-zinc-400 tracking-widest uppercase">Your Expedition Phase</p>
                        </div>
                        <button onClick={() => setShowTurnPopup(false)} className="button-premium px-10 py-4 text-lg w-full">
                            INITIATE ROLL
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
