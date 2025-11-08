import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h2>Welcome to TrackEdu!</h2>
        <p>This is your dashboard. More features coming soon!</p>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
