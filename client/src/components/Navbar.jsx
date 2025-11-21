import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper to close mobile menu when a link is clicked
  const closeMenu = () => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
        navbarCollapse.classList.remove('show');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={user ? (user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard') : '/login'}>
            <i className="fas fa-hospital-alt me-2"></i>HDIMS
        </Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
                {user && user.role === 'patient' && (
                    <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/patient/dashboard" onClick={closeMenu}>
                                <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/patient/book-appointment" onClick={closeMenu}>
                                <i className="fas fa-calendar-plus me-1"></i>Book Appointment
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/patient/appointments" onClick={closeMenu}>
                                <i className="fas fa-calendar-check me-1"></i>My Appointments
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/patient/medical-records" onClick={closeMenu}>
                                <i className="fas fa-file-medical me-1"></i>Medical Records
                            </Link>
                        </li>
                    </>
                )}
                {user && user.role === 'doctor' && (
                     <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/doctor/dashboard" onClick={closeMenu}>
                                <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/doctor/appointments" onClick={closeMenu}>
                                <i className="fas fa-calendar-check me-1"></i>Appointments
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/doctor/patients" onClick={closeMenu}>
                                <i className="fas fa-users-medical me-1"></i>My Patients
                            </Link>
                        </li>
                    </>
                )}
                {user && user.role === 'admin' && (
                    <li className="nav-item">
                        <Link className="nav-link" to="/admin/dashboard" onClick={closeMenu}>
                            <i className="fas fa-tachometer-alt me-1"></i>Dashboard
                        </Link>
                    </li>
                )}
            </ul>
            
            <ul className="navbar-nav">
                {user ? (
                    <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown">
                            <i className="fas fa-user-circle me-1"></i>{user.name || user.first_name}
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <Link className="dropdown-item" to={`/${user.role}/profile`} onClick={closeMenu}>
                                    <i className="fas fa-user-edit me-2"></i>Profile
                                </Link>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button className="dropdown-item" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                                </button>
                            </li>
                        </ul>
                    </li>
                ) : (
                    <>
                        <li className="nav-item">
                            <Link className="nav-link" to="/login" onClick={closeMenu}>
                                <i className="fas fa-sign-in-alt me-1"></i>Login
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" to="/register" onClick={closeMenu}>
                                <i className="fas fa-user-plus me-1"></i>Register
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;