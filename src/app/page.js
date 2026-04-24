'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus } from 'react-icons/fi';

export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'completed'
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

// Filter the todos based on current filter
const filteredTodos = todos.filter(todo => {
  if (filter === 'active') return !todo.completed
  if (filter === 'completed') return todo.completed
  return true // 'all'
})

  useEffect(() => { setIsMounted(true) }, []);

  useEffect(() => {
    if (isMounted) {
      const saved = localStorage.getItem('todos');
      if (saved) setTodos(JSON.parse(saved));
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, {
      id: Date.now(),
      text: input.trim(),
      completed: false
    }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id? {...todo, completed:!todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id!== id));
  };
const startEdit = (todo) => {
  setEditingId(todo.id)
  setEditText(todo.text)
}

const saveEdit = () => {
  if (editText.trim()) {
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editText } : todo
    ))
  }
  setEditingId(null)
  setEditText('')
}

const cancelEdit = () => {
  setEditingId(null)
  setEditText('')
}

const clearCompleted = () => {
  setTodos(todos.filter(todo => !todo.completed))
}

  const completedCount = todos.filter(t => t.completed).length;

  if (!isMounted) return <div className="min-h-screen bg-neutral-900" />;

  return (
    <main className="min-h-screen bg-neutral-900 text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Todo Pro v0.2</h1>
        <p className="text-neutral-400 mb-6">Day 14 of 100 Days of Code</p>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-neutral-800 border-neutral-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-teal-500 hover:bg-teal-400 px-6 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            <FiPlus /> Add
          </motion.button>
        </form>
{/* Filter Buttons */}
<div className="flex gap-2 mb-4 justify-center">
  {['all', 'active', 'completed'].map(f => (
    <button
      key={f}
      onClick={() => setFilter(f)}
      className={`px-3 py-1 rounded-lg capitalize transition ${
        filter === f 
          ? 'bg-blue-500 text-white' 
          : 'bg-neutral-700 text-neutral-300 hover:bg-neutral-600'
      }`}
>
      {f}
    </button>
  ))}
  {completedCount > 0 && (
  <button
    onClick={clearCompleted}
    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
  >
    Clear completed
  </button>
)}
</div>
        <div className="mb-4 text-sm text-neutral-400">
          {filteredTodos.length} items • {completedCount} completed
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {filteredTodos.map(todo => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 rounded-lg p-4"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 accent-teal-500 cursor-pointer"
                />
{editingId === todo.id ? (
  <input
    autoFocus
    value={editText}
    onChange={(e) => setEditText(e.target.value)}
    onBlur={saveEdit}
    onKeyDown={(e) => {
      if (e.key === 'Enter') saveEdit()
      if (e.key === 'Escape') cancelEdit()
    }}
    className="flex-1 bg-neutral-700 text-white px-2 py-1 rounded outline-none"
  />
) : (
  <span 
    onDoubleClick={() => startEdit(todo)}
    className={`flex-1 cursor-pointer ${todo.completed ? 'line-through text-neutral-500' : ''}`}
  >
    {todo.text}
  </span>
)}

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTodo(todo.id)}
                  className="text-rose-500 hover:text-rose-400 p-2"
                >
                  <FiTrash2 />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredTodos.length === 0 && (
          <p className="text-center text-neutral-500 mt-12">No tasks yet. Add one above!</p>
        )}
      </div>
    </main>
  );
}