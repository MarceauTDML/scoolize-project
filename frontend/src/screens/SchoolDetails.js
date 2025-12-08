import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSchoolById } from '../api/client';

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [school, setSchool] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await getSchoolById(id);
        setSchool(data);
      } catch (err) {
        setError("Impossible de charger les infos de l'école.");
      }
    };
    fetchDetails();
  }, [id]);

  if (error) return <div style={{textAlign:'center', marginTop:'50px', color:'red'}}>{error}</div>;
  if (!school) return <div style={{textAlign:'center', marginTop:'50px'}}>Chargement...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <button 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem' }}
      >
        ← Retour à la liste
      </button>

      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ color: '#007bff', marginTop: 0 }}>{school.first_name}</h1>
        <h3 style={{ color: '#555', fontWeight: 'normal' }}>📍 {school.last_name}</h3>
        
        <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '20px 0' }} />

        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>À propos</h4>
          <p style={{ lineHeight: '1.6', color: '#444' }}>
            {school.description || "Aucune description disponible pour le moment."}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <div>
            <strong>Adresse :</strong>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{school.address || "Non renseignée"}</p>
          </div>
          <div>
            <strong>Contact :</strong>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{school.email}</p>
            <p style={{ margin: '5px 0 0', color: '#666' }}>{school.phone}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong>Site Web :</strong>
            <p style={{ margin: '5px 0 0' }}>
              <a href={`http://${school.website}`} target="_blank" rel="noreferrer" style={{ color: '#007bff' }}>
                {school.website || "Non renseigné"}
              </a>
            </p>
          </div>
        </div>

        <button style={{ 
            width: '100%', 
            padding: '15px', 
            marginTop: '30px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1.1rem', 
            fontWeight: 'bold', 
            cursor: 'pointer' 
        }}>
            Postuler à cette école
        </button>
      </div>
    </div>
  );
};

export default SchoolDetails;