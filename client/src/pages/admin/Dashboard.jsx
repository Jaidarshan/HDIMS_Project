import { useEffect, useState } from 'react';
import api from '../../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// 🔒 HARD LOCKED OPTIONS (GLOBAL SAFE)
const LOCKED_OPTIONS = {
  responsive: false,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: true }
  }
};

// 🔒 FIXED CHART CONTAINER
const ChartBox = ({ children }) => (
  <div
    style={{
      width: '100%',
      height: '300px',
      maxHeight: '300px',
      padding: '10px',
      overflow: 'hidden'
    }}
  >
    {children}
  </div>
);

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  const { stats, charts } = data;

  /* ===================== BAR CHART ===================== */
  const monthlyChartData = {
    labels: charts.monthly.map(m => m.month),
    datasets: [{
      label: 'Appointments',
      data: charts.monthly.map(m => m.count),
      backgroundColor: '#2563EB',
      borderRadius: 6
    }]
  };

  /* ===================== PIE CHART ===================== */
  const statusChartData = {
    labels: charts.status.map(s => s.status),
    datasets: [{
      data: charts.status.map(s => s.count),
      backgroundColor: ['#2563EB', '#059669', '#DC2626', '#D97706']
    }]
  };

  return (
    <div className="container-fluid py-3">
      <h2 className="text-primary mb-4">
        <i className="fas fa-tachometer-alt me-2"></i>
        System Dashboard
      </h2>

      {/* ===================== STATS ===================== */}
      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">{stats.patients}</h3>
                <small>Total Patients</small>
              </div>
              <i className="fas fa-users fa-3x opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">{stats.doctors}</h3>
                <small>Active Doctors</small>
              </div>
              <i className="fas fa-user-md fa-3x opacity-50"></i>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">{stats.appointments}</h3>
                <small>Total Appointments</small>
              </div>
              <i className="fas fa-calendar-check fa-3x opacity-50"></i>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CHARTS ===================== */}
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">
              Monthly Appointments
            </div>
            <div className="card-body">
              <ChartBox>
                <Bar
                  data={monthlyChartData}
                  options={LOCKED_OPTIONS}
                  width={700}
                  height={300}
                />
              </ChartBox>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-light fw-bold">
              Appointment Status
            </div>
            <div className="card-body">
              <ChartBox>
                <Pie
                  data={statusChartData}
                  options={LOCKED_OPTIONS}
                  width={300}
                  height={300}
                />
              </ChartBox>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
