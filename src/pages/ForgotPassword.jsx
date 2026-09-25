import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

// Two-step OTP flow, all on one page:
//   Step 1: enter email -> request a 6-digit code
//   Step 2: enter the code + new password -> reset it
// No email link/token involved, so there's no CORS-vs-reset-link base URL
// to keep in sync (the pitfall the earlier link-based version had on
// GitHub Pages project sites).
const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [info, setInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      // Backend always returns the same generic message whether or not the
      // email exists/is allowed, on purpose - don't reveal account info here.
      setInfo(data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, password });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <p className="eyebrow">{'{auth}'}</p>
        <h2 className="auth-card__title">Forgot password</h2>
        {error && <div className="auth-card__error">{error}</div>}
        {info && <div className="auth-card__success">{info}</div>}

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="auth-card__form">
            <div className="contact__field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-glow auth-card__submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset code →'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-card__form">
            <div className="contact__field">
              <label htmlFor="otp">6-digit code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <div className="contact__field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
            <button type="submit" className="btn-glow auth-card__submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password →'}
            </button>
            <button
              type="button"
              className="auth-card__resend"
              onClick={handleResendCode}
              disabled={loading}
            >
              Didn't get a code? Resend
            </button>
          </form>
        )}

        <p className="auth-card__switch">
          <Link to="/login">← Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
