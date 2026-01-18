import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch list of doctors from backend
    api.get('/patient/book-appointment')
      .then(res => setDoctors(res.data))
      .catch(err => showToast('Failed to load doctors list', 'danger'));
  }, []);

  const formik = useFormik({
    initialValues: {
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      appointment_type: 'Consultation',
      symptoms: ''
    },
    onSubmit: async (values) => {
      try {
        await api.post('/patient/book-appointment', values);
        showToast('Appointment booked successfully!', 'success');
        navigate('/patient/dashboard');
      } catch (err) {
        showToast(err.response?.data?.error || 'Booking failed', 'danger');
      }
    }
  });

  return (
    <div className="row justify-content-center animate__animated animate__fadeIn">
      <div className="col-md-8 col-lg-6">
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3">
            <h4 className="mb-0 text-primary fw-bold">
                <i className="fas fa-calendar-plus me-2"></i>Book an Appointment
            </h4>
          </div>
          <div className="card-body p-4">
            
            <form onSubmit={formik.handleSubmit}>
              
              {/* Doctor Dropdown */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small text-uppercase">
                    <i className="fas fa-user-md me-2"></i>Select Doctor
                </label>
                <select 
                  name="doctor_id" 
                  className="form-select bg-light border-0 py-2"
                  onChange={formik.handleChange} 
                  value={formik.values.doctor_id} 
                  required
                >
                    <option value="">-- Choose a Doctor --</option>
                    {doctors.map(doc => (
                        <option key={doc.id} value={doc.id}>
                            Dr. {doc.name} ({doc.specialization})
                        </option>
                    ))}
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold text-muted small text-uppercase">
                        <i className="far fa-calendar-alt me-2"></i>Date
                    </label>
                    <input 
                      type="date" 
                      name="appointment_date" 
                      className="form-control bg-light border-0 py-2"
                      onChange={formik.handleChange} 
                      value={formik.values.appointment_date} 
                      required 
                    />
                </div>
                <div className="col-md-6 mt-3 mt-md-0">
                    <label className="form-label fw-bold text-muted small text-uppercase">
                        <i className="far fa-clock me-2"></i>Time
                    </label>
                    <input 
                      type="time" 
                      name="appointment_time" 
                      className="form-control bg-light border-0 py-2"
                      onChange={formik.handleChange} 
                      value={formik.values.appointment_time} 
                      required 
                    />
                </div>
              </div>

              {/* Appointment Type */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small text-uppercase">
                    <i className="fas fa-tag me-2"></i>Appointment Type
                </label>
                <select 
                  name="appointment_type" 
                  className="form-select bg-light border-0 py-2"
                  onChange={formik.handleChange} 
                  value={formik.values.appointment_type}
                >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* Symptoms */}
              <div className="mb-4">
                <label className="form-label fw-bold text-muted small text-uppercase">
                    <i className="fas fa-notes-medical me-2"></i>Symptoms
                </label>
                <textarea 
                  name="symptoms" 
                  className="form-control bg-light border-0"
                  rows="3"
                  onChange={formik.handleChange} 
                  value={formik.values.symptoms} 
                  placeholder="Briefly describe your symptoms..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary btn-lg shadow-sm">
                    <i className="fas fa-check-circle me-2"></i>Confirm Booking
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;