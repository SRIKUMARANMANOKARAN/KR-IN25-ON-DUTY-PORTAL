import React from 'react';
import { UserType } from '../types';

interface HeaderProps {
  loggedInUser: { id: string, type: UserType } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ loggedInUser, onLogout }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-sm shadow-lg z-50 p-4 flex justify-between items-center transition-all duration-300">
      <h1 className="text-2xl font-bold tracking-wider text-white">KR IN25</h1>
      {loggedInUser && (
        <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden sm:block text-gray-200">
                Welcome, <span className="font-semibold text-white">{loggedInUser.id}</span> ({loggedInUser.type})
            </span>
            <button
            onClick={onLogout}
            className="bg-red-600/80 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-500 transition duration-300 backdrop-blur-sm"
            >
            Logout
            </button>
        </div>
      )}
    </header>
  );
};

export default Header;