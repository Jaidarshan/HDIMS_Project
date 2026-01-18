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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-calendar-alt me-2"></i>My Schedule
        </h2>
        <span className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
            <i className="far fa-calendar me-2 text-muted"></i>Week of {schedule.start_of_week}
        </span>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
           <div className="alert bg-primary-subtle text-primary-emphasis border border-primary-subtle rounded-3 d-flex align-items-center mb-4">
                <i className="fas fa-info-circle me-3 fs-5"></i>
                <div>
                    This view shows your appointments for the current week.
                </div>
           </div>
           
           {/* Simple List View for Schedule */}
           <div className="list-group">
                {schedule.appointments.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="mb-3 text-muted opacity-25">
                            <i className="fas fa-calendar-times fa-3x"></i>
                        </div>
                        <p className="text-muted fw-medium mb-0">No appointments this week.</p>
                    </div>
                ) : (
                    schedule.appointments.map(apt => (
                        <div key={apt.id} className="list-group-item d-flex justify-content-between align-items-center p-3 border-start-0 border-end-0 hover-bg-light">
                            <div>
                                <h6 className="mb-1 text-primary fw-bold">
                                    <i className="far fa-clock me-2"></i>
                                    {new Date(apt.start).toLocaleDateString()} - {new Date(apt.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </h6>
                                <p className="mb-0 text-dark fw-medium">{apt.title}</p>
                            </div>
                            <span className={`badge rounded-pill px-3 py-2 border ${
                                apt.status === 'completed' 
                                ? 'bg-success-subtle text-success border-success-subtle' 
                                : 'bg-primary-subtle text-primary border-primary-subtle'
                            }`}>
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