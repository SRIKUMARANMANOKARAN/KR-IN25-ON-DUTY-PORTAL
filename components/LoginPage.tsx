import React, { useState } from 'react';
import { UserType } from '../types';

interface LoginPageProps {
  onLogin: (id: string, pass: string, type: UserType) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loginType, setLoginType] = useState<UserType>('user');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(id, password, loginType);
    if (!success) {
      setError('Invalid ID or password. Please try again.');
    }
  };

  const activeTabClass = 'bg-white/20 text-white';
  const inactiveTabClass = 'bg-transparent text-gray-300 hover:bg-white/10';

  return (
    <div className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="flex">
        <button
          onClick={() => { setLoginType('user'); setError(''); }}
          className={`w-1/2 p-4 font-bold text-lg transition duration-300 ${loginType === 'user' ? activeTabClass : inactiveTabClass}`}
        >
          User Login
        </button>
        <button
          onClick={() => { setLoginType('admin'); setError(''); }}
          className={`w-1/2 p-4 font-bold text-lg transition duration-300 ${loginType === 'admin' ? activeTabClass : inactiveTabClass}`}
        >
          Admin Login
        </button>
      </div>
      <div className="p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Welcome to KR IN25 Portal
        </h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-300">
              {loginType === 'user' ? 'User ID' : 'Admin ID'}
            </label>
            <input
              id="id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter your ID"
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-white"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-1 block w-full px-4 py-3 bg-white/5 border border-white/20 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 text-white"
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;