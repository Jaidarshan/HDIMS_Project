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

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-10">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="fas fa-user-md me-2"></i>Doctor Profile</h4>
          </div>
          <div className="card-body p-4">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            
            <form onSubmit={formik.handleSubmit}>
                <h5 className="border-bottom pb-2 mb-3">Personal Info</h5>
                <div className="row g-3 mb-4">
                    <div className="col-md-6"><label>First Name</label><input className="form-control" {...formik.getFieldProps('first_name')} /></div>
                    <div className="col-md-6"><label>Last Name</label><input className="form-control" {...formik.getFieldProps('last_name')} /></div>
                    <div className="col-md-6"><label>Phone</label><input className="form-control" {...formik.getFieldProps('phone')} /></div>
                    <div className="col-md-6"><label>Address</label><input className="form-control" {...formik.getFieldProps('address')} /></div>
                </div>

                <h5 className="border-bottom pb-2 mb-3">Professional Details</h5>
                <div className="row g-3 mb-4">
                    <div className="col-md-6"><label>Specialization</label><input className="form-control" {...formik.getFieldProps('specialization')} /></div>
                    <div className="col-md-6"><label>Education</label><input className="form-control" {...formik.getFieldProps('education')} /></div>
                    <div className="col-md-4"><label>Experience (Years)</label><input type="number" className="form-control" {...formik.getFieldProps('experience_years')} /></div>
                    <div className="col-md-4"><label>Consultation Fee ($)</label><input type="number" className="form-control" {...formik.getFieldProps('consultation_fee')} /></div>
                </div>

                <h5 className="border-bottom pb-2 mb-3">Schedule Hours</h5>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => (
                    <div className="row g-2 mb-2" key={day}>
                        <div className="col-2 fw-bold text-capitalize pt-1">{day}</div>
                        <div className="col-5"><input type="time" className="form-control" {...formik.getFieldProps(`${day}_start`)} /></div>
                        <div className="col-5"><input type="time" className="form-control" {...formik.getFieldProps(`${day}_end`)} /></div>
                    </div>
                ))}

                <button type="submit" className="btn btn-primary btn-lg mt-3 w-100">Save Changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;