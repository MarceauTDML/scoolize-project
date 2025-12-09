import React, { useEffect, useState } from 'react';
import { uploadTranscript, saveGrades, getGrades } from '../../api/client';

const StudentGrades = () => {
  const [activeTab, setActiveTab] = useState('premiere');
  
  const [periodMode, setPeriodMode] = useState('semestre');

  const [subTab, setSubTab] = useState('s1'); 

  const [loading, setLoading] = useState(false);
  const [allGrades, setAllGrades] = useState([]); 
  const [currentGrades, setCurrentGrades] = useState([]);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
      updateCurrentView();
  }, [allGrades, activeTab, subTab, periodMode]);

  const handleModeChange = (mode) => {
      setPeriodMode(mode);
      setSubTab(mode === 'trimestre' ? 't1' : 's1');
  };

  const refreshData = async () => {
      try {
          const data = await getGrades();
          setAllGrades(data);
      } catch (e) { console.error(e); }
  };

  const updateCurrentView = () => {
      const context = getContext();
      const filtered = allGrades.filter(g => g.context === context);
      
      if (filtered.length > 0) {
          setCurrentGrades(filtered.map(g => ({
              subject: g.subject,
              grade: g.grade,
              is_specialty: g.is_specialty === 1
          })));
      } else {
          if (context === 'bac_francais') {
              setCurrentGrades([
                  { subject: 'Français Écrit', grade: '', is_specialty: false },
                  { subject: 'Français Oral', grade: '', is_specialty: false },
                  { subject: 'Enseignement Scientifique', grade: '', is_specialty: false }
              ]);
          } else if (context === 'bac_final') {
              setCurrentGrades([
                  { subject: 'Philosophie', grade: '', is_specialty: false },
                  { subject: 'Grand Oral', grade: '', is_specialty: false },
                  { subject: 'Spécialité 1', grade: '', is_specialty: true },
                  { subject: 'Spécialité 2', grade: '', is_specialty: true }
              ]);
          } else {
              setCurrentGrades([]); 
          }
      }
  };

  const getContext = () => {
      if (activeTab === 'bac') {
          return subTab === 'anticipe' ? 'bac_francais' : 'bac_final';
      }
      return `${activeTab}_${subTab}`; 
  };

  const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setLoading(true);
      try {
          const res = await uploadTranscript(file);
          if (res.detected && res.detected.length > 0) {
              const detected = res.detected.map(d => ({
                  subject: d.subject, grade: d.grade, is_specialty: d.is_specialty
              }));
              setCurrentGrades(detected);
              alert("PDF analysé ! Vérifiez avant de sauvegarder.");
          } else {
              alert("Aucune note détectée. Remplissez manuellement.");
          }
      } catch (err) { alert("Erreur analyse PDF"); }
      setLoading(false);
      e.target.value = null;
  };

  const handleSave = async () => {
      try {
          const context = getContext();
          await saveGrades(context, currentGrades);
          alert(`Notes enregistrées pour : ${formatContextName(context)}`);
          refreshData();
      } catch (err) { alert("Erreur sauvegarde"); }
  };

  const formatContextName = (ctx) => {
      const map = {
          'premiere_t1': 'Première - Trimestre 1', 'premiere_t2': 'Première - Trimestre 2', 'premiere_t3': 'Première - Trimestre 3',
          'premiere_s1': 'Première - Semestre 1', 'premiere_s2': 'Première - Semestre 2',
          'terminale_t1': 'Terminale - Trimestre 1', 'terminale_t2': 'Terminale - Trimestre 2', 'terminale_t3': 'Terminale - Trimestre 3',
          'terminale_s1': 'Terminale - Semestre 1', 'terminale_s2': 'Terminale - Semestre 2',
          'bac_francais': 'BAC - Épreuves Anticipées', 'bac_final': 'BAC - Épreuves Terminales',
      };
      return map[ctx] || ctx;
  };

  const updateLine = (idx, field, val) => {
      const copy = [...currentGrades];
      copy[idx][field] = val;
      setCurrentGrades(copy);
  };

  const addLine = () => setCurrentGrades([...currentGrades, { subject: '', grade: '', is_specialty: false }]);
  const removeLine = (idx) => {
      const copy = [...currentGrades];
      copy.splice(idx, 1);
      setCurrentGrades(copy);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom:'20px' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Mes résultats scolaires</h1>
      </div>

      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
          <TabButton label="Classe de Première" active={activeTab === 'premiere'} onClick={() => { setActiveTab('premiere'); }} />
          <TabButton label="Classe de Terminale" active={activeTab === 'terminale'} onClick={() => { setActiveTab('terminale'); }} />
          <TabButton label="Examens du BAC" active={activeTab === 'bac'} onClick={() => { setActiveTab('bac'); setSubTab('anticipe'); }} />
      </div>

      {activeTab !== 'bac' && (
          <div style={{ marginBottom: '15px', fontSize:'0.9rem', color:'#555' }}>
              <span style={{ marginRight:'10px' }}>Mon lycée fonctionne en : </span>
              <label style={{ marginRight:'15px', cursor:'pointer' }}>
                  <input type="radio" checked={periodMode === 'trimestre'} onChange={() => handleModeChange('trimestre')} /> Trimestres
              </label>
              <label style={{ cursor:'pointer' }}>
                  <input type="radio" checked={periodMode === 'semestre'} onChange={() => handleModeChange('semestre')} /> Semestres
              </label>
          </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', flexWrap:'wrap' }}>
          {activeTab !== 'bac' ? (
              periodMode === 'trimestre' ? (
                  <>
                    <SubTabButton label="Trimestre 1" active={subTab === 't1'} onClick={() => setSubTab('t1')} />
                    <SubTabButton label="Trimestre 2" active={subTab === 't2'} onClick={() => setSubTab('t2')} />
                    <SubTabButton label="Trimestre 3" active={subTab === 't3'} onClick={() => setSubTab('t3')} />
                  </>
              ) : (
                  <>
                    <SubTabButton label="Semestre 1" active={subTab === 's1'} onClick={() => setSubTab('s1')} />
                    <SubTabButton label="Semestre 2" active={subTab === 's2'} onClick={() => setSubTab('s2')} />
                  </>
              )
          ) : (
              <>
                <SubTabButton label="Épreuves Anticipées (Français)" active={subTab === 'anticipe'} onClick={() => setSubTab('anticipe')} />
                <SubTabButton label="Épreuves Terminales" active={subTab === 'final'} onClick={() => setSubTab('final')} />
              </>
          )}
      </div>

      {activeTab !== 'bac' && (
          <div style={{ marginBottom: '20px', padding: '15px', border: '2px dashed #007bff', borderRadius: '10px', textAlign: 'center', background: '#e3f2fd' }}>
              <p style={{ margin: '0 0 10px 0', color: '#0056b3', fontWeight: 'bold' }}>
                  Automatisez la saisie : Importez le bulletin PDF de {formatContextName(getContext())}
              </p>
              <input type="file" accept="application/pdf" id="pdf-upload" style={{ display: 'none' }} onChange={handleUpload} disabled={loading} />
              <label htmlFor="pdf-upload" style={{ padding: '8px 20px', background: '#007bff', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  {loading ? 'Analyse en cours...' : '📤 Choisir un PDF'}
              </label>
          </div>
      )}

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #ddd', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', background: '#f1f3f5', padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
              <div>Matière</div>
              <div>Note /20</div>
              <div style={{textAlign:'center'}}>Spécialité ?</div>
              <div></div>
          </div>

          {currentGrades.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  Aucune note saisie pour cette période. <br/>
                  <button onClick={addLine} style={{ marginTop:'10px', color:'#007bff', background:'none', border:'none', cursor:'pointer', textDecoration:'underline' }}>Commencer à remplir manuellement</button>
              </div>
          )}

          {currentGrades.map((item, index) => (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 0.5fr', padding: '10px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                  <input type="text" value={item.subject} onChange={(e) => updateLine(index, 'subject', e.target.value)} placeholder="Nom de la matière" style={inputStyle} />
                  <input type="number" value={item.grade} onChange={(e) => updateLine(index, 'grade', e.target.value)} placeholder="20" step="0.01" style={inputStyle} />
                  <div style={{ textAlign: 'center' }}>
                      <input type="checkbox" checked={item.is_specialty} onChange={(e) => updateLine(index, 'is_specialty', e.target.checked)} style={{ transform: 'scale(1.2)', cursor: 'pointer' }} />
                  </div>
                  <button onClick={() => removeLine(index)} style={{ border:'none', background:'none', cursor:'pointer', fontSize:'1.2rem' }}>Supprimer</button>
              </div>
          ))}
      </div>

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={addLine} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Ajouter une ligne</button>
          <button onClick={handleSave} style={{ padding: '10px 30px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize:'1rem' }}>
              Enregistrer {formatContextName(getContext())}
          </button>
      </div>

    </div>
  );
};

const TabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ flex: 1, padding: '15px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: active ? '3px solid #007bff' : '3px solid transparent', color: active ? '#007bff' : '#666', fontWeight: active ? 'bold' : 'normal', fontSize: '1rem' }}>
        {label}
    </button>
);

const SubTabButton = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{ padding: '8px 15px', border: 'none', borderRadius: '20px', cursor: 'pointer', background: active ? '#007bff' : '#e9ecef', color: active ? 'white' : '#333', fontWeight: 'bold', fontSize: '0.9rem' }}>
        {label}
    </button>
);

const inputStyle = { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '90%' };

export default StudentGrades;