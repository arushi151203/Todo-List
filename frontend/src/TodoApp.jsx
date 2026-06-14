import { useState, useMemo, useEffect } from "react";

const API = "http://localhost:5000/api/tasks";

const CATEGORIES = ["Academic", "Project", "Personal", "Internship"];

const CATEGORY_COLORS = {
  Academic:   { bg: "rgba(139,92,246,0.18)", text: "#c4b5fd", dot: "#8b5cf6" },
  Project:    { bg: "rgba(59,130,246,0.18)",  text: "#93c5fd", dot: "#3b82f6" },
  Personal:   { bg: "rgba(52,211,153,0.18)",  text: "#6ee7b7", dot: "#10b981" },
  Internship: { bg: "rgba(251,146,60,0.18)",  text: "#fdba74", dot: "#f97316" },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// maps backend field names (due_date, done) to frontend names (dueDate, done)
function mapTask(t) {
  return {
    id:       t.id,
    title:    t.title,
    category: t.category,
    priority: t.priority,
    dueDate:  t.due_date ? t.due_date.split("T")[0] : "",
    done:     t.done,
  };
}

const EMPTY_FORM = { title: "", category: "Academic", priority: false, dueDate: "" };


export default function TodoApp() {

  const [tasks, setTasks]         = useState([]);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask]   = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);

  // fetch all tasks from backend on page load
  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => setTasks(data.map(mapTask)))
      .catch(err => console.error("Failed to fetch tasks:", err));
  }, []);

  // dynamic values for the stats bar and progress fill
  const total          = tasks.length;
  const completedCount = tasks.filter(t => t.done).length;
  const percent        = total === 0 ? 0 : Math.round((completedCount / total) * 100);

  const filtered = useMemo(() => {
    return tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  }, [tasks, search]);

  // pending / completed columns
  const pending   = filtered.filter(t => !t.done);
  const completed = filtered.filter(t => t.done);

  // add new task
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTask(null);
    setShowModal(true);
  };

  const openEdit = (task) => {
    setForm({ title: task.title, category: task.category, priority: task.priority, dueDate: task.dueDate });
    setEditTask(task);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
  };

  const saveTask = async () => {
    if (!form.title.trim()) return;

    const body = {
      title:    form.title,
      category: form.category,
      priority: form.priority,
      due_date: form.dueDate || null,
    };

    if (editTask) {
      // update existing task
      const res = await fetch(`${API}/${editTask.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...body, done: editTask.done }),
      });
      const updated = await res.json();
      setTasks(tasks.map(t => t.id === editTask.id ? mapTask(updated) : t));
    } else {
      // create new task
      const res = await fetch(API, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const created = await res.json();
      setTasks([mapTask(created), ...tasks]);
    }
    closeModal();
  };

  // checkbox - moves task between pending and completed
  const toggleDone = async (id) => {
    const task = tasks.find(t => t.id === id);
    const res  = await fetch(`${API}/${id}`, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        title:    task.title,
        category: task.category,
        priority: task.priority,
        due_date: task.dueDate || null,
        done:     !task.done,
      }),
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === id ? mapTask(updated) : t));
  };

  const deleteTask = async (id) => {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTasks(tasks.filter(t => t.id !== id));
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d1b2e; font-family: 'Inter', sans-serif; min-height: 100vh; }

        .app {
          min-height: 100vh;
          background: #0d1b2e;
          color: #e2e8f0;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: #0d1b2e;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .topbar-left h1 {
          font-size: 42px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -0.3px;
        }
        .topbar-left p {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }
        .topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: #475569;
          pointer-events: none;
        }
        .search-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          color: #e2e8f0;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          padding: 8px 14px 8px 36px;
          width: 220px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .search-input::placeholder { color: #475569; }
        .search-input:focus { border-color: rgba(139,92,246,0.5); background: rgba(255,255,255,0.07); }

        .add-task-btn {
          display: flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          border: none; border-radius: 10px;
          color: #fff; font-size: 13px; font-weight: 600;
          padding: 8px 18px; cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          font-family: 'Inter', sans-serif;
          white-space: nowrap;
        }
        .add-task-btn:hover { opacity: 0.88; transform: translateY(-1px); }

        /* stats bar — counts and progress update dynamically */
        .stats-bar {
          display: flex; align-items: center; gap: 24px;
          padding: 14px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #0d1b2e;
        }
        .stat { font-size: 13px; color: #94a3b8; }
        .stat span { color: #cbd5e1; font-weight: 600; margin-right: 4px; }
        .stat-divider { width: 1px; height: 14px; background: rgba(255,255,255,0.08); }
        .progress-wrap { flex: 1; display: flex; align-items: center; gap: 10px; }
        .progress-track {
          flex: 1; height: 5px;
          background: rgba(255,255,255,0.07);
          border-radius: 999px; overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7c3aed, #06b6d4);
          border-radius: 999px;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
        }
        .progress-pct { font-size: 12px; color: #94a3b8; min-width: 36px; text-align: right; }

        .kanban {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          padding: 24px 32px;
          align-items: start;
        }

        .column {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
        }
        .col-header {
          display: flex; align-items: center; gap: 10px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .col-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .col-dot.dot-pending   { background: #ef4444; box-shadow: 0 0 6px #ef444488; }
        .col-dot.dot-completed { background: #10b981; box-shadow: 0 0 6px #10b98188; }
        .col-title { font-size: 14px; font-weight: 600; color: #cbd5e1; }
        .col-count {
          margin-left: auto;
          background: rgba(255,255,255,0.07);
          border-radius: 20px;
          font-size: 11px; font-weight: 600; color: #64748b;
          padding: 2px 9px;
        }
        .cards-wrap { padding: 12px; display: flex; flex-direction: column; gap: 10px; min-height: 120px; }

        .task-card {
          background: #112030;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 14px 16px;
          transition: border-color 0.2s, transform 0.15s;
          position: relative;
        }
        .task-card:hover { border-color: rgba(255,255,255,0.14); transform: translateY(-1px); }
        .task-card.is-done { opacity: 0.55; }

        .card-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }

        .cat-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          padding: 3px 9px; border-radius: 20px;
          flex-shrink: 0;
        }
        .cat-dot { width: 6px; height: 6px; border-radius: 50%; }

        .priority-star { margin-left: auto; font-size: 16px; line-height: 1; flex-shrink: 0; }

        .card-title {
          font-size: 14px; font-weight: 600; color: #f1f5f9;
          margin-bottom: 5px; line-height: 1.4;
        }
        .task-card.is-done .card-title { text-decoration: line-through; color: #475569; }

        .card-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        .card-date {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #475569;
        }

        .check-wrap {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.18);
          flex-shrink: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s;
          margin-top: 1px;
        }
        .check-wrap.checked { background: #10b981; border-color: #10b981; }
        .check-wrap:hover:not(.checked) { border-color: #7c3aed; }

        .card-actions {
          display: flex; gap: 6px;
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .task-card:hover .card-actions { opacity: 1; }
        .act-btn {
          width: 26px; height: 26px; border-radius: 7px; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.2s;
        }
        .act-btn.edit { background: rgba(255,255,255,0.07); color: #94a3b8; }
        .act-btn.edit:hover { background: rgba(255,255,255,0.13); color: #e2e8f0; }
        .act-btn.del  { background: rgba(239,68,68,0.12); color: #f87171; }
        .act-btn.del:hover { background: rgba(239,68,68,0.25); }

        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; padding: 32px 16px;
          color: #334155;
        }
        .empty-icon { font-size: 28px; opacity: 0.4; }
        .empty-text { font-size: 13px; }

        .overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          padding: 16px;
        }

        .modal {
          background: #112030;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          padding: 28px;
          width: 100%; max-width: 460px;
          position: relative;
        }
        .modal-title { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-bottom: 22px; }
        .modal-close {
          position: absolute; top: 20px; right: 20px;
          width: 30px; height: 30px; border-radius: 8px;
          border: none; background: rgba(255,255,255,0.07);
          color: #64748b; cursor: pointer; font-size: 16px;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .modal-close:hover { background: rgba(255,255,255,0.12); color: #e2e8f0; }

        .field { margin-bottom: 16px; }
        .field label {
          display: block; font-size: 12px; font-weight: 600;
          color: #64748b; margin-bottom: 6px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .field input, .field select {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          color: #e2e8f0; font-size: 14px; font-family: 'Inter', sans-serif;
          padding: 10px 14px; outline: none;
          transition: border-color 0.2s;
        }
        .field input:focus, .field select:focus { border-color: rgba(139,92,246,0.5); }
        .field input::placeholder { color: #334155; }
        .field select { appearance: none; cursor: pointer; }
        .field select option { background: #0d1b2e; }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        .priority-row {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.2s;
          margin-bottom: 20px;
        }
        .priority-row:hover { border-color: rgba(255,255,255,0.15); }
        .priority-checkbox {
          width: 18px; height: 18px; border-radius: 5px;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: background 0.2s, border-color 0.2s;
        }
        .priority-checkbox.on { background: #7c3aed; border-color: #7c3aed; }
        .priority-label { font-size: 14px; color: #94a3b8; flex: 1; }
        .priority-star-label { font-size: 16px; }

        .modal-footer { display: flex; gap: 10px; margin-top: 4px; }
        .btn-cancel {
          flex: 1; padding: 11px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.05);
          color: #64748b; font-size: 14px; font-weight: 500;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: background 0.2s, color 0.2s;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.09); color: #94a3b8; }
        .btn-save {
          flex: 1; padding: 11px; border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6d28d9, #7c3aed);
          color: #fff; font-size: 14px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif;
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-save:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-save:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      <div className="app">

        <div className="topbar">
          <div className="topbar-left">
            <h1>My Task</h1>
            <p>Plan, track, and complete your assignments efficiently.</p>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* add new task */}
            <button className="add-task-btn" onClick={openAdd}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* stats bar — updates dynamically as tasks are added/completed */}
        <div className="stats-bar">
          <div className="stat"><span>{total}</span>Total</div>
          <div className="stat-divider" />
          <div className="stat"><span>{pending.length}</span>Pending</div>
          <div className="stat-divider" />
          <div className="stat"><span>{completedCount}</span>Completed</div>
          <div className="stat-divider" />
          <div className="progress-wrap">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
          <div className="progress-pct">{percent}% done</div>
        </div>

        <div className="kanban">

          {/* pending column */}
          <div className="column">
            <div className="col-header">
              <div className="col-dot dot-pending" />
              <span className="col-title">Pending</span>
              <span className="col-count">{pending.length}</span>
            </div>
            <div className="cards-wrap">
              {pending.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No pending tasks</div>
                </div>
              )}
              {pending.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleDone}
                  onEdit={openEdit}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>

          {/* completed column */}
          <div className="column">
            <div className="col-header">
              <div className="col-dot dot-completed" />
              <span className="col-title">Completed</span>
              <span className="col-count">{completed.length}</span>
            </div>
            <div className="cards-wrap">
              {completed.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-text">Nothing completed yet</div>
                </div>
              )}
              {completed.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleDone}
                  onEdit={openEdit}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {showModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-title">{editTask ? "Edit Task" : "New Task"}</div>
            <button className="modal-close" onClick={closeModal}>✕</button>

            <div className="field">
              <label>Title *</label>
              <input
                placeholder="Task title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>

            <div className="two-col">
              <div className="field">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="priority-row" onClick={() => setForm(f => ({ ...f, priority: !f.priority }))}>
              <div className={`priority-checkbox${form.priority ? " on" : ""}`}>
                {form.priority && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </div>
              <span className="priority-label">Mark as priority task</span>
              <span className="priority-star-label">⭐</span>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeModal}>Cancel</button>
              <button
                className="btn-save"
                onClick={saveTask}
                disabled={!form.title.trim()}
              >
                {editTask ? "Save Changes" : "Create Task"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}


function TaskCard({ task, onToggle, onEdit, onDelete }) {

  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.Personal;

  return (
    <div className={`task-card${task.done ? " is-done" : ""}`}>

      <div className="card-top">
        <span className="cat-badge" style={{ background: cat.bg, color: cat.text }}>
          <span className="cat-dot" style={{ background: cat.dot }} />
          {task.category}
        </span>
        {task.priority && <span className="priority-star">⭐</span>}
      </div>

      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
        <div
          className={`check-wrap${task.done ? " checked" : ""}`}
          onClick={() => onToggle(task.id)}
        >
          {task.done && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="card-title">{task.title}</div>
        </div>
      </div>

      <div className="card-footer" style={{ marginTop: "10px" }}>
        {task.dueDate && (
          <div className="card-date">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {formatDate(task.dueDate)}
          </div>
        )}
        <div className="card-actions">
          <button className="act-btn edit" onClick={() => onEdit(task)} title="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="act-btn del" onClick={() => onDelete(task.id)} title="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
}