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
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>Établissements disponibles</h1>
      </div>

      <p style={{ color: '#666', fontSize: '1.1rem' }}>
        Découvrez les écoles partenaires et postulez directement via Scoolize.
      </p>

      <div className="schools-grid">
        {schools.map((school) => (
          <div key={school.id} className="school-card">
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{school.first_name}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', color: '#666', marginBottom: '10px' }}>
              <span style={{ marginRight: '8px' }}>📍</span> 
              <span>{school.last_name}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', color: '#888', fontSize: '0.9em' }}>
              <span style={{ marginRight: '8px' }}>✉️</span>
              <span>{school.email}</span>
            </div>
            
            <button 
              style={{ 
                marginTop: '15px', 
                width: '100%', 
                padding: '10px', 
                background: '#e9ecef', 
                color: '#333', 
                border: 'none', 
                borderRadius: '5px', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onClick={() => navigate(`/school/${school.id}`)}
            >
              Voir la fiche
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;