import { useState, useEffect } from 'react';
import './index.css';

import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // Persist login state using JWT and user info
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const user = localStorage.getItem('jwt_user');
    if (token && user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch {
        setCurrentUser(null);
      }
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Toggle between light and dark theme
  function toggleTheme() {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }

  
  // When user logs in, store user info in localStorage
  function handleSetCurrentUser(user) {
    if (user) {
      localStorage.setItem('jwt_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jwt_user');
      localStorage.removeItem('jwt_token');
    }
    setCurrentUser(user);
  }

  return (
    <div id="app">
      {!currentUser ? (
        <AuthScreen setCurrentUser={handleSetCurrentUser} />
      ) : (
        <DashboardScreen
          currentUser={currentUser}
          setCurrentUser={handleSetCurrentUser}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}

export default App;
