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

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <h2 className="text-primary mb-4"><i className="fas fa-users-medical me-2"></i>My Patients</h2>
      
      <div className="row g-4">
        {patients.length === 0 ? <p className="text-muted">No patients found.</p> : (
            patients.map(patient => (
                <div key={patient.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body text-center">
                            <div className="mb-3">
                                <i className="fas fa-user-circle fa-4x text-secondary"></i>
                            </div>
                            <h5 className="card-title">{patient.name}</h5>
                            <p className="text-muted small mb-2">ID: {patient.patient_id}</p>
                            <p className="mb-3"><i className="fas fa-phone me-2"></i>{patient.phone || 'N/A'}</p>
                            
                            <Link to={`/doctor/patient/${patient.id}/records`} className="btn btn-outline-primary btn-sm w-100">
                                <i className="fas fa-file-medical me-2"></i>View Records
                            </Link>
                        </div>
                        <div className="card-footer bg-light text-muted small text-center">
                            Last Visit: {patient.last_visit || 'Never'}
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