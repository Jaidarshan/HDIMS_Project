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
      // Logic strictly preserved as per your request
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
    <div className="row justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="col-md-6 col-lg-5">
            <div className="card shadow-md border-0">
                {/* Header: Teal Background automatically applied via bg-primary in index.css */}
                <div className="card-header bg-primary text-white text-center py-3">
                    <h4 className="mb-0 fw-bold">
                        <i className="fas fa-sign-in-alt me-2"></i>Login to HDIMS
                    </h4>
                </div>
                <div className="card-body p-4 p-md-5">
                    {error && <div className="alert alert-danger border-0 rounded-3">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label fw-bold text-muted small text-uppercase">
                                <i className="fas fa-envelope me-1"></i>Email Address
                            </label>
                            <input 
                                type="email" 
                                className="form-control form-control-lg bg-light border-0" 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required 
                                placeholder="name@example.com"
                            />
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label fw-bold text-muted small text-uppercase">
                                <i className="fas fa-lock me-1"></i>Password
                            </label>
                            <input 
                                type="password" 
                                className="form-control form-control-lg bg-light border-0" 
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required 
                                placeholder="••••••••"
                            />
                        </div>
                        
                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                                <i className="fas fa-sign-in-alt me-2"></i>Sign In
                            </button>
                        </div>
                    </form>
                    
                    <hr className="my-4 text-muted opacity-25" />
                    
                    <div className="text-center">
                        <p className="mb-3 text-muted small">Don't have an account?</p>
                        <div className="d-grid gap-2" role="group">
                            <Link to="/register" className="btn btn-outline-primary">
                                <i className="fas fa-user me-2"></i>Register as Patient
                            </Link>
                            {/* Changed to outline-info to keep it distinct but consistent with Teal theme */}
                            <Link to="/doctor/register" className="btn btn-outline-info">
                                <i className="fas fa-user-md me-2"></i>Register as Doctor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default Login;