import React, { useState } from 'react';

const ForgotPasswordView = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    if (!email.includes('@gmail.com')) {
      setMessage('Enter a valid @gmail.com email');
      return;
    }
    // Mock password reset
    setMessage(`Password reset link sent to ${email}`);
  };

  return (
    <div className="flex justify-center items-center p-6 min-h-[60vh]">
      <div className="w-full max-w-md bg-indigo-700 text-white p-10 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-8 text-center">Forgot Password</h2>
        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label htmlFor="fp-email" className="block text-lg font-medium mb-2">
              Enter your email:
            </label>
            <input
              id="fp-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-200 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter email address"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-white text-indigo-700 py-2 px-6 rounded-lg font-bold shadow-xl hover:bg-indigo-100 transition"
          >
            Send Reset Link
          </button>
        </form>
        {message && <p className="text-center pt-2">{message}</p>}
        <div className="text-center mt-4">
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

export default ForgotPasswordView;
