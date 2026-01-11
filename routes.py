from google import genai
import os
from datetime import datetime, date, time, timedelta
from flask import request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import func, and_, or_
from app import app, db, login_manager
from models import User, Patient, Doctor, Appointment, MedicalRecord, Specialization, Disease, SystemMetrics
from utils import (
    generate_patient_id, generate_doctor_id, generate_appointment_id, 
    generate_record_id, calculate_age, format_time, format_date,
    is_doctor_available, get_doctor_working_days, validate_appointment_time,
    get_available_time_slots, get_appointment_priority_data
)
from data_structures import HDIMSDataStructures
import logging

# Initialize data structures
hdims_ds = HDIMSDataStructures()

# Helper function to handle unauthorized access for APIs
@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({'error': 'Authentication required', 'authenticated': False}), 401

@app.route('/api/auth/status')
def auth_status():
    """Check current authentication status"""
    if current_user.is_authenticated:
        return jsonify({
            'authenticated': True,
            'user': {
                'id': current_user.id,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'role': current_user.role
            }
        })
    return jsonify({'authenticated': False}), 200

@app.route('/api/login', methods=['POST'])
def login():
    """Login API"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing request body'}), 400

    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    
    if user and user.check_password(password):
        if user.is_active:
            login_user(user)
            return jsonify({
                'message': 'Logged in successfully!',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'role': user.role,
                    'name': user.full_name
                }
            }), 200
        else:
            return jsonify({'error': 'Your account has been deactivated. Please contact admin.'}), 403
    else:
        return jsonify({'error': 'Invalid email or password.'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    """Patient registration API"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    
    # Validation
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email already registered.'}), 409
    
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match.'}), 400
    
    try:
        # Create user
        date_of_birth_str = data.get('date_of_birth')
        date_of_birth = datetime.strptime(date_of_birth_str, '%Y-%m-%d').date() if date_of_birth_str else None

        user = User(
            email=email,
            role='patient',
            first_name=first_name,
            last_name=last_name,
            phone=data.get('phone'),
            date_of_birth=date_of_birth,
            gender=data.get('gender'),
            address=data.get('address'),
            is_active=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
        
        # Create patient profile
        patient = Patient(
            user_id=user.id,
            patient_id=generate_patient_id(),
            blood_type=data.get('blood_type'),
            allergies=data.get('allergies') or 'None known',
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_phone=data.get('emergency_contact_phone'),
            insurance_provider=data.get('insurance_provider'),
            insurance_number=data.get('insurance_number')
        )
        db.session.add(patient)
        db.session.commit()
        
        # Index patient
        patient_data = {
            'first_name': first_name,
            'last_name': last_name,
            'email': email,
            'patient_id': patient.patient_id
        }
        hdims_ds.index_patient(user.id, patient_data)
        
        return jsonify({'message': 'Registration successful! Please log in.'}), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Registration error: {e}")
        return jsonify({'error': 'Registration failed. Please try again.'}), 500

@app.route('/api/doctor/register', methods=['POST'])
def doctor_register():
    """Doctor registration API"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    try:
        email = data.get('email')
        license_number = data.get('license_number')

        # Check duplicates
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered.'}), 409
        
        if Doctor.query.filter_by(license_number=license_number).first():
            return jsonify({'error': 'License number already registered.'}), 409
        
        # Create user
        date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        user = User(
            email=email,
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            date_of_birth=date_of_birth,
            gender=data.get('gender'),
            address=data.get('address', ''),
            role='doctor'
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.flush()
        
        # Create doctor profile
        doctor = Doctor(
            user_id=user.id,
            doctor_id=generate_doctor_id(),
            specialization=data['specialization'],
            license_number=license_number,
            experience_years=int(data.get('experience_years', 0)),
            education=data.get('education', ''),
            consultation_fee=float(data.get('consultation_fee', 0))
        )
        
        # Set working hours
        working_hours = [
            ('monday', 'monday_start', 'monday_end'),
            ('tuesday', 'tuesday_start', 'tuesday_end'),
            ('wednesday', 'wednesday_start', 'wednesday_end'),
            ('thursday', 'thursday_start', 'thursday_end'),
            ('friday', 'friday_start', 'friday_end'),
            ('saturday', 'saturday_start', 'saturday_end'),
            ('sunday', 'sunday_start', 'sunday_end')
        ]
        
        for day, start_field, end_field in working_hours:
            start_time = data.get(start_field)
            end_time = data.get(end_field)
            if start_time and end_time:
                setattr(doctor, f'{day}_start', datetime.strptime(start_time, '%H:%M').time())
                setattr(doctor, f'{day}_end', datetime.strptime(end_time, '%H:%M').time())
        
        db.session.add(doctor)
        db.session.commit()
        
        # Index doctor
        doctor_data = {
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': email,
            'doctor_id': doctor.doctor_id,
            'specialization': doctor.specialization,
            'type': 'doctor'
        }
        hdims_ds.index_doctor(user.id, doctor_data)
        
        return jsonify({'message': 'Doctor registration successful!'}), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Doctor registration error: {e}")
        return jsonify({'error': 'Registration failed.'}), 500

@app.route('/api/admin/register', methods=['POST'])
def admin_register():
    """Admin registration API"""
    data = request.get_json()
    try:
        admin_code = data.get('admin_code')
        if admin_code != 'HDIMS_ADMIN_2025':
            return jsonify({'error': 'Invalid admin authorization code.'}), 403
        
        email = data.get('email')
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered.'}), 409
        
        date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        user = User(
            email=email,
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            date_of_birth=date_of_birth,
            gender=data.get('gender'),
            address=data.get('address', ''),
            role='admin'
        )
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'Admin registration successful!'}), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Admin registration error: {e}")
        return jsonify({'error': 'Registration failed.'}), 500

@app.route('/api/logout')
@login_required
def logout():
    """Logout user"""
    logout_user()
    return jsonify({'message': 'You have been logged out.'}), 200

# ---------------- Patient Routes ----------------

@app.route('/api/patient/dashboard')
@login_required
def patient_dashboard():
    """Patient dashboard API"""
    if current_user.role != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    patient = current_user.patient_profile
    if not patient:
        return jsonify({'error': 'Patient profile not found'}), 404
    
    # Get recent appointments
    recent_appointments = Appointment.query.filter_by(
        patient_id=patient.id
    ).order_by(Appointment.appointment_date.desc()).limit(5).all()
    
    # Get upcoming appointments
    upcoming_appointments = Appointment.query.filter(
        and_(
            Appointment.patient_id == patient.id,
            Appointment.appointment_date >= date.today(),
            Appointment.status == 'scheduled'
        )
    ).order_by(Appointment.appointment_date.asc()).limit(3).all()
    
    # Get recent medical records
    recent_records = MedicalRecord.query.filter_by(
        patient_id=patient.id
    ).order_by(MedicalRecord.record_date.desc()).limit(3).all()
    
    # Helper to serialize
    def serialize_appointment(apt):
        return {
            'id': apt.id,
            'doctor_name': apt.doctor.user.full_name,
            'specialization': apt.doctor.specialization,
            'date': apt.appointment_date.strftime('%B %d, %Y'), # Formatted like 'October 10, 2025'
            'time': apt.appointment_time.strftime('%I:%M %p'),  # Formatted like '10:30 AM'
            'status': apt.status,
            'type': apt.appointment_type
        }

    def serialize_record(rec):
        return {
            'id': rec.id,
            'doctor_name': rec.doctor.user.full_name,
            'date': rec.record_date.strftime('%B %d, %Y'),
            'diagnosis': rec.diagnosis,
            'follow_up_required': rec.follow_up_required
        }

    return jsonify({
        'patient_name': current_user.full_name,
        'patient_info': {  # <--- ADDED THIS BLOCK
            'patient_id': patient.patient_id,
            'blood_type': patient.blood_type or 'Not specified',
            'allergies': patient.allergies or 'None known',
            'emergency_contact': patient.emergency_contact_name or 'Not specified',
            'insurance': patient.insurance_provider or 'Not specified'
        },
        'recent_appointments': [serialize_appointment(a) for a in recent_appointments],
        'upcoming_appointments': [serialize_appointment(a) for a in upcoming_appointments],
        'recent_records': [serialize_record(r) for r in recent_records],
        'stats': { # <--- ADDED STATS COUNTS
            'upcoming_count': len(upcoming_appointments),
            'total_visits': len(recent_appointments),
            'records_count': len(recent_records)
        }
    })

@app.route('/api/patient/profile', methods=['GET', 'POST'])
@login_required
def patient_profile():
    """Patient profile API"""
    if current_user.role != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    patient = current_user.patient_profile
    if not patient:
        return jsonify({'error': 'Profile not found'}), 404
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            
            # Update user info
            current_user.first_name = data.get('first_name', current_user.first_name)
            current_user.last_name = data.get('last_name', current_user.last_name)
            current_user.phone = data.get('phone', current_user.phone)
            current_user.address = data.get('address', current_user.address)
            current_user.gender = data.get('gender', current_user.gender)
            
            dob = data.get('date_of_birth')
            if dob:
                current_user.date_of_birth = datetime.strptime(dob, '%Y-%m-%d').date()
            
            # Update patient info
            patient.blood_type = data.get('blood_type', patient.blood_type)
            patient.allergies = data.get('allergies', patient.allergies)
            patient.emergency_contact_name = data.get('emergency_contact_name', patient.emergency_contact_name)
            patient.emergency_contact_phone = data.get('emergency_contact_phone', patient.emergency_contact_phone)
            patient.insurance_provider = data.get('insurance_provider', patient.insurance_provider)
            patient.insurance_number = data.get('insurance_number', patient.insurance_number)
            
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully!'}), 200
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Profile update error: {e}")
            return jsonify({'error': 'Update failed'}), 500
    
    # GET request - Return profile
    return jsonify({
        'user': {
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'email': current_user.email,
            'phone': current_user.phone,
            'address': current_user.address,
            'gender': current_user.gender,
            'date_of_birth': current_user.date_of_birth.isoformat() if current_user.date_of_birth else None
        },
        'patient': {
            'patient_id': patient.patient_id,
            'blood_type': patient.blood_type,
            'allergies': patient.allergies,
            'emergency_contact_name': patient.emergency_contact_name,
            'emergency_contact_phone': patient.emergency_contact_phone,
            'insurance_provider': patient.insurance_provider,
            'insurance_number': patient.insurance_number
        }
    })

@app.route('/api/patient/book-appointment', methods=['GET', 'POST'])
@login_required
def book_appointment():
    """Book appointment API"""
    if current_user.role != 'patient':
        return jsonify({'error': 'Access denied'}), 403
    
    patient = current_user.patient_profile
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            doctor_id = data.get('doctor_id')
            date_str = data.get('appointment_date')
            time_str = data.get('appointment_time')
            
            if not all([doctor_id, date_str, time_str]):
                return jsonify({'error': 'Missing required fields'}), 400
            
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            appointment_time = datetime.strptime(time_str, '%H:%M').time()
            
            doctor = Doctor.query.get(doctor_id)
            if not doctor:
                return jsonify({'error': 'Doctor not found'}), 404
            
            is_valid, message = validate_appointment_time(doctor, appointment_date, appointment_time)
            if not is_valid:
                return jsonify({'error': message}), 400
            
            # Calculate priority
            priority_data = {
                'appointment_type': data.get('appointment_type'),
                'patient_age': calculate_age(current_user.date_of_birth),
                'appointment_date': appointment_date,
                'created_at': date.today()
            }
            priority_score = hdims_ds.appointment_queue.calculate_priority(priority_data)
            
            appointment = Appointment(
                appointment_id=generate_appointment_id(),
                patient_id=patient.id,
                doctor_id=doctor.id,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status='scheduled',
                priority_score=priority_score,
                appointment_type=data.get('appointment_type'),
                symptoms=data.get('symptoms')
            )
            
            db.session.add(appointment)
            db.session.commit()
            
            hdims_ds.appointment_queue.add_appointment(appointment.id, priority_data)
            
            return jsonify({'message': 'Appointment booked successfully!'}), 201
            
        except Exception as e:
            db.session.rollback()
            logging.error(f"Booking error: {e}")
            return jsonify({'error': 'Booking failed'}), 500
    
    # GET - Return list of doctors
    doctors = Doctor.query.join(User).all()
    return jsonify([{
        'id': d.id,
        'name': d.user.full_name,
        'specialization': d.specialization,
        'fee': d.consultation_fee,
        'experience': d.experience_years
    } for d in doctors])

@app.route('/api/patient/appointments')
@login_required
def patient_appointments_list():
    """Patient appointments API"""
    if current_user.role != 'patient':
        return jsonify({'error': 'Access denied'}), 403
        
    patient = current_user.patient_profile
    appointments = Appointment.query.filter_by(patient_id=patient.id).order_by(Appointment.appointment_date.desc()).all()
    
    return jsonify([{
        'id': apt.id,
        'doctor_name': apt.doctor.user.full_name,
        'specialization': apt.doctor.specialization,
        'date': apt.appointment_date.isoformat(),
        'time': apt.appointment_time.strftime('%H:%M'),
        'status': apt.status,
        'type': apt.appointment_type,
        'notes': apt.notes
    } for apt in appointments])

@app.route('/api/patient/medical-records')
@login_required
def patient_medical_records_list():
    """Patient medical records API"""
    if current_user.role != 'patient':
        return jsonify({'error': 'Access denied'}), 403
        
    patient = current_user.patient_profile
    records = MedicalRecord.query.filter_by(patient_id=patient.id).order_by(MedicalRecord.record_date.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'date': r.record_date.isoformat(),
        'doctor_name': r.doctor.user.full_name,
        'diagnosis': r.diagnosis,
        'treatment': r.treatment,
        'prescription': r.prescription,
        'notes': r.notes
    } for r in records])

# ---------------- Doctor Routes ----------------

@app.route('/api/doctor/dashboard')
@login_required
def doctor_dashboard():
    """Doctor dashboard API"""
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    
    today_appointments = Appointment.query.filter(
        and_(Appointment.doctor_id == doctor.id, Appointment.appointment_date == date.today())
    ).order_by(Appointment.appointment_time.asc()).all()
    
    upcoming_appointments = Appointment.query.filter(
        and_(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date > date.today(),
            Appointment.status == 'scheduled'
        )
    ).order_by(Appointment.appointment_date.asc()).limit(5).all()
    
    def serialize_apt(apt):
        return {
            'id': apt.id,
            'patient_name': apt.patient.user.full_name,
            'patient_id': apt.patient.patient_id,
            'time': apt.appointment_time.strftime('%H:%M'),
            'date': apt.appointment_date.isoformat(),
            'type': apt.appointment_type,
            'status': apt.status
        }
    
    return jsonify({
        'doctor_name': current_user.full_name,
        'today_appointments': [serialize_apt(a) for a in today_appointments],
        'upcoming_appointments': [serialize_apt(a) for a in upcoming_appointments]
    })

@app.route('/api/doctor/profile', methods=['GET', 'POST'])
@login_required
def doctor_profile():
    """Doctor profile API"""
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    
    if request.method == 'POST':
        try:
            data = request.get_json()
            # User fields
            current_user.first_name = data.get('first_name', current_user.first_name)
            current_user.last_name = data.get('last_name', current_user.last_name)
            current_user.phone = data.get('phone', current_user.phone)
            current_user.address = data.get('address', current_user.address)
            
            # Doctor fields
            doctor.specialization = data.get('specialization', doctor.specialization)
            doctor.experience_years = int(data.get('experience_years', doctor.experience_years))
            doctor.education = data.get('education', doctor.education)
            doctor.consultation_fee = float(data.get('consultation_fee', doctor.consultation_fee))
            
            # Working hours
            days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            for day in days:
                start = data.get(f'{day}_start')
                end = data.get(f'{day}_end')
                
                if start: setattr(doctor, f'{day}_start', datetime.strptime(start, '%H:%M').time())
                else: setattr(doctor, f'{day}_start', None)
                
                if end: setattr(doctor, f'{day}_end', datetime.strptime(end, '%H:%M').time())
                else: setattr(doctor, f'{day}_end', None)
                
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500

    # GET
    working_days = get_doctor_working_days(doctor)
    # Add time serialization logic for working days if necessary
    
    return jsonify({
        'user': {
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'email': current_user.email,
            'phone': current_user.phone,
            'address': current_user.address
        },
        'doctor': {
            'specialization': doctor.specialization,
            'license_number': doctor.license_number,
            'experience_years': doctor.experience_years,
            'education': doctor.education,
            'consultation_fee': doctor.consultation_fee,
            # Serialize working hours manually to string format
            'monday_start': doctor.monday_start.strftime('%H:%M') if doctor.monday_start else '',
            'monday_end': doctor.monday_end.strftime('%H:%M') if doctor.monday_end else '',
            # ... repeat for other days or loop dynamically in frontend ...
        }
    })

@app.route('/api/doctor/appointments')
@login_required
def doctor_appointments_list():
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
        
    doctor = current_user.doctor_profile
    appointments = Appointment.query.filter_by(doctor_id=doctor.id).order_by(Appointment.appointment_date.desc()).all()
    
    return jsonify([{
        'id': a.id,
        'patient_name': a.patient.user.full_name,
        'date': a.appointment_date.isoformat(),
        'time': a.appointment_time.strftime('%H:%M'),
        'type': a.appointment_type,
        'status': a.status,
        'symptoms': a.symptoms
    } for a in appointments])

@app.route('/api/doctor/schedule')
@login_required
def doctor_schedule_api():
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    today = date.today()
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=6)
    
    week_appointments = Appointment.query.filter(
        and_(
            Appointment.doctor_id == doctor.id,
            Appointment.appointment_date >= start_of_week,
            Appointment.appointment_date <= end_of_week
        )
    ).all()
    
    return jsonify({
        'start_of_week': start_of_week.isoformat(),
        'end_of_week': end_of_week.isoformat(),
        'appointments': [{
            'id': a.id,
            'title': f"{a.patient.user.full_name} ({a.appointment_type})",
            'start': f"{a.appointment_date.isoformat()}T{a.appointment_time.strftime('%H:%M')}",
            'status': a.status
        } for a in week_appointments]
    })

@app.route('/api/doctor/patients')
@login_required
def doctor_patients_list():
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    patients = db.session.query(Patient).join(Appointment).filter(Appointment.doctor_id == doctor.id).distinct().all()
    
    result = []
    for p in patients:
        last_appt = Appointment.query.filter_by(patient_id=p.id, doctor_id=doctor.id).order_by(Appointment.appointment_date.desc()).first()
        result.append({
            'id': p.id,
            'name': p.user.full_name,
            'patient_id': p.patient_id,
            'phone': p.user.phone,
            'last_visit': last_appt.appointment_date.isoformat() if last_appt else None
        })
    
    return jsonify(result)

@app.route('/api/doctor/patient/<int:patient_id>/medical-records')
@login_required
def doctor_patient_records(patient_id):
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    # Check permission
    has_treated = Appointment.query.filter_by(patient_id=patient_id, doctor_id=doctor.id).first()
    if not has_treated:
        return jsonify({'error': 'Permission denied. You have not treated this patient.'}), 403
    
    records = MedicalRecord.query.filter_by(patient_id=patient_id).order_by(MedicalRecord.record_date.desc()).all()
    return jsonify([{
        'id': r.id,
        'date': r.record_date.isoformat(),
        'diagnosis': r.diagnosis,
        'treatment': r.treatment,
        'prescription': r.prescription,
        'doctor_name': r.doctor.user.full_name
    } for r in records])

@app.route('/api/doctor/appointment/<int:appointment_id>/complete', methods=['POST'])
@login_required
def api_complete_appointment(appointment_id):
    if current_user.role != 'doctor':
        return jsonify({'error': 'Access denied'}), 403
    
    doctor = current_user.doctor_profile
    appointment = Appointment.query.get_or_404(appointment_id)
    
    if appointment.doctor_id != doctor.id:
        return jsonify({'error': 'Access denied'}), 403
    
    try:
        data = request.get_json()
        appointment.status = 'completed'
        appointment.notes = data.get('notes')
        
        if data.get('diagnosis'):
            record = MedicalRecord(
                record_id=generate_record_id(),
                patient_id=appointment.patient_id,
                doctor_id=doctor.id,
                appointment_id=appointment.id,
                record_date=date.today(),
                diagnosis=data.get('diagnosis'),
                symptoms=data.get('symptoms'),
                treatment=data.get('treatment'),
                prescription=data.get('prescription'),
                lab_results=data.get('lab_results'),
                notes=data.get('medical_notes'),
                follow_up_required=data.get('follow_up_required', False)
            )
            if data.get('follow_up_date'):
                record.follow_up_date = datetime.strptime(data.get('follow_up_date'), '%Y-%m-%d').date()
            db.session.add(record)
            
        db.session.commit()
        return jsonify({'message': 'Appointment completed'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ---------------- Admin Routes ----------------

@app.route('/api/admin/dashboard')
@login_required
def api_admin_dashboard():
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # 1. Counts
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()
    
    # 2. Monthly appointment data
    monthly_query = db.session.query(
        func.date_trunc('month', Appointment.appointment_date).label('month'),
        func.count(Appointment.id).label('count')
    ).group_by('month').order_by('month').all()
    
    monthly_data = [{
        'month': row.month.strftime('%Y-%m') if row.month else '',
        'count': row.count
    } for row in monthly_query]

    # 3. Monthly Revenue (NEW)
    revenue_query = db.session.query(
        func.date_trunc('month', Appointment.appointment_date).label('month'),
        func.sum(Doctor.consultation_fee).label('revenue')
    ).join(Doctor, Appointment.doctor_id == Doctor.id)\
     .filter(Appointment.status == 'completed')\
     .group_by('month').order_by('month').all()

    revenue_data = [{
        'month': row.month.strftime('%Y-%m') if row.month else '',
        'revenue': float(row.revenue or 0)
    } for row in revenue_query]

    # 4. Status distribution
    status_data = db.session.query(
        Appointment.status,
        func.count(Appointment.id).label('count')
    ).group_by(Appointment.status).all()
    
    status_distribution = [{'status': row.status, 'count': row.count} for row in status_data]

    # 5. Specialization distribution
    specialization_data = db.session.query(
        Doctor.specialization,
        func.count(Doctor.id).label('count')
    ).group_by(Doctor.specialization).all()
    
    specialization_distribution = [{'specialization': row.specialization, 'count': row.count} for row in specialization_data]
    
    return jsonify({
        'stats': {
            'patients': total_patients,
            'doctors': total_doctors,
            'appointments': total_appointments
        },
        'charts': {
            'monthly': monthly_data,
            'revenue': revenue_data,
            'status': status_distribution,
            'specialization': specialization_distribution
        }
    })

@app.route('/api/admin/users')
@login_required
def api_admin_users():
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    page = request.args.get('page', 1, type=int)
    users = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=20, error_out=False)
    
    return jsonify({
        'users': [{
            'id': u.id,
            'name': u.full_name,
            'email': u.email,
            'role': u.role,
            'is_active': u.is_active
        } for u in users.items],
        'total_pages': users.pages,
        'current_page': users.page
    })

@app.route('/api/admin/user/<int:user_id>/toggle-status', methods=['POST'])
@login_required
def api_toggle_user(user_id):
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
        
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot deactivate self'}), 400
        
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({'message': f"User {'activated' if user.is_active else 'deactivated'}"})

@app.route('/api/admin/analytics')
@login_required
def api_admin_analytics():
    if current_user.role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    # --- 1. Get Date Filters ---
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')
    
    date_filter = True 
    if start_date_str and end_date_str:
        try:
            start = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            date_filter = and_(Appointment.appointment_date >= start, Appointment.appointment_date <= end)
        except ValueError:
            pass

    # --- 2. Existing Queries ---
    status_counts = db.session.query(Appointment.status, func.count(Appointment.id)).filter(date_filter).group_by(Appointment.status).all()
    
    revenue_data = db.session.query(Doctor.specialization, func.sum(Doctor.consultation_fee)).join(Appointment, Doctor.id == Appointment.doctor_id).filter(Appointment.status == 'completed').filter(date_filter).group_by(Doctor.specialization).all()
     
    monthly_data = db.session.query(func.strftime('%Y-%m', Appointment.appointment_date).label('month'), func.count(Appointment.id)).filter(date_filter).group_by('month').order_by('month').all()

    gender_data = db.session.query(User.gender, func.count(User.id)).join(Patient, User.id == Patient.user_id).group_by(User.gender).all()

    # --- 3. NEW QUERIES ---
    
    # E. Appointment Types (Emergency vs Routine)
    type_counts = db.session.query(
        Appointment.appointment_type, 
        func.count(Appointment.id)
    ).filter(date_filter).group_by(Appointment.appointment_type).all()

    # F. Top Diagnoses (from Medical Records linked to Appointments in this range)
    # We join MedicalRecord -> Appointment to respect the date filter
    diagnosis_data = db.session.query(
        MedicalRecord.diagnosis, 
        func.count(MedicalRecord.id)
    ).join(Appointment, MedicalRecord.appointment_id == Appointment.id)\
     .filter(date_filter)\
     .group_by(MedicalRecord.diagnosis)\
     .order_by(func.count(MedicalRecord.id).desc())\
     .limit(5).all()

    return jsonify({
        'appointment_status': dict(status_counts),
        'revenue_by_specialization': {r[0]: r[1] for r in revenue_data},
        'monthly_growth': {m[0]: m[1] for m in monthly_data},
        'patient_demographics': {g[0]: g[1] for g in gender_data},
        # New Data
        'appointment_types': dict(type_counts),
        'top_diagnoses': {d[0]: d[1] for d in diagnosis_data}
    })

# ---------------- Shared API Routes ----------------

@app.route('/api/doctors/<specialization>')
@login_required
def api_get_doctors_by_spec(specialization):
    doctors = Doctor.query.filter_by(specialization=specialization).all()
    return jsonify([{
        'id': d.id,
        'name': d.user.full_name,
        'fee': d.consultation_fee,
        'rating': d.rating
    } for d in doctors])

@app.route('/api/doctor/<int:doctor_id>/available-slots')
@login_required
def api_get_slots(doctor_id):
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({'error': 'Date required'}), 400
        
    try:
        appt_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        doctor = Doctor.query.get_or_404(doctor_id)
        slots = get_available_time_slots(doctor, appt_date)
        return jsonify({'slots': slots})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Search APIs - kept mostly same as they were already JSON
@app.route('/api/search/patients')
@login_required
def search_patients():
    if current_user.role not in ['doctor', 'admin']: return jsonify({'error': 'Denied'}), 403
    query = request.args.get('q', '')
    if len(query) < 2: return jsonify([])
    results = hdims_ds.search_patients(query, limit=10)
    return jsonify([{'name': name, 'data': data[0]['data'] if data else {}} for name, data in results])

@app.route('/api/search/doctors')
@login_required
def search_doctors():
    query = request.args.get('q', '')
    if len(query) < 2: return jsonify([])
    results = hdims_ds.search_doctors(query, limit=10)
    return jsonify([{'name': name, 'data': data[0]['data'] if data else {}} for name, data in results])

@app.route('/api/search/diseases')
@login_required
def search_diseases():
    if current_user.role != 'doctor': return jsonify({'error': 'Denied'}), 403
    query = request.args.get('q', '')
    if len(query) < 2: return jsonify([])
    results = hdims_ds.search_diseases(query, limit=10)
    return jsonify([{'name': name, 'data': data[0]['data'] if data else {}} for name, data in results])

@app.route('/init-db-railway-deployment')
def init_db_endpoint():
    try:
        db.create_all()
        if not User.query.filter_by(email='admin@hdims.com').first():
            admin = User(email='admin@hdims.com', role='admin', first_name='System', last_name='Admin', is_active=True)
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
        return jsonify({'message': 'DB Initialized'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- AI Assistant Route ---

@app.route('/api/chat', methods=['POST'])
def chat_with_ai():
    """
    Endpoint for the AI Assistant.
    Receives a message and returns a response from Gemini.
    """
    data = request.get_json()
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    try:
        # 1. Get API Key
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return jsonify({'error': 'Server configuration error: AI Key missing'}), 500
        
        # 2. Initialize Client (The NEW way)
        # Instead of genai.configure, we create a Client
        client = genai.Client(api_key=api_key)
        
        # 3. System Prompt (Your context-aware prompt)
        system_context = """
        You are the intelligent AI Assistant for HDIMS (Health Data Information Management System).
        Your goal is to guide users through the app using exact, step-by-step navigation instructions based on the actual user interface.

        ### 1. PATIENT NAVIGATION GUIDE
        * **Booking an Appointment:**
            - **Fastest Way:** Go to your **Dashboard**, scroll down to the **"Quick Actions"** card, and click the blue **"Book Appointment"** button.
            - **Alternative:** Click **"Book Appointment"** in the top navigation bar.
            - **From Appointments Page:** Click the **"Book New"** button (+ icon) in the top right corner.

        * **Viewing Medical Records:**
            - Click **"Medical Records"** in the top navigation bar.
            - You will see a list of cards showing your diagnosis, treatment, and prescriptions.
            - *Note:* If a record has a yellow border, it means a **Follow-up is Required**.

        * **Checking Appointments:**
            - Go to the **"My Appointments"** page.
            - **Status Colors:** Blue = Scheduled, Green = Completed, Red = Cancelled.

        * **Updating Profile:**
            - Click your name in the top-right corner of the navbar -> select **"Profile"**.
            - Or click the yellow **"Update Profile"** button in the "Quick Actions" section of the Dashboard.
            - You can update your phone, allergies, and emergency contact details here.

        ### 2. DOCTOR NAVIGATION GUIDE
        * **Managing Your Schedule:**
            - Go to your **Dashboard** to see a list of today's appointments immediately.
            - To see all upcoming visits, click **"Appointments"** in the top navigation bar.

        * **Completing an Appointment:**
            - Navigate to the **"Appointments"** page.
            - Find the patient in the list.
            - Click the **"Complete"** button on the right side.
            - A popup will ask you to enter the **Diagnosis** to finalize the record.

        * **Viewing Patient History:**
            - Click **"My Patients"** in the navigation bar.
            - You will see cards for all your patients. Click the **"View Records"** button on a specific patient's card to see their full history.

        ### 3. SECURITY & PRIVACY (AES-256)
        - If a user asks about data safety, explain: "All sensitive medical data (like your allergies, diagnosis, and prescriptions) is encrypted using **AES-256** before it is stored. Even the database administrators cannot read your private health information."
        
        ### 4. GENERAL RULES
        - **Be Specific:** Use the exact button names (e.g., "Quick Actions", "Book New").
        - **No Personal Data:** Remind users you cannot "see" their live data.
        """
        
        # 4. Generate Content (The NEW way)
        # We combine system context + user question manually for the best result
        full_prompt = f"System Instruction:\n{system_context}\n\nUser Question:\n{user_message}"
        
        response = client.models.generate_content(
            model="gemini-2.5-flash",  # Correct model name (not 2.5)
            contents=full_prompt
        )
        
        # 5. Return text
        return jsonify({'response': response.text})
        
    except Exception as e:
        logging.error(f"AI Error: {str(e)}")
        return jsonify({'response': "I'm having trouble connecting right now. Please try again later."}), 500

# Error handlers
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500