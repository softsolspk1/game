"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Trophy, Users, HelpCircle, Phone, FastForward, Split, Dice5, ChevronRight, Award, Loader2 } from "lucide-react";

type Question = {
    id: string;
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
    difficulty: number;
};

type PlayerState = {
    id: number;
    name: string;
    score: number;
    position: number;
    color: string;
    lifelines: {
        fiftyFifty: boolean;
        skip: boolean;
        phone: boolean;
    };
};

function GameContent() {
    const searchParams = useSearchParams();
    const initialPlayerCount = parseInt(searchParams.get("players") || "2");

    const [players, setPlayers] = useState<PlayerState[]>([]);
    const [currentRound, setCurrentRound] = useState(1);
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [round1QuestionsCount, setRound1QuestionsCount] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [showQuestion, setShowQuestion] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
    const [diceRoll, setDiceRoll] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sound effects refs
    const sounds = {
        correct: useRef<HTMLAudioElement | null>(null),
        wrong: useRef<HTMLAudioElement | null>(null),
        dice: useRef<HTMLAudioElement | null>(null),
        win: useRef<HTMLAudioElement | null>(null),
    };

    useEffect(() => {
        const colors = ["#E91E63", "#9C27B0", "#FFC107", "#00E676"];
        const initialPlayers = Array.from({ length: initialPlayerCount }, (_, i) => ({
            id: i + 1,
            name: `Medical Team ${String.fromCharCode(65 + i)}`,
            score: 0,
            position: 0,
            color: colors[i],
            lifelines: { fiftyFifty: true, skip: true, phone: true },
        }));
        setPlayers(initialPlayers);
        fetchQuestions(1);

        // Initialize audio (placeholders/URLs)
        sounds.correct.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        sounds.wrong.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
        sounds.dice.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3');
        sounds.win.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2007/2007-preview.mp3');
    }, [initialPlayerCount]);

    const fetchQuestions = async (difficulty: number) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/questions?difficulty=${difficulty}`);
            const data = await res.json();
            setQuestions(data);
        } catch (e) {
            console.error("Failed to fetch questions");
        } finally {
            setIsLoading(false);
        }
    };

    const playSound = (type: keyof typeof sounds) => {
        const sound = sounds[type].current;
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => { }); // Handle autoplay blocks
        }
    };

    const startRound1 = () => {
        if (questions.length === 0) {
            alert("Initializing Clinical Data... Please wait.");
            return;
        }
        setGameStarted(true);
        nextQuestion();
    };

    const nextQuestion = () => {
        if (questions.length === 0) return;
        const availableQuestions = questions.filter(q => q.id !== currentQuestion?.id);
        const pool = availableQuestions.length > 0 ? availableQuestions : questions;
        const randomIdx = Math.floor(Math.random() * pool.length);
        setCurrentQuestion(pool[randomIdx]);
        setShowQuestion(true);
        setDisabledOptions([]);
        setFeedback(null);
    };

    const handleAnswer = (option: string) => {
        if (!currentQuestion) return;

        const isCorrect = option === currentQuestion.correctOption;
        setFeedback({ isCorrect, show: true });
        playSound(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            if (isCorrect) {
                if (currentRound === 1) {
                    const updatedPlayers = [...players];
                    updatedPlayers[currentPlayerIndex].score += 10;
                    setPlayers(updatedPlayers);
                } else {
                    const updatedPlayers = [...players];
                    let newPos = updatedPlayers[currentPlayerIndex].position + (diceRoll || 0);

                    // Clinical Landmarks (Snakes & Ladders)
                    const transitions: Record<number, number> = {
                        4: 14, 9: 31, 21: 42, 28: 84, 51: 67, 71: 91, 80: 99,
                        17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 79
                    };

                    if (newPos in transitions) {
                        newPos = transitions[newPos];
                    }
                    updatedPlayers[currentPlayerIndex].position = Math.min(newPos, 100);
                    setPlayers(updatedPlayers);

                    if (newPos >= 100) {
                        playSound('win');
                        alert(`${players[currentPlayerIndex].name} HAS ACHIEVED THERAPEUTIC STABILITY!`);
                    }
                }
            }

            setShowQuestion(false);

            if (currentRound === 1) {
                const nextTotal = round1QuestionsCount + 1;
                setRound1QuestionsCount(nextTotal);
                const nextIdx = (currentPlayerIndex + 1) % players.length;
                setCurrentPlayerIndex(nextIdx);

                if (nextTotal === players.length * 3) {
                    setCurrentRound(2);
                    setGameStarted(false);
                    fetchQuestions(2);
                } else {
                    setTimeout(nextQuestion, 500);
                }
            } else {
                setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
                setDiceRoll(null);
            }
        }, isCorrect ? 500 : 1500);
    };

    const rollDice = () => {
        setIsRolling(true);
        setDiceRoll(null);
        playSound('dice');
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceRoll(roll);
            setIsRolling(false);
            setTimeout(nextQuestion, 800);
        }, 1200);
    };

    const useLifeline = (type: 'fiftyFifty' | 'skip' | 'phone') => {
        const updatedPlayers = [...players];
        const player = updatedPlayers[currentPlayerIndex];
        if (!player.lifelines[type] || !currentQuestion) return;
        player.lifelines[type] = false;
        if (type === 'fiftyFifty') {
            const options = ['A', 'B', 'C', 'D'].filter(o => o !== currentQuestion.correctOption);
            const toDisable = options.sort(() => 0.5 - Math.random()).slice(0, 2);
            setDisabledOptions(toDisable);
        } else if (type === 'skip') {
            setShowQuestion(false);
            setTimeout(nextQuestion, 500);
        } else if (type === 'phone') {
            alert("Consultant: Initial LOTUS findings suggest option " + currentQuestion.correctOption + " is the most evidence-based choice.");
        }
        setPlayers(updatedPlayers);
    };

    return (
        <div className="flex flex-col gap-8 md:gap-12 items-center w-full animate-in fade-in duration-1000">
            {/* HUD Section */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 w-full">
                {players.map((p, i) => (
                    <div
                        key={p.id}
                        className={`glass p-5 min-w-[200px] flex-1 transition-all duration-500 relative border ${i === currentPlayerIndex ? 'border-accent-gold scale-105 bg-white/10 glow-gold' : 'border-white/5 opacity-60'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Team</span>
                            <div className="flex gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${p.lifelines.fiftyFifty ? 'bg-accent-magenta' : 'bg-white/10'}`} />
                                <div className={`w-1.5 h-1.5 rounded-full ${p.lifelines.skip ? 'bg-accent-gold' : 'bg-white/10'}`} />
                                <div className={`w-1.5 h-1.5 rounded-full ${p.lifelines.phone ? 'bg-accent-pink' : 'bg-white/10'}`} />
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-4" style={{ color: p.color }}>{p.name}</h4>
                        <div className="flex justify-between items-end">
                            <div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase">Score</div>
                                <div className="text-xl font-black">{p.score}</div>
                            </div>
                            {currentRound === 2 && (
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-zinc-500 uppercase">Progress</div>
                                    <div className="text-xl font-black text-accent-gold">{p.position}%</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Game Interface */}
            <div className="glass w-full max-w-6xl min-h-[520px] flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-3xl border-white/10 shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-magenta via-accent-gold to-accent-magenta opacity-30" />

                {isLoading && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-accent-gold animate-spin" />
                        <p className="text-xs font-black tracking-widest text-zinc-500 uppercase">Synchronizing clinical data...</p>
                    </div>
                )}

                {!isLoading && !gameStarted && currentRound === 1 && (
                    <div className="flex flex-col items-center gap-8 p-12 text-center max-w-2xl animate-in zoom-in duration-500">
                        <span className="px-5 py-1.5 bg-accent-gold/10 text-accent-gold text-xs font-black tracking-[0.3em] rounded-full border border-accent-gold/20">MODULE I: FOUNDATIONAL ASSESSMENT</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">QUALIFYING CLINICAL ROUND</h2>
                        <p className="text-zinc-400 font-light leading-relaxed">Respond to clinical foundational scenarios to determine your case progression speed.</p>
                        <button onClick={startRound1} className="button-premium px-16 text-lg">BEGIN EVALUATION</button>
                    </div>
                )}

                {currentRound === 2 && !showQuestion && !isRolling && !isLoading && (
                    <div className="flex flex-col items-center gap-10 p-12 text-center w-full animate-in fade-in duration-500">
                        <span className="px-5 py-1.5 bg-accent-magenta/10 text-accent-magenta text-xs font-black tracking-[0.3em] rounded-full border border-accent-magenta/20 uppercase">Module II: Expedited Pathway</span>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient-gold">THE LADDER & SNAKE PATHWAY</h2>

                        <div className="flex flex-col md:flex-row items-center gap-16 py-8">
                            <div className="text-left space-y-1">
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Practitioner</p>
                                <p className="text-5xl font-black" style={{ color: players[currentPlayerIndex]?.color }}>{players[currentPlayerIndex]?.name}</p>
                            </div>
                            <div className="relative group">
                                <button onClick={rollDice} className="w-28 h-28 bg-gradient-to-br from-accent-gold to-orange-400 rounded-[32px] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-6 transition-all duration-300 active:scale-95 group relative z-10">
                                    <Dice5 size={56} className="text-primary-dark" />
                                </button>
                                <div className="absolute inset-0 bg-accent-gold blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-black tracking-[0.5em] uppercase opacity-40">Roll to analyze therapeutic progression</p>
                    </div>
                )}

                {isRolling && (
                    <div className="flex flex-col items-center gap-8 text-center animate-pulse">
                        <Dice5 size={96} className="text-accent-gold animate-spin-slow opacity-80" />
                        <div className="space-y-2">
                            <p className="text-2xl font-black tracking-widest text-white uppercase italic">Analyzing Pathway...</p>
                            <div className="w-48 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                                <div className="h-full bg-accent-gold animate-progress w-full" />
                            </div>
                        </div>
                    </div>
                )}

                {showQuestion && currentQuestion && (
                    <div className="absolute inset-0 bg-primary-dark/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 md:p-16 z-50 animate-in fade-in zoom-in duration-1000">
                        <div className="w-full max-w-4xl flex flex-col gap-10">
                            <div className="flex justify-between items-center border-b border-white/5 pb-8">
                                <div className="text-left">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.5em]">Clinical Assessment</span>
                                    <h4 className="text-2xl font-black text-white italic">Scrutinize Evidence</h4>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => useLifeline('fiftyFifty')} disabled={!players[currentPlayerIndex].lifelines.fiftyFifty} className="glass p-3 px-6 text-[10px] font-black hover:bg-white/5 disabled:opacity-30 border-accent-magenta/20 transition-all">50:50</button>
                                    <button onClick={() => useLifeline('skip')} disabled={!players[currentPlayerIndex].lifelines.skip} className="glass p-3 px-6 text-[10px] font-black hover:bg-white/5 disabled:opacity-30 border-accent-gold/20 transition-all">SKIP</button>
                                    <button onClick={() => useLifeline('phone')} disabled={!players[currentPlayerIndex].lifelines.phone} className="glass p-3 px-6 text-[10px] font-black hover:bg-white/5 disabled:opacity-30 border-accent-pink/20 transition-all">CONSULT</button>
                                </div>
                            </div>

                            <div className="space-y-10">
                                <h3 className="text-3xl md:text-5xl font-black leading-tight text-white">{currentQuestion.text}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => handleAnswer(opt)}
                                            disabled={disabledOptions.includes(opt) || feedback?.show}
                                            className={`glass p-6 text-left transition-all duration-300 border flex items-center gap-6 group ${feedback?.show && opt === currentQuestion.correctOption ? 'border-green-500 bg-green-500/10' :
                                                    feedback?.show && opt !== currentQuestion.correctOption ? 'opacity-20 grayscale' :
                                                        disabledOptions.includes(opt) ? 'opacity-0 pointer-events-none' :
                                                            'hover:border-accent-magenta hover:bg-white/5 border-white/10 active:scale-95'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${feedback?.show && opt === currentQuestion.correctOption ? 'bg-green-500 text-white' : 'bg-zinc-900 text-zinc-500 group-hover:bg-accent-magenta group-hover:text-white'
                                                }`}>{opt}</div>
                                            <span className="text-zinc-300 font-bold text-lg group-hover:text-white">
                                                {opt === 'A' ? currentQuestion.optionA : opt === 'B' ? currentQuestion.optionB : opt === 'C' ? currentQuestion.optionC : currentQuestion.optionD}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Progress Board */}
            {currentRound === 2 && (
                <div className="glass w-full max-w-6xl p-10 space-y-8 animate-in slide-in-from-bottom-8 duration-700 backdrop-blur-lg">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.4em]">Expedition Tracking</span>
                            <h4 className="text-3xl font-black text-white italic">Pathway to Clinical Stability</h4>
                        </div>
                        <div className="flex gap-4">
                            {players.map(p => (
                                <div key={p.id} className="flex items-center gap-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/10">
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ backgroundColor: p.color }} />
                                    <span className="text-xs font-black uppercase tracking-tighter" style={{ color: p.color }}>{p.name.split(' ').pop()}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative h-24 bg-black/40 rounded-3xl flex items-center px-12 border border-white/5 overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)] opacity-30" />
                        {/* 10% Intersections */}
                        <div className="absolute inset-0 flex justify-between px-12 py-2 opacity-5 pointer-events-none">
                            {Array.from({ length: 11 }).map((_, i) => <div key={i} className="h-full border-r border-white" />)}
                        </div>

                        {players.map((p, i) => (
                            <div
                                key={p.id}
                                className="absolute h-1.5 transition-all duration-1000 rounded-full"
                                style={{
                                    left: '48px',
                                    width: `calc(${p.position}% - 96px)`,
                                    backgroundColor: p.color,
                                    top: `${25 + (i * 18)}%`,
                                    zIndex: 10 + i,
                                    filter: 'drop-shadow(0 0 8px ' + p.color + '44)'
                                }}
                            >
                                <div className="absolute -right-4 -top-3.5 w-10 h-10 rounded-2xl border-4 border-white/10 flex items-center justify-center p-1 bg-zinc-950 shadow-2xl animate-float transition-transform hover:scale-125" style={{ animationDelay: `${i * 0.4}s` }}>
                                    <div className="w-full h-full rounded-xl" style={{ backgroundColor: p.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent-magenta animate-pulse" />
                            <span className="text-[10px] font-black text-zinc-500 tracking-[0.3em] uppercase">Clinical Baseline</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent-gold" />
                            <span className="text-[10px] font-black text-accent-gold tracking-[0.3em] uppercase">Therapeutic Stability</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function GamePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-accent-gold font-bold tracking-[1em] animate-pulse uppercase">Synchronizing Expedition...</div>}>
            <GameContent />
        </Suspense>
    );
}
