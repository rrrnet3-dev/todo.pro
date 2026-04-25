'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all') // 'all', 'active', 'completed', 'today', 'tomorrow', 'overdue'
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [editingDateId, setEditingDateId] = useState(null)
  const editInputRef = useRef(null)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos')
    if (saved) setTodos(JSON.parse(saved))
  }, [])

  // Save to localStorage when todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Focus edit input when entering edit mode
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

  const updateDueDate = (id, newDate) => {
    setTodos(todos.map(todo =>
      todo.id === id? {...todo, dueDate: newDate || null } : todo
    ))
    setEditingDateId(null)
  }

  const clearCompleted = () => {
    setTodos(todos.filter(todo =>!todo.completed))
  }

  const clearSearch = () => {
    setSearch('')
  }

  // Helper: check if date is today
  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0]
    return dateStr === today
  }

  // Helper: check if date is tomorrow
  const isTomorrow = (dateStr) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return dateStr === tomorrow.toISOString().split('T')[0]
  }

  // Helper: check if overdue
  const isOverdue = (todo) => {
    return todo.dueDate && new Date(todo.dueDate) < new Date().setHours(0,0,0,0) &&!todo.completed
  }

  // Filter + Search + Sort logic
  const filteredTodos = todos
  .filter(todo => {
      // Search filter
      if (search &&!todo.text.toLowerCase().includes(search.toLowerCase())) {
        return false
      }

      // Status filters
      if (filter === 'active') return!todo.completed
      if (filter === 'completed') return todo.completed
      if (filter === 'today') return todo.dueDate && isToday(todo.dueDate) &&!todo.completed
      if (filter === 'tomorrow') return todo.dueDate && isTomorrow(todo.dueDate) &&!todo.completed
      if (filter === 'overdue') return isOverdue(todo)
      return true // 'all'
    })
  .sort((a, b) => {
      // Completed items go to bottom
      if (a.completed &&!b.completed) return 1
      if (!a.completed && b.completed) return -1
      if (a.completed && b.completed) return 0

      // Both incomplete: sort by due date
      if (!a.dueDate &&!b.dueDate) return 0
      if (!a.dueDate) return 1 // No date goes to bottom
      if (!b.dueDate) return -1

      return new Date(a.dueDate) - new Date(b.dueDate)
    })

  const activeCount = todos.filter(t =>!t.completed).length
  const completedCount = todos.filter(t => t.completed).length
  const todayCount = todos.filter(t => t.dueDate && isToday(t.dueDate) &&!t.completed).length
  const tomorrowCount = todos.filter(t => t.dueDate && isTomorrow(t.dueDate) &&!t.completed).length
  const overdueCount = todos.filter(t => isOverdue(t)).length
  const today = new Date().toISOString().split('T')[0]

  const filterButtons = [
    { key: 'all', label: 'All', count: null },
    { key: 'active', label: 'Active', count: activeCount },
    { key: 'completed', label: 'Completed', count: completedCount },
    { key: 'today', label: 'Due Today', count: todayCount },
    { key: 'tomorrow', label: 'Tomorrow', count: tomorrowCount },
    { key: 'overdue', label: 'Overdue', count: overdueCount }
  ]

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Todo Pro v0.4.1</h1>
        <p className="text-neutral-400 mb-6">Day 16 of 100 Days of Code</p>

        {/* Add Form */}
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
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

        {/* Search Bar */}
        <div className="relative mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
            placeholder="Search tasks..."
            className="w-full px-4 py-2 pr-10 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-emerald-500 transition"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {filterButtons.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-lg transition text-sm ${
                filter === f.key
             ? 'bg-emerald-500 text-white'
                : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {f.label} {f.count!== null && f.count > 0 && `(${f.count})`}
            </button>
          ))}
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition ml-auto text-sm"
            >
              Clear completed
            </button>
          )}
        </div>

        <div className="mb-4 text-sm text-neutral-400">
          {filteredTodos.length} {filteredTodos.length === 1? 'item' : 'items'}
          {search && ` matching "${search}"`}
        </div>

        {/* Todo List */}
        <AnimatePresence mode="popLayout">
          {filteredTodos.map(todo => {
            const overdue = isOverdue(todo)
            const dueToday = todo.dueDate && isToday(todo.dueDate) &&!todo.completed
            const dueTomorrow = todo.dueDate && isTomorrow(todo.dueDate) &&!todo.completed

            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`flex items-center gap-3 p-3 mb-2 bg-neutral-900 border rounded-lg ${
                  overdue? 'border-red-500/50' : dueToday? 'border-yellow-500/50' : dueTomorrow? 'border-blue-500/50' : 'border-neutral-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer flex-shrink-0"
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
                  <div className="flex-1 min-w-0">
                    <span
                      onDoubleClick={() => startEdit(todo)}
                      className={`cursor-pointer block truncate ${
                        todo.completed? 'line-through text-neutral-500' : ''
                      }`}
                    >
                      {todo.text}
                    </span>
                    {(todo.dueDate || todo.completedAt) && (
                      <div className="text-xs mt-1 flex items-center gap-2 flex-wrap">
                        {todo.dueDate && (
                          editingDateId === todo.id? (
                            <input
                              type="date"
                              defaultValue={todo.dueDate}
                              min={today}
                              onBlur={(e) => updateDueDate(todo.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') updateDueDate(todo.id, e.target.value)
                                if (e.key === 'Escape') setEditingDateId(null)
                              }}
                              autoFocus
                              className="px-2 py-0.5 bg-neutral-800 border border-emerald-500 rounded outline-none text-neutral-300"
                            />
                          ) : (
                            <button
                              onClick={() => setEditingDateId(todo.id)}
                              className={`hover:underline ${
                                todo.completed? 'text-neutral-500' : overdue? 'text-red-400' : dueToday? 'text-yellow-400' : dueTomorrow? 'text-blue-400' : 'text-neutral-400'
                              }`}
                            >
                              Due: {new Date(todo.dueDate).toLocaleDateString('en-GB')}
                            </button>
                          )
                        )}

                        {todo.completed && todo.completedAt && (
                          <span className="text-emerald-400">
                            ✓ Done: {new Date(todo.completedAt).toLocaleDateString('en-GB')}
                          </span>
                        )}

                        {overdue && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full font-bold">
                            OVERDUE
                          </span>
                        )}
                        {dueToday &&!overdue && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full font-bold">
                            TODAY
                          </span>
                        )}
                        {dueTomorrow && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full font-bold">
                            TOMORROW
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-neutral-500 hover:text-red-400 transition flex-shrink-0"
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
            {search? `No tasks matching "${search}"` :
             filter === 'active'? 'No active tasks' :
             filter === 'completed'? 'No completed tasks' :
             filter === 'today'? 'Nothing due today' :
             filter === 'tomorrow'? 'Nothing planned for tomorrow' :
             filter === 'overdue'? 'No overdue tasks' :
             'No tasks yet. Add one above!'}
          </div>
        )}
      </div>
    </main>
  )
}