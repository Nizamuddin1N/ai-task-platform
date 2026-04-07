import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: 400 }}>
        <h1 style={{ textAlign: 'center', color: '#4f46e5' }}>AI Task Platform</h1>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          <label>Password (min 6 chars)</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" minLength={6} required />
          {error && <p className="error">{error}</p>}
          <button className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 14 }}>
          Have account? <Link to="/login" style={{ color: '#4f46e5' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}