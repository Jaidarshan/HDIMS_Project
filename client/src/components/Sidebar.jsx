import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to check if a link is active
  const isActive = (path) => location.pathname === path ? 'active bg-primary-subtle text-primary fw-bold' : 'text-muted';

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-white" 
         style={{ width: 'var(--sidebar-width)', height: '100vh', position: 'fixed', left: 0, top: 0, borderRight: '1px solid var(--border-color)', zIndex: 1000 }}>
      
      {/* 1. Brand Section */}
      <Link to="/" className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-decoration-none pt-2 px-2">
        <div className="bg-primary text-white rounded p-2 me-2 d-flex align-items-center justify-content-center" style={{width: '32px', height: '32px'}}>
          <i className="fas fa-hospital-alt"></i>
        </div>
        <span className="fs-5 fw-bold text-dark">HDIMS</span>
      </Link>
      
      <hr className="text-secondary opacity-25 my-4" />

      {/* 2. Navigation Links */}
      <ul className="nav nav-pills flex-column mb-auto">
        
        {/* Patient Links */}
        {user && user.role === 'patient' && (
          <>
            <li className="nav-item mb-2">
              <Link to="/patient/dashboard" className={`nav-link ${isActive('/patient/dashboard')}`}>
                <i className="fas fa-tachometer-alt me-2" style={{width: '20px'}}></i> Dashboard
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/patient/book-appointment" className={`nav-link ${isActive('/patient/book-appointment')}`}>
                <i className="fas fa-calendar-plus me-2" style={{width: '20px'}}></i> Book Appt.
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/patient/appointments" className={`nav-link ${isActive('/patient/appointments')}`}>
                <i className="fas fa-calendar-check me-2" style={{width: '20px'}}></i> My Appts.
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/patient/medical-records" className={`nav-link ${isActive('/patient/medical-records')}`}>
                <i className="fas fa-file-medical me-2" style={{width: '20px'}}></i> Records
              </Link>
            </li>
          </>
        )}

        {/* Doctor Links */}
        {user && user.role === 'doctor' && (
          <>
            <li className="nav-item mb-2">
              <Link to="/doctor/dashboard" className={`nav-link ${isActive('/doctor/dashboard')}`}>
                <i className="fas fa-tachometer-alt me-2" style={{width: '20px'}}></i> Dashboard
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/doctor/appointments" className={`nav-link ${isActive('/doctor/appointments')}`}>
                <i className="fas fa-calendar-check me-2" style={{width: '20px'}}></i> Appointments
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/doctor/patients" className={`nav-link ${isActive('/doctor/patients')}`}>
                <i className="fas fa-users me-2" style={{width: '20px'}}></i> My Patients
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/doctor/schedule" className={`nav-link ${isActive('/doctor/schedule')}`}>
                <i className="fas fa-clock me-2" style={{width: '20px'}}></i> Schedule
              </Link>
            </li>
          </>
        )}

        {/* Admin Links */}
        {user && user.role === 'admin' && (
          <>
            <li className="nav-item mb-2">
              <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`}>
                <i className="fas fa-tachometer-alt me-2" style={{width: '20px'}}></i> Dashboard
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/users" className={`nav-link ${isActive('/admin/users')}`}>
                <i className="fas fa-users-cog me-2" style={{width: '20px'}}></i> Users
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/admin/analytics" className={`nav-link ${isActive('/admin/analytics')}`}>
                <i className="fas fa-chart-line me-2" style={{width: '20px'}}></i> Analytics
              </Link>
            </li>
          </>
        )}

        {/* Public Links (When not logged in) */}
        {!user && (
          <>
             <li className="nav-item mb-2">
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                <i className="fas fa-home me-2" style={{width: '20px'}}></i> Home
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                <i className="fas fa-sign-in-alt me-2" style={{width: '20px'}}></i> Login
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link to="/register" className={`nav-link ${isActive('/register')}`}>
                <i className="fas fa-user-plus me-2" style={{width: '20px'}}></i> Register
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* 3. User Profile / Logout Section */}
      {user && (
        <div>
          <hr className="text-secondary opacity-25 my-3" />
          <div className="dropdown">
            <a href="#" className="d-flex align-items-center link-dark text-decoration-none dropdown-toggle" id="dropdownUser2" data-bs-toggle="dropdown" aria-expanded="false">
              <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-2" style={{width: '32px', height: '32px'}}>
                 <i className="fas fa-user"></i>
              </div>
              <strong>{user.name || user.first_name}</strong>
            </a>
            <ul className="dropdown-menu text-small shadow" aria-labelledby="dropdownUser2">
              <li><Link className="dropdown-item" to={`/${user.role}/profile`}>Profile</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={handleLogout}>Sign out</button></li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;