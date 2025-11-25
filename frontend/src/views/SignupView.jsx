// src/views/SignupView.jsx
import React, { useState } from 'react';

const SignupView = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://teimsafety.com/api/signup", {


        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setName('');
        setEmail('');
        setPassword('');

        // Redirect to login after success
        setTimeout(() => onNavigate('Login'), 1500);
      } else {
        setError(data.detail || data.message || 'Signup failed.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error: Could not connect to backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-[60vh]">
      <div className="w-full max-w-md bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Sign Up</h2>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Name Input */}
          <div>
            <label htmlFor="signup-name" className="block text-lg font-medium mb-2">Name:</label>
            <input
              id="signup-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="signup-email" className="block text-lg font-medium mb-2">Email:</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="block text-lg font-medium mb-2">Password:</label>
            <input
              id="signup-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>

          {/* Error & Success Messages */}
          {error && <p className="text-red-300 text-center pt-2">{error}</p>}
          {success && (
            <p className="text-green-300 text-center pt-2 font-bold">
              Success! Account created. Redirecting to login...
            </p>
          )}
        </form>

        {/* Back to Login Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => onNavigate('Login')}
            className="text-white font-semibold underline hover:text-indigo-200 transition duration-150"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
