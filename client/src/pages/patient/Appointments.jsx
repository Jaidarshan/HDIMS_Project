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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  return (
    <div className="animate__animated animate__fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div>
            <h2 className="text-primary fw-bold mb-0">
                <i className="fas fa-calendar-check me-2"></i>My Appointments
            </h2>
            <p className="text-muted small mb-0 mt-1">Manage and view your appointment history</p>
        </div>
        <div className="mt-3 mt-md-0">
            <Link to="/patient/book-appointment" className="btn btn-primary shadow-sm">
                <i className="fas fa-plus me-2"></i>Book New Appointment
            </Link>
        </div>
      </div>

      {/* Appointments Table Card */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="bg-light">
                    <tr>
                        <th className="py-3 ps-4 text-uppercase text-muted small fw-bold border-bottom">Date & Time</th>
                        <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Doctor</th>
                        <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Type</th>
                        <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Status</th>
                        <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center py-5">
                                <div className="mb-3 text-muted opacity-25">
                                    <i className="fas fa-calendar-times fa-3x"></i>
                                </div>
                                <p className="text-muted fw-medium">No appointments found.</p>
                                <Link to="/patient/book-appointment" className="btn btn-sm btn-outline-primary">
                                    Book your first appointment
                                </Link>
                            </td>
                        </tr>
                    ) : (
                        appointments.map(apt => (
                            <tr key={apt.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center">
                                        <div className="bg-primary-subtle text-primary rounded p-2 me-3 d-flex flex-column align-items-center justify-content-center" style={{width: '50px'}}>
                                            <i className="fas fa-calendar-day mb-1"></i>
                                        </div>
                                        <div>
                                            <div className="fw-bold text-dark">{apt.date}</div>
                                            <small className="text-muted">
                                                <i className="far fa-clock me-1"></i>{apt.time}
                                            </small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="fw-bold text-dark">Dr. {apt.doctor_name}</div>
                                    <small className="text-muted">{apt.specialization}</small>
                                </td>
                                <td>
                                    <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle rounded-pill px-3">
                                        {apt.type}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge rounded-pill px-3 py-2 border ${
                                        apt.status === 'completed' ? 'bg-success-subtle text-success border-success-subtle' : 
                                        apt.status === 'scheduled' ? 'bg-primary-subtle text-primary border-primary-subtle' : 
                                        'bg-danger-subtle text-danger border-danger-subtle'
                                    }`}>
                                        {apt.status === 'completed' && <i className="fas fa-check-circle me-1"></i>}
                                        {apt.status === 'scheduled' && <i className="fas fa-clock me-1"></i>}
                                        {apt.status === 'cancelled' && <i className="fas fa-times-circle me-1"></i>}
                                        <span className="text-capitalize">{apt.status}</span>
                                    </span>
                                </td>
                                <td>
                                    {apt.notes ? (
                                        <span className="text-muted small text-truncate d-inline-block" style={{maxWidth: '150px'}} title={apt.notes}>
                                            {apt.notes}
                                        </span>
                                    ) : (
                                        <span className="text-muted opacity-50 small">-</span>
                                    )}
                                </td>
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