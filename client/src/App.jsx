import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ToastProvider } from './context/ToastContext'; // <--- Import this
import NotFound from './pages/NotFound';
import ChatAssistant from './components/ChatAssistant';

// --- IMPORTS ---
// Public
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import DoctorRegister from './pages/DoctorRegister';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import BookAppointment from './pages/patient/BookAppointment';
import PatientAppointments from './pages/patient/Appointments';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import PatientProfile from './pages/patient/Profile';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientRecords from './pages/doctor/PatientRecords';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorProfile from './pages/doctor/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminAnalytics from './pages/admin/Analytics';

// Guard
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <ChatAssistant />
            <main className="container mt-4" style={{ minHeight: '80vh' }}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/doctor/register" element={<DoctorRegister />} />
                <Route path="/admin/register" element={<AdminRegister />} />

                {/* Patient */}
                <Route path="/patient/dashboard" element={<PrivateRoute role="patient"><PatientDashboard /></PrivateRoute>} />
                <Route path="/patient/book-appointment" element={<PrivateRoute role="patient"><BookAppointment /></PrivateRoute>} />
                <Route path="/patient/appointments" element={<PrivateRoute role="patient"><PatientAppointments /></PrivateRoute>} />
                <Route path="/patient/medical-records" element={<PrivateRoute role="patient"><PatientMedicalRecords /></PrivateRoute>} />
                <Route path="/patient/profile" element={<PrivateRoute role="patient"><PatientProfile /></PrivateRoute>} />

                {/* Doctor */}
                <Route path="/doctor/dashboard" element={<PrivateRoute role="doctor"><DoctorDashboard /></PrivateRoute>} />
                <Route path="/doctor/appointments" element={<PrivateRoute role="doctor"><DoctorAppointments /></PrivateRoute>} />
                <Route path="/doctor/patients" element={<PrivateRoute role="doctor"><DoctorPatients /></PrivateRoute>} />
                <Route path="/doctor/patient/:id/records" element={<PrivateRoute role="doctor"><DoctorPatientRecords /></PrivateRoute>} />
                <Route path="/doctor/schedule" element={<PrivateRoute role="doctor"><DoctorSchedule /></PrivateRoute>} />
                <Route path="/doctor/profile" element={<PrivateRoute role="doctor"><DoctorProfile /></PrivateRoute>} />

                {/* Admin */}
                <Route path="/admin/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/users" element={<PrivateRoute role="admin"><AdminUsers /></PrivateRoute>} />
                <Route path="/admin/analytics" element={<PrivateRoute role="admin"><AdminAnalytics /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </Layout>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;