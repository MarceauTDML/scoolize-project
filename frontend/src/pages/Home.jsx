import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

function Home() {
    const [schools, setSchools] = useState([]);
    const [meta, setMeta] = useState({ totalPages: 1, currentPage: 1 });
    const [searchParams, setSearchParams] = useSearchParams();

    const currentPage = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        fetch(`http://localhost:3000/api/schools?page=${currentPage}&limit=10`)
            .then(res => res.json())
            .then(data => {
                setSchools(data.data);
                setMeta(data.meta);
            })
            .catch(err => console.error(err));
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            setSearchParams({ page: newPage });
            window.scrollTo(0, 0);
        }
    };

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
                        <div key={school.id} className="school-card" style={{display: 'flex', flexDirection: 'column'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                                <h2 style={{marginTop: 0}}>
                                    <Link to={`/school/${school.id}`} style={{color: 'inherit', textDecoration: 'none'}}>
                                        {school.name}
                                    </Link>
                                </h2>
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
                            
                            <div style={{marginTop: 'auto', paddingTop: '20px', display: 'flex', gap: '10px'}}>
                                <Link to={`/school/${school.id}`} style={{textDecoration: 'none', fontWeight: 'bold', color: '#646cff'}}>
                                    Voir la fiche &rarr;
                                </Link>
                                
                                {school.website && (
                                    <a 
                                        href={school.website} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        style={{marginLeft: 'auto', fontSize: '0.9em'}}
                                    >
                                        Site web ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {schools.length === 0 && (
                <p style={{ marginTop: '20px' }}>Aucune école trouvée pour cette page.</p>
            )}

            {meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px', paddingBottom: '20px' }}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        &lt; Précédent
                    </button>

                    <span style={{ fontSize: '1.1em' }}>
                        Page <strong>{currentPage}</strong> sur {meta.totalPages}
                    </span>

                    <button 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === meta.totalPages}
                        style={{ opacity: currentPage === meta.totalPages ? 0.5 : 1, cursor: currentPage === meta.totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Suivant &gt;
                    </button>
                </div>
            )}
        </div>
    );
}

export default Home;