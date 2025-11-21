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

  const handleComplete = async (id) => {
    const diagnosis = prompt("Enter Diagnosis:");
    if (!diagnosis) return;
    
    try {
        await api.post(`/doctor/appointment/${id}/complete`, { 
            diagnosis, 
            notes: "Completed via React" 
        });
        // Refresh list
        setAppointments(appointments.map(a => a.id === id ? {...a, status: 'completed'} : a));
        showToast('Appointment marked as completed.', 'success');
    } catch (err) {
        showToast('Failed to complete appointment.', 'danger');
    }
  };

  return (
    <div>
      <h2>Manage Appointments</h2>
      <table>
        <thead>
            <tr>
                <th>Date/Time</th>
                <th>Patient</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {appointments.map(apt => (
                <tr key={apt.id}>
                    <td>{apt.date} {apt.time}</td>
                    <td>{apt.patient_name}</td>
                    <td>{apt.type}</td>
                    <td>{apt.status}</td>
                    <td>
                        {apt.status === 'scheduled' && (
                            <button onClick={() => handleComplete(apt.id)}>Complete</button>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default DoctorAppointments;