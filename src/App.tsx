/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from './types';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load current session from localStorage on app boot
  useEffect(() => {
    const rawUser = localStorage.getItem('credible_easy_current_user');
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch (err) {
        console.error('Failed to parse cached user session', err);
      }
    }
    setIsInitializing(false);
  }, []);

  // Update current user locally and save to general users database
  const handleUserUpdate = (updatedProfile: UserProfile) => {
    setCurrentUser(updatedProfile);
    localStorage.setItem('credible_easy_current_user', JSON.stringify(updatedProfile));
    
    // Also save state in global user directory
    const rawUsers = localStorage.getItem('credible_easy_users');
    if (rawUsers) {
      const users = JSON.parse(rawUsers);
      if (users[updatedProfile.identifier]) {
        users[updatedProfile.identifier] = {
          ...users[updatedProfile.identifier],
          ...updatedProfile
        };
        localStorage.setItem('credible_easy_users', JSON.stringify(users));
      }
    }
  };

  const handleAuthSuccess = (activatedUser: UserProfile) => {
    setCurrentUser(activatedUser);
    localStorage.setItem('credible_easy_current_user', JSON.stringify(activatedUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('credible_easy_current_user');
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-wine-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-500 font-mono">Initializing Secures Gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-wine-150/80 selection:text-wine-950">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="auth-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Auth onAuthSuccess={handleAuthSuccess} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Dashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onUserUpdate={handleUserUpdate} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
