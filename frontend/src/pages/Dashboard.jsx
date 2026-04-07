import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const OPERATIONS = ['uppercase', 'lowercase', 'reverse', 'wordcount'];

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [form, setForm] = useState({ title: '', inputText: '', operation: 'uppercase' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('email');

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data.tasks);
      if (selectedTask) {
        const updated = data.tasks.find(t => t._id === selectedTask._id);
        if (updated) setSelectedTask(updated);
      }
    } catch {}
  }, [selectedTask]);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 3000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true); setError('');
    try {
      await api.post('/tasks', form);
      setForm({ title: '', inputText: '', operation: 'uppercase' });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally { setCreating(false); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <nav>
        <span>AI Task Platform</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#c7d2fe', fontSize: 14 }}>{email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div className="card">
              <h2>Create Task</h2>
              <form onSubmit={handleCreate}>
                <label>Title</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Task title" required />
                <label>Input Text</label>
                <textarea value={form.inputText} onChange={e => setForm({ ...form, inputText: e.target.value })}
                  placeholder="Enter text to process..." rows={4} required style={{ resize: 'vertical' }} />
                <label>Operation</label>
                <select value={form.operation} onChange={e => setForm({ ...form, operation: e.target.value })}>
                  {OPERATIONS.map(op => <option key={op} value={op}>{op}</option>)}
                </select>
                {error && <p className="error">{error}</p>}
                <button className="btn-primary" style={{ width: '100%' }} disabled={creating}>
                  {creating ? 'Creating...' : 'Run Task'}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="card">
              <h2>Tasks ({tasks.length})</h2>
              {tasks.length === 0 && <div className="empty">No tasks yet. Create one!</div>}
              {tasks.map(task => (
                <div key={task._id} className="task-item" onClick={() => setSelectedTask(task)}>
                  <div className="task-header">
                    <strong style={{ fontSize: 14 }}>{task.title}</strong>
                    <span className={`badge ${task.status}`}>{task.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
                    {task.operation} · {new Date(task.createdAt).toLocaleTimeString()}
                  </div>
                  {task.result && (
                    <div style={{ marginTop: 8, fontSize: 13, background: '#f9fafb', padding: '6px 10px', borderRadius: 6 }}>
                      Result: <strong>{task.result}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedTask && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{selectedTask.title}</h2>
              <button className="btn-sm btn-danger" onClick={() => setSelectedTask(null)}>Close</button>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              Operation: {selectedTask.operation} · Status: <span className={`badge ${selectedTask.status}`}>{selectedTask.status}</span>
            </p>
            <p style={{ fontSize: 13 }}><strong>Input:</strong> {selectedTask.inputText}</p>
            {selectedTask.result && <p style={{ fontSize: 13, marginTop: 8 }}><strong>Result:</strong> {selectedTask.result}</p>}
            <div className="logs">
              {selectedTask.logs?.map((log, i) => (
                <p key={i}>[{new Date(log.timestamp).toLocaleTimeString()}] {log.message}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}