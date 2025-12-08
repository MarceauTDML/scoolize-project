import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/client';

const Register = () => {
  const navigate = useNavigate();
  
  const [role, setRole] = useState('student'); 

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    description: '',
    address: '',
    website: '',
    phone: ''
  });
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    try {
      await register({ ...formData, role });
      
      setMessage('Succès ! Redirection...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>Inscription</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', gap: '10px' }}>
            <button 
                type="button"
                onClick={() => setRole('student')}
                style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: role === 'student' ? '#007bff' : '#f0f2f5',
                    color: role === 'student' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                Élève
            </button>
            <button 
                type="button"
                onClick={() => setRole('school')}
                style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: role === 'school' ? '#007bff' : '#f0f2f5',
                    color: role === 'school' ? 'white' : '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                }}
            >
                École
            </button>
        </div>

        <form onSubmit={handleSubmit}>
          {role === 'student' ? (
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                <label>Prénom</label>
                <input type="text" name="first_name" required onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                <label>Nom</label>
                <input type="text" name="last_name" required onChange={handleChange} />
                </div>
            </div>
          ) : (
            <>
                <div>
                    <label>Nom de l'établissement</label>
                    <input type="text" name="first_name" required onChange={handleChange} placeholder="Ex: Polytech Lyon" />
                </div>
                <div>
                    <label>Ville</label>
                    <input type="text" name="last_name" required onChange={handleChange} placeholder="Ex: Lyon" />
                </div>
                <div>
                    <label>Description courte</label>
                    <textarea 
                        name="description" 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label>Téléphone</label>
                        <input type="text" name="phone" onChange={handleChange} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Site Web</label>
                        <input type="text" name="website" onChange={handleChange} placeholder="www.ecole.fr" />
                    </div>
                </div>
                <div>
                    <label>Adresse complète</label>
                    <input type="text" name="address" onChange={handleChange} />
                </div>
            </>
          )}

          <div style={{ marginTop: '15px' }}>
            <label>Email</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>
          <div>
            <label>Mot de passe</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>

          <button type="submit" style={{ marginTop: '20px' }}>
            {role === 'school' ? "S'inscrire (Validation requise)" : "S'inscrire"}
          </button>
        </form>
        
        {message && (
          <p style={{ marginTop: '15px', color: isError ? 'red' : 'green', fontWeight: 'bold' }}>
            {message}
          </p>
        )}
        
        <p style={{marginTop: '15px', fontSize: '0.9em'}}>
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </div>
    </div>
  );
};

export default Register;