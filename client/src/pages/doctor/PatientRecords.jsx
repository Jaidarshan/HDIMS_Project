import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

function DoctorPatientRecords() {
  const { id } = useParams();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/doctor/patient/${id}/medical-records`)
      .then(res => { setRecords(res.data); setLoading(false); })
      .catch(err => {
          setError(err.response?.data?.error || 'Access Denied');
          setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  if (error) return (
    <div className="alert alert-danger border-0 shadow-sm m-4 d-flex align-items-center">
        <i className="fas fa-exclamation-triangle me-2"></i>{error}
    </div>
  );

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn">
      <div className="mb-4">
        <h3 className="text-primary fw-bold mb-0">
            <i className="fas fa-notes-medical me-2"></i>Patient Medical History
        </h3>
      </div>
      
      {records.length === 0 ? (
          <div className="alert alert-info border-0 shadow-sm d-flex align-items-center">
              <i className="fas fa-info-circle me-2"></i>No medical records found for this patient.
          </div>
      ) : (
          <div className="timeline">
            {records.map(rec => (
                <div key={rec.id} className="card mb-4 border-0 shadow-sm border-start border-4 border-primary">
                    <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3">
                        <span className="fw-bold text-dark">
                            <i className="far fa-calendar-alt me-2 text-primary"></i>{rec.date}
                        </span>
                        <span className="text-muted small bg-light px-2 py-1 rounded">
                            <i className="fas fa-user-md me-1"></i>Dr. {rec.doctor_name}
                        </span>
                    </div>
                    <div className="card-body p-4">
                        <h5 className="card-title text-primary fw-bold mb-3">
                            <i className="fas fa-stethoscope me-2"></i>{rec.diagnosis}
                        </h5>
                        <hr className="text-muted opacity-25" />
                        <div className="row g-3">
                            <div className="col-md-6 mb-2">
                                <strong className="text-muted small text-uppercase fw-bold d-block mb-1">Treatment:</strong>
                                <p className="mb-0 text-dark fw-medium">{rec.treatment || 'None'}</p>
                            </div>
                            <div className="col-md-6 mb-2">
                                <strong className="text-muted small text-uppercase fw-bold d-block mb-1">Prescription:</strong>
                                {/* Changed from text-danger to a clean styled box */}
                                <p className="mb-0 bg-primary-subtle text-dark p-2 rounded border border-primary-subtle font-monospace">
                                    {rec.prescription || 'None'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}

export default DoctorPatientRecords;