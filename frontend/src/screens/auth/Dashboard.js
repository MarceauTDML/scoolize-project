import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Bienvenue sur le Dashboard</h1>
      <p>Vous êtes connecté.</p>
      
      <button 
        onClick={handleLogout}
        style={{ 
          backgroundColor: '#dc3545', 
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px' 
        }}
      >
        Déconnexion
      </button>
    </div>
  );
};

export default Dashboard;