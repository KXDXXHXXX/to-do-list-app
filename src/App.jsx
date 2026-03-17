import React, { useState, useMemo } from 'react';
import { isSameDay, format } from 'date-fns';
import { useLocalStorage } from './hooks/useLocalStorage';
import Calendar from './components/Calendar';
import PomodoroTimer from './components/PomodoroTimer';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';

function App() {
  const [todos, setTodos] = useLocalStorage('pomodoro_todos', []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTask, setActiveTask] = useState(null);

  // Filter out todos for the selected date
  const filteredTodos = useMemo(() => {
    return todos.filter(t => t.date && isSameDay(new Date(t.date), selectedDate));
  }, [todos, selectedDate]);

  const handleAddTodo = (newTodo) => {
    setTodos(prev => [{ ...newTodo, date: selectedDate.toISOString() }, ...prev]);
  };

  const handleToggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-indigo-100 selection:text-indigo-900 pb-20">
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 bg-clip-text text-transparent">
            FocusFlow
          </h1>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Sidebar: Calendar & Timer */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="sticky top-24 flex flex-col gap-6">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <PomodoroTimer activeTaskName={activeTask} />
            </div>
          </div>

          {/* Main Content: Tasks */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                {isSameDay(selectedDate, new Date()) ? "Today's Focus" : format(selectedDate, 'MMM d, yyyy')}
                <span className="text-sm font-medium bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
                  {filteredTodos.length}
                </span>
              </h2>
              <p className="text-slate-500 mt-2">Manage your tasks and sync them with the Pomodoro timer.</p>
            </div>

            <TodoForm onAdd={handleAddTodo} />

            <div className="mt-8">
              <TodoList
                todos={filteredTodos}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                onStartTimer={setActiveTask}
              />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
