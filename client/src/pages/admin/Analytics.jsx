import { useEffect, useState, memo } from 'react';
import api from '../../api';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const LOCKED_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false } },
    y: { beginAtZero: true, grid: { color: '#f1f5f9' } } // Matches var(--border-color)
  },
  layout: { padding: 0 }
};

// Styled match for AdminDashboard's ChartBox
const ChartShell = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        background: 'var(--bg-surface)',
        borderRadius: 'var(--border-radius)',
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid var(--border-color)', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

const PieChart = memo(({ data }) => <Pie data={data} options={LOCKED_OPTIONS} />);
const BarChart = memo(({ data, options }) => <Bar data={data} options={options} />);
const LineChart = memo(({ data, options }) => <Line data={data} options={options} />);
const DoughnutChart = memo(({ data }) => <Doughnut data={data} options={LOCKED_OPTIONS} />);

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  const getDateParams = (range) => {
    const end = new Date();
    const start = new Date();
    if (range === '7days') start.setDate(end.getDate() - 7);
    else if (range === '30days') start.setDate(end.getDate() - 30);
    else if (range === '90days') start.setDate(end.getDate() - 90);
    else return {}; 
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  useEffect(() => {
    setLoading(true);
    const params = getDateParams(timeRange);
    api.get('/admin/analytics', { params })
      .then(res => { setData(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [timeRange]);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading Analytics...</span>
        </div>
    </div>
  );
  
  if (!data) return <div className="text-center text-danger p-5">Failed to load analytics data.</div>;

  // 1. Status Chart (Teal Theme)
  const statusChart = {
    labels: Object.keys(data.appointment_status || {}),
    datasets: [{
      data: Object.values(data.appointment_status || {}),
      backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'], // Blue, Green, Red, Amber
    }],
  };

  // 2. Revenue by Specialization (Teal Bars)
  const topRevenue = Object.entries(data.revenue_by_specialization || {}).sort(([, a], [, b]) => b - a).slice(0, 5);
  const revenueChart = {
    labels: topRevenue.map(i => i[0]),
    datasets: [{
      data: topRevenue.map(i => i[1]),
      backgroundColor: '#0d9488', // Medical Teal
      borderRadius: 4,
      barThickness: 15, 
    }],
  };
  const revenueOptions = {
    ...LOCKED_OPTIONS,
    indexAxis: 'y',
    scales: { x: { grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
  };

  // 3. Growth Chart (Smooth Blue Line)
  const sortedGrowth = Object.entries(data.monthly_growth || {}).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
  const growthChart = {
    labels: sortedGrowth.map(i => i[0]),
    datasets: [{
      data: sortedGrowth.map(i => i[1]),
      borderColor: '#3b82f6', // Blue
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  };
  const growthOptions = {
    ...LOCKED_OPTIONS,
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 10 } }, x: { grid: { display: false } } },
  };

  // 4. Demographics (Pastel Palette)
  const genderChart = {
    labels: Object.keys(data.patient_demographics || {}),
    datasets: [{
      data: Object.values(data.patient_demographics || {}),
      backgroundColor: ['#ec4899', '#0ea5e9', '#64748b'], // Pink, Blue, Gray
      cutout: '70%',
      borderWidth: 0
    }],
  };

  // 5. Appointment Types (Teal/Indigo Palette)
  const typeChart = {
    labels: Object.keys(data.appointment_types || {}),
    datasets: [{
      data: Object.values(data.appointment_types || {}),
      backgroundColor: ['#6366f1', '#0d9488', '#d946ef', '#f43f5e'],
      borderWidth: 0
    }]
  };

  // 6. Top Diagnoses (Emerald Bars)
  const topDiagnoses = Object.entries(data.top_diagnoses || {}).sort(([, a], [, b]) => b - a).slice(0, 5);
  const diagnosesChart = {
    labels: topDiagnoses.map(i => i[0]),
    datasets: [{
      data: topDiagnoses.map(i => i[1]),
      backgroundColor: '#10b981', // Emerald
      borderRadius: 4,
      barThickness: 15,
    }]
  };
  const diagnosesOptions = { ...revenueOptions };

  return (
    <div className="container-fluid p-4 animate__animated animate__fadeIn" style={{ paddingBottom: 100 }}>
      {/* Header & Filter */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <h2 className="text-primary fw-bold mb-0">
            <i className="fas fa-chart-line me-2"></i>System Analytics
        </h2>
        <div className="d-flex align-items-center gap-2">
          <label className="text-muted fw-bold small text-uppercase">Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)} 
            className="form-select form-select-sm bg-light border-0 shadow-sm"
            style={{ width: 'auto', fontWeight: '500' }}
          >
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        
        {/* Row 1 */}
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Appointment Status</h6>
          <ChartShell><PieChart data={statusChart} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Top Departments (Revenue)</h6>
          <ChartShell><BarChart data={revenueChart} options={revenueOptions} /></ChartShell>
        </div>
        
        {/* Row 2 */}
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Monthly Growth</h6>
          <ChartShell><LineChart data={growthChart} options={growthOptions} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Demographics</h6>
          <ChartShell><DoughnutChart data={genderChart} /></ChartShell>
        </div>
        
        {/* Row 3 */}
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Appointment Types</h6>
          <ChartShell><DoughnutChart data={typeChart} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 className="text-muted fw-bold text-uppercase small mb-2">Top Diagnoses (Prevalence)</h6>
          <ChartShell><BarChart data={diagnosesChart} options={diagnosesOptions} /></ChartShell>
        </div>

      </div>
    </div>
  );
}

export default AdminAnalytics;