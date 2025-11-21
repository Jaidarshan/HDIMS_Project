import { useFormik } from 'formik';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

function DoctorRegister() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      first_name: '', last_name: '', email: '', password: '', phone: '', date_of_birth: '',
      gender: 'Male', address: '', specialization: 'General Medicine', license_number: '',
      experience_years: 0, consultation_fee: 0,
      monday_start: '', monday_end: '', tuesday_start: '', tuesday_end: '',
      wednesday_start: '', wednesday_end: '', thursday_start: '', thursday_end: '',
      friday_start: '', friday_end: ''
    },
    onSubmit: async (values) => {
      try {
        await api.post('/doctor/register', values);
        showToast('Registration successful! Please log in.', 'success');
        navigate('/login');
      } catch (err) {
        showToast(err.response?.data?.error || 'Registration failed', 'danger');
      }
    }
  });

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm mb-5">
          <div className="card-header bg-success text-white text-center">
            <h4 className="mb-0"><i className="fas fa-user-md me-2"></i>Doctor Registration</h4>
          </div>
          <div className="card-body p-4">
            <form onSubmit={formik.handleSubmit}>
                {/* Basic Info */}
                <h5 className="mb-3">Basic Information</h5>
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <input className="form-control" placeholder="First Name" {...formik.getFieldProps('first_name')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" placeholder="Last Name" {...formik.getFieldProps('last_name')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" type="email" placeholder="Email" {...formik.getFieldProps('email')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" type="password" placeholder="Password" {...formik.getFieldProps('password')} required />
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
                </div>

                {/* Professional Info */}
                <h5 className="mb-3 mt-4">Professional Details</h5>
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <select className="form-select" {...formik.getFieldProps('specialization')}>
                            <option value="General Medicine">General Medicine</option>
                            <option value="Cardiology">Cardiology</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Dermatology">Dermatology</option>
                            <option value="Pediatrics">Pediatrics</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" placeholder="License Number" {...formik.getFieldProps('license_number')} required />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" type="number" placeholder="Experience (Years)" {...formik.getFieldProps('experience_years')} />
                    </div>
                    <div className="col-md-6">
                        <input className="form-control" type="number" placeholder="Consultation Fee" {...formik.getFieldProps('consultation_fee')} />
                    </div>
                </div>

                {/* Working Hours (Simplified for brevity, can add more days) */}
                <h5 className="mb-3 mt-4">Working Hours (Monday - Friday)</h5>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                    <div className="row g-2 mb-2 align-items-center" key={day}>
                        <div className="col-2 text-capitalize fw-bold">{day}</div>
                        <div className="col-5">
                            <input type="time" className="form-control" {...formik.getFieldProps(`${day}_start`)} />
                        </div>
                        <div className="col-5">
                            <input type="time" className="form-control" {...formik.getFieldProps(`${day}_end`)} />
                        </div>
                    </div>
                ))}

                <div className="d-grid mt-4">
                    <button type="submit" className="btn btn-success btn-lg">Register as Doctor</button>
                </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorRegister;