"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, HelpCircle, FastForward, CheckCircle2, XCircle, ChevronRight } from "lucide-react";

type Team = {
    id: number;
    name: string;
    color: string;
    scoreRound1: number;
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

    useEffect(() => {
        // Load teams from localStorage
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            setTeams(data.teams || []);
        }

        // Fetch questions
        fetch("/api/questions?difficulty=1")
            .then((res) => res.json())
            .then((data) => {
                // Shuffle questions
                const shuffled = data.sort(() => 0.5 - Math.random());
                setQuestions(shuffled);
            });
    }, []);

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
    const question = questions[currentQuestionIndex];

    const handleTimeOut = () => {
        setTimerActive(false);
        setShowResult(true);
        setIsCorrect(false);
        setPointsAwarded(-1); // Negative marking for timeout
        applyScore(-1);
    };

    const handleAnswer = (option: string) => {
        if (!timerActive) return;
        setTimerActive(false);
        setSelectedOption(option);

        const timeTaken = 30 - timeLeft;
        const correct = option === question.correctOption;
        setIsCorrect(correct);

        let pts = 0;
        if (correct) {
            if (timeTaken <= 10) pts = 5;
            else if (timeTaken <= 20) pts = 3;
            else pts = 2;
        } else {
            pts = -1; // Negative marking
        }

        setPointsAwarded(pts);
        applyScore(pts);
        setShowResult(true);
    };

    const applyScore = (pts: number) => {
        const updated = [...teams];
        updated[currentTeamIndex].scoreRound1 += pts;
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

        if (currentTeamIndex === teams.length - 1) {
            // Round Finished? Let's just do 2 loops per team (8 questions total)
            if (currentQuestionIndex >= 8) {
                endRound1();
                return;
            }
            setCurrentTeamIndex(0);
        } else {
            setCurrentTeamIndex(currentTeamIndex + 1);
        }
        setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const endRound1 = () => {
        const saved = localStorage.getItem("ladder-session");
        if (saved) {
            const data = JSON.parse(saved);
            data.teams = teams;
            data.status = "ROUND2";
            localStorage.setItem("ladder-session", JSON.stringify(data));
        }
        router.push("/game/round2");
    };

    if (questions.length === 0 || !currentTeam) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto py-8">

            {/* Top Bar */}
            <div className="flex justify-between items-center glass p-4">
                <div>
                    <h2 className="text-xl font-bold text-gold tracking-widest">ROUND 1: CLINICAL TRIVIA</h2>
                    <p className="text-sm text-zinc-400">Time-based scoring. -1 for incorrect answers.</p>
                </div>
                <div className="flex gap-4">
                    {teams.map((t, i) => (
                        <div
                            key={t.id}
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${currentTeamIndex === i ? 'bg-white/10 scale-110 shadow-lg' : 'opacity-50 border-transparent'}`}
                            style={{ borderColor: currentTeamIndex === i ? t.color : 'transparent' }}
                        >
                            <div className="text-[10px] font-bold" style={{ color: t.color }}>{t.name}</div>
                            <div className="text-xl font-black">{t.scoreRound1} pts</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Play Area */}
            <div className="glass p-8 md:p-12 relative overflow-hidden" style={{ borderColor: `${currentTeam.color}50` }}>
                <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: currentTeam.color }} />

                <div className="flex justify-between items-end mb-8">
                    <div>
                        <div className="text-sm font-bold uppercase tracking-widest" style={{ color: currentTeam.color }}>
                            Current Turn: {currentTeam.name}
                        </div>
                        <h3 className="text-3xl font-medium mt-2">Question {currentQuestionIndex + 1}</h3>
                    </div>

                    <div className="text-right">
                        <div className={`text-6xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}s
                        </div>
                        <div className="text-xs text-zinc-500 font-bold tracking-widest mt-1">TIME REMAINING</div>
                    </div>
                </div>

                {/* Question Text */}
                <div className="text-2xl md:text-3xl font-semibold leading-relaxed mb-12">
                    "{question.text}"
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {['A', 'B', 'C', 'D'].map((letter) => {
                        if (hiddenOptions.includes(letter)) return <div key={letter} className="p-6 border-2 border-transparent" />; // Placeholder

                        const isSelected = selectedOption === letter;
                        const isRight = showResult && letter === question.correctOption;
                        const isWrong = showResult && isSelected && !isRight;

                        let bgClass = "bg-white/5 hover:bg-white/10 hover:border-white/30";
                        if (isSelected) bgClass = "bg-white/20 border-white";
                        if (isRight) bgClass = "bg-green-500/20 border-green-500 text-green-100";
                        if (isWrong) bgClass = "bg-red-500/20 border-red-500 text-red-100";

                        return (
                            <button
                                key={letter}
                                onClick={() => !showResult && handleAnswer(letter)}
                                disabled={showResult}
                                className={`p-6 rounded-2xl border-2 text-left transition-all ${bgClass} ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex gap-4 items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-black/50 ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                        {letter}
                                    </div>
                                    <div className="text-lg">
                                        {question[`option${letter}` as keyof Question]}
                                    </div>
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Lifelines */}
                {!showResult && (
                    <div className="flex gap-4 justify-center border-t border-white/10 pt-8 mt-4">
                        <button
                            onClick={use5050}
                            disabled={currentTeam.used5050}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${currentTeam.used5050 ? 'bg-zinc-800 text-zinc-600' : 'bg-primary-mid text-accent-pink hover:bg-accent-magenta hover:text-white transition-colors'}`}
                        >
                            <HelpCircle size={20} /> 50:50 Lifeline
                        </button>
                        <button
                            onClick={useSkip}
                            disabled={currentTeam.usedSkip}
                            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold ${currentTeam.usedSkip ? 'bg-zinc-800 text-zinc-600' : 'bg-primary-mid text-accent-gold hover:bg-accent-gold hover:text-black transition-colors'}`}
                        >
                            <FastForward size={20} /> Skip Question
                        </button>
                    </div>
                )}

                {/* Result Overlay */}
                {showResult && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                        {isCorrect ? (
                            <CheckCircle2 size={100} className="text-green-500 mb-6 drop-shadow-[0_0_30px_rgba(34,197,94,0.5)]" />
                        ) : (
                            <XCircle size={100} className="text-red-500 mb-6 drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                        )}

                        <h2 className={`text-5xl font-black mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'CORRECT!' : 'INCORRECT'}
                        </h2>

                        <p className="text-2xl text-white mb-8">
                            {pointsAwarded > 0 ? `+${pointsAwarded} Points` : `${pointsAwarded} Points`}
                        </p>

                        <button onClick={nextTurn} className="button-premium px-12 py-4 text-xl flex items-center gap-3">
                            NEXT TEAM <ChevronRight />
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
