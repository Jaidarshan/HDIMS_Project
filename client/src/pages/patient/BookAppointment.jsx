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
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0"><i className="fas fa-calendar-plus me-2"></i>Book an Appointment</h4>
          </div>
          <div className="card-body p-4">
            
            <form onSubmit={formik.handleSubmit}>
              
              {/* Doctor Dropdown */}
              <div className="mb-3">
                <label className="form-label">Select Doctor</label>
                <select 
                  name="doctor_id" 
                  className="form-select"
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
              <div className="row mb-3">
                <div className="col-md-6">
                    <label className="form-label">Date</label>
                    <input 
                      type="date" 
                      name="appointment_date" 
                      className="form-control"
                      onChange={formik.handleChange} 
                      value={formik.values.appointment_date} 
                      required 
                    />
                </div>
                <div className="col-md-6">
                    <label className="form-label">Time</label>
                    <input 
                      type="time" 
                      name="appointment_time" 
                      className="form-control"
                      onChange={formik.handleChange} 
                      value={formik.values.appointment_time} 
                      required 
                    />
                </div>
              </div>

              {/* Appointment Type */}
              <div className="mb-3">
                <label className="form-label">Appointment Type</label>
                <select 
                  name="appointment_type" 
                  className="form-select"
                  onChange={formik.handleChange} 
                  value={formik.values.appointment_type}
                >
                    <option value="Consultation">Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Emergency">Emergency</option>
                </select>
              </div>

              {/* Symptoms */}
              <div className="mb-3">
                <label className="form-label">Symptoms</label>
                <textarea 
                  name="symptoms" 
                  className="form-control"
                  rows="3"
                  onChange={formik.handleChange} 
                  value={formik.values.symptoms} 
                  placeholder="Briefly describe your symptoms..."
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary btn-lg">
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