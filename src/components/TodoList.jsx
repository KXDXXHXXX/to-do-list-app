import React, { useState, useRef, useEffect } from 'react';
import { Timer, Trash2, Check, Pencil, GripVertical, ChevronDown } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

const CATEGORIES = ["Personal", "Work", "Study", "Shopping", "Health"];

function SortableItem({ todo, onToggle, onDelete, onStartTimer, onUpdate, onUpdateCategory, onUpdateFocusTime }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: todo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.9 : 1,
    };

    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const inputRef = useRef(null);

    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [categoryInput, setCategoryInput] = useState(todo.category || "");
    const categoryRef = useRef(null);

    const [isEditingTime, setIsEditingTime] = useState(false);
    const [timeInput, setTimeInput] = useState(todo.focusTime || 25);
    const timeRef = useRef(null);

    // Focus text input when editing starts
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    // Handle clicking outside to close category dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsEditingCategory(false);
            }
        };

        if (isEditingCategory) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditingCategory]);

    // Handle clicking outside to close time input
    useEffect(() => {
        const handleClickOutsideTime = (event) => {
            if (timeRef.current && !timeRef.current.contains(event.target)) {
                setIsEditingTime(false);
            }
        };

        if (isEditingTime) {
            document.addEventListener('mousedown', handleClickOutsideTime);
        } else {
            document.removeEventListener('mousedown', handleClickOutsideTime);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutsideTime);
        };
    }, [isEditingTime]);

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

    const handleCategoryChange = (newCategory) => {
        if (newCategory.trim() !== "") {
            onUpdateCategory(todo.id, newCategory.trim());
        }
        setIsEditingCategory(false);
    };

    const handleCategoryKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCategoryChange(categoryInput);
        } else if (e.key === 'Escape') {
            setIsEditingCategory(false);
        }
    };

    const handleTimeChange = (newTime) => {
        const parsed = parseInt(newTime, 10);
        if (!isNaN(parsed) && parsed > 0) {
            onUpdateFocusTime(todo.id, parsed);
        }
        setIsEditingTime(false);
    };

    const handleTimeKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleTimeChange(timeInput);
        } else if (e.key === 'Escape') {
            setIsEditingTime(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group flex items-center justify-between p-4 bg-white rounded-2xl border transition-all ${isDragging ? 'shadow-lg border-indigo-400 scale-[1.02]' : 'shadow-sm border-slate-100 hover:shadow-md hover:border-indigo-100'
                } ${todo.completed && !isDragging ? 'opacity-60 bg-slate-50/50' : ''}`}
        >
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <button
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors py-1"
                >
                    <GripVertical className="w-5 h-5 pointer-events-none" />
                </button>
                <button
                    onClick={() => onToggle(todo.id)}
                    className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors ${todo.completed ? 'bg-indigo-500 text-white' : 'border-2 border-slate-300 hover:border-indigo-400'
                        }`}
                >
                    {todo.completed && <Check className="w-4 h-4" />}
                </button>

                <div className={`flex flex-col overflow-visible flex-1 mr-4`}>
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

                    <div className="flex items-center gap-2 mt-1">
                        {/* Editable Category Badge */}
                        <div className="relative" ref={categoryRef}>
                            {isEditingCategory ? (
                                <div className="absolute top-0 left-0 z-20 flex bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden flex-col min-w-[120px]">
                                    <input
                                        type="text"
                                        value={categoryInput}
                                        onChange={(e) => setCategoryInput(e.target.value)}
                                        onKeyDown={handleCategoryKeyDown}
                                        autoFocus
                                        placeholder="New Category..."
                                        className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-50 border-b border-slate-100 focus:outline-none"
                                    />
                                    <div className="max-h-32 overflow-y-auto">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => handleCategoryChange(cat)}
                                                className="w-full text-left px-3 py-1.5 text-xs uppercase font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => !todo.completed && setIsEditingCategory(true)}
                                    className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 transition-colors ${!todo.completed ? 'cursor-pointer hover:bg-indigo-100 hover:text-indigo-600' : ''}`}
                                    title={!todo.completed ? "Edit Category" : ""}
                                >
                                    {todo.category}
                                    {!todo.completed && <ChevronDown className="w-3 h-3 opacity-50" />}
                                </div>
                            )}
                        </div>

                        {/* Editable Focus Time Badge */}
                        <div className="relative" ref={timeRef}>
                            {isEditingTime ? (
                                <div className="absolute top-0 left-0 z-20 flex bg-white border border-slate-200 shadow-md rounded-lg overflow-hidden flex-col w-[60px]">
                                    <input
                                        type="number"
                                        min="1"
                                        max="120"
                                        value={timeInput}
                                        onChange={(e) => setTimeInput(e.target.value)}
                                        onKeyDown={handleTimeKeyDown}
                                        autoFocus
                                        className="px-2 py-1 text-xs font-bold text-rose-600 bg-rose-50 focus:outline-none text-center"
                                    />
                                </div>
                            ) : (
                                <div
                                    onClick={() => !todo.completed && setIsEditingTime(true)}
                                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 transition-colors ${!todo.completed ? 'cursor-pointer hover:bg-rose-100 hover:text-rose-700' : ''}`}
                                    title={!todo.completed ? "Edit Focus Time" : ""}
                                >
                                    ⏱️ {todo.focusTime || 25}m
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`flex items-center gap-1 transition-opacity ml-2 ${isDragging ? 'opacity-0' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'}`}>
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
                    onClick={() => onStartTimer(todo)}
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
    );
}

export default function TodoList({ todos, onToggle, onDelete, onStartTimer, onUpdate, onUpdateCategory, onUpdateFocusTime, onReorder }) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (!todos || todos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 text-sm">
                <div className="text-4xl mb-4">✨</div>
                <p>No tasks for this day. Enjoy your free time!</p>
            </div>
        );
    }

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            onReorder(active.id, over.id);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
        >
            <div className="flex flex-col gap-3 mt-4">
                <SortableContext
                    items={todos.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {todos.map(todo => (
                        <SortableItem
                            key={todo.id}
                            todo={todo}
                            onToggle={onToggle}
                            onDelete={onDelete}
                            onStartTimer={onStartTimer}
                            onUpdate={onUpdate}
                            onUpdateCategory={onUpdateCategory}
                            onUpdateFocusTime={onUpdateFocusTime}
                        />
                    ))}
                </SortableContext>
            </div>
        </DndContext>
    );
}
