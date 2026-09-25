import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role !== 'admin') {
        await logout();
        setError('This account does not have admin access.');
        return;
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <p className="eyebrow">{'{auth}'}</p>
        <h2 className="auth-card__title">Login</h2>
        {resetSuccess && (
          <div className="auth-card__success">Password reset. Please log in with your new password.</div>
        )}
        {error && <div className="auth-card__error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-card__form">
          <div className="contact__field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="contact__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-glow auth-card__submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login →'}
          </button>
        </form>
        <p className="auth-card__switch">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
