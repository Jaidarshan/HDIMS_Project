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

/* ===========================
   🔒 HARD LOCKED OPTIONS
   =========================== */
const LOCKED_OPTIONS = {
  responsive: false,        // 🚫 NO ResizeObserver
  maintainAspectRatio: false,
  animation: false,
  plugins: { legend: { display: false } },
};

/* ===========================
   🔒 FIXED CHART CONTAINER
   =========================== */
const ChartShell = ({ children }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '240px',
        background: '#fff',
        borderRadius: '10px',
        padding: '12px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

/* ===========================
   MEMOIZED CHARTS (NO RERENDER)
   =========================== */
const PieChart = memo(({ data }) => (
  <Pie data={data} options={LOCKED_OPTIONS} width={260} height={220} />
));

const BarChart = memo(({ data, options }) => (
  <Bar data={data} options={options} width={500} height={220} />
));

const LineChart = memo(({ data, options }) => (
  <Line data={data} options={options} width={500} height={220} />
));

const DoughnutChart = memo(({ data }) => (
  <Doughnut data={data} options={LOCKED_OPTIONS} width={260} height={220} />
));

/* ===========================
   MAIN COMPONENT
   =========================== */
function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => setData(res.data))
      .catch(console.error);
  }, []);

  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  }

  /* -------- DATA -------- */
  const statusChart = {
    labels: Object.keys(data.appointment_status),
    datasets: [{
      data: Object.values(data.appointment_status),
      backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
    }],
  };

  const topRevenue = Object.entries(data.revenue_by_specialization || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const revenueChart = {
    labels: topRevenue.map(i => i[0]),
    datasets: [{
      data: topRevenue.map(i => i[1]),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  };

  const revenueOptions = {
    ...LOCKED_OPTIONS,
    indexAxis: 'y',
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false } },
    },
  };

  const growthChart = {
    labels: Object.keys(data.monthly_growth),
    datasets: [{
      data: Object.values(data.monthly_growth),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139,92,246,.15)',
      fill: true,
      tension: 0.3,
    }],
  };

  const growthOptions = {
    ...LOCKED_OPTIONS,
    scales: {
      y: { beginAtZero: true },
      x: { grid: { display: false } },
    },
  };

  const genderChart = {
    labels: Object.keys(data.patient_demographics),
    datasets: [{
      data: Object.values(data.patient_demographics),
      backgroundColor: ['#ec4899', '#0ea5e9', '#64748b'],
      cutout: '70%',
    }],
  };

  /* ===========================
     DASHBOARD LAYOUT (NO BOOTSTRAP)
     =========================== */
  return (
    <div
      style={{
        padding: 24,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 24,
      }}
    >
      <div style={{ gridColumn: 'span 1' }}>
        <h6>Status</h6>
        <ChartShell>
          <PieChart data={statusChart} />
        </ChartShell>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <h6>Top Departments (Revenue)</h6>
        <ChartShell>
          <BarChart data={revenueChart} options={revenueOptions} />
        </ChartShell>
      </div>

      <div style={{ gridColumn: 'span 2' }}>
        <h6>Monthly Growth</h6>
        <ChartShell>
          <LineChart data={growthChart} options={growthOptions} />
        </ChartShell>
      </div>

      <div style={{ gridColumn: 'span 1' }}>
        <h6>Demographics</h6>
        <ChartShell>
          <DoughnutChart data={genderChart} />
        </ChartShell>
      </div>
    </div>
  );
}

export default AdminAnalytics;
