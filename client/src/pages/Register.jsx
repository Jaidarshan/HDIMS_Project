import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      first_name: '', last_name: '', email: '', password: '', confirm_password: '',
      phone: '', date_of_birth: '', gender: 'Male', blood_type: '', allergies: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(6, 'Must be 6 characters or more').required('Required'),
      confirm_password: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required')
    }),
    onSubmit: async (values) => {
      try {
        await api.post('/register', values);
        showToast('Registration successful! Please login.', 'success');
        navigate('/login');
      } catch (err) {
        showToast(err.response?.data?.error || 'Registration failed', 'danger');
      }
    },
  });

  return (
    <div className="row justify-content-center animate__animated animate__fadeIn">
      <div className="col-lg-8 col-xl-7">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white py-3">
            <h4 className="mb-0 fw-bold">
                <i className="fas fa-user-plus me-2"></i>Patient Registration
            </h4>
          </div>
          <div className="card-body p-4 p-md-5">
            
            <form onSubmit={formik.handleSubmit}>
              
              {/* Personal Information Section */}
              <h5 className="text-primary fw-bold text-uppercase small letter-spacing mb-3">
                  <i className="far fa-id-card me-2"></i>Personal Information
              </h5>
              
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">First Name</label>
                    <input 
                        name="first_name" 
                        className="form-control bg-light border-0"
                        placeholder="e.g. John" 
                        onChange={formik.handleChange} 
                        value={formik.values.first_name} 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Last Name</label>
                    <input 
                        name="last_name" 
                        className="form-control bg-light border-0"
                        placeholder="e.g. Doe" 
                        onChange={formik.handleChange} 
                        value={formik.values.last_name} 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Phone Number</label>
                    <input 
                        name="phone" 
                        className="form-control bg-light border-0"
                        placeholder="(555) 123-4567" 
                        onChange={formik.handleChange} 
                        value={formik.values.phone} 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Date of Birth</label>
                    <input 
                        name="date_of_birth" 
                        type="date" 
                        className="form-control bg-light border-0"
                        onChange={formik.handleChange} 
                        value={formik.values.date_of_birth} 
                    />
                </div>
                <div className="col-12">
                    <label className="form-label fw-bold text-muted small text-uppercase">Gender</label>
                    <select 
                        name="gender" 
                        className="form-select bg-light border-0"
                        onChange={formik.handleChange} 
                        value={formik.values.gender}
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
              </div>

              {/* Account Security Section */}
              <h5 className="text-primary fw-bold text-uppercase small letter-spacing mb-3 border-top pt-4">
                  <i className="fas fa-shield-alt me-2"></i>Account Security
              </h5>

              <div className="row g-3 mb-4">
                <div className="col-12">
                    <label className="form-label fw-bold text-muted small text-uppercase">Email Address</label>
                    <input 
                        name="email" 
                        type="email" 
                        className={`form-control bg-light border-0 ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                        placeholder="name@example.com" 
                        onChange={formik.handleChange} 
                        value={formik.values.email} 
                    />
                    {formik.touched.email && formik.errors.email && (
                        <div className="invalid-feedback">{formik.errors.email}</div>
                    )}
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Password</label>
                    <input 
                        name="password" 
                        type="password" 
                        className={`form-control bg-light border-0 ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••" 
                        onChange={formik.handleChange} 
                        value={formik.values.password} 
                    />
                    {formik.touched.password && formik.errors.password && (
                        <div className="invalid-feedback">{formik.errors.password}</div>
                    )}
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">Confirm Password</label>
                    <input 
                        name="confirm_password" 
                        type="password" 
                        className={`form-control bg-light border-0 ${formik.touched.confirm_password && formik.errors.confirm_password ? 'is-invalid' : ''}`}
                        placeholder="••••••••" 
                        onChange={formik.handleChange} 
                        value={formik.values.confirm_password} 
                    />
                    {formik.touched.confirm_password && formik.errors.confirm_password && (
                        <div className="invalid-feedback">{formik.errors.confirm_password}</div>
                    )}
                </div>
              </div>

              <div className="d-grid mt-5">
                <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                    <i className="fas fa-check-circle me-2"></i>Create Account
                </button>
              </div>

            </form>
          </div>
          <div className="card-footer bg-light text-center py-3 border-top-0">
              <p className="mb-0 text-muted small">
                  Already have an account? <Link to="/login" className="fw-bold text-primary text-decoration-none">Sign In</Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;