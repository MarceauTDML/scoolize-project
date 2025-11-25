import { useState, useEffect } from 'react';

function Home() {
    const [schools, setSchools] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/schools')
            .then(res => res.json())
            .then(data => setSchools(data))
            .catch(err => console.error(err));
    }, []);

    const renderStars = (rating) => {
        const stars = Math.round(rating);
        return '⭐'.repeat(stars);
    };

    return (
        <div>
            <h1>Découvrez nos écoles partenaires</h1>
            <div className="school-grid">
                {schools.map(school => {
                    const avgRating = Number(school.average_rating);
                    const count = school.rating_count;

                    return (
                        <div key={school.id} className="school-card">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                <h2 style={{marginTop: 0}}>{school.name}</h2>
                                {count > 0 ? (
                                    <div style={{textAlign: 'right'}}>
                                        <span style={{fontSize: '1.2em', fontWeight: 'bold', color: '#FFD700'}}>
                                            {avgRating.toFixed(1)}/5
                                        </span>
                                        <div style={{fontSize: '0.8em'}}>{renderStars(avgRating)}</div>
                                        <small style={{color: '#888'}}>({count} avis)</small>
                                    </div>
                                ) : (
                                    <span style={{fontSize: '0.8em', background: '#444', padding: '2px 6px', borderRadius: '4px'}}>
                                        Nouveau
                                    </span>
                                )}
                            </div>
                            
                            <p style={{fontStyle: 'italic', color: '#aaa', marginTop: '5px'}}>📍 {school.address}</p>
                            <p>{school.description}</p>
                            
                            {school.website && (
                                <a 
                                    href={school.website} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{display: 'inline-block', marginTop: '10px'}}
                                >
                                    Visiter le site web
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
            {schools.length === 0 && <p>Aucune école inscrite pour le moment.</p>}
        </div>
    );
}

export default Home;