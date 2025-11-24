import { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const AdminPanel = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const isLoggedIn = Boolean(token);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Unable to login');
      }
      const data = await res.json();
      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
      setCredentials({ username: '', password: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/responses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('adminToken');
          setToken('');
        }
        const data = await res.json();
        throw new Error(data.message || 'Unable to fetch responses');
      }
      const data = await res.json();
      setResponses(data.responses);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResponses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setResponses([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this response?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/api/admin/responses/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Unable to delete response');
      }
      setResponses((prev) => prev.filter((response) => response._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId('');
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="app-shell admin-shell">
        <div className="admin-card">
          <h1>Admin Login</h1>
          <form className="admin-form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="status-message">{error}</p>}
            <button className="love-btn love-btn--yes" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Let me in'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell admin-shell">
      <div className="admin-card">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Admin dashboard</p>
            <h1>Saved Answers</h1>
          </div>
          <button className="ghost-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>
        <div className="admin-actions">
          <button className="love-btn love-btn--secondary" onClick={fetchResponses} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh list'}
          </button>
          <span>{responses.length} responses</span>
        </div>
        {error && <p className="status-message">{error}</p>}
        <section className="admin-table">
          {responses.length === 0 && !loading && <p>No responses captured yet.</p>}
          {responses.map((response) => (
            <article key={response._id} className="response-card response-card--admin">
              <div className="response-header">
                <p className="response-answer">Answer: {response.answer}</p>
                <button
                  className="ghost-btn ghost-btn--danger"
                  onClick={() => handleDelete(response._id)}
                  disabled={deletingId === response._id}
                >
                  {deletingId === response._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
              {response.note && <p className="response-note">Why: {response.note}</p>}
              {response.prompt && <p className="response-prompt">Question: {response.prompt}</p>}
              <span className="response-date">
                {new Date(response.createdAt).toLocaleString()}
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

export default AdminPanel;

