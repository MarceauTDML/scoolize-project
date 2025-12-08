import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/client';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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
      await register(formData);
      
      setMessage('Succès ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 1500);

    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom d'utilisateur</label>
          <input type="text" name="username" required onChange={handleChange} />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" required onChange={handleChange} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" name="password" required onChange={handleChange} />
        </div>
        <button type="submit">S'inscrire</button>
      </form>
      
      {message && (
        <p style={{ marginTop: '10px', color: isError ? 'red' : 'green' }}>
          {message}
        </p>
      )}
      
      <p style={{marginTop: '15px', fontSize: '0.9em'}}>
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </div>
  );
};

export default Register;