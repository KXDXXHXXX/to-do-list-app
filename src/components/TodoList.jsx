import React, { useState, useRef, useEffect } from 'react';
import { Timer, Trash2, Check, Pencil } from 'lucide-react';

export default function TodoList({ todos, onToggle, onDelete, onStartTimer, onUpdate }) {
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const inputRef = useRef(null);

    // Focus input when editing starts
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    if (!todos || todos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-sm">
                <div className="text-4xl mb-4">✨</div>
                <p>No tasks for this day. Enjoy your free time!</p>
            </div>
        );
    }

    const startEditing = (id, currentText) => {
        setEditingId(id);
        setEditText(currentText);
    };

    const submitEdit = (id) => {
        if (editText.trim() !== "") {
            onUpdate(id, editText.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e, id) => {
        if (e.key === 'Enter') {
            submitEdit(id);
        } else if (e.key === 'Escape') {
            setEditingId(null);
        }
    };

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

                        <div className={`flex flex-col overflow-hidden flex-1 mr-4`}>
                            {editingId === todo.id ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onBlur={() => submitEdit(todo.id)}
                                    onKeyDown={(e) => handleKeyDown(e, todo.id)}
                                    className="font-medium bg-slate-50 text-slate-800 border border-indigo-300 rounded-md px-2 py-0.5 outline-none focus:ring-2 focus:ring-indigo-100 w-full"
                                />
                            ) : (
                                <span
                                    onDoubleClick={() => !todo.completed && startEditing(todo.id, todo.text)}
                                    className={`font-medium truncate transition-all cursor-text ${todo.completed ? 'line-through text-slate-400' : ''}`}
                                    style={{ color: todo.completed ? undefined : todo.color }}
                                >
                                    {todo.text}
                                </span>
                            )}
                            <div className="flex items-center mt-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                                    {todo.category}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity ml-2">
                        {!todo.completed && editingId !== todo.id && (
                            <button
                                onClick={() => startEditing(todo.id, todo.text)}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                                title="Edit Task"
                            >
                                <Pencil className="w-5 h-5" />
                            </button>
                        )}
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
