import { useEffect, useState } from 'react';
import api from '../services/api';

const EMPTY_FORM = { bio: '', email: '', phone: '', location: '', educationSummary: '', coreAreas: '' };

const AdminProfilePanel = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/profile')
      .then(({ data }) => {
        setForm({
          bio: data.bio || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          educationSummary: data.educationSummary || '',
          coreAreas: (data.coreAreas || []).join(', '),
        });
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        coreAreas: form.coreAreas.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await api.put('/profile', payload);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="admin-list__empty">Loading…</p>;
  }

  return (
    <form className="card admin-form" onSubmit={handleSubmit}>
      <h3 className="admin-form__title">About / Contact Info</h3>
      <p className="admin-page__subtitle" style={{ marginBottom: '1rem' }}>
        This feeds both the "My Professional Side" bio and the contact card details shown on your portfolio.
      </p>
      {error && <div className="auth-card__error">{error}</div>}
      {saved && <div className="contact__success">Saved — changes are live on your portfolio.</div>}

      <div className="admin-form__grid">
        <div className="contact__field admin-form__field--wide">
          <label htmlFor="profile-bio">Bio</label>
          <textarea
            id="profile-bio"
            rows={4}
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="I'm a developer who enjoys building software that grows and makes a real difference..."
          />
        </div>
        <div className="contact__field">
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="contact__field">
          <label htmlFor="profile-phone">Phone</label>
          <input
            id="profile-phone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 234 567 890"
          />
        </div>
        <div className="contact__field">
          <label htmlFor="profile-location">Location</label>
          <input
            id="profile-location"
            value={form.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Your City, Country"
          />
        </div>
        <div className="contact__field">
          <label htmlFor="profile-eduSummary">Education Summary</label>
          <input
            id="profile-eduSummary"
            value={form.educationSummary}
            onChange={(e) => handleChange('educationSummary', e.target.value)}
            placeholder="B.Tech in Computer Science"
          />
          <span className="admin-form__hint">Short one-liner shown in the About meta list.</span>
        </div>
        <div className="contact__field admin-form__field--wide">
          <label htmlFor="profile-coreAreas">Core Areas</label>
          <input
            id="profile-coreAreas"
            value={form.coreAreas}
            onChange={(e) => handleChange('coreAreas', e.target.value)}
            placeholder="Full-Stack Web Dev, React + Node.js, REST APIs, MongoDB"
          />
          <span className="admin-form__hint">Comma-separated — shown as chips under "Core Areas".</span>
        </div>
      </div>

      <div className="admin-form__actions">
        <button type="submit" className="btn-glow" disabled={saving}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
};

export default AdminProfilePanel;
