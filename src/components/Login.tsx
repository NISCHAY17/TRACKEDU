import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import './Login.css';
import logo from '../assets/LOGO1.png';

const Login: React.FC = () => {
  const [identifier, setIdentifier] = useState(''); // Use identifier instead of email
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

   
    let email = identifier;
    if (!identifier.includes('@')) {
      email = `${identifier}@trackedu.local`;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Firebase Auth Error:", err.code, err.message);
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError("Invalid username/email or password.");
          break;
        case 'auth/invalid-email':
          setError("Please enter a valid username or email address.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your connection.");
          break;
        default:
          setError("An unexpected error occurred. Please try again.");
          break;
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="TrackEdu Logo" className="logo" />
        <h2>TRACKEDU LOGIN</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="identifier">Username or Email</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
          {error && <p style={{ color: '#ffcccb', marginTop: '1rem' }}>{error}</p>}
        </form>
        <p style={{ marginTop: '1rem', color: '#000000' }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
