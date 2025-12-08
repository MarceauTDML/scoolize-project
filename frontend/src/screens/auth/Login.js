import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/client';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = await login(formData);

      localStorage.setItem('token', data.token);
      navigate('/dashboard');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Connexion</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input type="email" name="email" required onChange={handleChange} />
        </div>
        <div>
          <label>Mot de passe</label>
          <input type="password" name="password" required onChange={handleChange} />
        </div>
        <button type="submit">Se connecter</button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      <p style={{marginTop: '15px', fontSize: '0.9em'}}>
        Pas de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
};

export default Login;