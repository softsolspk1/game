"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Database } from "lucide-react";

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

export default function AdminPanel() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
        text: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        difficulty: 1,
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        const res = await fetch("/api/questions");
        const data = await res.json();
        setQuestions(data);
    };

    const handleCreate = async () => {
        const res = await fetch("/api/questions", {
            method: "POST",
            body: JSON.stringify(newQuestion),
        });
        if (res.ok) {
            setNewQuestion({
                text: "",
                optionA: "",
                optionB: "",
                optionC: "",
                optionD: "",
                correctOption: "A",
                difficulty: 1,
            });
            fetchQuestions();
        }
    };

    const handleDelete = async (id: string) => {
        const res = await fetch(`/api/questions?id=${id}`, {
            method: "DELETE",
        });
        if (res.ok) fetchQuestions();
    };

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gold flex items-center gap-3">
                    <Database /> QUESTION BANK ADMIN
                </h1>
            </div>

            {/* Add New Question */}
            <div className="glass p-6 female-glow">
                <h2 className="text-xl font-bold mb-6 text-secondary-soft">Create New Question</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Question Text</label>
                        <textarea
                            className="w-full bg-white/5 border border-glass-border rounded-lg p-3 outline-none focus:border-accent-gold"
                            value={newQuestion.text}
                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Option A</label>
                        <input
                            className="w-full bg-white/5 border border-glass-border rounded-lg p-2 outline-none focus:border-accent-gold"
                            value={newQuestion.optionA}
                            onChange={(e) => setNewQuestion({ ...newQuestion, optionA: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Option B</label>
                        <input
                            className="w-full bg-white/5 border border-glass-border rounded-lg p-2 outline-none focus:border-accent-gold"
                            value={newQuestion.optionB}
                            onChange={(e) => setNewQuestion({ ...newQuestion, optionB: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Option C</label>
                        <input
                            className="w-full bg-white/5 border border-glass-border rounded-lg p-2 outline-none focus:border-accent-gold"
                            value={newQuestion.optionC}
                            onChange={(e) => setNewQuestion({ ...newQuestion, optionC: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Option D</label>
                        <input
                            className="w-full bg-white/5 border border-glass-border rounded-lg p-2 outline-none focus:border-accent-gold"
                            value={newQuestion.optionD}
                            onChange={(e) => setNewQuestion({ ...newQuestion, optionD: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Correct Option</label>
                        <select
                            className="w-full bg-primary-deep border border-glass-border rounded-lg p-2 outline-none"
                            value={newQuestion.correctOption}
                            onChange={(e) => setNewQuestion({ ...newQuestion, correctOption: e.target.value })}
                        >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Round Difficulty</label>
                        <select
                            className="w-full bg-primary-deep border border-glass-border rounded-lg p-2 outline-none"
                            value={newQuestion.difficulty}
                            onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: parseInt(e.target.value) })}
                        >
                            <option value={1}>Round 1 (Points)</option>
                            <option value={2}>Round 2 (Dice)</option>
                        </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                        <button
                            onClick={handleCreate}
                            className="bg-accent-gold text-primary-deep px-8 py-3 rounded-full font-bold hover:scale-105 transition-all flex items-center gap-2"
                        >
                            <Plus size={20} /> SAVE TO BANK
                        </button>
                    </div>
                </div>
            </div>

            {/* List Questions */}
            <div className="glass female-glow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-white/10 text-secondary-soft">
                        <tr>
                            <th className="p-4">Question</th>
                            <th className="p-4">Correct</th>
                            <th className="p-4">Round</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {questions.map((q) => (
                            <tr key={q.id} className="border-b border-glass-border hover:bg-white/5">
                                <td className="p-4 max-w-md truncate">{q.text}</td>
                                <td className="p-4 font-bold text-gold">{q.correctOption}</td>
                                <td className="p-4">{q.difficulty}</td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleDelete(q.id)}
                                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
