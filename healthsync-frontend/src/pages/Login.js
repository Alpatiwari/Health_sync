// src/pages/Login.js - Complete Updated Login Page with Firebase Google Authentication
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Login = ({ darkMode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    signInWithGoogle, 
    login, 
    register, 
    forgotPassword, 
    isAuthenticated, 
    loading: authLoading 
  } = useContext(AuthContext);

  const [formMode, setFormMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

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

  // Google Sign In Handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      // Navigation will be handled by useEffect after authentication success
    } catch (error) {
      setError(error.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginData.email, loginData.password, loginData.rememberMe);
      // Navigation will be handled by useEffect after login success
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

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!signupData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const response = await register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password
      });

      if (response.success) {
        // User is automatically logged in after signup
        // Navigation will be handled by useEffect
      }
    } catch (error) {
      setError(error.message || 'Signup failed. Please try again.');
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
      const response = await forgotPassword(forgotEmail);
      setSuccess(response.message || 'Password reset instructions have been sent to your email.');
      setForgotEmail('');
    } catch (error) {
      setError(error.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading HealthSync..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-violet-900/30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/5 rounded-full blur-3xl animate-ping"></div>
      </div>

      {/* Floating Health Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 text-purple-400/20 text-6xl animate-bounce delay-300">💊</div>
        <div className="absolute top-1/3 right-1/4 text-violet-400/20 text-5xl animate-bounce delay-700">❤️</div>
        <div className="absolute bottom-1/4 left-1/3 text-indigo-400/20 text-4xl animate-bounce delay-1000">🏃</div>
        <div className="absolute top-2/3 right-1/3 text-purple-400/20 text-5xl animate-bounce delay-500">🧘</div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Brand & Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12 relative">
          <div className="backdrop-blur-sm bg-slate-800/30 rounded-3xl p-12 border border-slate-700/50 shadow-2xl">
            {/* Brand Section */}
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-6 shadow-lg">
                <span className="text-4xl">🏥</span>
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent mb-4">
                HealthSync
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed">
                Your comprehensive health tracking companion with AI-powered insights
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {[
                { icon: '📊', title: 'Smart Analytics', desc: 'AI-powered insights from your health data' },
                { icon: '🔗', title: 'Device Integration', desc: 'Connect with popular fitness trackers and health apps' },
                { icon: '🎯', title: 'Goal Tracking', desc: 'Set and achieve your personalized health goals' },
                { icon: '🔒', title: 'Privacy First', desc: 'Your health data is encrypted and secure' }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 group hover:transform hover:scale-105 transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:shadow-lg transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Development Notice */}
            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
              <p className="text-blue-400 text-sm">
                <strong>Google Authentication:</strong> Sign in with your Google account for the best experience. 
                Email/password login is also available as a fallback option.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            {/* Glassmorphism Card */}
            <div className="backdrop-blur-xl bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50 shadow-2xl">
              {/* Form Tabs */}
              <div className="flex mb-8 bg-slate-800/50 rounded-2xl p-1 border border-slate-700/30">
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    formMode === 'login'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => {
                    setFormMode('login');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                    formMode === 'signup'
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                  onClick={() => {
                    setFormMode('signup');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Sign Up
                </button>
              </div>

              {/* Messages */}
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-pulse">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm animate-pulse">
                  {success}
                </div>
              )}

              {/* Google Sign In Button - Always visible */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-4 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl border border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] flex items-center justify-center space-x-3"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {formMode !== 'forgot' && (
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800/40 text-slate-400">or continue with email</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              {formMode === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField('')}
                        placeholder="Email address"
                        className={`w-full px-4 py-4 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-400 transition-all duration-300 ${
                          focusedField === 'email' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                        required
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField('')}
                        placeholder="Password"
                        className={`w-full px-4 py-4 bg-slate-800/50 border-2 rounded-xl text-white placeholder-slate-400 transition-all duration-300 ${
                          focusedField === 'password' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                            : 'border-slate-600 hover:border-slate-500'
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={loginData.rememberMe}
                        onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                        className="w-5 h-5 bg-slate-800 border-2 border-slate-600 rounded focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-slate-300 text-sm group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormMode('forgot')}
                      className="text-purple-400 text-sm hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {loading ? 'Signing in...' : 'Sign In with Email'}
                  </button>
                </form>
              )}

              {/* Signup Form */}
              {formMode === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      placeholder="First name"
                      className="px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                      required
                    />
                    <input
                      type="text"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      placeholder="Last name"
                      className="px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                      required
                    />
                  </div>

                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="Email address"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                    required
                  />

                  <input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="Create password"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                    minLength="6"
                    required
                  />

                  <input
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                    required
                  />

                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={signupData.agreeToTerms}
                      onChange={(e) => setSignupData({ ...signupData, agreeToTerms: e.target.checked })}
                      className="w-5 h-5 mt-1 bg-slate-800 border-2 border-slate-600 rounded focus:ring-2 focus:ring-purple-500"
                      required
                    />
                    <span className="text-slate-300 text-sm group-hover:text-white transition-colors">
                      I agree to the <a href="/terms" className="text-purple-400 hover:text-purple-300">Terms</a> and{' '}
                      <a href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</a>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              )}

              {/* Forgot Password Form */}
              {formMode === 'forgot' && (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                    <p className="text-slate-400">Enter your email to receive reset instructions</p>
                  </div>

                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full px-4 py-4 bg-slate-800/50 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 hover:border-slate-500 focus:border-purple-500 focus:shadow-lg focus:shadow-purple-500/20 transition-all duration-300"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormMode('login')}
                    className="w-full py-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all duration-300 border border-slate-600"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex justify-center space-x-6 mb-4">
                  {['Help', 'Contact', 'Privacy', 'Terms'].map((link) => (
                    <a key={link} href={`/${link.toLowerCase()}`} className="text-sm text-slate-400 hover:text-purple-400 transition-colors">
                      {link}
                    </a>
                  ))}
                </div>
                <p className="text-center text-xs text-slate-500">
                  © 2025 HealthSync. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;