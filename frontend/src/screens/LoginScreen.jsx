import { useState } from 'react';
import './LoginScreen.css'; // Import the CSS file for styling

export default function LoginScreen({ setCurrentUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLogin() {
    const users = JSON.parse(localStorage.getItem('dms_users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      user.lastLogin = new Date().toISOString();
      localStorage.setItem('dms_users', JSON.stringify(users));
      setCurrentUser(user);
    } else {
      setError('Invalid credentials! Try admin/admin123 or user/user123');
    }
  }

  function quickLogin(type) {
    if (type === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('user');
      setPassword('user123');
    }
    setTimeout(handleLogin, 100);
  }

  return (
    <div className="login-attractive-bg">
      <div className="login-attractive-card">
        <div className="login-avatar">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Avatar" />
        </div>
        <h1 className="login-title">Welcome to <span>SecureDoc</span></h1>
        <p className="login-subtitle">Sign in to your document management dashboard</p>
        <div className="login-form-group">
          <label htmlFor="username">Username</label>
          <input id="username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your username" />
        </div>
        <div className="login-form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your password" />
        </div>
        <button type="button" className="btn btn-primary login-btn" onClick={handleLogin}>Login</button>
        {error && <div className="login-error">{error}</div>}
        <div className="login-demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin / admin123</p>
          <p>User: user / user123</p>
          <div className="login-demo-btns">
            <button type="button" className="btn btn-secondary" onClick={() => quickLogin('admin')}>Login as Admin</button>
            <button type="button" className="btn btn-secondary" onClick={() => quickLogin('user')}>Login as User</button>
          </div>
        </div>
      </div>
    </div>
  );
}
