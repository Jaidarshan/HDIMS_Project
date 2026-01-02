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
    y: { beginAtZero: true, grid: { color: '#f3f4f6' } }
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

// 🔒 STRICT FIXED CONTAINER (Same as Analytics)
const ChartBox = ({ children }) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      height: '240px', // Strictly matches Analytics
      background: '#fff',
      borderRadius: '10px',
      padding: '12px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      border: '1px solid #eee', 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0 // Prevents grid blowout
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

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  const { stats, charts } = data;

  // 1. Monthly Volume
  const monthlyChartData = {
    labels: charts.monthly.map(m => m.month),
    datasets: [{
      label: 'Appointments',
      data: charts.monthly.map(m => m.count),
      backgroundColor: '#3b82f6',
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
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
    }]
  };

  // 3. Status
  const statusChartData = {
    labels: charts.status.map(s => s.status),
    datasets: [{
      data: charts.status.map(s => s.count),
      backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#f59e0b'],
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
    <div className="container-fluid py-4" style={{ paddingBottom: 100 }}>
      <h2 className="text-primary mb-4 fw-bold" style={{ fontSize: '1.5rem' }}>
        <i className="fas fa-tachometer-alt me-2"></i>Admin Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(45deg, #2563EB, #1D4ED8)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.patients}</h2><div className="text-white-50">Total Patients</div></div>
              <i className="fas fa-users fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(45deg, #10B981, #059669)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.doctors}</h2><div className="text-white-50">Active Doctors</div></div>
              <i className="fas fa-user-md fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white shadow-sm border-0" style={{ background: 'linear-gradient(45deg, #F59E0B, #D97706)' }}>
            <div className="card-body d-flex justify-content-between align-items-center p-4">
              <div><h2 className="mb-0 fw-bold">{stats.appointments}</h2><div className="text-white-50">Total Appointments</div></div>
              <i className="fas fa-calendar-check fa-3x opacity-25"></i>
            </div>
          </div>
        </div>
      </div>

      {/* GRID LAYOUT (Aligned with Analytics) 
         Use strict grid-template-columns to align rows perfectly
      */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        
        {/* ROW 1 */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Monthly Appointment Volume</h6>
          <ChartBox><Bar data={monthlyChartData} options={LOCKED_OPTIONS} /></ChartBox>
        </div>
        
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Appointment Status</h6>
          <ChartBox><Pie data={statusChartData} options={PIE_OPTIONS} /></ChartBox>
        </div>

        {/* ROW 2 */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Monthly Revenue Trend</h6>
          <ChartBox><Line data={revenueChartData} options={LOCKED_OPTIONS} /></ChartBox>
        </div>

        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Doctors by Department</h6>
          <ChartBox><Doughnut data={specChartData} options={PIE_OPTIONS} /></ChartBox>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;