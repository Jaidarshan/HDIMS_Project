import { useEffect, useState } from 'react';
import api from '../../api';

function DoctorSchedule() {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/schedule')
      .then(res => { setSchedule(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-calendar-alt me-2"></i>My Schedule</h2>
        <span className="badge bg-secondary fs-6">
            Week of {schedule.start_of_week}
        </span>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
           <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                This view shows your appointments for the current week.
           </div>
           
           {/* Simple List View for Schedule */}
           <div className="list-group">
                {schedule.appointments.length === 0 ? (
                    <div className="list-group-item text-center text-muted py-4">No appointments this week.</div>
                ) : (
                    schedule.appointments.map(apt => (
                        <div key={apt.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="mb-1 text-primary">
                                    {new Date(apt.start).toLocaleDateString()} - {new Date(apt.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </h6>
                                <p className="mb-0">{apt.title}</p>
                            </div>
                            <span className={`badge bg-${apt.status === 'completed' ? 'success' : 'primary'}`}>
                                {apt.status}
                            </span>
                        </div>
                    ))
                )}
           </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorSchedule;