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

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <h2 className="text-primary mb-4"><i className="fas fa-file-medical me-2"></i>My Medical Records</h2>
      
      <div className="row">
        <div className="col-12">
            {records.length === 0 ? (
                <div className="card p-5 text-center">
                    <i className="fas fa-notes-medical fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No medical records found.</p>
                </div>
            ) : (
                records.map(record => (
                    <div key={record.id} className="card medical-record-card mb-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 text-primary">
                                <i className="fas fa-stethoscope me-2"></i>{record.diagnosis}
                            </h5>
                            <span className="badge bg-light text-dark border">
                                <i className="far fa-calendar-alt me-1"></i>{record.date}
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <strong className="text-secondary">Doctor:</strong>
                                    <p>Dr. {record.doctor_name}</p>
                                </div>
                                <div className="col-md-6">
                                    <strong className="text-secondary">Treatment:</strong>
                                    <p>{record.treatment || 'N/A'}</p>
                                </div>
                                <div className="col-12">
                                    <strong className="text-secondary">Prescription:</strong>
                                    <p className="bg-light p-2 rounded border-start border-4 border-primary">
                                        {record.prescription || 'None'}
                                    </p>
                                </div>
                                {record.notes && (
                                    <div className="col-12">
                                        <strong className="text-secondary">Notes:</strong>
                                        <p className="small text-muted">{record.notes}</p>
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