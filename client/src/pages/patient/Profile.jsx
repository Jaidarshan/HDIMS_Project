import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

function PatientProfile() {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: 'success' });
  const { showToast } = useToast();

  const formik = useFormik({
    initialValues: {
      first_name: '', last_name: '', phone: '', address: '', date_of_birth: '', gender: '',
      blood_type: '', allergies: '', emergency_contact_name: '', emergency_contact_phone: '',
      insurance_provider: '', insurance_number: ''
    },
    onSubmit: async (values) => {
      try {
        await api.post('/patient/profile', values);
        showToast('Profile updated successfully!', 'success');
        setMsg({ text: 'Profile updated successfully!', type: 'success' });
        window.scrollTo(0, 0);
      } catch (err) {
        showToast('Failed to update profile. Please try again.', 'danger');
        setMsg({ text: 'Failed to update profile. Please try again.', type: 'danger' });
      }
    }
  });

  useEffect(() => {
    api.get('/patient/profile')
      .then(res => {
        const { user, patient } = res.data;
        formik.setValues({ ...(user || {}), ...(patient || {}) }); // Merge user and patient data safely
        setLoading(false);
      })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h4 className="mb-0"><i className="fas fa-user-edit me-2"></i>Edit Profile</h4>
          </div>
          <div className="card-body p-4">
            {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

            <form onSubmit={formik.handleSubmit}>
              <h5 className="text-primary mb-3 border-bottom pb-2">Personal Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input type="text" className="form-control" {...formik.getFieldProps('first_name')} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input type="text" className="form-control" {...formik.getFieldProps('last_name')} />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-control" {...formik.getFieldProps('phone')} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Date of Birth</label>
                    <input type="date" className="form-control" {...formik.getFieldProps('date_of_birth')} />
                </div>
              </div>

              <div className="mb-3">
                 <label className="form-label">Address</label>
                 <textarea className="form-control" rows="2" {...formik.getFieldProps('address')}></textarea>
              </div>

              <h5 className="text-primary mb-3 border-bottom pb-2 mt-4">Medical Information</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Blood Type</label>
                    <select className="form-select" {...formik.getFieldProps('blood_type')}>
                        <option value="">Select Blood Type</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                            <option key={bt} value={bt}>{bt}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label">Allergies</label>
                    <input type="text" className="form-control" {...formik.getFieldProps('allergies')} placeholder="Separate with commas" />
                </div>
              </div>

              <h5 className="text-primary mb-3 border-bottom pb-2 mt-4">Emergency Contact</h5>
              <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Contact Name</label>
                    <input type="text" className="form-control" {...formik.getFieldProps('emergency_contact_name')} />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Contact Phone</label>
                    <input type="tel" className="form-control" {...formik.getFieldProps('emergency_contact_phone')} />
                </div>
              </div>

              <div className="d-grid gap-2 mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
                    <i className="fas fa-save me-2"></i>Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;