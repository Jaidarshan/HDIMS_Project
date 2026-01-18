import { useEffect, useState } from 'react';
import api from '../../api';

function PatientMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/patient/medical-records')
      .then(res => { setRecords(res.data); setLoading(false); })
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
      <div className="mb-4">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-file-medical me-2"></i>My Medical Records
        </h2>
        <p className="text-muted small mt-1">View your diagnosis history and prescriptions</p>
      </div>
      
      <div className="row">
        <div className="col-12">
            {records.length === 0 ? (
                <div className="card border-0 shadow-sm p-5 text-center">
                    <div className="mb-3 text-muted opacity-25">
                        <i className="fas fa-notes-medical fa-4x"></i>
                    </div>
                    <h5 className="text-muted fw-bold">No Records Found</h5>
                    <p className="text-muted small">You haven't had any medical consultations recorded yet.</p>
                </div>
            ) : (
                records.map(record => (
                    <div key={record.id} className="card border-0 shadow-sm mb-4">
                        {/* Card Header */}
                        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                            <div>
                                <h5 className="mb-0 text-primary fw-bold">
                                    <i className="fas fa-stethoscope me-2"></i>{record.diagnosis}
                                </h5>
                            </div>
                            <span className="badge bg-white text-dark border shadow-sm px-3 py-2 rounded-pill">
                                <i className="far fa-calendar-alt me-2 text-muted"></i>{record.date}
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="card-body p-4">
                            <div className="row g-4">
                                {/* Doctor Info */}
                                <div className="col-md-6">
                                    <label className="small text-muted text-uppercase fw-bold mb-1">Attending Doctor</label>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-2 text-primary">
                                            <i className="fas fa-user-md"></i>
                                        </div>
                                        <span className="fw-medium text-dark">Dr. {record.doctor_name}</span>
                                    </div>
                                </div>

                                {/* Treatment Info */}
                                <div className="col-md-6">
                                    <label className="small text-muted text-uppercase fw-bold mb-1">Treatment Plan</label>
                                    <div className="d-flex align-items-center">
                                        <div className="bg-light rounded-circle p-2 me-2 text-success">
                                            <i className="fas fa-procedures"></i>
                                        </div>
                                        <span className="fw-medium text-dark">{record.treatment || 'Consultation only'}</span>
                                    </div>
                                </div>

                                {/* Prescription Section (Highlighted) */}
                                <div className="col-12">
                                    <div className="bg-primary-subtle rounded-3 p-3 border border-primary-subtle">
                                        <label className="small text-primary-emphasis text-uppercase fw-bold mb-2">
                                            <i className="fas fa-prescription-bottle-alt me-2"></i>Prescription
                                        </label>
                                        <p className="mb-0 text-dark font-monospace" style={{lineHeight: '1.6'}}>
                                            {record.prescription || 'No medication prescribed.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Notes Section */}
                                {record.notes && (
                                    <div className="col-12">
                                        <label className="small text-muted text-uppercase fw-bold mb-1">Clinical Notes</label>
                                        <p className="small text-muted bg-light p-3 rounded mb-0">
                                            <i className="fas fa-sticky-note me-2 opacity-50"></i>
                                            {record.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
}

export default PatientMedicalRecords;