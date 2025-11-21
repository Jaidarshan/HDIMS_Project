import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api';
import { useNavigate } from 'react-router-dom';
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
    <div className="form-container">
      <h2>Patient Registration</h2>
      <form onSubmit={formik.handleSubmit}>
        <input name="first_name" placeholder="First Name" onChange={formik.handleChange} value={formik.values.first_name} />
        <input name="last_name" placeholder="Last Name" onChange={formik.handleChange} value={formik.values.last_name} />
        <input name="email" type="email" placeholder="Email" onChange={formik.handleChange} value={formik.values.email} />
        
        <input name="password" type="password" placeholder="Password" onChange={formik.handleChange} value={formik.values.password} />
        {formik.errors.password ? <div className="error">{formik.errors.password}</div> : null}
        
        <input name="confirm_password" type="password" placeholder="Confirm Password" onChange={formik.handleChange} value={formik.values.confirm_password} />
        {formik.errors.confirm_password ? <div className="error">{formik.errors.confirm_password}</div> : null}

        <input name="phone" placeholder="Phone" onChange={formik.handleChange} value={formik.values.phone} />
        <input name="date_of_birth" type="date" onChange={formik.handleChange} value={formik.values.date_of_birth} />
        
        <select name="gender" onChange={formik.handleChange} value={formik.values.gender}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
        </select>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;