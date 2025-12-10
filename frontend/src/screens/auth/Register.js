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

  const passwordCriteria = {
    length: formData.password.length >= 11,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[\W_]/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!isPasswordValid) {
        setIsError(true);
        setMessage("Le mot de passe ne respecte pas les critères de sécurité.");
        return;
    }

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
          
          <div style={{ marginTop: '15px' }}>
            <label>Mot de passe</label>
            <input 
                type="password" 
                name="password" 
                required 
                onChange={handleChange} 
                style={{ 
                    border: formData.password && !isPasswordValid ? '2px solid red' : isPasswordValid && formData.password ? '2px solid green' : '1px solid #ccc' 
                }}
            />
            {formData.password && !isPasswordValid && (
                <div style={{ fontSize: '0.8rem', marginTop: '5px', background: '#fff3cd', padding: '10px', borderRadius: '5px' }}>
                    <p style={{margin: '2px 0', color: passwordCriteria.length ? 'green' : 'red'}}>
                        {passwordCriteria.length ? '✅' : '❌'} Au moins 11 caractères
                    </p>
                    <p style={{margin: '2px 0', color: passwordCriteria.uppercase ? 'green' : 'red'}}>
                        {passwordCriteria.uppercase ? '✅' : '❌'} Une majuscule
                    </p>
                    <p style={{margin: '2px 0', color: passwordCriteria.lowercase ? 'green' : 'red'}}>
                        {passwordCriteria.lowercase ? '✅' : '❌'} Une minuscule
                    </p>
                    <p style={{margin: '2px 0', color: passwordCriteria.number ? 'green' : 'red'}}>
                        {passwordCriteria.number ? '✅' : '❌'} Un chiffre
                    </p>
                    <p style={{margin: '2px 0', color: passwordCriteria.special ? 'green' : 'red'}}>
                        {passwordCriteria.special ? '✅' : '❌'} Un caractère spécial (!@#$%^&*)
                    </p>
                </div>
            )}
          </div>

          <button 
            type="submit" 
            style={{ marginTop: '20px', opacity: isPasswordValid ? 1 : 0.6, cursor: isPasswordValid ? 'pointer' : 'not-allowed' }}
            disabled={!isPasswordValid}
          >
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