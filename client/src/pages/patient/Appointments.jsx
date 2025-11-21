import { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patient/appointments')
      .then(res => { setAppointments(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-calendar-check me-2"></i>My Appointments</h2>
        <Link to="/patient/book-appointment" className="btn btn-primary">
            <i className="fas fa-plus me-2"></i>Book New
        </Link>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="bg-light">
                    <tr>
                        <th>Date & Time</th>
                        <th>Doctor</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No appointments found.</td></tr>
                    ) : (
                        appointments.map(apt => (
                            <tr key={apt.id}>
                                <td>
                                    <div className="fw-bold">{apt.date}</div>
                                    <small className="text-muted">{apt.time}</small>
                                </td>
                                <td>
                                    <div className="fw-bold">Dr. {apt.doctor_name}</div>
                                    <small className="text-muted">{apt.specialization}</small>
                                </td>
                                <td><span className="badge bg-secondary">{apt.type}</span></td>
                                <td>
                                    <span className={`badge ${
                                        apt.status === 'completed' ? 'bg-success' : 
                                        apt.status === 'scheduled' ? 'bg-primary' : 'bg-danger'
                                    }`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td><small className="text-muted">{apt.notes || '-'}</small></td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientAppointments;