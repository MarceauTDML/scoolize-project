import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function SchoolDetails() {
    const { id } = useParams();
    const [school, setSchool] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:3000/api/schools/${id}`)
            .then(res => {
                if (!res.ok) throw new Error("École introuvable");
                return res.json();
            })
            .then(data => {
                setSchool(data.school);
                setReviews(data.reviews);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p style={{textAlign: 'center'}}>Chargement...</p>;
    if (!school) return <p style={{textAlign: 'center'}}>École introuvable.</p>;

    return (
        <div style={{maxWidth: '800px', margin: '0 auto'}}>
            <Link to="/" style={{display: 'inline-block', marginBottom: '20px'}}>&larr; Retour aux écoles</Link>
            
            <div className="card">
                <h1 style={{marginTop: 0}}>{school.name}</h1>
                <p className="badge" style={{display: 'inline-block'}}>{school.address}</p>
                
                <div style={{margin: '20px 0', fontSize: '1.1em'}}>
                    {school.rating_count > 0 ? (
                        <span>Note moyenne : <strong>{Number(school.average_rating).toFixed(1)}/5</strong> ({school.rating_count} avis)</span>
                    ) : (
                        <span>Pas encore d'avis</span>
                    )}
                </div>

                <h3>À propos</h3>
                <p style={{lineHeight: '1.8'}}>{school.description}</p>

                {school.website && (
                    <a href={school.website} target="_blank" rel="noreferrer" className="button" style={{display: 'inline-block', marginTop: '10px', padding: '10px 20px', background: '#646cff', color: 'white', textDecoration: 'none', borderRadius: '8px'}}>
                        Visiter le site officiel
                    </a>
                )}
            </div>

            <div style={{marginTop: '40px'}}>
                <h2>Avis des étudiants</h2>
                {reviews.length === 0 ? (
                    <p style={{fontStyle: 'italic', color: '#888'}}>Aucun avis pour le moment.</p>
                ) : (
                    <div className="school-grid" style={{gridTemplateColumns: '1fr'}}>
                        {reviews.map((rev, index) => (
                            <div key={index} className="school-card" style={{padding: '20px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                    <strong>{rev.email.split('@')[0]}</strong> {/* On cache la fin de l'email pour la confidentialité */}
                                    <span style={{color: '#FFD700'}}>{'⭐'.repeat(rev.rating)}</span>
                                </div>
                                <p style={{marginTop: '10px'}}>{rev.comment || "Pas de commentaire."}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default SchoolDetails;