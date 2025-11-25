import { useState, useEffect } from 'react';

function AdminDashboard() {
    const [pendingSchools, setPendingSchools] = useState([]);

    const fetchPendingSchools = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:3000/api/admin/pending-schools', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPendingSchools(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPendingSchools();
    }, []);

    const handleApprove = async (id) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/admin/approve-school/${id}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPendingSchools();
    };

    const handleReject = async (id) => {
        if(!confirm("Êtes-vous sûr de vouloir rejeter cette école ?")) return;
        
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/admin/reject-school/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchPendingSchools();
    };

    return (
        <div>
            <h1>Dashboard Administrateur</h1>
            <h2>Écoles en attente de validation</h2>
            
            {pendingSchools.length === 0 ? (
                <p>Aucune école en attente.</p>
            ) : (
                <div className="school-grid">
                    {pendingSchools.map(school => (
                        <div key={school.id} className="school-card" style={{borderColor: 'orange'}}>
                            <h3>{school.name}</h3>
                            <p><strong>Email :</strong> {school.email}</p>
                            <p>{school.description}</p>
                            <div style={{marginTop: '10px'}}>
                                <button 
                                    onClick={() => handleApprove(school.id)}
                                    style={{backgroundColor: '#4CAF50', color: 'white', marginRight: '10px'}}
                                >
                                    Valider
                                </button>
                                <button 
                                    onClick={() => handleReject(school.id)}
                                    style={{backgroundColor: '#f44336', color: 'white'}}
                                >
                                    Rejeter
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;