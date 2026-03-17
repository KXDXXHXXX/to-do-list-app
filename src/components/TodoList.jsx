import React from 'react';
import { Timer, Trash2, Check } from 'lucide-react';

export default function TodoList({ todos, onToggle, onDelete, onStartTimer }) {
    if (!todos || todos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-sm">
                <div className="text-4xl mb-4">✨</div>
                <p>No tasks for this day. Enjoy your free time!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 mt-4">
            {todos.map(todo => (
                <div
                    key={todo.id}
                    className={`group flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 transition-all ${todo.completed ? 'opacity-60 bg-slate-50/50' : 'hover:shadow-md hover:border-indigo-100'
                        }`}
                >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <button
                            onClick={() => onToggle(todo.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${todo.completed ? 'bg-indigo-500 text-white' : 'border-2 border-slate-300 hover:border-indigo-400'
                                }`}
                        >
                            {todo.completed && <Check className="w-4 h-4" />}
                        </button>
                        <div className={`flex flex-col overflow-hidden`}>
                            <span
                                className={`font-medium truncate transition-all ${todo.completed ? 'line-through text-slate-400' : ''}`}
                                style={{ color: todo.completed ? undefined : todo.color }}
                            >
                                {todo.text}
                            </span>
                            <div className="flex items-center mt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    {todo.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                        <button
                            onClick={() => onStartTimer(todo.text)}
                            className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Start Pomodoro Timer"
                        >
                            <Timer className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => onDelete(todo.id)}
                            className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Task"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
