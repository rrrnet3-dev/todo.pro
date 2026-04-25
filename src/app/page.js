'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const editInputRef = useRef(null)

  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) setTodos(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const addTodo = (e) => {
    e.preventDefault()
    if (input.trim() === '') return

    const newTodo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
      dueDate: dueDate || null,
      completedAt: null
    }
    setTodos([...todos, newTodo])
    setInput('')
    setDueDate('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id
     ? {
         ...todo,
           completed:!todo.completed,
           completedAt:!todo.completed? new Date().toISOString() : null
         }
       : todo
    ))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id!== id))
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const saveEdit = (id) => {
    if (editText.trim() === '') {
      deleteTodo(id)
    } else {
      setTodos(todos.map(todo =>
        todo.id === id? {...todo, text: editText.trim() } : todo
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
    setTodos(todos.filter(todo =>!todo.completed))
  }

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return!todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const activeCount = todos.filter(t =>!t.completed).length
  const completedCount = todos.filter(t => t.completed).length
  const today = new Date().toISOString().split('T')[0]

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Todo Pro v0.3.2</h1>
        <p className="text-neutral-400 mb-6">Day 15.2 of 100 Days of Code</p>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-emerald-500 transition"
          />
          <input
            type="date"
            value={dueDate}
            min={today}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-emerald-500 transition text-neutral-300"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition"
          >
            + Add
          </button>
        </form>

        <div className="flex gap-2 mb-4 flex-wrap">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg transition capitalize ${
                filter === f
               ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {f}
            </button>
          ))}
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition ml-auto"
            >
              Clear completed
            </button>
          )}
        </div>

        <div className="mb-4 text-sm text-neutral-400">
          {todos.length} items • {completedCount} completed
        </div>

        <AnimatePresence mode="popLayout">
          {filteredTodos.map(todo => {
            const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date().setHours(0,0,0,0) &&!todo.completed

            return (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`flex items-center gap-3 p-3 mb-2 bg-neutral-900 border rounded-lg ${
                  isOverdue? 'border-red-500/50' : 'border-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />

                {editingId === todo.id? (
                  <input
                    ref={editInputRef}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit(todo.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="flex-1 px-2 py-1 bg-neutral-800 border border-emerald-500 rounded outline-none"
                  />
                ) : (
                  <div className="flex-1">
                    <span
                      onDoubleClick={() => startEdit(todo)}
                      className={`cursor-pointer ${
                        todo.completed? 'line-through text-neutral-500' : ''
                      }`}
                    >
                      {todo.text}
                    </span>
                    {/* Day 15.2: Show both dates */}
                    {(todo.dueDate || todo.completedAt) && (
                      <div className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                        {todo.dueDate && (
                          <span className={
                            todo.completed? 'text-neutral-500' : isOverdue? 'text-red-400' : 'text-neutral-400'
                          }>
                            Due: {new Date(todo.dueDate).toLocaleDateString('en-GB')}
                          </span>
                        )}

                        {todo.completed && todo.completedAt && (
                          <span className="text-emerald-400">
                            ✓ Done: {new Date(todo.completedAt).toLocaleDateString('en-GB')}
                          </span>
                        )}

                        {isOverdue && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">
                            OVERDUE
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-neutral-500 hover:text-red-400 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filteredTodos.length === 0 && (
          <div className="text-center text-neutral-500 py-8">
            {filter === 'active' && 'No active tasks'}
            {filter === 'completed' && 'No completed tasks'}
            {filter === 'all' && 'No tasks yet. Add one above!'}
          </div>
        )}
      </div>
    </main>
  )
}