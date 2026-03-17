import React, { useState } from 'react';
import { Plus } from 'lucide-react';

const CATEGORIES = ['Personal', 'Work', 'Study', 'Fitness', 'Other'];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#64748b'];

export default function TodoForm({ onAdd }) {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('Personal');
    const [color, setColor] = useState(COLORS[6]); // Default blue
    const [focusTime, setFocusTime] = useState(25); // Default 25 min

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd({
            id: crypto.randomUUID(),
            text: text.trim(),
            category,
            color,
            focusTime: parseInt(focusTime, 10) || 25,
            completed: false
        });
        setText('');
        setFocusTime(25);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex gap-3 items-center">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-700 placeholder:text-slate-400"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-4 justify-between px-1">
                <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-slate-500 uppercase">Category</span>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-100 focus:border-indigo-400 outline-none p-1.5"
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-slate-500 uppercase">Focus (min)</span>
                    <input
                        type="number"
                        min="1"
                        max="120"
                        value={focusTime}
                        onChange={(e) => setFocusTime(e.target.value)}
                        className="w-14 bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-indigo-100 focus:border-indigo-400 outline-none p-1.5 text-center"
                    />
                </div>

                <div className="flex gap-2 items-center">
                    <span className="text-xs font-medium text-slate-500 uppercase mr-1">Color</span>
                    <div className="flex gap-1.5">
                        {COLORS.slice(0, 5).map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setColor(c)}
                                className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-indigo-400 scale-110 shadow-sm' : 'border-transparent hover:scale-110'} transition-transform`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-6 h-6 p-0 border-0 rounded-full cursor-pointer overflow-hidden appearance-none"
                            style={{ backgroundColor: color }}
                            title="Custom Color"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
