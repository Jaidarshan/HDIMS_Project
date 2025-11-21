import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(formData.email, formData.password);
      showToast(`Welcome back, ${user.name || 'User'}!`, 'success');
      if (user.role === 'patient') navigate('/patient/dashboard');
      else if (user.role === 'doctor') navigate('/doctor/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
        showToast(err.response?.data?.error || 'Login failed.', 'danger');
    }
  };

  return (
    <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white text-center">
                    <h4 className="mb-0">
                        <i className="fas fa-sign-in-alt me-2"></i>Login to HDIMS
                    </h4>
                </div>
                <div className="card-body p-4">
                    {error && <div className="alert alert-danger">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">
                                <i className="fas fa-envelope me-1"></i>Email Address
                            </label>
                            <input 
                                type="email" 
                                className="form-control" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                            />
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label">
                                <i className="fas fa-lock me-1"></i>Password
                            </label>
                            <input 
                                type="password" 
                                className="form-control" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required 
                            />
                        </div>
                        
                        <div className="d-grid">
                            <button type="submit" className="btn btn-primary btn-lg">
                                <i className="fas fa-sign-in-alt me-2"></i>Login
                            </button>
                        </div>
                    </form>
                    
                    <hr className="my-4" />
                    
                    <div className="text-center">
                        <p className="mb-0">Don't have an account?</p>
                        <div className="btn-group-vertical d-grid gap-2" role="group">
                            <Link to="/register" className="btn btn-outline-primary">
                                <i className="fas fa-user me-2"></i>Register as Patient
                            </Link>
                            <Link to="/doctor/register" className="btn btn-outline-success">
                                <i className="fas fa-user-md me-2"></i>Register as Doctor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Credentials Section */}
            <div className="card mt-4">
                <div className="card-header bg-light">
                    <h6 className="mb-0">
                        <i className="fas fa-info-circle me-2"></i>Test Login Credentials
                    </h6>
                </div>
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <div className="text-center">
                                <div className="fw-bold text-primary">Patient</div>
                                <small>patient@hdims.com</small><br />
                                <small>patient123</small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center">
                                <div className="fw-bold text-success">Doctor</div>
                                <small>doctor@hdims.com</small><br />
                                <small>doctor123</small>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="text-center">
                                <div className="fw-bold text-danger">Admin</div>
                                <small>admin@hdims.com</small><br />
                                <small>admin123</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
}

export default Login;