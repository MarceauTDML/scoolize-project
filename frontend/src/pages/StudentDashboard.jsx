import { useState, useEffect } from 'react';

function StudentDashboard() {
    const [schools, setSchools] = useState([]);
    const [membership, setMembership] = useState(null);
    const [myRating, setMyRating] = useState(null);
    const [formData, setFormData] = useState({ schoolId: '', year: '1ere année' });
    const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/api/schools').then(r => r.json()).then(setSchools);
        
        fetch('http://localhost:3000/api/students/my-status', {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(r => r.json()).then(data => {
            setMembership(data.membership);
            setMyRating(data.rating);
            if(data.rating) setRatingData({ rating: data.rating.rating, comment: data.rating.comment });
        });
    }, []);

    const handleJoin = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/api/students/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        if (res.ok) window.location.reload();
        else alert("Erreur lors de la demande");
    };

    const handleRate = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3000/api/students/rate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(ratingData)
        });
        if (res.ok) alert("Avis enregistré !");
    };

    if (membership) {
        return (
            <div>
                <h1>Mon Espace Élève</h1>
                <div className="card">
                    <h2>Ma situation</h2>
                    <p><strong>École :</strong> {membership.school_name}</p>
                    <p><strong>Année :</strong> {membership.year}</p>
                    <p><strong>Statut :</strong> 
                        <span style={{
                            color: membership.status === 'accepted' ? 'green' : 
                                   membership.status === 'rejected' ? 'red' : 'orange'
                        }}> {membership.status === 'accepted' ? 'Validé ✅' : membership.status === 'rejected' ? 'Refusé ❌' : 'En attente ⏳'}</span>
                    </p>
                </div>

                {membership.status === 'accepted' && (
                    <div className="card" style={{marginTop: '20px', borderColor: '#646cff'}}>
                        <h3>Noter mon école</h3>
                        <form onSubmit={handleRate}>
                            <div className="form-group">
                                <label>Note (1 à 5)</label>
                                <select 
                                    value={ratingData.rating} 
                                    onChange={(e) => setRatingData({...ratingData, rating: e.target.value})}
                                >
                                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Commentaire</label>
                                <textarea 
                                    value={ratingData.comment} 
                                    onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                                />
                            </div>
                            <button type="submit">Envoyer mon avis</button>
                        </form>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div>
            <h1>Rejoindre une école</h1>
            <p>Sélectionnez votre établissement pour pouvoir le noter.</p>
            <form onSubmit={handleJoin} style={{maxWidth: '400px', margin: '20px auto'}}>
                <div className="form-group">
                    <label>École</label>
                    <select 
                        required 
                        value={formData.schoolId} 
                        onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                    >
                        <option value="">-- Choisir une école --</option>
                        {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label>Année d'étude</label>
                    <select 
                        value={formData.year} 
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                    >
                        <option value="1ere année">1ère année</option>
                        <option value="2e année">2e année</option>
                        <option value="3e année">3e année</option>
                        <option value="4e année">4e année</option>
                        <option value="5e année">5e année</option>
                    </select>
                </div>
                <button type="submit">Envoyer la demande</button>
            </form>
        </div>
    );
}

export default StudentDashboard;