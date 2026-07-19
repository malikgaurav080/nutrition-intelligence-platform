import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext.tsx';

export default function Login() {
  const { loginUser, currentUser, error, clearError } = useUser();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard', { replace: true });
    }
    return () => clearError();
  }, [currentUser, navigate, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please enter both email and password');
      return;
    }

    const success = await loginUser({ email, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    
    // Simulate sending OTP
    setOtpSent(true);
    alert('Mock Action: OTP code [123456] sent to ' + forgotEmail);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      alert('Invalid mock OTP code. Try 123456');
      return;
    }
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    
    // Reset password success simulator
    setForgotSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotEmail('');
      setOtpSent(false);
      setOtpCode('');
      setNewPassword('');
      setForgotSuccess(false);
    }, 2000);
  };

  return (
    <div 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-dark)',
        padding: '20px'
      }}
    >
      <div className="premium-card" style={{ maxWidth: '400px', width: '100%' }}>
        <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '1.75rem', textAlign: 'center' }}>
          Welcome Back
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
          Access your health command center
        </p>

        {(formError || error) && (
          <div 
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid var(--error)',
              color: 'var(--error)',
              padding: '10px',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem'
            }}
          >
            {formError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '1rem'
              }}
              placeholder="name@domain.com"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--divider)',
                borderRadius: '8px',
                padding: '12px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '1rem'
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input 
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Remember Me
            </label>
            <button 
              type="button"
              onClick={() => { clearError(); setShowForgotModal(true); }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--secondary)',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button 
            type="submit"
            style={{
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: 'var(--bg-dark)',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
          >
            Authenticate
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Start Onboarding
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal Simulator */}
      {showForgotModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div className="premium-card glass-panel" style={{ maxWidth: '400px', width: '90%' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Reset Security Key</h2>
            
            {forgotSuccess ? (
              <div style={{ color: 'var(--primary)', padding: '20px 0', textAlign: 'center' }}>
                <h3>Password Reset Successful!</h3>
                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>Closing reset window...</p>
              </div>
            ) : !otpSent ? (
              <form onSubmit={handleForgotPasswordSubmit}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Enter your registered email address to receive a verification code.
                </p>
                <div style={{ marginBottom: '1.5rem' }}>
                  <input 
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--divider)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    style={{
                      background: 'none',
                      border: '1px solid var(--divider)',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{
                      backgroundColor: 'var(--secondary)',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Send OTP
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Enter the mock OTP code [123456] sent to you and write a new password.
                </p>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    OTP Verification Code
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--divider)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    New Password
                  </label>
                  <input 
                    type="password"
                    required
                    placeholder="Min 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--divider)',
                      borderRadius: '8px',
                      padding: '12px',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button 
                    type="button"
                    onClick={() => { setOtpSent(false); setOtpCode(''); }}
                    style={{
                      background: 'none',
                      border: '1px solid var(--divider)',
                      color: 'var(--text-primary)',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--bg-dark)',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
