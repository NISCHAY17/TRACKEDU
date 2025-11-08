import React from 'react';
import './Login.css';

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2> TRACKEDU LOGIN </h2>
        <form>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
