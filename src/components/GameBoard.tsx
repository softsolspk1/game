"use client";

import React from 'react';
import { SNAKES_AND_LADDERS } from '@/lib/gameConstants';

type Team = {
    id: number;
    name: string;
    color: string;
    position: number;
};

interface GameBoardProps {
    teams: Team[];
    containerClassName?: string;
}

const transitions: Record<number, number> = SNAKES_AND_LADDERS;

// Vibrant color palette matching the image
const cellColors = [
    'bg-[#FF9500]/50', // Orange
    'bg-[#FF85B2]/50', // Pink
    'bg-[#5AC8FA]/50', // Blue
    'bg-[#FFCC00]/50', // Yellow
    'bg-[#4CD964]/50', // Green
];

export default function GameBoard({ teams, containerClassName }: GameBoardProps) {
    const rows = [];
    for (let r = 9; r >= 0; r--) {
        const row = [];
        for (let c = 0; c < 10; c++) {
            let num;
            if (r % 2 === 0) { num = r * 10 + c + 1; }
            else { num = r * 10 + (9 - c) + 1; }
            row.push(num);
        }
        rows.push(row);
    }

    return (
        <div className={`relative w-full rounded-2xl bg-[#1e293b] border-8 border-[#0f172a] shadow-2xl overflow-hidden ${containerClassName || 'aspect-square max-w-[650px] mx-auto'}`}>
            {/* Actual Board Image Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 opacity-100"
                style={{ backgroundImage: "url('/board.png')" }}
            />

            <div className="relative z-10 grid grid-cols-10 h-full w-full pointer-events-none">
                {rows.map((row) => (
                    row.map((num) => {
                        // The cells are now transparent, just for piece alignment
                        return (
                            <div
                                key={num}
                                className="relative flex flex-col items-center justify-center"
                            >
                                {/* We can keep small debug numbers or remove them */}
                                {/* <span className="absolute top-1 left-1.5 text-[8px] font-black text-black/10">{num}</span> */}

                                {/* Team Pieces */}
                                <div className="absolute inset-0 flex items-center justify-center gap-1 z-30">
                                    {teams.filter(t => t.position === num).map(t => (
                                        <div
                                            key={t.id}
                                            className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,255,255,1)] animate-float pointer-events-auto flex items-center justify-center relative overflow-hidden group/piece"
                                            style={{
                                                backgroundColor: t.color,
                                                boxShadow: `0 0 30px ${t.color}`,
                                                zIndex: 100 + t.id
                                            }}
                                        >
                                            {/* Inner Gloss */}
                                            <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent" />
                                            {/* Team Initials or ID if more than one piece on same square could be added here, but keep it simple for now as requested */}
                                            <div className="absolute -inset-1 bg-white/20 blur-sm opacity-0 group-hover/piece:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ))}
            </div>
        </div>
    );
}
