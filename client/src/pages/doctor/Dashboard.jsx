import { useEffect, useState } from 'react';
import api from '../../api';

function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/doctor/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Dr. {data.doctor_name} - Dashboard</h1>
      
      <div className="row">
        <div className="col">
            <h3>Today's Appointments</h3>
            {data.today_appointments.length === 0 ? <p>No appointments today.</p> : (
                <ul>
                    {data.today_appointments.map(apt => (
                        <li key={apt.id}>
                            {apt.time} - {apt.patient_name} ({apt.status})
                        </li>
                    ))}
                </ul>
            )}
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;