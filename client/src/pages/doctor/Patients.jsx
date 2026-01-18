import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/patients')
      .then(res => { setPatients(res.data); setLoading(false); })
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
            <i className="fas fa-users me-2"></i>My Patients
        </h2>
        <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2">
            Total: {patients.length}
        </span>
      </div>
      
      <div className="row g-4">
        {patients.length === 0 ? (
            <div className="col-12">
                <div className="text-center py-5">
                    <div className="mb-3 text-muted opacity-25">
                        <i className="fas fa-user-injured fa-4x"></i>
                    </div>
                    <h5 className="text-muted fw-bold">No Patients Found</h5>
                    <p className="text-muted small">You don't have any patients assigned yet.</p>
                </div>
            </div>
        ) : (
            patients.map(patient => (
                <div key={patient.id} className="col-md-6 col-lg-4 col-xl-3">
                    <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                        <div className="card-body text-center p-4">
                            <div className="mb-3 d-inline-block position-relative">
                                <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{width: '80px', height: '80px'}}>
                                    <i className="fas fa-user fa-3x"></i>
                                </div>
                            </div>
                            
                            <h5 className="card-title fw-bold text-dark mb-1">{patient.name}</h5>
                            <p className="text-muted small mb-3 bg-light rounded-pill px-2 py-1 d-inline-block">
                                ID: {patient.patient_id}
                            </p>
                            
                            <div className="mb-4">
                                <p className="mb-0 text-muted small">
                                    <i className="fas fa-phone-alt me-2 text-primary opacity-50"></i>
                                    {patient.phone || 'No phone number'}
                                </p>
                            </div>
                            
                            <Link to={`/doctor/patient/${patient.id}/records`} className="btn btn-outline-primary w-100 shadow-sm">
                                <i className="fas fa-file-medical me-2"></i>View History
                            </Link>
                        </div>
                        <div className="card-footer bg-white border-top-0 text-center pb-3">
                            <small className="text-muted opacity-75">
                                <i className="far fa-clock me-1"></i>Last Visit: {patient.last_visit || 'Never'}
                            </small>
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

export default DoctorPatients;