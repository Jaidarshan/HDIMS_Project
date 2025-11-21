import { useEffect, useState } from 'react';
import api from '../../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function AdminAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/analytics').then(res => setData(res.data)).catch(console.error);
  }, []);

  if (!data) return <div>Loading Analytics...</div>;

  // Prepare chart data
  const chartData = {
    labels: Object.keys(data.appointment_status),
    datasets: [{
        data: Object.values(data.appointment_status),
        backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 1,
    }],
  };

  return (
    <div>
      <h2 className="text-primary mb-4"><i className="fas fa-chart-pie me-2"></i>System Analytics</h2>
      <div className="row">
        <div className="col-md-6">
            <div className="card shadow-sm">
                <div className="card-header bg-light">Appointment Status Distribution</div>
                <div className="card-body" style={{maxHeight: '400px'}}>
                    <Pie data={chartData} />
                </div>
            </div>
        </div>
        {/* Add more charts here based on available data */}
      </div>
    </div>
  );
}

export default AdminAnalytics;