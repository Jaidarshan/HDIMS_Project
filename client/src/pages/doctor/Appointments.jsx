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
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary"><i className="fas fa-user-md me-2"></i>Manage Appointments</h2>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0 align-middle">
              <thead className="bg-light text-secondary">
                  <tr>
                      <th>Date & Time</th>
                      <th>Patient Name</th>
                      <th>Type</th>
                      <th style={{width: '30%'}}>Symptoms</th>
                      <th>Status</th>
                      <th>Action</th>
                  </tr>
              </thead>
              <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt.id}>
                          <td>
                            <div className="fw-bold">{apt.date}</div>
                            <small className="text-muted">{apt.time}</small>
                          </td>
                          <td className="fw-bold">{apt.patient_name}</td>
                          <td>
                            <span className={`badge ${apt.type === 'Emergency' ? 'bg-danger' : 'bg-info text-dark'}`}>
                              {apt.type}
                            </span>
                          </td>
                          {/* FIX: Display Symptoms Here */}
                          <td>
                            <span className="text-dark small">
                              {apt.symptoms ? apt.symptoms : <em className="text-muted">No symptoms provided</em>}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              apt.status === 'completed' ? 'bg-success' : 
                              apt.status === 'scheduled' ? 'bg-primary' : 'bg-secondary'
                            }`}>
                              {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                            </span>
                          </td>
                          <td>
                              {apt.status === 'scheduled' && (
                                  <button 
                                    className="btn btn-sm btn-success"
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