"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, HelpCircle, FastForward, CheckCircle2, XCircle, ChevronRight, Users, Play, Trophy } from "lucide-react";
import GameBoard from "@/components/GameBoard";
import { SNAKES_AND_LADDERS, QUESTIONS_PER_ROUND } from "@/lib/gameConstants";

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
};

type Question = {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
};

export default function RoundOne() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const [timeLeft, setTimeLeft] = useState(30);
    const [timerActive, setTimerActive] = useState(false);

    const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [pointsAwarded, setPointsAwarded] = useState(0);

    const [isRoundStarted, setIsRoundStarted] = useState(false);
    const [showTurnPopup, setShowTurnPopup] = useState(false);
    const [questionsAnsweredPerTeam, setQuestionsAnsweredPerTeam] = useState<Record<number, number>>({});

    useEffect(() => {
        // Load teams from localStorage
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                const loadedTeams = (data.teams || []).map((t: Team) => ({
                    ...t,
                    position: t.position || 1
                }));
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

        // Fetch questions
        fetch("/api/questions?difficulty=1")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    const shuffled = data.sort(() => 0.5 - Math.random());
                    setQuestions(shuffled);
                } else {
                    console.error("Invalid questions data type:", typeof data);
                }
            })
            .catch(err => console.error("Questions fetch failed:", err));
    }, [router]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timerActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev === 1) {
                        setTimerActive(false);
                        handleTimeOut();
                        return 0;
                    }
                    if (tickAudio.current) {
                        tickAudio.current.currentTime = 0;
                        tickAudio.current.play().catch(() => { });
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // Audio refs for more reliable playback
    const correctAudio = useRef<HTMLAudioElement | null>(null);
    const wrongAudio = useRef<HTMLAudioElement | null>(null);
    const tickAudio = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        correctAudio.current = new Audio("https://www.soundjay.com/human/applause-01.mp3");
        wrongAudio.current = new Audio("https://www.soundjay.com/button/button-10.mp3");
        tickAudio.current = new Audio("https://www.soundjay.com/clock/clock-ticking-2.mp3");
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

    // Start timer when a new question is loaded and ready
    useEffect(() => {
        if (questions.length > 0 && !showResult) {
            setTimeLeft(30);
            setTimerActive(true);
            setHiddenOptions([]);
            setSelectedOption(null);
        }
    }, [currentQuestionIndex, questions.length, showResult]);

    const currentTeam = teams[currentTeamIndex];
    const question = questions[currentQuestionIndex % questions.length];

    const handleTimeOut = () => {
        setTimerActive(false);
        playWrong();
        setShowResult(true);
        setIsCorrect(false);
        setPointsAwarded(-1); // Penalty for timeout
        applyScoreAndMove(-1, -1); // Move back for timeout
    };

    const handleAnswer = (option: string) => {
        if (!timerActive) return;
        setTimerActive(false);
        setSelectedOption(option);

        const timeTaken = 30 - timeLeft;
        const correct = option === question.correctOption;
        setIsCorrect(correct);

        let pts = 0;
        let steps = 0;
        if (correct) {
            playCorrect();
            if (timeTaken <= 10) {
                pts = 10;
                steps = 10;
            } else if (timeTaken <= 20) {
                pts = 6;
                steps = 6;
            } else {
                pts = 3;
                steps = 3;
            }
        } else {
            playWrong();
            pts = -1; // Penalty for incorrect answer
            steps = -1;
        }

        setPointsAwarded(pts);
        applyScoreAndMove(pts, steps);
        setShowResult(true);
    };

    const applyScoreAndMove = (pts: number, steps: number) => {
        const updated = [...teams];
        const team = updated[currentTeamIndex];

        team.scoreRound1 += pts;
        team.totalScore += pts;

        let newPos = (team.position || 0) + steps;
        if (newPos < 1) newPos = 1;
        if (newPos > 100) newPos = 100;

        if (newPos in SNAKES_AND_LADDERS) {
            newPos = SNAKES_AND_LADDERS[newPos];
        }

        team.position = newPos;
        console.log(`[ROUND 1] Team ${team.name} answered. Pts: ${pts}, Steps: ${steps}, New Pos: ${newPos}, Total XP: ${team.totalScore}`);

        // Persist immediately to avoid state loss
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = updated;
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }

        setTeams(updated);
    };

    const use5050 = () => {
        if (!currentTeam || currentTeam.used5050) return;

        // Mark as used
        const updated = [...teams];
        updated[currentTeamIndex].used5050 = true;
        setTeams(updated);

        // Hide 2 incorrect options
        const allOptions = ["A", "B", "C", "D"];
        const incorrectOptions = allOptions.filter(o => o !== question.correctOption);
        // Shuffle and pick 2
        const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
        setHiddenOptions([shuffled[0], shuffled[1]]);
    };

    const useSkip = () => {
        if (!currentTeam || currentTeam.usedSkip) return;

        const updated = [...teams];
        updated[currentTeamIndex].usedSkip = true;
        setTeams(updated);

        setTimerActive(false);
        nextTurn();
    };

    const nextTurn = () => {
        setShowResult(false);

        // Update question count for the active team
        const updatedCounts = { ...questionsAnsweredPerTeam };
        updatedCounts[currentTeam.id] = (updatedCounts[currentTeam.id] || 0) + 1;
        setQuestionsAnsweredPerTeam(updatedCounts);

        // Check if ALL teams finished their 5 questions
        const allFinished = teams.every(t => (updatedCounts[t.id] || 0) >= QUESTIONS_PER_ROUND);

        if (allFinished) {
            endRound1();
            return;
        }

        // Cycle to next team
        let nextIndex = (currentTeamIndex + 1) % teams.length;

        // Find next team that still has questions left
        while ((updatedCounts[teams[nextIndex].id] || 0) >= QUESTIONS_PER_ROUND) {
            nextIndex = (nextIndex + 1) % teams.length;
        }

        setCurrentTeamIndex(nextIndex);
        setCurrentQuestionIndex(prev => prev + 1);
        setShowTurnPopup(true);
    };

    const startRound = () => {
        setIsRoundStarted(true);
        setShowTurnPopup(true);
    };

    const endRound1 = () => {
        // Sync teams from latest state
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = teams;
            data.status = "ROUND1_COMPLETE";
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }

        // Navigate
        router.push("/game/leaderboard");
    };

    if (questions.length === 0 || teams.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#0f172a] text-white">

            {/* Top Bar - Compact */}
            <div className="flex justify-between items-center glass p-4 shrink-0 mx-6 mt-6 rounded-[2rem] border-b-2 border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-magenta/5 via-transparent to-accent-gold/5" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="hidden lg:flex flex-col">
                        <h2 className="text-sm font-black text-gradient-gold tracking-[0.3em] uppercase italic">Expedition</h2>
                        <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Phase 01</span>
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
                                <div className="text-lg font-black" style={{ color: t.color }}>{t.scoreRound1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-12 relative z-10">
                    <div className="flex items-center gap-4 bg-black/40 px-6 py-2 rounded-2xl border border-white/5 shadow-inner">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Milestone</span>
                            <div className="text-xl font-black text-white italic">
                                {questionsAnsweredPerTeam[currentTeam.id] || 0} <span className="text-zinc-600 font-light mx-0.5">/</span> {QUESTIONS_PER_ROUND}
                            </div>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10" />
                        <div className="text-right flex flex-col items-end min-w-[100px] relative">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Time Remaining</span>
                            <div className={`text-4xl font-black italic tracking-tighter tabular-nums flex items-baseline gap-1 ${timeLeft <= 10 ? 'text-red-500 animate-timer-tick' : 'text-accent-gold'}`}>
                                {timeLeft}
                                <span className="text-xs opacity-50 not-italic ml-1">SEC</span>
                            </div>
                            {timeLeft <= 10 && (
                                <div className="absolute -inset-2 bg-red-500/10 blur-xl rounded-full animate-pulse" />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border-2 transition-all shadow-lg" style={{ borderColor: `${currentTeam.color}40`, color: currentTeam.color, boxShadow: `0 10px 30px -10px ${currentTeam.color}40` }}>
                        <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_currentColor]" style={{ backgroundColor: currentTeam.color }} />
                        <span className="text-base font-black uppercase tracking-widest italic">{currentTeam.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Area: Side-by-Side */}
            <div className="flex flex-row flex-1 min-h-0 overflow-hidden p-8 gap-8">

                {/* Left Side: The Board (Full Height) */}
                <div className="flex-1 flex items-center justify-center relative glass rounded-[2.5rem] bg-black/20 border-white/5 p-4 shadow-2xl">
                    <div className="absolute top-6 left-8 flex items-center gap-2 opacity-30">
                        <Trophy size={14} className="text-accent-gold" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Active Navigation Path</span>
                    </div>
                    <GameBoard
                        teams={teams.map(t => ({ id: t.id, name: t.name, color: t.color, position: t.position || 0 }))}
                        containerClassName="h-[90%] w-[90%] max-h-full aspect-square"
                    />
                </div>

                {/* Right Side: Question & Answers */}
                <div className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                    <div className="glass p-10 flex-1 flex flex-col justify-center relative border-t-4 shadow-magenta/10" style={{ borderColor: currentTeam.color, borderRadius: '2.5rem' }}>
                        <div className="w-full h-full flex flex-col gap-10 relative shrink-0">
                            <div className="space-y-4">
                                <div className="flex items-start gap-6">
                                    <div className="p-4 rounded-[1.25rem] bg-black/40 border-2 shrink-0 shadow-2xl transition-transform duration-500 hover:rotate-6" style={{ borderColor: currentTeam.color, boxShadow: `0 0 30px ${currentTeam.color}30` }}>
                                        <Users size={32} style={{ color: currentTeam.color }} />
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-black leading-tight italic tracking-tight text-white drop-shadow-sm">
                                        {question.text}
                                    </h3>
                                </div>
                                <div className="h-0.5 w-24 bg-gradient-to-r from-accent-pink to-transparent opacity-30" />
                            </div>

                            <div className="grid grid-cols-1 gap-5">
                                {['A', 'B', 'C', 'D'].map((letter) => {
                                    if (hiddenOptions.includes(letter)) return <div key={letter} className="h-[92px] opacity-10 border-2 border-dashed border-white/5 rounded-2xl" />;
                                    const isSelected = selectedOption === letter;
                                    const isRight = showResult && letter === question.correctOption;
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
                                                {question[`option${letter}` as keyof Question]}
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
                                    )
                                })}
                            </div>

                            {/* Lifelines */}
                            {!showResult && (
                                <div className="flex gap-5 justify-start pt-6">
                                    <button onClick={use5050} disabled={currentTeam.used5050} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl group/btn ${currentTeam.used5050 ? 'opacity-20 grayscale border-white/5 bg-transparent' : 'bg-white/5 border-2 border-white/10 hover:bg-accent-magenta hover:border-accent-magenta hover:text-white hover:-translate-y-1'}`}>
                                        <HelpCircle size={18} className="group-hover/btn:rotate-12 transition-transform" /> 50:50
                                    </button>
                                    <button onClick={useSkip} disabled={currentTeam.usedSkip} className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-xl group/btn ${currentTeam.usedSkip ? 'opacity-20 grayscale border-white/5 bg-transparent' : 'bg-white/5 border-2 border-white/10 hover:bg-accent-gold hover:text-black hover:border-accent-gold hover:-translate-y-1'}`}>
                                        <FastForward size={18} className="group-hover/btn:translate-x-1 transition-transform" /> SKIP
                                    </button>
                                    <button onClick={() => alert("Scientific Consultation: Based on Dufogen protocols, option " + question.correctOption + " is indicated.")} className="flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-xs tracking-widest bg-blue-600/10 border-2 border-blue-600/30 text-blue-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-xl hover:-translate-y-1 group/btn">
                                        <Users size={18} className="group-hover/btn:scale-110 transition-transform" /> CONSULT
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Result Overlay */}
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
                                        <p className="text-3xl font-bold text-white/50 uppercase tracking-[0.4em] italic">{pointsAwarded > 0 ? `+${pointsAwarded} Bonus XP` : `${pointsAwarded} XP Penalty`}</p>
                                    </div>
                                    <button onClick={nextTurn} className="button-premium px-16 py-8 text-3xl flex items-center gap-6 group rounded-3xl mt-6 shadow-2xl">
                                        <span className="font-black italic tracking-widest pr-2 border-r border-white/20">PROCEED</span>
                                        <ChevronRight className="group-hover:translate-x-3 transition-transform" size={32} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team Status Summary */}
                    <div className="glass p-8 grid grid-cols-2 gap-8 rounded-[2rem] border-white/5 bg-black/40 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-white/5" />
                        <div className="space-y-2 relative z-10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-1">Current XP</span>
                            <div className="text-5xl font-black italic tracking-tighter" style={{ color: currentTeam.color }}>{currentTeam.scoreRound1}</div>
                        </div>
                        <div className="space-y-2 relative z-10 text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 block mb-1">Board Position</span>
                            <div className="text-5xl font-black italic tracking-tighter text-accent-gold">{currentTeam.position || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Round Start Popup */}
            {!isRoundStarted && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-[#0f172a]/90 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="max-w-2xl w-full glass p-16 text-center space-y-10 animate-in zoom-in duration-500 rounded-[3rem] border-t-4 border-accent-gold glow-gold/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-accent-gold animate-progress" />
                        <Trophy size={100} className="mx-auto text-accent-gold animate-float drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]" />
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase italic text-gradient-gold">Expedition</h2>
                                <span className="text-2xl font-light text-white tracking-[0.5em] uppercase opacity-60">Phase One</span>
                            </div>
                            <div className="h-px w-32 bg-white/10 mx-auto" />
                            <p className="text-zinc-400 text-lg leading-relaxed italic pr-6 pl-6">5 Critical Questions per team. <span className="text-accent-gold">10 / 6 / 3 XP</span> and board progression based on response speed. Inaccuracies or timeouts incur a <span className="text-red-500">-1 XP</span> and position penalty.</p>
                        </div>
                        <button onClick={startRound} className="button-premium px-16 py-7 text-2xl flex items-center gap-4 mx-auto group rounded-2xl shadow-2xl">
                            <Play size={28} fill="currentColor" className="group-hover:scale-110 transition-transform" /> <span className="font-black italic tracking-widest">BEGIN EXPEDITION</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Team Turn Popup */}
            {isRoundStarted && showTurnPopup && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="max-w-xl w-full glass p-12 text-center space-y-8 border-b-[12px] animate-in slide-in-from-bottom-20 duration-500 rounded-[3rem] shadow-2xl relative overflow-hidden" style={{ borderColor: currentTeam.color }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/5" />
                        <div className="w-24 h-24 rounded-3xl bg-black/40 border-2 flex items-center justify-center mx-auto transition-transform duration-700 hover:rotate-12 shadow-inner" style={{ borderColor: currentTeam.color, boxShadow: `0 0 40px ${currentTeam.color}20` }}>
                            <Users size={48} style={{ color: currentTeam.color }} />
                        </div>
                        <div className="space-y-3">
                            <span className="text-[10px] font-black italic text-zinc-500 uppercase tracking-[0.6em] block mb-2">Ready for Engagement</span>
                            <h3 className="text-5xl font-black uppercase tracking-tighter text-white female-glow" style={{ color: currentTeam.color }}>{currentTeam.name}</h3>
                            <div className="h-0.5 w-24 bg-white/10 mx-auto mt-4" />
                            <p className="text-xl font-bold text-zinc-400 tracking-widest uppercase italic pt-2">Clinical Scenario Prepared</p>
                        </div>
                        <button onClick={() => setShowTurnPopup(false)} className="button-premium px-12 py-6 text-2xl w-full rounded-2xl shadow-xl group">
                            <span className="font-black italic tracking-widest">VIEW QUESTION</span>
                            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
