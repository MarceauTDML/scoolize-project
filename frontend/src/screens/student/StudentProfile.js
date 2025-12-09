import React, { useEffect, useState } from 'react';
import { getStudentProfile, createStudentProfile } from '../../api/client';
import { useNavigate } from 'react-router-dom';

const StudentProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  
  const [formData, setFormData] = useState({
    gender: 'M',
    birth_name: '', used_name: '', birth_date: '', birth_place: '',
    address: '', phone: '',
    ine_number: '', jdc_status: '',
    current_status: '', current_school: '', bac_date: '', specialties: '',
    parent_address: '', parent_job: '', siblings_count: 0, is_scholarship: '0',
    specific_info: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getStudentProfile();
        if (response.hasProfile) {
            const data = response.data;
            if(data.birth_date) data.birth_date = data.birth_date.split('T')[0];
            if(data.bac_date) data.bac_date = data.bac_date.split('T')[0];
            
            setFormData(data);
            setIsLocked(true);
        }
      } catch (err) {
        console.error("Erreur chargement profil", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm("Attention : Une fois sauvegardé, vous ne pourrez plus modifier ces informations. Confirmer ?")) {
        return;
    }

    try {
      await createStudentProfile(formData);
      alert("Profil sauvegardé et verrouillé !");
      setIsLocked(true);
      window.scrollTo(0,0);
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Chargement...</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      
      <div style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Mon dossier élève</h1>
        {isLocked && <span style={{ background:'#28a745', color:'white', padding:'5px 15px', borderRadius:'20px', fontSize:'0.9rem' }}>Validé & Verrouillé</span>}
      </div>

      <form onSubmit={handleSubmit}>
        
        <h3 style={{ color: '#007bff', borderBottom:'1px solid #eee', paddingBottom:'5px' }}>Identité</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
                <label>Sexe *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} disabled={isLocked} required style={inputStyle}>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Autre">Autre</option>
                </select>
            </div>
            <div>
                <label>Date de naissance *</label>
                <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>Nom de naissance *</label>
                <input type="text" name="birth_name" value={formData.birth_name} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>Nom d'usage</label>
                <input type="text" name="used_name" value={formData.used_name} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
            <div>
                <label>Lieu de naissance *</label>
                <input type="text" name="birth_place" value={formData.birth_place} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
        </div>

        <h3 style={{ color: '#007bff', borderBottom:'1px solid #eee', paddingBottom:'5px' }}>Contact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
                <label>Adresse postale complète *</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>Numéro de téléphone *</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
        </div>

        <h3 style={{ color: '#007bff', borderBottom:'1px solid #eee', paddingBottom:'5px' }}>Scolarité & Admin</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
                <label>Numéro INE *</label>
                <input type="text" name="ine_number" value={formData.ine_number} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>JDC (Journée Défense et Citoyenneté) *</label>
                <select name="jdc_status" value={formData.jdc_status} onChange={handleChange} disabled={isLocked} required style={inputStyle}>
                    <option value="">Sélectionner...</option>
                    <option value="Effectuée">Effectuée</option>
                    <option value="En attente">En attente</option>
                    <option value="Non concerné">Non concerné</option>
                </select>
            </div>
            <div>
                <label>Statut actuel</label>
                <input type="text" name="current_status" placeholder="Ex: Lycéen Terminale" value={formData.current_status} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
            <div>
                <label>Etablissement actuel</label>
                <input type="text" name="current_school" value={formData.current_school} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
            <div>
                <label>Date obtention BAC (ou prévision)</label>
                <input type="date" name="bac_date" value={formData.bac_date} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
            <div>
                <label>Spécialités / Options</label>
                <input type="text" name="specialties" placeholder="Ex: Maths, Physique, Arts..." value={formData.specialties} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
        </div>

        <h3 style={{ color: '#007bff', borderBottom:'1px solid #eee', paddingBottom:'5px' }}>Famille</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
                <label>Adresse des parents (Tuteur légal) *</label>
                <input type="text" name="parent_address" value={formData.parent_address} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>Profession du tuteur *</label>
                <input type="text" name="parent_job" value={formData.parent_job} onChange={handleChange} disabled={isLocked} required style={inputStyle} />
            </div>
            <div>
                <label>Nombre de frères et sœurs</label>
                <input type="number" name="siblings_count" value={formData.siblings_count} onChange={handleChange} disabled={isLocked} style={inputStyle} />
            </div>
            <div>
                <label>Boursier ?</label>
                <select name="is_scholarship" value={formData.is_scholarship} onChange={handleChange} disabled={isLocked} style={inputStyle}>
                    <option value="0">Non</option>
                    <option value="1">Oui</option>
                </select>
            </div>
        </div>

        <h3 style={{ color: '#007bff', borderBottom:'1px solid #eee', paddingBottom:'5px' }}>Informations spécifiques</h3>
        <div style={{ marginBottom: '20px' }}>
            <label>Informations complémentaires (Handicap, sportif de haut niveau...)</label>
            <textarea name="specific_info" value={formData.specific_info} onChange={handleChange} disabled={isLocked} rows="3" style={{...inputStyle, height:'auto'}} />
        </div>

        {!isLocked ? (
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={() => navigate('/dashboard')} style={{ flex: 1, padding: '12px', background: '#ccc', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Annuler
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Sauvegarder et Valider
                </button>
            </div>
        ) : (
            <div style={{ marginTop: '20px', padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '5px', textAlign: 'center' }}>
                Votre dossier est complet et validé.
                <br/>
                <button type="button" onClick={() => navigate('/dashboard')} style={{ marginTop:'10px', padding: '8px 20px', background: '#155724', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Retour au Dashboard
                </button>
            </div>
        )}

      </form>
    </div>
  );
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginTop: '5px',
    boxSizing: 'border-box'
};

export default StudentProfile;