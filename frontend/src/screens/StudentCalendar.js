import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getMyEventRegistrations } from '../api/client';
import { useNavigate } from 'react-router-dom';

moment.locale('fr');
const localizer = momentLocalizer(moment);

const StudentCalendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const registrations = await getMyEventRegistrations();
        
        const formattedEvents = registrations.map(reg => {
            const startDate = new Date(reg.event_date);
            const endDate = new Date(reg.event_date);
            endDate.setHours(endDate.getHours() + 3);

            return {
                id: reg.event_id,
                title: `${reg.title} - ${reg.school_name}`,
                start: startDate,
                end: endDate,
                status: reg.status,
                schoolId: reg.school_id
            };
        });

        setEvents(formattedEvents);
      } catch (error) {
        console.error("Erreur calendrier", error);
      }
    };
    fetchData();
  }, []);

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'accepted') backgroundColor = '#28a745';
    if (event.status === 'pending') backgroundColor = '#ffc107';
    if (event.status === 'rejected') backgroundColor = '#dc3545';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const handleSelectEvent = (event) => {
      navigate(`/school/${event.schoolId}`);
  };

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>📅 Mon Agenda JPO</h1>
          <div style={{ fontSize: '0.9rem' }}>
              <span style={{ marginRight:'15px' }}>🟢 Confirmé</span>
              <span style={{ marginRight:'15px' }}>🟡 En attente</span>
          </div>
      </div>

      <div style={{ height: '90%', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour",
              agenda: "Agenda",
              date: "Date",
              time: "Heure",
              event: "Événement",
              noEventsInRange: "Aucune JPO prévue sur cette période."
          }}
        />
      </div>
    </div>
  );
};

export default StudentCalendar;