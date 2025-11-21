import { useFormik } from 'formik';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function AdminRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      first_name: '', last_name: '', email: '', password: '',
      phone: '', date_of_birth: '', gender: 'Male', address: '',
      admin_code: '' // The special field for admins
    },
    onSubmit: async (values) => {
      try {
        await api.post('/admin/register', values);
        showToast('Registration successful! Please log in.', 'success');
        navigate('/login');
      } catch (err) {
        showToast(err.response?.data?.error || 'Registration failed', 'danger');
      }
    }
  });

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="card shadow-sm border-danger">
          <div className="card-header bg-danger text-white text-center">
            <h4 className="mb-0"><i className="fas fa-user-shield me-2"></i>Admin Registration</h4>
          </div>
          <div className="card-body p-4">
            <form onSubmit={formik.handleSubmit}>
                
                <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Restricted Area: Authorization Code Required
                </div>

                <div className="mb-3">
                    <label className="form-label">Authorization Code</label>
                    <input 
                        type="password" 
                        className="form-control border-danger" 
                        {...formik.getFieldProps('admin_code')} 
                        placeholder="Enter Admin Code"
                        required 
                    />
                </div>

                <h5 className="mb-3 text-muted border-bottom pb-2">Personal Details</h5>

                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <input className="form-control" placeholder="First Name" {...formik.getFieldProps('first_name')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Last Name" {...formik.getFieldProps('last_name')} required />
                    </div>
                    <div className="col-12">
                        <input className="form-control" type="email" placeholder="Email" {...formik.getFieldProps('email')} required />
                    </div>
                    <div className="col-12">
                        <input className="form-control" type="password" placeholder="Password" {...formik.getFieldProps('password')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" type="tel" placeholder="Phone" {...formik.getFieldProps('phone')} />
                    </div>
                    <div className="col-md-6">
                         <input className="form-control" type="date" {...formik.getFieldProps('date_of_birth')} required />
                    </div>
                    <div className="col-md-6">
                        <select className="form-select" {...formik.getFieldProps('gender')}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                     <div className="col-12">
                        <textarea className="form-control" placeholder="Address" rows="2" {...formik.getFieldProps('address')}></textarea>
                    </div>
                </div>

                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-danger btn-lg">Register as Admin</button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRegister;