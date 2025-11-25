import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user',
        schoolName: '',
        description: '',
        address: '',
        website: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            
            if (response.ok) {
                alert('Compte créé ! Connectez-vous.');
                navigate('/');
            } else {
                alert(data.message || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1>Créer un compte Scoolize</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Je suis :</label>
                    <select name="role" value={formData.role} onChange={handleChange}>
                        <option value="user">Un élève</option>
                        <option value="school">Une école</option>
                    </select>
                </div>

                {}
                {formData.role === 'school' && (
                    <div style={{ padding: '15px', border: '1px solid #646cff', borderRadius: '8px', marginBottom: '15px' }}>
                        <h3>Informations de l'établissement</h3>
                        <div className="form-group">
                            <label>Nom de l'école</label>
                            <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Adresse</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Site Web</label>
                            <input type="text" name="website" value={formData.website} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} />
                        </div>
                    </div>
                )}

                <button type="submit">S'inscrire</button>
            </form>
        </div>
    );
}

export default Register;