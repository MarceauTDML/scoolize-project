import React, { useEffect, useState } from 'react';
import { getSchools } from '../api/client';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [schools, setSchools] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const data = await getSchools();
        setSchools(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchSchools();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Liste des Écoles</h1>
        <button 
            onClick={() => navigate('/login')}
            style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
        >
            Se connecter
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        {schools.map((school) => (
          <div key={school.id} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '10px', 
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            borderLeft: '5px solid #007bff'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{school.first_name}</h3>
            <p style={{ margin: '0', color: '#666' }}>📍 {school.last_name}</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '0.9em', color: '#888' }}>✉️ {school.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;