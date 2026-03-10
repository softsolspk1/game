"use client";

import { useState, useEffect, useRef } from "react";
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

    // Audio refs
    const correctAudio = useRef<HTMLAudioElement | null>(null);
    const wrongAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        correctAudio.current = new Audio("https://www.soundjay.com/human/applause-01.mp3");
        wrongAudio.current = new Audio("https://www.soundjay.com/button/button-10.mp3");
    }, []);

    const playCorrect = () => {
        if (correctAudio.current) {
            correctAudio.current.currentTime = 0;
            correctAudio.current.play().catch((e: Error) => console.warn("Audio play blocked", e));
        }
    };

    const playWrong = () => {
        if (wrongAudio.current) {
            wrongAudio.current.currentTime = 0;
            wrongAudio.current.play().catch((e: Error) => console.warn("Audio play blocked", e));
        }
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
            <div className="flex justify-between items-center glass p-4 shrink-0 mx-6 mt-6 rounded-[2rem] border-b-2 border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-magenta/5 via-transparent to-accent-gold/5" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="hidden lg:flex flex-col">
                        <h2 className="text-sm font-black text-gradient-gold tracking-[0.3em] uppercase italic">Expedition</h2>
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Final Phase</span>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10 hidden lg:block" />

                    <div className="flex gap-3">
                        {teams.map((t, i) => (
                            <div
                                key={t.id}
                                className={`px-5 py-2 rounded-2xl border-2 transition-all duration-500 flex flex-col items-center min-w-[80px] ${currentTeamIndex === i ? 'bg-white/10 scale-110 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-black/20 opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                style={{ borderColor: currentTeamIndex === i ? t.color : 'transparent' }}
                            >
                                <span className="text-[9px] font-black uppercase tracking-tighter opacity-70" style={{ color: t.color }}>{t.name}</span>
                                <div className="text-lg font-black" style={{ color: t.color }}>{t.position || 0}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-8 relative z-10">
                    <button onClick={() => endGame(teams)} className="text-[10px] font-black text-zinc-500 hover:text-white hover:bg-white/10 uppercase tracking-widest border border-white/5 px-6 py-3 rounded-2xl transition-all shadow-inner">
                        Sync to Results
                    </button>
                    <div className="flex items-center gap-4 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 leading-none">Global XP</span>
                                <div className="text-xl font-black text-white italic">{currentTeam.totalScore}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 bg-white/5 rounded-xl border transition-all" style={{ borderColor: `${currentTeam.color}40`, color: currentTeam.color }}>
                            <div className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: currentTeam.color }} />
                            <span className="text-xs font-black uppercase tracking-widest italic">{currentTeam.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Side-by-Side */}
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden p-8 gap-8">

                {/* Left Side: The Board (Full Height) */}
                <div className="flex-1 flex items-center justify-center relative glass rounded-[2.5rem] bg-black/20 border-white/5 p-4 shadow-2xl">
                    <div className="absolute top-6 left-8 flex items-center gap-2 opacity-30">
                        <Trophy size={14} className="text-accent-gold" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Vertical Ascent Path</span>
                    </div>
                    <GameBoard
                        teams={teams.map(t => ({ id: t.id, name: t.name, color: t.color, position: t.position || 0 }))}
                        containerClassName="h-[90%] w-[90%] max-h-full aspect-square"
                    />
                </div>

                {/* Right Side: Dice & Activity */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                    {/* Dice Station or Question Phase */}
                    <div className="glass flex-1 flex flex-col relative border-t-4 shadow-magenta/10 overflow-hidden" style={{ borderColor: currentTeam.color, borderRadius: '2.5rem' }}>
                        {!showQuestion ? (
                            <div className="flex flex-col items-center justify-center gap-12 w-full p-10 flex-1 relative">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />

                                <div className="space-y-4 text-center relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-accent-gold text-[9px] font-black uppercase tracking-[0.4em] mb-2">
                                        Movement Authorization
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase">Roll for <span className="text-gradient-gold">Propulsion</span></h3>
                                    <p className="text-zinc-500 font-medium italic opacity-60">Establish the trajectory of your clinical journey</p>
                                </div>

                                <div className="relative group">
                                    <div className={`absolute inset-0 blur-[60px] rounded-full scale-125 opacity-30 transition-all duration-700 ${isRolling ? 'bg-white animate-pulse' : ''}`} style={{ backgroundColor: currentTeam.color }} />
                                    <div
                                        className={`w-56 h-56 bg-black/60 backdrop-blur-3xl border-[12px] rounded-[3.5rem] flex items-center justify-center text-9xl font-black shadow-2xl relative z-10 transition-all duration-500 ${isRolling ? 'rotate-[360deg] scale-110' : 'group-hover:scale-105'}`}
                                        style={{ borderColor: currentTeam.color, color: currentTeam.color, boxShadow: `0 0 50px ${currentTeam.color}40`, textShadow: `0 0 20px ${currentTeam.color}60` }}
                                    >
                                        {diceValue}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5 w-full max-w-md relative z-10">
                                    <button
                                        onClick={rollDice}
                                        disabled={isRolling}
                                        className={`button-premium text-3xl py-10 px-12 rounded-3xl flex items-center justify-center gap-6 shadow-2xl group/roll ${isRolling ? 'opacity-30 grayscale pointer-events-none' : ''}`}
                                    >
                                        <Dices size={44} className="group-hover/roll:rotate-45 transition-transform duration-500 text-accent-gold" />
                                        <span className="font-black italic tracking-widest leading-none">{isRolling ? 'ROLLING...' : 'INITIATE ROLL'}</span>
                                    </button>
                                    <div className="flex items-center gap-3 justify-center opacity-30">
                                        <div className="h-px w-8 bg-white" />
                                        <p className="text-center text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocol Validation Required</p>
                                        <div className="h-px w-8 bg-white" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col flex-1 p-10 space-y-10 animate-in slide-in-from-right duration-700 overflow-y-auto">
                                <div className="flex justify-between items-start border-b border-white/10 pb-8 shrink-0 relative">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-white/5 border border-white/10 shadow-inner">
                                                <Users size={20} style={{ color: currentTeam.color }} />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Validation Phase</span>
                                        </div>
                                        <h2 className="text-4xl font-black mt-2 italic text-white female-glow" style={{ color: currentTeam.color }}>
                                            {currentTeam.name}
                                        </h2>
                                    </div>
                                    <div className="flex flex-col items-end pr-4">
                                        <div className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em] leading-none mb-2">Target Units</div>
                                        <div className="text-6xl font-black text-white italic tracking-tighter" style={{ textShadow: `0 0 20px ${currentTeam.color}40` }}>{diceValue}</div>
                                    </div>
                                    {/* Small background indicator */}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-accent-gold/5 blur-3xl rounded-full" />
                                </div>

                                <div className="space-y-8 flex-1">
                                    <div className="flex items-start gap-8">
                                        <div className="p-4 rounded-2xl bg-black/40 border-2 shrink-0 shadow-2xl transition-transform duration-500 hover:rotate-6" style={{ borderColor: currentTeam.color, boxShadow: `0 0 30px ${currentTeam.color}30` }}>
                                            <Users size={36} style={{ color: currentTeam.color }} />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <h3 className="text-3xl md:text-4xl font-black leading-tight italic tracking-tight text-white drop-shadow-sm">
                                                {currentQuestion?.text}
                                            </h3>
                                            <div className="h-0.5 w-24 bg-gradient-to-r from-accent-pink to-transparent opacity-30" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-5">
                                        {['A', 'B', 'C', 'D'].map((letter) => {
                                            if (hiddenOptions.includes(letter)) return <div key={letter} className="h-[92px] opacity-10 border-2 border-dashed border-white/5 rounded-2xl" />;
                                            const isSelected = selectedOption === letter;
                                            const isRight = showResult && letter === currentQuestion?.correctOption;
                                            const isWrong = showResult && isSelected && !isRight;

                                            let bgClass = "bg-white/5 hover:bg-white/10 border-white/10";
                                            if (isSelected) bgClass = "bg-white/15 border-white/40 shadow-lg scale-[1.02]";
                                            if (isRight) bgClass = "bg-green-500/20 border-green-500/50 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)] scale-[1.02]";
                                            if (isWrong) bgClass = "bg-red-500/20 border-red-500/50 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.2)]";

                                            return (
                                                <button
                                                    key={letter}
                                                    onClick={() => !showResult && handleAnswer(letter)}
                                                    disabled={showResult}
                                                    className={`p-7 rounded-[1.5rem] border-2 text-left transition-all duration-300 ${bgClass} flex items-center gap-6 group relative overflow-hidden`}
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl bg-black/60 border border-white/10 group-hover:scale-110 group-hover:bg-black/80 transition-all shadow-inner relative z-10`}>
                                                        {letter}
                                                    </div>
                                                    <div className="text-xl font-bold leading-snug relative z-10 pr-4">
                                                        {currentQuestion ? currentQuestion[`option${letter}` as keyof Question] : ''}
                                                    </div>

                                                    {isRight && (
                                                        <div className="absolute right-6 animate-in zoom-in spin-in-90 duration-500">
                                                            <CheckCircle2 size={32} />
                                                        </div>
                                                    )}
                                                    {isWrong && (
                                                        <div className="absolute right-6 animate-in zoom-in spin-in-90 duration-500">
                                                            <XCircle size={32} />
                                                        </div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {!showResult && (
                                        <div className="flex gap-5 justify-start pt-6">
                                            <button onClick={use5050} disabled={currentTeam.used5050} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl group/btn ${currentTeam.used5050 ? 'opacity-20 grayscale border-white/5 bg-transparent' : 'bg-white/5 border-2 border-white/10 hover:bg-accent-magenta hover:border-accent-magenta hover:text-white hover:-translate-y-1'}`}>
                                                <HelpCircle size={18} className="group-hover/btn:rotate-12 transition-transform" /> 50:50
                                            </button>
                                            <button onClick={useSkip} disabled={currentTeam.usedSkip} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl group/btn ${currentTeam.usedSkip ? 'opacity-20 grayscale border-white/5 bg-transparent' : 'bg-white/5 border-2 border-white/10 hover:bg-accent-gold hover:text-black hover:border-accent-gold hover:-translate-y-1'}`}>
                                                <FastForward size={18} className="group-hover/btn:translate-x-1 transition-transform" /> SKIP
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {showResult && (
                                    <div className="absolute inset-0 bg-[#0f172a]/98 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500 z-50 p-12 text-center rounded-[2.5rem]">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />
                                        <div className="flex flex-col items-center gap-10 relative z-10">
                                            <div className="relative">
                                                <div className={`absolute inset-0 blur-3xl rounded-full scale-150 opacity-40 animate-pulse ${isCorrect ? 'bg-green-500' : 'bg-red-500'}`} />
                                                {isCorrect ?
                                                    <CheckCircle2 size={160} className="text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)] animate-in zoom-in duration-700" /> :
                                                    <XCircle size={160} className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-in zoom-in duration-700" />
                                                }
                                            </div>
                                            <div className="space-y-4">
                                                <h2 className={`text-7xl font-black tracking-tighter uppercase italic leading-none ${isCorrect ? 'text-green-400 female-glow' : 'text-red-400'}`}>
                                                    {isCorrect ? 'Verified' : 'Failed'}
                                                </h2>
                                                <p className="text-3xl font-bold text-white/50 uppercase tracking-[0.4em] italic leading-tight">{isCorrect ? `Propulsion Unit: Forward ${pointsAwarded}` : 'XP Penalty Applied (-1)'}</p>
                                            </div>
                                            <button onClick={proceedWithMove} className="button-premium px-16 py-8 text-3xl flex items-center gap-6 group rounded-3xl mt-6 shadow-2xl relative z-10">
                                                <span className="font-black italic tracking-widest pr-2 border-r border-white/20">CONFIRM MOVE</span>
                                                <ChevronRight className="group-hover:translate-x-3 transition-transform" size={40} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Team Stats Summary */}
                    <div className="glass p-8 grid grid-cols-2 gap-8 rounded-[2rem] border-white/5 bg-black/40 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />
                        <div className="space-y-2 relative z-10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-1">Current Progress</span>
                            <div className="flex items-baseline justify-center gap-3">
                                <div className="text-5xl font-black italic tracking-tighter text-accent-gold" style={{ textShadow: `0 0 20px rgba(251,191,36,0.3)` }}>{currentTeam.position || 0}</div>
                                <div className="text-xs font-black text-zinc-600 uppercase tracking-tighter">Pos</div>
                            </div>
                        </div>
                        <div className="space-y-2 relative z-10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-1">Total Accumulated XP</span>
                            <div className="flex items-baseline justify-center gap-3">
                                <div className="text-5xl font-black italic tracking-tighter text-white">{currentTeam.totalScore}</div>
                                <div className="text-xs font-black text-zinc-600 uppercase tracking-tighter">Pts</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Round Start Popup */}
            {
                !isRoundStarted && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-[#0f172a]/90 backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="max-w-2xl w-full glass p-16 text-center space-y-10 animate-in zoom-in duration-500 rounded-[3rem] border-t-4 border-accent-gold glow-gold/20 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold animate-progress" />
                            <div className="p-6 bg-accent-gold/10 rounded-[2.5rem] w-32 h-32 flex items-center justify-center mx-auto border-4 border-accent-gold shadow-[0_0_40px_rgba(251,191,36,0.2)]">
                                <Trophy size={64} className="text-accent-gold animate-float drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" />
                            </div>
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-gradient-gold">Final Ascent</h2>
                                    <span className="text-2xl font-light text-white tracking-[0.5em] uppercase opacity-60">Phase Two</span>
                                </div>
                                <div className="h-px w-32 bg-white/10 mx-auto" />
                                <p className="text-zinc-400 text-lg leading-relaxed italic pr-6 pl-6">The ultimate climb. Movement is gated by specialized medical inquiries. Successful validation allows movement equal to the <span className="text-accent-gold">Dice Propulsion Value</span>. Protocol errors incur a <span className="text-red-500">-1 XP</span> and position penalty.</p>
                            </div>
                            <button onClick={() => { setIsRoundStarted(true); setShowTurnPopup(true); }} className="button-premium px-16 py-7 text-2xl flex items-center gap-4 mx-auto group rounded-2xl shadow-2xl">
                                <Play size={28} fill="currentColor" className="group-hover:scale-110 transition-transform" /> <span className="font-black italic tracking-widest uppercase">Start Final Round</span>
                            </button>
                        </div>
                    </div>
                )
            }

            {/* Team Turn Popup */}
            {
                isRoundStarted && showTurnPopup && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="max-w-xl w-full glass p-12 text-center space-y-8 border-b-[12px] animate-in slide-in-from-bottom-20 duration-500 rounded-[3rem] shadow-2xl relative overflow-hidden" style={{ borderColor: currentTeam.color }}>
                            <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                            <div className="w-24 h-24 rounded-3xl bg-black/40 border-2 flex items-center justify-center mx-auto transition-transform duration-700 hover:rotate-12 shadow-inner" style={{ borderColor: currentTeam.color, boxShadow: `0 0 40px ${currentTeam.color}20` }}>
                                <Users size={48} style={{ color: currentTeam.color }} />
                            </div>
                            <div className="space-y-3">
                                <span className="text-[10px] font-black italic text-zinc-500 uppercase tracking-[0.6em] block mb-2">Protocol Ready</span>
                                <h3 className="text-5xl font-black uppercase tracking-tighter text-white female-glow" style={{ color: currentTeam.color }}>{currentTeam.name}</h3>
                                <div className="h-0.5 w-24 bg-white/10 mx-auto mt-4" />
                                <p className="text-xl font-bold text-zinc-400 tracking-widest uppercase italic pt-2">Initiate Propulsion Sequence</p>
                            </div>
                            <button onClick={() => setShowTurnPopup(false)} className="button-premium px-12 py-6 text-2xl w-full rounded-2xl shadow-xl group">
                                <span className="font-black italic tracking-widest">INITIATE ROLL</span>
                                <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}
        </div>
    );
}
