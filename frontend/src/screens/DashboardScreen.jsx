import { useState } from 'react';
import DocumentsView from '../views/DocumentsView';
import UploadView from '../views/UploadView';
import UsersView from '../views/UsersView';
import RecentsView from '../views/RecentsView';
import DataUsageView from '../views/DataUsageView';
import NotesView from '../views/NotesView';

const NAV = [
  { key: 'documents', label: 'Documents', icon: 'fa-file-alt' },
  { key: 'upload', label: 'Upload', icon: 'fa-upload' },
  { key: 'notes', label: 'Notes', icon: 'fa-sticky-note' },
  { key: 'users', label: 'Users', icon: 'fa-users', admin: true },
  { key: 'recents', label: 'Recents History', icon: 'fa-history' },
  { key: 'datausage', label: 'Data Usage', icon: 'fa-chart-pie' },
];

export default function DashboardScreen({ currentUser, setCurrentUser, theme, toggleTheme }) {
  const [view, setView] = useState('documents');

  function logout() {
    setCurrentUser(null);
  }

  return (
    <div className="screen active login-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: theme === 'dark' ? 'linear-gradient(135deg,#2f2f2f 0%,#121212 100%)' : 'linear-gradient(135deg,#e0e7ff 0%,#f8fafc 100%)' }}>
      <div style={{ boxShadow: '0 8px 32px rgba(44,62,80,0.10)', borderRadius: '18px', padding: '0', background: theme === 'dark' ? '#2f2f2f' : '#fff', minWidth: '340px', maxWidth: '1100px', width: '100%', display: 'flex', overflow: 'hidden' }}>
        <nav className="sidebar" style={{ background: theme === 'dark' ? '#1e1e1e' : '#f1f5f9', padding: '32px 0', width: '220px', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: theme === 'dark' ? '1px solid #444' : '1px solid #e5e7eb' }}>
          <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ background: '#6366f1', borderRadius: '50%', padding: 14, marginBottom: 10 }}>
              <i className="fas fa-shield-alt" style={{ fontSize: '2rem', color: '#fff' }}></i>
            </div>
            <h2 style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#2c3e50', margin: 0 }}>SecureDoc</h2>
          </div>
          <ul className="nav-menu" style={{ width: '100%' }}>
            {NAV.filter(n => !n.admin || currentUser.role === 'admin').map(n => (
              <li key={n.key} style={{ width: '100%' }}>
                <a href="#" className={`nav-link${view === n.key ? ' active' : ''}`} onClick={() => setView(n.key)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 24px', color: view === n.key ? '#6366f1' : '#334155', fontWeight: view === n.key ? 'bold' : 'normal', background: view === n.key ? '#e0e7ff' : 'none', border: 'none', borderRadius: '0 20px 20px 0', fontSize: '1.08rem', transition: 'background 0.2s' }}>
                  <i className={`fas ${n.icon}`}></i> {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '28px 36px 18px 36px', borderBottom: theme === 'dark' ? '1px solid #444' : '1px solid #e5e7eb', background: theme === 'dark' ? '#2f2f2f' : '#fff', color: theme === 'dark' ? '#eee' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#6366f1' }}>Welcome, {currentUser.username} ({currentUser.role})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button className="btn btn-secondary" style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: 'bold', fontSize: '1rem' }} onClick={logout}>Logout</button>
              <button
                onClick={toggleTheme}
                style={{
                  background: theme === 'dark' ? '#222' : '#fff',
                  color: theme === 'dark' ? '#fff' : '#222',
                  border: '1px solid #e5e7eb',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'background 0.2s, color 0.2s'
                }}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <span role="img" aria-label="Light">🌞</span> : <span role="img" aria-label="Dark">🌙</span>}
              </button>
            </div>
          </header>
          <main className="main-content" style={{ flex: 1, padding: '36px', background: theme === 'dark' ? '#121212' : '#f8fafc', minHeight: 'calc(100vh - 80px)', color: theme === 'dark' ? '#ddd' : undefined }}>
            {view === 'documents' && <DocumentsView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'upload' && <UploadView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'notes' && <NotesView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'users' && currentUser.role === 'admin' && <UsersView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'recents' && <RecentsView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
            {view === 'datausage' && <DataUsageView currentUser={currentUser} theme={theme} toggleTheme={toggleTheme} />}
          </main>
        </div>
      </div>
    </div>
  );
}
