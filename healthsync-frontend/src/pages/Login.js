import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../services/api';
import '../styles/components.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading: authLoading } = useContext(AuthContext);

  const [formMode, setFormMode] = useState('login'); // 'login', 'signup', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = location.state?.from?.pathname || '/dashboard';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password, loginData.rememberMe);
      // Navigation handled by useEffect after login success
    } catch (error) {
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!signupData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.post('/auth/signup', {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password
      });

      setSuccess(data.message || 'Account created successfully! Please check your email to verify your account.');
      setFormMode('login');
      setSignupData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setSuccess('Password reset instructions have been sent to your email.');
      setForgotEmail('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setLoading(true);
      window.location.href = `/api/auth/${provider}`;
    } catch (error) {
      setError(`${provider} login failed`);
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@healthsync.com', 'demo123', false);
    } catch (error) {
      setError('Demo login failed');
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="brand-section">
            <div className="brand-logo">
              <div className="logo-icon">🏥</div>
              <h1>HealthSync</h1>
            </div>
            <p className="brand-tagline">
              Your comprehensive health tracking companion with AI-powered insights
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">📊</div>
              <div>
                <h3>Smart Analytics</h3>
                <p>AI-powered insights from your health data</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔗</div>
              <div>
                <h3>Device Integration</h3>
                <p>Connect with popular fitness trackers and health apps</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎯</div>
              <div>
                <h3>Goal Tracking</h3>
                <p>Set and achieve your personalized health goals</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div>
                <h3>Privacy First</h3>
                <p>Your health data is encrypted and secure</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="form-container">
            {/* Form Mode Tabs */}
            <div className="form-tabs">
              <button
                className={`tab-btn ${formMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setFormMode('login');
                  setError('');
                  setSuccess('');
                }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn ${formMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setFormMode('signup');
                  setError('');
                  setSuccess('');
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            {/* Login Form */}
            {formMode === 'login' && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={loginData.rememberMe}
                      onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setFormMode('forgot')}
                  >
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {formMode === 'signup' && (
              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      id="firstName"
                      type="text"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      placeholder="First name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      id="lastName"
                      type="text"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      placeholder="Last name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail">Email</label>
                  <input
                    id="signupEmail"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword">Password</label>
                  <input
                    id="signupPassword"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Create a password"
                    minLength="8"
                    required
                  />
                  <div className="password-requirements">
                    Password must be at least 8 characters long
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={signupData.agreeToTerms}
                      onChange={(e) => setSignupData({ ...signupData, agreeToTerms: e.target.checked })}
                      required
                    />
                    I agree to the <a href="/terms" target="_blank">Terms of Service</a> and{' '}
                    <a href="/privacy" target="_blank">Privacy Policy</a>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            )}

            {/* Forgot Password Form */}
            {formMode === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-header">
                  <h2>Reset Password</h2>
                  <p>Enter your email address and we'll send you a link to reset your password.</p>
                </div>

                <div className="form-group">
                  <label htmlFor="forgotEmail">Email</label>
                  <input
                    id="forgotEmail"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-full"
                  onClick={() => setFormMode('login')}
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {/* Social Login & Demo (only for login mode) */}
            {formMode === 'login' && (
              <>
                <div className="divider">
                  <span>or continue with</span>
                </div>

                <div className="social-login">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('google')}
                    className="btn btn-social google"
                    disabled={loading}
                  >
                    <span className="social-icon">🔍</span>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSocialLogin('apple')}
                    className="btn btn-social apple"
                    disabled={loading}
                  >
                    <span className="social-icon">🍎</span>
                    Apple
                  </button>
                </div>

                <div className="demo-section">
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="btn btn-outline btn-full"
                    disabled={loading}
                  >
                    Try Demo Account
                  </button>
                  <p className="demo-note">
                    Explore HealthSync with sample data - no signup required
                  </p>
                </div>
              </>
            )}

            {/* Footer Links */}
            <div className="form-footer">
              <div className="footer-links">
                <a href="/help">Help</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
              </div>
              <p className="copyright">
                © 2025 HealthSync. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
