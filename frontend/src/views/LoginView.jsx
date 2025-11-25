// src/views/LoginView.jsx
import React, { useState } from 'react';

const LoginView = ({ onNavigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // --- Client-side validations ---
    if (!email.includes('@')) {
      setError('Email must be valid.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      // Send login request to backend
      const response = await fetch("http://teimsafety.com/api/login", {



        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful, call parent handler
        onLoginSuccess({ email, name: data.name || '' });
      } else {
        // Show backend error
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-[60vh] bg-gray-50">
      <div className="w-full max-w-md bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Login</h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Input */}
          <div>
            <label htmlFor="login-email" className="block text-lg font-medium mb-2">
              Email:
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter email address"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="login-password" className="block text-lg font-medium mb-2">
              Password:
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter password"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center text-sm">
            <button
              type="button"
              onClick={() => onNavigate('ForgotPassword')}
              className="text-white hover:text-indigo-200 transition duration-150"
            >
              Forgot Password?
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-300 text-center pt-2">{error}</p>}
        </form>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p>
            New member? 
            <button 
              onClick={() => onNavigate('Signup')}
              className="text-white font-semibold underline ml-1 hover:text-indigo-200 transition duration-150"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
