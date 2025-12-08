import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { getAllSchoolLocations } from '../api/client';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconRetinaUrl: iconRetina,
    iconUrl: iconMarker,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const SchoolsMap = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllSchoolLocations();
        console.log(`${data.length} écoles chargées.`);
        setSchools(data);
      } catch (error) {
        console.error("Erreur chargement carte:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement de la carte...</div>;

  return (
    <div style={{ height: 'calc(100vh - 80px)', width: '100%', position: 'relative', zIndex: 1 }}>
      
      <div style={{ 
          position: 'absolute', top: 10, right: 10, zIndex: 999, 
          background: 'rgba(255,255,255,0.9)', padding: '10px 15px', 
          borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontWeight: 'bold', color: '#333'
      }}>
          {schools.length} Établissements
      </div>

      <MapContainer 
        center={[46.603354, 1.888334]} 
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom={true}>
            {schools.map((school) => {
                const lat = parseFloat(school.latitude);
                const lng = parseFloat(school.longitude);
                
                if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null;

                return (
                    <Marker key={school.id} position={[lat, lng]}>
                        <Popup>
                            <div style={{ textAlign: 'center', minWidth: '160px' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#007bff' }}>
                                    {school.first_name}
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                                    {school.last_name}
                                </p>
                                
                                {school.school_type && (
                                    <span style={{ 
                                        display: 'inline-block',
                                        marginTop: '8px',
                                        fontSize: '0.75rem', 
                                        padding: '3px 8px', 
                                        borderRadius: '10px',
                                        background: school.school_type.toLowerCase().includes('privé') ? '#ffc107' : '#17a2b8',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {school.school_type}
                                    </span>
                                )}
                                
                                <button 
                                    onClick={() => navigate(`/school/${school.id}`)}
                                    style={{ 
                                        marginTop: '10px', 
                                        width: '100%',
                                        padding: '8px', 
                                        background: '#343a40', 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Voir la fiche
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default SchoolsMap;