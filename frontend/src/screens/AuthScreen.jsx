import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../api';

export default function AuthScreen({ setCurrentUser }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const { token, user } = await apiLogin(username, password);
      localStorage.setItem('jwt_token', token);
      setCurrentUser(user);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
    setLoading(false);
  }

  async function handleSignup() {
    if (!username || !password) {
      setError('Please enter a username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await apiRegister(username, password);
      await handleLogin();
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
    setLoading(false);
  }

  return (
    <div className="screen active login-container" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'linear-gradient(135deg,#e0e7ff 0%,#f8fafc 100%)'}}>
      <div className="login-form-modern" style={{boxShadow:'0 8px 32px rgba(44,62,80,0.10)',borderRadius:'18px',padding:'48px 36px',background:'#fff',minWidth:'340px',maxWidth:'360px',width:'100%'}}>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:32}}>
          <div style={{background:'#6366f1',borderRadius:'50%',padding:18,marginBottom:16}}>
            <i className="fas fa-lock" style={{fontSize:'2.5rem',color:'#fff'}}></i>
          </div>
          <h1 style={{fontSize:'2.2rem',fontWeight:'bold',color:'#2c3e50',marginBottom:'6px'}}>Sign {mode==='login'?'In':'Up'}</h1>
          <p style={{fontSize:'1.1rem',color:'#64748b',marginBottom:'0'}}>Access your SecureDoc account</p>
        </div>
        <div className="form-group" style={{marginBottom:18}}>
          <label htmlFor="username" style={{fontWeight:'bold',fontSize:'1.05rem',color:'#2c3e50'}}>Username</label>
          <input id="username" autoFocus placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && (mode==='login'?handleLogin():handleSignup())} style={{width:'100%',padding:'10px',borderRadius:'7px',border:'1px solid #cbd5e1',marginTop:6,fontSize:'1rem'}} />
        </div>
        <div className="form-group" style={{marginBottom:18}}>
          <label htmlFor="password" style={{fontWeight:'bold',fontSize:'1.05rem',color:'#2c3e50'}}>Password</label>
          <div style={{display:'flex',alignItems:'center',position:'relative'}}>
            <input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && (mode==='login'?handleLogin():handleSignup())} style={{width:'100%',padding:'10px',borderRadius:'7px',border:'1px solid #cbd5e1',marginTop:6,fontSize:'1rem'}} />
            <button type="button" onClick={()=>setShowPassword(v=>!v)} style={{position:'absolute',right:10,top:10,background:'none',border:'none',cursor:'pointer',color:'#6366f1',fontSize:'1.1rem'}} title={showPassword?'Hide password':'Show password'}>
              <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </button>
          </div>
        </div>
        {error && <div style={{color:'#ef4444',marginBottom:12,textAlign:'center',fontWeight:500}}>{error}</div>}
        <button type="button" className="btn btn-primary" style={{width:'100%',fontSize:'1.1rem',marginTop:'6px',marginBottom:'10px',background:'#6366f1',border:'none',padding:'12px 0',borderRadius:'7px',fontWeight:'bold'}} onClick={mode==='login'?handleLogin:handleSignup} disabled={loading}>
          {loading ? (mode==='login'?'Signing In...':'Signing Up...') : (mode==='login'?'Sign In':'Sign Up')}
        </button>
        <div style={{marginTop:18,textAlign:'center'}}>
          {mode === 'login' ? (
            <>
              <span>Don't have an account? </span>
              <button className="btn btn-link" style={{padding:'0 6px',fontSize:'1rem',color:'#6366f1',background:'none',border:'none',textDecoration:'underline',cursor:'pointer'}} onClick={()=>{setMode('signup');setError('')}}>Sign Up</button>
            </>
          ) : (
            <>
              <span>Already have an account? </span>
              <button className="btn btn-link" style={{padding:'0 6px',fontSize:'1rem',color:'#6366f1',background:'none',border:'none',textDecoration:'underline',cursor:'pointer'}} onClick={()=>{setMode('login');setError('')}}>Sign In</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
