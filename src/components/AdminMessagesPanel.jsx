import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminMessagesPanel = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/messages');
      setMessages(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (msg) => {
    try {
      const { data } = await api.patch(`/messages/${msg._id}/read`, { read: !msg.read });
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message? This cannot be undone.')) return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="admin-panel">
      <div className="card admin-form" style={{ marginBottom: '1.5rem' }}>
        <h3 className="admin-form__title">
          Inbox {unreadCount > 0 && <span className="badge-chip badge-chip--accent">{unreadCount} unread</span>}
        </h3>
        <p className="admin-page__subtitle">Messages submitted through your portfolio's contact form.</p>
      </div>

      {error && <div className="auth-card__error">{error}</div>}

      <div className="admin-list">
        {loading ? (
          <p className="admin-list__empty">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="admin-list__empty">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div className={`card admin-list__item ${!msg.read ? 'admin-list__item--unread' : ''}`} key={msg._id}>
              <div className="admin-list__item-body">
                <h4>
                  {msg.name} {!msg.read && <span className="badge-chip badge-chip--accent">New</span>}
                </h4>
                <p className="admin-list__meta">
                  {msg.email} · {new Date(msg.createdAt).toLocaleString()}
                </p>
                {msg.subject && <p className="admin-list__meta">Subject: {msg.subject}</p>}
                <p className="admin-list__desc">{msg.message}</p>
              </div>
              <div className="admin-list__item-actions">
                <button type="button" className="btn-outline-glow admin-list__btn" onClick={() => toggleRead(msg)}>
                  {msg.read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button
                  type="button"
                  className="admin-list__btn admin-list__btn--danger"
                  onClick={() => handleDelete(msg._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessagesPanel;
