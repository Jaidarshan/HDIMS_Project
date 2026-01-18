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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  // Access data safely
  const { patient_name, patient_info, upcoming_appointments, recent_appointments, recent_records, stats } = data;

  return (
    <>
      {/* Page Header */}
      <div className="row mb-4 animate__animated animate__fadeIn">
        <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h2 className="text-primary fw-bold mb-0">
                        <i className="fas fa-tachometer-alt me-2"></i>Dashboard
                    </h2>
                    <p className="text-muted mb-0">Welcome back, {patient_name}</p>
                </div>
                <div className="d-none d-md-block">
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">
                        <i className="fas fa-id-card me-2"></i>ID: {patient_info.patient_id}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
            <div className="card bg-primary text-white border-0 shadow-md h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="mb-0 fw-bold">{stats?.upcoming_count || 0}</h3>
                            <p className="mb-0 small opacity-75">Upcoming Appts</p>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-calendar-check fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-success text-white border-0 shadow-md h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="mb-0 fw-bold">{stats?.total_visits || 0}</h3>
                            <p className="mb-0 small opacity-75">Total Visits</p>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-user-check fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-info text-white border-0 shadow-md h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 className="mb-0 fw-bold">{stats?.records_count || 0}</h3>
                            <p className="mb-0 small opacity-75">Medical Records</p>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-file-medical fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div className="col-md-3">
            <div className="card bg-warning text-white border-0 shadow-md h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="mb-0 fw-bold text-truncate">{patient_info.insurance || 'No Insurance'}</h6>
                            <p className="mb-0 small opacity-75">Insurance Provider</p>
                        </div>
                        <div className="bg-white bg-opacity-25 rounded-circle p-3 d-flex align-items-center justify-content-center" style={{width: '50px', height: '50px'}}>
                            <i className="fas fa-shield-alt fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Upcoming Appointments */}
        <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 text-primary fw-bold">
                        <i className="fas fa-calendar-alt me-2"></i>Upcoming Appointments
                    </h5>
                </div>
                <div className="card-body p-0">
                    {upcoming_appointments.length > 0 ? (
                        <div className="list-group list-group-flush">
                            {upcoming_appointments.map(apt => (
                                <div key={apt.id} className="list-group-item p-3 border-bottom-0 border-top-0 border-end-0 border-start-4 border-primary m-2 bg-light rounded">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="mb-1 fw-bold text-dark">Dr. {apt.doctor_name}</h6>
                                            <small className="text-muted d-block mb-1">{apt.specialization}</small>
                                            <div className="d-flex gap-2">
                                                <span className="badge bg-white text-primary border border-primary-subtle">
                                                    <i className="far fa-calendar me-1"></i>{apt.date}
                                                </span>
                                                <span className="badge bg-white text-dark border">
                                                    <i className="far fa-clock me-1"></i>{apt.time}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <span className="badge bg-success-subtle text-success border border-success-subtle text-capitalize px-3 py-2 rounded-pill">
                                                {apt.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3 text-muted opacity-25">
                                <i className="fas fa-calendar-plus fa-4x"></i>
                            </div>
                            <p className="text-muted mb-3">No upcoming appointments scheduled</p>
                            <Link to="/patient/book-appointment" className="btn btn-outline-primary btn-sm">
                                <i className="fas fa-plus me-2"></i>Book Now
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Recent Medical Records */}
        <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 text-primary fw-bold">
                        <i className="fas fa-file-medical-alt me-2"></i>Recent Medical Records
                    </h5>
                </div>
                <div className="card-body p-0">
                    {recent_records.length > 0 ? (
                        <div className="list-group list-group-flush">
                            {recent_records.map(record => (
                                <div key={record.id} className="list-group-item p-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="mb-1 fw-bold text-dark">{record.diagnosis || 'General Consultation'}</h6>
                                            <p className="small text-muted mb-1">
                                                <i className="fas fa-user-md me-1"></i>Dr. {record.doctor_name}
                                            </p>
                                        </div>
                                        <span className="small text-muted bg-light px-2 py-1 rounded">
                                            {record.date}
                                        </span>
                                    </div>
                                    {record.follow_up_required && (
                                        <div className="mt-2">
                                            <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                                                <i className="fas fa-exclamation-circle me-1"></i>Follow-up Required
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-3 text-muted opacity-25">
                                <i className="fas fa-folder-open fa-4x"></i>
                            </div>
                            <p className="text-muted">No medical records found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Patient Information Grid */}
      <div className="row mt-4">
        <div className="col-12">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom py-3">
                    <h5 className="mb-0 text-primary fw-bold">
                        <i className="fas fa-info-circle me-2"></i>Medical Profile
                    </h5>
                </div>
                <div className="card-body p-4">
                    <div className="row g-4">
                        <div className="col-md-3 col-sm-6">
                            <label className="small text-muted text-uppercase fw-bold mb-1">Blood Type</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-danger-subtle text-danger rounded-circle p-2 me-2">
                                    <i className="fas fa-tint"></i>
                                </div>
                                <span className="fw-bold fs-5">{patient_info.blood_type || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <label className="small text-muted text-uppercase fw-bold mb-1">Allergies</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-warning-subtle text-warning rounded-circle p-2 me-2">
                                    <i className="fas fa-allergies"></i>
                                </div>
                                <span className="fw-medium">{patient_info.allergies || 'None'}</span>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <label className="small text-muted text-uppercase fw-bold mb-1">Emergency Contact</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary-subtle text-primary rounded-circle p-2 me-2">
                                    <i className="fas fa-phone-alt"></i>
                                </div>
                                <span className="fw-medium">{patient_info.emergency_contact || 'Not set'}</span>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6">
                            <label className="small text-muted text-uppercase fw-bold mb-1">Insurance</label>
                            <div className="d-flex align-items-center">
                                <div className="bg-success-subtle text-success rounded-circle p-2 me-2">
                                    <i className="fas fa-file-contract"></i>
                                </div>
                                <span className="fw-medium">{patient_info.insurance || 'Self Pay'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4 mb-5">
        <div className="col-12">
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h5 className="mb-4 text-dark fw-bold">Quick Actions</h5>
                    <div className="row g-3">
                        <div className="col-md-3">
                            <Link to="/patient/book-appointment" className="btn btn-primary w-100 py-3 shadow-sm border-0">
                                <i className="fas fa-calendar-plus fa-lg mb-2 d-block"></i>
                                Book Appointment
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/appointments" className="btn btn-outline-primary w-100 py-3 border-2">
                                <i className="fas fa-calendar-check fa-lg mb-2 d-block"></i>
                                My Appointments
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/medical-records" className="btn btn-outline-primary w-100 py-3 border-2">
                                <i className="fas fa-file-medical fa-lg mb-2 d-block"></i>
                                Medical Records
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link to="/patient/profile" className="btn btn-outline-secondary w-100 py-3 border-2">
                                <i className="fas fa-user-edit fa-lg mb-2 d-block"></i>
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