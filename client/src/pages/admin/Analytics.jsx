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
  layout: { padding: 0 }
};

const ChartShell = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        background: '#fff',
        borderRadius: '10px',
        padding: '10px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        border: '1px solid #eee', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 0 
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

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading Analytics...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: 'center', color: 'red' }}>Failed to load data.</div>;

  const statusChart = {
    labels: Object.keys(data.appointment_status || {}),
    datasets: [{
      data: Object.values(data.appointment_status || {}),
      backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
    }],
  };

  const topRevenue = Object.entries(data.revenue_by_specialization || {}).sort(([, a], [, b]) => b - a).slice(0, 5);
  const revenueChart = {
    labels: topRevenue.map(i => i[0]),
    datasets: [{
      data: topRevenue.map(i => i[1]),
      backgroundColor: '#3b82f6',
      borderRadius: 4,
      barThickness: 15, 
    }],
  };
  const revenueOptions = {
    ...LOCKED_OPTIONS,
    indexAxis: 'y',
    scales: { x: { grid: { display: false } }, y: { grid: { display: false }, ticks: { font: { size: 11 } } } },
  };

  const sortedGrowth = Object.entries(data.monthly_growth || {}).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
  const growthChart = {
    labels: sortedGrowth.map(i => i[0]),
    datasets: [{
      data: sortedGrowth.map(i => i[1]),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,.15)',
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    }],
  };
  const growthOptions = {
    ...LOCKED_OPTIONS,
    scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { stepSize: 10 } }, x: { grid: { display: false } } },
  };

  const genderChart = {
    labels: Object.keys(data.patient_demographics || {}),
    datasets: [{
      data: Object.values(data.patient_demographics || {}),
      backgroundColor: ['#ec4899', '#0ea5e9', '#64748b'],
      cutout: '70%',
    }],
  };

  const typeChart = {
    labels: Object.keys(data.appointment_types || {}),
    datasets: [{
      data: Object.values(data.appointment_types || {}),
      backgroundColor: ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'],
      borderWidth: 0
    }]
  };

  const topDiagnoses = Object.entries(data.top_diagnoses || {}).sort(([, a], [, b]) => b - a).slice(0, 5);
  const diagnosesChart = {
    labels: topDiagnoses.map(i => i[0]),
    datasets: [{
      data: topDiagnoses.map(i => i[1]),
      backgroundColor: '#10b981', 
      borderRadius: 4,
      barThickness: 15,
    }]
  };
  const diagnosesOptions = { ...revenueOptions };

  return (
    <div style={{ padding: 24, paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, borderBottom: '1px solid #eee', paddingBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>System Analytics</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#6b7280' }}>Time Range:</label>
          <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #d1d5db', outline: 'none', cursor: 'pointer' }}>
            <option value="all">All Time</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Status</h6>
          <ChartShell><PieChart data={statusChart} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Top Departments (Revenue)</h6>
          <ChartShell><BarChart data={revenueChart} options={revenueOptions} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Monthly Growth</h6>
          <ChartShell><LineChart data={growthChart} options={growthOptions} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Demographics</h6>
          <ChartShell><DoughnutChart data={genderChart} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 1', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Appointment Types</h6>
          <ChartShell><DoughnutChart data={typeChart} /></ChartShell>
        </div>
        <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
          <h6 style={{ marginBottom: 8, color: '#4b5563', fontWeight: 600 }}>Top Diagnoses (Disease Prevalence)</h6>
          <ChartShell><BarChart data={diagnosesChart} options={diagnosesOptions} /></ChartShell>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;