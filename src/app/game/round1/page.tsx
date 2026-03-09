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
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && timerActive) {
            handleTimeOut();
        }
        return () => clearInterval(interval);
    }, [timerActive, timeLeft]);

    // Audio refs for more reliable playback
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
            <div className="flex justify-between items-center glass p-3 shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-black text-gold tracking-widest hidden md:block">EXPEDITION ROUND 1</h2>
                    <div className="flex gap-2">
                        {teams.map((t, i) => (
                            <div
                                key={t.id}
                                className={`px-4 py-1 rounded-lg border-2 transition-all ${currentTeamIndex === i ? 'bg-white/10 scale-105 shadow-lg' : 'opacity-40'}`}
                                style={{ borderColor: currentTeamIndex === i ? t.color : 'transparent' }}
                            >
                                <div className="text-[12px] font-black" style={{ color: t.color }}>{t.scoreRound1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Q Asked</span>
                        <div className="text-xl font-black text-white">
                            {questionsAnsweredPerTeam[currentTeam.id] || 0} / {QUESTIONS_PER_ROUND}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}s
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full border" style={{ borderColor: `${currentTeam.color}40`, color: currentTeam.color }}>
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentTeam.color, boxShadow: `0 0 10px ${currentTeam.color}` }} />
                        <span className="text-sm font-bold uppercase tracking-widest">{currentTeam.name}</span>
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

                {/* Right Side: Question & Answers */}
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    <div className="glass p-8 flex-1 flex flex-col justify-center relative border-t-4" style={{ borderColor: currentTeam.color }}>
                        <div className="w-full flex flex-col gap-8 relative shrink-0">
                            <div className="space-y-2">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-white/5 border-2 shrink-0 animate-in zoom-in duration-700" style={{ borderColor: currentTeam.color, boxShadow: `0 0 20px ${currentTeam.color}20` }}>
                                        <Users size={28} style={{ color: currentTeam.color }} />
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                                        {question.text}
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {['A', 'B', 'C', 'D'].map((letter) => {
                                    if (hiddenOptions.includes(letter)) return <div key={letter} className="p-5 border-2 border-transparent" />;
                                    const isSelected = selectedOption === letter;
                                    const isRight = showResult && letter === question.correctOption;
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
                                            className={`p-6 rounded-2xl border-2 text-left transition-all ${bgClass} flex items-center gap-5 group`}
                                        >
                                            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg bg-black/50 group-hover:scale-110 transition-transform`}>
                                                {letter}
                                            </div>
                                            <div className="text-lg font-bold leading-snug">
                                                {question[`option${letter}` as keyof Question]}
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Lifelines */}
                            {!showResult && (
                                <div className="flex gap-4 justify-start pt-4">
                                    <button onClick={use5050} disabled={currentTeam.used5050} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm transition-all ${currentTeam.used5050 ? 'opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:bg-accent-magenta hover:border-accent-magenta hover:text-white'}`}>
                                        <HelpCircle size={20} /> 50:50
                                    </button>
                                    <button onClick={useSkip} disabled={currentTeam.usedSkip} className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm transition-all ${currentTeam.usedSkip ? 'opacity-30 grayscale' : 'bg-white/5 border border-white/10 hover:bg-accent-gold hover:text-black hover:border-accent-gold'}`}>
                                        <FastForward size={20} /> SKIP
                                    </button>
                                    <button onClick={() => alert("Scientific Consultation: Based on Dufogen protocols, option " + question.correctOption + " is indicated.")} className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm bg-white/5 border border-white/10 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                                        <Users size={20} /> CONSULT
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Result Overlay */}
                        {showResult && (
                            <div className="absolute inset-0 bg-[#0f172a]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 z-50 p-8 text-center">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="relative">
                                        {isCorrect ? <CheckCircle2 size={120} className="text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" /> : <XCircle size={120} className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]" />}
                                    </div>
                                    <div>
                                        <h2 className={`text-6xl font-black tracking-tighter ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                                            {isCorrect ? 'VERIFIED' : 'FAILED'}
                                        </h2>
                                        <p className="text-2xl font-bold text-white/60 mt-2 uppercase tracking-widest">{pointsAwarded > 0 ? `+${pointsAwarded} Bonus Points` : `${pointsAwarded} XP Penalty`}</p>
                                    </div>
                                    <button onClick={nextTurn} className="button-premium px-12 py-6 text-2xl flex items-center gap-4 group">
                                        PROCEED <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team Status Summary */}
                    <div className="glass p-6 grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current XP</span>
                            <div className="text-3xl font-black" style={{ color: currentTeam.color }}>{currentTeam.scoreRound1}</div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Current Position</span>
                            <div className="text-3xl font-black text-accent-gold">{currentTeam.position || 0}</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Round Start Popup */}
            {!isRoundStarted && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="max-w-xl w-full glass p-12 text-center space-y-8 animate-in zoom-in duration-500">
                        <Trophy size={80} className="mx-auto text-accent-gold" />
                        <div className="space-y-4">
                            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Expedition Round 1</h2>
                            <p className="text-zinc-400 font-medium">5 Questions per team. 10/6/3 XP & Board Position based on speed. Incorrect answers or timeouts result in -1 XP and -1 position penalty.</p>
                        </div>
                        <button onClick={startRound} className="button-premium px-12 py-5 text-xl flex items-center gap-3 mx-auto">
                            <Play size={24} fill="currentColor" /> BEGIN EXPEDITION
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
                            <h3 className="text-4xl font-black uppercase">{currentTeam.name}</h3>
                            <p className="text-lg font-bold text-zinc-400 tracking-widest uppercase">Your Question is Ready</p>
                        </div>
                        <button onClick={() => setShowTurnPopup(false)} className="button-premium px-10 py-4 text-lg w-full">
                            VIEW QUESTION
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
