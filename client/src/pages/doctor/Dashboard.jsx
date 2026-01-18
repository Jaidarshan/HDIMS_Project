import { useEffect, useState } from 'react';
import api from '../../api';

function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
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
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-primary fw-bold mb-0">
            <i className="fas fa-user-md me-2"></i>Dr. {data.doctor_name} - Dashboard
        </h1>
      </div>
      
      <div className="row">
        <div className="col-12">
            {/* Appointments Card */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                    <h3 className="mb-0 text-primary fw-bold fs-5">
                        <i className="fas fa-calendar-day me-2"></i>Today's Appointments
                    </h3>
                </div>
                <div className="card-body p-0">
                    {data.today_appointments.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-calendar-check fa-3x text-muted mb-3 opacity-25"></i>
                            <p className="text-muted fw-medium mb-0">No appointments today.</p>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {data.today_appointments.map(apt => (
                                <li key={apt.id} className="list-group-item p-3 border-bottom d-flex justify-content-between align-items-center hover-bg-light">
                                    <div>
                                        <span className="badge bg-primary-subtle text-primary me-2">
                                            <i className="far fa-clock me-1"></i>{apt.time}
                                        </span>
                                        <span className="text-dark fw-medium ms-2">
                                            {apt.patient_name}
                                        </span>
                                    </div>
                                    <span className="badge bg-light text-dark border">
                                        {apt.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;