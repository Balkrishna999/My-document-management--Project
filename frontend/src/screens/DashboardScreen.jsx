import { useState } from 'react';
import DocumentsView from '../views/DocumentsView';
import UploadView from '../views/UploadView';
import UsersView from '../views/UsersView';
import RecentsView from '../views/RecentsView';
import DataUsageView from '../views/DataUsageView';

const NAV = [
  { key: 'documents', label: 'Documents', icon: 'fa-file-alt' },
  { key: 'upload', label: 'Upload', icon: 'fa-upload' },
  { key: 'users', label: 'Users', icon: 'fa-users', admin: true },
  { key: 'recents', label: 'Recents History', icon: 'fa-history' },
  { key: 'datausage', label: 'Data Usage', icon: 'fa-chart-pie' }, // Added Data Usage nav
];

export default function DashboardScreen({ currentUser, setCurrentUser }) {
  const [view, setView] = useState('documents');

  function logout() {
    setCurrentUser(null);
  }

  return (
    <div className="screen active login-container" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#e0e7ff 0%,#f8fafc 100%)'}}>
      <div style={{boxShadow:'0 8px 32px rgba(44,62,80,0.10)',borderRadius:'18px',padding:'0',background:'#fff',minWidth:'340px',maxWidth:'1100px',width:'100%',display:'flex',overflow:'hidden'}}>
        <nav className="sidebar" style={{background:'#f1f5f9',padding:'32px 0',width:'220px',minHeight:'100%',display:'flex',flexDirection:'column',alignItems:'center',borderRight:'1px solid #e5e7eb'}}>
          <div style={{marginBottom:32,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{background:'#6366f1',borderRadius:'50%',padding:14,marginBottom:10}}>
              <i className="fas fa-shield-alt" style={{fontSize:'2rem',color:'#fff'}}></i>
            </div>
            <h2 style={{fontWeight:'bold',fontSize:'1.3rem',color:'#2c3e50',margin:0}}>SecureDoc</h2>
          </div>
          <ul className="nav-menu" style={{width:'100%'}}>
            {NAV.filter(n => !n.admin || currentUser.role === 'admin').map(n => (
              <li key={n.key} style={{width:'100%'}}>
                <a href="#" className={`nav-link${view===n.key?' active':''}`} onClick={() => setView(n.key)} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 24px',color:view===n.key?'#6366f1':'#334155',fontWeight:view===n.key?'bold':'normal',background:view===n.key?'#e0e7ff':'none',border:'none',borderRadius:'0 20px 20px 0',fontSize:'1.08rem',transition:'background 0.2s'}}>
                  <i className={`fas ${n.icon}`}></i> {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{flex:1,display:'flex',flexDirection:'column',minHeight:'100vh'}}>
          <header className="header" style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'28px 36px 18px 36px',borderBottom:'1px solid #e5e7eb',background:'#fff'}}>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{fontWeight:'bold',fontSize:'1.2rem',color:'#6366f1'}}>Welcome, {currentUser.username} ({currentUser.role})</span>
            </div>
            <button className="btn btn-secondary" style={{background:'#6366f1',color:'#fff',border:'none',padding:'10px 22px',borderRadius:'7px',fontWeight:'bold',fontSize:'1rem'}} onClick={logout}>Logout</button>
          </header>
          <main className="main-content" style={{flex:1,padding:'36px',background:'#f8fafc',minHeight:'calc(100vh - 80px)'}}>
            {view === 'documents' && <DocumentsView currentUser={currentUser} />}
            {view === 'upload' && <UploadView currentUser={currentUser} />}
            {view === 'users' && currentUser.role === 'admin' && <UsersView currentUser={currentUser} />}
            {view === 'recents' && <RecentsView currentUser={currentUser} />}
            {view === 'datausage' && <DataUsageView currentUser={currentUser} />} {/* Data Usage View */}
          </main>
        </div>
      </div>
    </div>
  );
}
