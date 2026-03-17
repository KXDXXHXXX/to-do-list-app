import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Coffee, Brain, Settings } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PomodoroTimer({ activeTask = null }) {
    const [focusMinutes, setFocusMinutes] = useLocalStorage('pomodoro_focus_minutes', 25);
    const [breakMinutes, setBreakMinutes] = useLocalStorage('pomodoro_break_minutes', 5);

    const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [isMuted, setIsMuted] = useLocalStorage('pomodoro_muted', false);
    const [showSettings, setShowSettings] = useState(false);

    const audioCtxRef = useRef(null);

    // Handle new activeTask start
    useEffect(() => {
        if (activeTask && activeTask.timestamp) {
            const time = activeTask.focusTime || 25;
            setFocusMinutes(time);
            setTimeLeft(time * 60);
            setIsBreak(false);
            setIsRunning(true);
        }
    }, [activeTask?.timestamp]);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isRunning && timeLeft === 0) {
            clearInterval(interval);
            playBeep();
            if (!isBreak) {
                setIsBreak(true);
                setTimeLeft(breakMinutes * 60);
            } else {
                setIsBreak(false);
                setTimeLeft(focusMinutes * 60);
                setIsRunning(false);
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, isBreak, focusMinutes, breakMinutes]);

    const playBeep = () => {
        if (isMuted) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, ctx.currentTime);

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);

            // Second beep
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.4);
            gain2.gain.setValueAtTime(0, ctx.currentTime + 0.4);
            gain2.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.45);
            gain2.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);

            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(ctx.currentTime + 0.4);
            osc2.stop(ctx.currentTime + 0.7);

        } catch (e) {
            console.error('Audio playback failed', e);
        }
    };

    const toggleTimer = () => {
        if (showSettings) setShowSettings(false); // Close settings when starting
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(isBreak ? breakMinutes * 60 : focusMinutes * 60);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // test beep function
    const handleTestBeep = () => {
        setTimeLeft(2);
        setIsRunning(true);
    }

    const handleFocusChange = (e) => {
        const val = Math.max(1, parseInt(e.target.value) || 1);
        setFocusMinutes(val);
        if (!isRunning && !isBreak) setTimeLeft(val * 60);
    };

    const handleBreakChange = (e) => {
        const val = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
        setBreakMinutes(val);
        if (!isRunning && isBreak) setTimeLeft(val * 60);
    };

    return (
        <div className={`p-6 rounded-2xl shadow-sm border ${isBreak ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} w-full max-w-sm transition-colors duration-500`}>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    {isBreak ? <Coffee className="w-5 h-5 text-emerald-600" /> : <Brain className="w-5 h-5 text-rose-600" />}
                    <h3 className={`font-semibold ${isBreak ? 'text-emerald-800' : 'text-rose-800'}`}>
                        {isBreak ? 'Break Time' : 'Focus Time'}
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-full hover:bg-white/50 transition-colors ${isMuted ? 'text-slate-400' : 'text-slate-700'}`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-full hover:bg-white/50 transition-colors ${showSettings ? 'bg-white/50 text-indigo-600' : 'text-slate-700'}`}
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="mb-6 p-4 bg-white/60 rounded-xl border border-white/50 shadow-sm transition-all text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Focus (min)</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                value={focusMinutes}
                                onChange={handleFocusChange}
                                disabled={isRunning}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="font-semibold text-slate-600 text-xs uppercase tracking-wider">Break (min)</label>
                            <input
                                type="number"
                                min="1"
                                max="60"
                                value={breakMinutes}
                                onChange={handleBreakChange}
                                disabled={isRunning}
                                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-700 focus:ring-2 focus:ring-indigo-100 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>
                    {isRunning && <p className="text-xs text-rose-500 mt-2 font-medium">Pause the timer to change visual settings.</p>}
                </div>
            )}

            <div className="text-center mb-6">
                <div className={`text-6xl font-bold tracking-tight mb-2 ${isBreak ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatTime(timeLeft)}
                </div>
                <div className="min-h-[1.5rem] text-sm font-medium text-slate-600 flex items-center justify-center">
                    {activeTask ? (
                        <span className="bg-white/60 px-3 py-1 rounded-full shadow-sm max-w-full truncate flex items-center gap-1">
                            <span className="text-xs">🎯</span> {activeTask.text || activeTask.name}
                        </span>
                    ) : (
                        <span>Ready to focus?</span>
                    )}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button onClick={toggleTimer} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${isBreak ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                    {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button onClick={resetTimer} className="w-14 h-14 rounded-full flex items-center justify-center bg-white text-slate-600 shadow-sm border border-slate-200 hover:bg-slate-50 transition-transform active:scale-95">
                    <RotateCcw className="w-6 h-6" />
                </button>
            </div>

            {/* For internal test only */}
            <div className="mt-4 flex justify-center">
                <button onClick={handleTestBeep} className="text-xs text-slate-400 underline hover:text-slate-600 cursor-pointer">
                    Test 2s Timer
                </button>
            </div>
        </div>
    );
}
