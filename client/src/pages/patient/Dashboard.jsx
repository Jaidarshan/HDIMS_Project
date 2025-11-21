import { useEffect, useState } from 'react';
import api from '../../api';
import { Link } from 'react-router-dom';

function PatientDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patient/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  // Access data safely
  const { patient_name, patient_info, upcoming_appointments, recent_appointments, recent_records, stats } = data;

  return (
    <>
      <div className="row">
        <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="text-primary">
                    <i className="fas fa-tachometer-alt me-2"></i>Patient Dashboard
                </h2>
                <div className="text-muted">
                    Welcome back, {patient_name}
                </div>
            </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
            <div className="card bg-primary text-white">
                <div className="card-body">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h4 className="mb-0">{stats?.upcoming_count || 0}</h4>
                            <p className="mb-0">Upcoming</p>
                        </div>
                        <div className="align-self-center">
                            <i className="fas fa-calendar-check fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-success text-white">
                <div className="card-body">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h4 className="mb-0">{stats?.total_visits || 0}</h4>
                            <p className="mb-0">Total Visits</p>
                        </div>
                        <div className="align-self-center">
                            <i className="fas fa-user-check fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-info text-white">
                <div className="card-body">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h4 className="mb-0">{stats?.records_count || 0}</h4>
                            <p className="mb-0">Medical Records</p>
                        </div>
                        <div className="align-self-center">
                            <i className="fas fa-file-medical fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-warning text-white">
                <div className="card-body">
                    <div className="d-flex justify-content-between">
                        <div>
                            <h4 className="mb-0 fs-5">{patient_info.patient_id}</h4>
                            <p className="mb-0">Patient ID</p>
                        </div>
                        <div className="align-self-center">
                            <i className="fas fa-id-card fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Upcoming Appointments */}
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-calendar-alt me-2"></i>Upcoming Appointments
                    </h5>
                </div>
                <div className="card-body">
                    {upcoming_appointments.length > 0 ? (
                        upcoming_appointments.map(apt => (
                            <div key={apt.id} className="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded">
                                <div>
                                    <h6 className="mb-1">Dr. {apt.doctor_name}</h6>
                                    <small className="text-muted">{apt.specialization}</small>
                                    <div className="mt-1">
                                        <span className="badge bg-primary me-1">{apt.date}</span>
                                        <span className="badge bg-secondary">{apt.time}</span>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <span className="badge bg-success text-capitalize">{apt.status}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No upcoming appointments</p>
                            <Link to="/patient/book-appointment" className="btn btn-primary">
                                <i className="fas fa-plus me-2"></i>Book Appointment
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Recent Medical Records */}
        <div className="col-lg-6">
            <div className="card h-100">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-file-medical-alt me-2"></i>Recent Medical Records
                    </h5>
                </div>
                <div className="card-body">
                    {recent_records.length > 0 ? (
                        recent_records.map(record => (
                            <div key={record.id} className="d-flex justify-content-between align-items-center p-3 mb-2 bg-light rounded">
                                <div>
                                    <h6 className="mb-1">{record.diagnosis || 'General Consultation'}</h6>
                                    <small className="text-muted">Dr. {record.doctor_name}</small>
                                    <div className="mt-1">
                                        <span className="badge bg-info">{record.date}</span>
                                    </div>
                                </div>
                                <div>
                                    {record.follow_up_required && (
                                        <span className="badge bg-warning text-dark">Follow-up Required</span>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <i className="fas fa-file-medical fa-3x text-muted mb-3"></i>
                            <p className="text-muted">No medical records yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="row mt-4">
        <div className="col-12">
            <div className="card">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-user me-2"></i>Patient Information
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <strong>Blood Type:</strong>
                            <span className="ms-2">{patient_info.blood_type}</span>
                        </div>
                        <div className="col-md-6">
                            <strong>Allergies:</strong>
                            <span className="ms-2">{patient_info.allergies}</span>
                        </div>
                        <div className="col-md-6">
                            <strong>Emergency Contact:</strong>
                            <span className="ms-2">{patient_info.emergency_contact}</span>
                        </div>
                        <div className="col-md-6">
                            <strong>Insurance:</strong>
                            <span className="ms-2">{patient_info.insurance}</span>
                        </div>
                    </div>
                    <div className="mt-3">
                        <Link to="/patient/profile" className="btn btn-outline-primary">
                            <i className="fas fa-edit me-2"></i>Update Profile
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4 mb-5">
        <div className="col-12">
            <div className="card">
                <div className="card-header bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-bolt me-2"></i>Quick Actions
                    </h5>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <Link to="/patient/book-appointment" className="btn btn-primary btn-lg w-100">
                                <i className="fas fa-calendar-plus mb-2 d-block"></i>
                                Book Appointment
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/appointments" className="btn btn-success btn-lg w-100">
                                <i className="fas fa-calendar-check mb-2 d-block"></i>
                                My Appointments
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/medical-records" className="btn btn-info btn-lg w-100">
                                <i className="fas fa-file-medical mb-2 d-block"></i>
                                Medical Records
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/profile" className="btn btn-warning btn-lg w-100">
                                <i className="fas fa-user-edit mb-2 d-block"></i>
                                Update Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

export default PatientDashboard;