import { useEffect, useState } from 'react';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    api.get('/doctor/appointments')
      .then(res => setAppointments(res.data))
      .catch(console.error);
  }, []);

  const handleComplete = async (id, patientName, symptoms) => {
    // Show symptoms in the prompt so the doctor has context immediately
    const diagnosis = prompt(
      `Patient: ${patientName}\nSymptoms: ${symptoms || 'None'}\n\nEnter Diagnosis to complete:`
    );
    
    if (!diagnosis) return;
    
    try {
        await api.post(`/doctor/appointment/${id}/complete`, { 
            diagnosis, 
            notes: "Completed via web dashboard" 
        });
        
        // Optimistically update the UI
        setAppointments(appointments.map(a => 
            a.id === id ? {...a, status: 'completed'} : a
        ));
        
        showToast('Appointment marked as completed.', 'success');
    } catch (err) {
        showToast('Failed to complete appointment.', 'danger');
    }
  };

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-user-md me-2"></i>Manage Appointments
        </h2>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                  <tr>
                      <th className="py-3 ps-4 text-uppercase text-muted small fw-bold border-bottom">Date & Time</th>
                      <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Patient Name</th>
                      <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Type</th>
                      <th className="py-3 text-uppercase text-muted small fw-bold border-bottom" style={{width: '30%'}}>Symptoms</th>
                      <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Status</th>
                      <th className="py-3 text-uppercase text-muted small fw-bold border-bottom">Action</th>
                  </tr>
              </thead>
              <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="mb-3 text-muted opacity-25">
                            <i className="fas fa-calendar-times fa-3x"></i>
                        </div>
                        <p className="text-muted fw-medium mb-0">No appointments found.</p>
                      </td>
                    </tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.id}>
                          <td className="ps-4">
                            <div className="fw-bold text-dark">{apt.date}</div>
                            <small className="text-muted">
                                <i className="far fa-clock me-1"></i>{apt.time}
                            </small>
                          </td>
                          <td className="fw-bold text-primary">{apt.patient_name}</td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 border ${
                                apt.type === 'Emergency' 
                                ? 'bg-danger-subtle text-danger border-danger-subtle' 
                                : 'bg-info-subtle text-info border-info-subtle'
                            }`}>
                              {apt.type}
                            </span>
                          </td>
                          {/* FIX: Display Symptoms Here */}
                          <td>
                            <span className="text-dark small">
                              {apt.symptoms ? apt.symptoms : <em className="text-muted opacity-50">No symptoms provided</em>}
                            </span>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 border ${
                              apt.status === 'completed' ? 'bg-success-subtle text-success border-success-subtle' : 
                              apt.status === 'scheduled' ? 'bg-primary-subtle text-primary border-primary-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'
                            }`}>
                              {apt.status === 'completed' && <i className="fas fa-check-circle me-1"></i>}
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </td>
                          <td>
                              {apt.status === 'scheduled' && (
                                  <button 
                                    className="btn btn-sm btn-success shadow-sm"
                                    onClick={() => handleComplete(apt.id, apt.patient_name, apt.symptoms)}
                                  >
                                    <i className="fas fa-check-circle me-1"></i> Complete
                                  </button>
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

export default DoctorAppointments;