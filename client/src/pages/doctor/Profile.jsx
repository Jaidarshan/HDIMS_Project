import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function DoctorProfile() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: 'success' });
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      first_name: '', last_name: '', phone: '', address: '',
      specialization: '', experience_years: 0, education: '', consultation_fee: 0,
      monday_start: '', monday_end: '', tuesday_start: '', tuesday_end: '',
      wednesday_start: '', wednesday_end: '', thursday_start: '', thursday_end: '',
      friday_start: '', friday_end: ''
    },
    onSubmit: async (values) => {
      try {
        await api.post('/doctor/profile', values);
        showToast('Profile updated successfully!', 'success');
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        window.scrollTo(0, 0);
      } catch (err) {
        showToast('Update failed.', 'danger');
        setMsg({ text: 'Update failed.', type: 'danger' });
      }
    }
  });

  useEffect(() => {
    api.get('/doctor/profile').then(res => {
      formik.setValues({ ...(res.data.user || {}), ...(res.data.doctor || {}) });
      setLoading(false);
    }).catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );

  return (
    <div className="row justify-content-center animate__animated animate__fadeIn">
      <div className="col-lg-10">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3">
            <h4 className="mb-0 text-primary fw-bold">
                <i className="fas fa-user-md me-2"></i>Doctor Profile
            </h4>
          </div>
          <div className="card-body p-4">
            {msg.text && (
                <div className={`alert alert-${msg.type} border-0 shadow-sm mb-4 d-flex align-items-center`}>
                    <i className={`fas fa-${msg.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    {msg.text}
                </div>
            )}
            
            <form onSubmit={formik.handleSubmit}>
                {/* Section 1: Personal Info */}
                <h5 className="text-primary fw-bold text-uppercase small letter-spacing mb-3 mt-2">
                    <i className="fas fa-id-card me-2"></i>Personal Info
                </h5>
                <div className="row g-3 mb-5">
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">First Name</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('first_name')} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">Last Name</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('last_name')} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">Phone</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('phone')} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">Address</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('address')} />
                    </div>
                </div>

                {/* Section 2: Professional Details */}
                <h5 className="text-primary fw-bold text-uppercase small letter-spacing mb-3 border-top pt-4">
                    <i className="fas fa-briefcase-medical me-2"></i>Professional Details
                </h5>
                <div className="row g-3 mb-5">
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">Specialization</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('specialization')} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small text-uppercase">Education</label>
                        <input className="form-control bg-light border-0" {...formik.getFieldProps('education')} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold text-muted small text-uppercase">Experience (Years)</label>
                        <input type="number" className="form-control bg-light border-0" {...formik.getFieldProps('experience_years')} />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label fw-bold text-muted small text-uppercase">Consultation Fee ($)</label>
                        <div className="input-group">
                            <span className="input-group-text bg-light border-0 text-muted">$</span>
                            <input type="number" className="form-control bg-light border-0" {...formik.getFieldProps('consultation_fee')} />
                        </div>
                    </div>
                </div>

                {/* Section 3: Schedule Hours */}
                <h5 className="text-primary fw-bold text-uppercase small letter-spacing mb-3 border-top pt-4">
                    <i className="far fa-clock me-2"></i>Schedule Hours
                </h5>
                <div className="card bg-light border-0 p-3 mb-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                        <div className="row g-2 mb-3 align-items-center" key={day}>
                            <div className="col-md-2 col-3 fw-bold text-capitalize text-muted small text-uppercase pt-1">
                                {day}
                            </div>
                            <div className="col-md-5 col-4">
                                <input type="time" className="form-control border-0 shadow-sm" {...formik.getFieldProps(`${day}_start`)} />
                            </div>
                            <div className="col-md-5 col-5">
                                <input type="time" className="form-control border-0 shadow-sm" {...formik.getFieldProps(`${day}_end`)} />
                            </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary btn-lg mt-2 w-100 shadow-sm">
                    <i className="fas fa-save me-2"></i>Save Changes
                </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;