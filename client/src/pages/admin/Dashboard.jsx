import { useEffect, useState } from 'react';
import api from '../../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const LOCKED_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: false } // Hide legend for cleaner dashboard
  },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f1f5f9' } } // Matches var(--border-color) visually
  },
  layout: { padding: 0 }
};

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } }, // Hide legend to save space
  scales: { x: { display: false }, y: { display: false } }
};

// 🔒 STRICT FIXED CONTAINER (Styled to match Theme)
const ChartBox = ({ children }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '240px', // Strictly matches Analytics
      background: 'var(--bg-surface)',
      borderRadius: 'var(--border-radius)',
      padding: '16px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      border: '1px solid var(--border-color)', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0, // Prevents grid blowout
      boxShadow: 'var(--shadow-sm)'
    }}
  >
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {children}
    </div>
  </div>
);

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  const { stats, charts } = data;

  // 1. Monthly Volume (Updated to Teal)
  const monthlyChartData = {
    labels: charts.monthly.map(m => m.month),
    datasets: [{
      label: 'Appointments',
      data: charts.monthly.map(m => m.count),
      backgroundColor: '#0d9488', // Medical Teal
      borderRadius: 4,
      barThickness: 25
    }]
  };

  // 2. Monthly Revenue
  const revenueChartData = {
    labels: charts.revenue ? charts.revenue.map(r => r.month) : [],
    datasets: [{
        label: 'Revenue ($)',
        data: charts.revenue ? charts.revenue.map(r => r.revenue) : [],
        borderColor: '#10b981', // Emerald Green
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
    }]
  };

  // 3. Status (Updated Colors)
  const statusChartData = {
    labels: charts.status.map(s => s.status),
    datasets: [{
      data: charts.status.map(s => s.count),
      backgroundColor: ['#10b981', '#0d9488', '#ef4444', '#f59e0b'], // Green, Teal, Red, Amber
      borderWidth: 0
    }]
  };

  // 4. Specialization
  const sortedSpecs = charts.specialization.sort((a, b) => b.count - a.count);
  const specChartData = {
    labels: sortedSpecs.map(s => s.specialization),
    datasets: [{
      data: sortedSpecs.map(s => s.count),
      backgroundColor: ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e'],
      cutout: '70%',
      borderWidth: 0
    }]
  };

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn" style={{ paddingBottom: 100 }}>
      <div className="mb-4">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.patients}</h2><div className="text-white-50 small text-uppercase fw-bold">Total Patients</div></div>
              <i className="fas fa-users fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.doctors}</h2><div className="text-white-50 small text-uppercase fw-bold">Active Doctors</div></div>
              <i className="fas fa-user-md fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.appointments}</h2><div className="text-white-50 small text-uppercase fw-bold">Total Appointments</div></div>
              <i className="fas fa-calendar-check fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT (Strictly preserved structure, updated styling) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* ROW 1 */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Monthly Appointment Volume</h6>
          <ChartBox><Bar data={monthlyChartData} options={LOCKED_OPTIONS} /></ChartBox>
        </div>
        
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Appointment Status</h6>
          <ChartBox><Pie data={statusChartData} options={PIE_OPTIONS} /></ChartBox>
        </div>

        {/* ROW 2 */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Monthly Revenue Trend</h6>
          <ChartBox><Line data={revenueChartData} options={LOCKED_OPTIONS} /></ChartBox>
        </div>

        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Doctors by Department</h6>
          <ChartBox><Doughnut data={specChartData} options={PIE_OPTIONS} /></ChartBox>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;