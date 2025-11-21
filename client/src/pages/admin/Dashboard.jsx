import { useEffect, useState } from 'react';
import api from '../../api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  const { stats, charts } = data;

  // Prepare Bar Chart Data (Monthly)
  const monthlyChartData = {
    labels: charts.monthly.map(m => m.month),
    datasets: [{
      label: 'Appointments',
      data: charts.monthly.map(m => m.count),
      backgroundColor: 'rgba(37, 99, 235, 0.8)',
    }]
  };

  // Prepare Pie Chart Data (Status)
  const statusChartData = {
    labels: charts.status.map(s => s.status),
    datasets: [{
      data: charts.status.map(s => s.count),
      backgroundColor: ['#2563EB', '#059669', '#DC2626', '#D97706'],
    }]
  };

  return (
    <div>
      <h2 className="text-primary mb-4"><i className="fas fa-tachometer-alt me-2"></i>System Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
            <div className="card bg-primary text-white h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="mb-0">{stats.patients}</h3>
                        <p className="mb-0">Total Patients</p>
                    </div>
                    <i className="fas fa-users fa-3x opacity-50"></i>
                </div>
            </div>
        </div>
        <div className="col-md-4">
            <div className="card bg-success text-white h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="mb-0">{stats.doctors}</h3>
                        <p className="mb-0">Active Doctors</p>
                    </div>
                    <i className="fas fa-user-md fa-3x opacity-50"></i>
                </div>
            </div>
        </div>
        <div className="col-md-4">
            <div className="card bg-info text-white h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="mb-0">{stats.appointments}</h3>
                        <p className="mb-0">Total Appointments</p>
                    </div>
                    <i className="fas fa-calendar-check fa-3x opacity-50"></i>
                </div>
            </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4">
        <div className="col-md-8">
            <div className="card shadow-sm h-100">
                <div className="card-header bg-light fw-bold">Monthly Appointments</div>
                <div className="card-body">
                    <Bar data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
                </div>
            </div>
        </div>
        <div className="col-md-4">
            <div className="card shadow-sm h-100">
                <div className="card-header bg-light fw-bold">Appointment Status</div>
                <div className="card-body d-flex justify-content-center">
                    <div style={{ height: '300px', width: '100%' }}>
                        <Pie data={statusChartData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;