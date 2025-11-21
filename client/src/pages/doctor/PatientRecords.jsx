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

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div>
      <h3 className="text-primary mb-4"><i className="fas fa-notes-medical me-2"></i>Patient Medical History</h3>
      
      {records.length === 0 ? (
          <div className="alert alert-info">No medical records found for this patient.</div>
      ) : (
          <div className="timeline">
            {records.map(rec => (
                <div key={rec.id} className="card mb-4 shadow-sm border-start border-primary border-4">
                    <div className="card-header d-flex justify-content-between bg-light">
                        <span className="fw-bold">{rec.date}</span>
                        <span className="text-muted">Dr. {rec.doctor_name}</span>
                    </div>
                    <div className="card-body">
                        <h5 className="card-title text-primary">{rec.diagnosis}</h5>
                        <hr />
                        <div className="row">
                            <div className="col-md-6 mb-2">
                                <strong>Treatment:</strong>
                                <p>{rec.treatment || 'None'}</p>
                            </div>
                            <div className="col-md-6 mb-2">
                                <strong>Prescription:</strong>
                                <p className="text-danger">{rec.prescription || 'None'}</p>
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