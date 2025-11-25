import { useState, useEffect } from 'react';

function SchoolDashboard() {
    const [requests, setRequests] = useState([]);

    const fetchRequests = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3000/api/school-management/requests', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(res.ok) setRequests(await res.json());
        } catch(err) { console.error(err); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleDecision = async (id, status) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:3000/api/school-management/requests/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        fetchRequests();
    };

    return (
        <div>
            <h1>Gestion de mon École</h1>
            <h2>Demandes d'adhésion en attente</h2>
            
            {requests.length === 0 ? <p>Aucune demande en cours.</p> : (
                <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
                    <thead>
                        <tr style={{borderBottom: '1px solid #555'}}>
                            <th style={{padding: '10px', textAlign: 'left'}}>Email Élève</th>
                            <th style={{padding: '10px', textAlign: 'left'}}>Année</th>
                            <th style={{padding: '10px', textAlign: 'center'}}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} style={{borderBottom: '1px solid #333'}}>
                                <td style={{padding: '10px'}}>{req.email}</td>
                                <td style={{padding: '10px'}}>{req.year}</td>
                                <td style={{padding: '10px', textAlign: 'center'}}>
                                    <button 
                                        onClick={() => handleDecision(req.id, 'accepted')}
                                        style={{marginRight: '10px', backgroundColor: '#4CAF50', padding: '5px 10px'}}
                                    >
                                        Accepter
                                    </button>
                                    <button 
                                        onClick={() => handleDecision(req.id, 'rejected')}
                                        style={{backgroundColor: '#f44336', padding: '5px 10px'}}
                                    >
                                        Refuser
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default SchoolDashboard;