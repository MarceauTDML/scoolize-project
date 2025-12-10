import React from 'react';
import { useNavigate } from 'react-router-dom';

const CalendarDetails = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', color: '#333' }}>
      
      <button 
        onClick={() => navigate('/')}
        style={{ marginBottom: '20px', padding: '10px 20px', border: 'none', background: '#e9ecef', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#555' }}
      >
        ← Retour
      </button>

      <div style={{ textAlign: 'center', marginBottom: '50px', borderBottom: '2px solid #000091', paddingBottom: '20px' }}>
        <h1 style={{ color: '#000091', margin: 0, fontSize: '2.5rem' }}>CALENDRIER 2026</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '10px' }}>Les 3 étapes clés de votre orientation</p>
      </div>

      <div style={{ display: 'flex', marginBottom: '40px', gap: '30px' }}>
        <div style={{ width: '80px', flexShrink: 0 }}>
          <div style={{ background: '#000091', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>1</div>
        </div>
        <div style={{ flex: 1, background: '#f4f4f4', padding: '25px', borderRadius: '10px', borderLeft: '5px solid #000091' }}>
          <h2 style={{ color: '#000091', marginTop: 0 }}>Je m'informe et découvre les formations</h2>
          <h3 style={{ color: '#666', marginTop: 0 }}>De octobre 2025 à janvier 2026</h3>
          
          <ul style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>De octobre 2025 à janvier 2026 :</strong> Je prépare mon projet d'orientation.
            </li>
            <li>
              <strong>Mercredi 17 décembre 2025 :</strong> Je découvre la carte des formations Parcoursup 2026.
            </li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 2 */}
      <div style={{ display: 'flex', marginBottom: '40px', gap: '30px' }}>
        <div style={{ width: '80px', flexShrink: 0 }}>
          <div style={{ background: '#e1000f', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>2</div>
        </div>
        <div style={{ flex: 1, background: '#fff0f0', padding: '25px', borderRadius: '10px', borderLeft: '5px solid #e1000f' }}>
          <h2 style={{ color: '#e1000f', marginTop: 0 }}>Je m'inscris et je formule mes vœux</h2>
          <h3 style={{ color: '#666', marginTop: 0 }}>Du 19 janvier au 1 avril 2026</h3>
          
          <ul style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Du lundi 19 janvier au jeudi 12 mars 2026 :</strong> Je m'inscris sur la plateforme et je formule mes vœux.
            </li>
            <li>
              <strong>Mercredi 1er avril 2026 :</strong> Dernier jour pour compléter mon dossier et confirmer mes vœux.
            </li>
          </ul>
        </div>
      </div>

      {/* ÉTAPE 3 */}
      <div style={{ display: 'flex', marginBottom: '40px', gap: '30px' }}>
        <div style={{ width: '80px', flexShrink: 0 }}>
          <div style={{ background: '#28a745', color: 'white', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
        </div>
        <div style={{ flex: 1, background: '#f0fff4', padding: '25px', borderRadius: '10px', borderLeft: '5px solid #28a745' }}>
          <h2 style={{ color: '#28a745', marginTop: 0 }}>Je reçois les réponses et je décide</h2>
          <h3 style={{ color: '#666', marginTop: 0 }}>Du 2 juin au 10 décembre 2026</h3>
          
          <ul style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Mardi 2 juin 2026 :</strong> Début de la phase d'admission principale. Je reçois les réponses des formations et je fais mes choix.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Du vendredi 5 au lundi 8 juin 2026 :</strong> Classement des vœux en attente.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Jeudi 11 juin 2026 :</strong> Début de la phase d'admission complémentaire.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Du 12 au 19 juin 2026 :</strong> Suspension des délais de réponse pendant les épreuves écrites du baccalauréat.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Mardi 7 juillet 2026 :</strong> Résultats du baccalauréat. Après les résultats, je m'inscris administrativement dans mon établissement.
            </li>
            <li>
              <strong>Samedi 11 juillet 2026 :</strong> Fin de la phase principale d'admission.
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default CalendarDetails;