#!/usr/bin/env python3
"""
Scalable Data Generator for HDIMS
Run this to populate the database with extensive data for analytics.
"""

from datetime import date, time, datetime, timedelta
import random
import string
from app import app, db
from models import User, Patient, Doctor, Appointment, MedicalRecord
from utils import (generate_patient_id, generate_doctor_id, generate_appointment_id, 
                   generate_record_id, initialize_system_data)

# Configurations
NUM_PATIENTS = 50   # Creates 50 patients
NUM_DOCTORS = 10    # Creates 10 doctors
MONTHS_HISTORY = 12 # Generates data for the last year

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def create_bulk_data():
    with app.app_context():
        print("🚀 Starting bulk data generation...")
        
        # 1. Initialize Basics
        initialize_system_data()
        
        # 2. Create Doctors (if they don't exist)
        specs = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General Surgery', 'Psychiatry']
        doctors = []
        
        print(f"Generating {NUM_DOCTORS} doctors...")
        for i in range(NUM_DOCTORS):
            email = f"doctor.{random_string()}@hdims.com"
            if not User.query.filter_by(email=email).first():
                user = User(
                    email=email,
                    role='doctor',
                    first_name=f"Dr. {random_string(5).capitalize()}",
                    last_name=random_string(6).capitalize(),
                    phone=f"555-{random.randint(1000,9999)}",
                    is_active=True
                )
                user.set_password('doctor123')
                db.session.add(user)
                db.session.flush()
                
                doctor = Doctor(
                    user_id=user.id,
                    doctor_id=generate_doctor_id(),
                    specialization=random.choice(specs),
                    license_number=f"MD{random.randint(100000, 999999)}",
                    experience_years=random.randint(2, 30),
                    consultation_fee=random.choice([100, 150, 200, 250, 300, 500]),
                    monday_start=time(9, 0), monday_end=time(17, 0),
                    tuesday_start=time(9, 0), tuesday_end=time(17, 0),
                    wednesday_start=time(9, 0), wednesday_end=time(17, 0),
                    thursday_start=time(9, 0), thursday_end=time(17, 0),
                    friday_start=time(9, 0), friday_end=time(17, 0)
                )
                db.session.add(doctor)
                doctors.append(doctor)
        db.session.commit()
        
        # Reload doctors to include pre-existing ones
        all_doctors = Doctor.query.all()

        # 3. Create Patients
        print(f"Generating {NUM_PATIENTS} patients...")
        all_patients = []
        for i in range(NUM_PATIENTS):
            email = f"patient.{random_string()}@test.com"
            if not User.query.filter_by(email=email).first():
                user = User(
                    email=email,
                    role='patient',
                    first_name=random_string(5).capitalize(),
                    last_name=random_string(6).capitalize(),
                    phone=f"555-{random.randint(1000,9999)}",
                    date_of_birth=date(random.randint(1950, 2015), random.randint(1, 12), random.randint(1, 28)),
                    gender=random.choice(['Male', 'Female']),
                    address=f"{random.randint(1,999)} {random_string(6)} St",
                    is_active=True
                )
                user.set_password('patient123')
                db.session.add(user)
                db.session.flush()
                
                patient = Patient(
                    user_id=user.id,
                    patient_id=generate_patient_id(),
                    blood_type=random.choice(['A+', 'O+', 'B+', 'AB-', 'O-']),
                    insurance_provider=random.choice(['BlueCross', 'Aetna', 'Medicare', 'None'])
                )
                db.session.add(patient)
                all_patients.append(patient)
        db.session.commit()
        
        # Reload patients
        all_patients = Patient.query.all()

        # 4. Generate History of Appointments
        print(f"Generating appointments for past {MONTHS_HISTORY} months...")
        appointments_created = 0
        
        for i in range(len(all_patients) * 3): # Avg 3 appointments per patient
            patient = random.choice(all_patients)
            doctor = random.choice(all_doctors)
            
            # Random date within last year
            days_ago = random.randint(0, 365)
            appt_date = date.today() - timedelta(days=days_ago)
            
            status = 'completed' if days_ago > 7 else random.choice(['scheduled', 'cancelled'])
            
            appointment = Appointment(
                appointment_id=generate_appointment_id(),
                patient_id=patient.id,
                doctor_id=doctor.id,
                appointment_date=appt_date,
                appointment_time=time(random.randint(9, 16), 0),
                status=status,
                appointment_type=random.choice(['consultation', 'follow-up', 'emergency', 'routine']),
                symptoms="Generated symptom description",
                priority_score=random.randint(1, 100)
            )
            db.session.add(appointment)
            appointments_created += 1
            
            # Create Medical Record if completed
            if status == 'completed':
                record = MedicalRecord(
                    record_id=generate_record_id(),
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_id=appointment.id,
                    record_date=appt_date,
                    diagnosis=random.choice(['Flu', 'Hypertension', 'Diabetes', 'Healthy', 'Infection']),
                    treatment="Standard protocol",
                    follow_up_required=random.choice([True, False])
                )
                db.session.add(record)
                
        db.session.commit()
        print(f"✅ Success! Created {len(doctors)} doctors, {len(all_patients)} patients, and {appointments_created} appointments.")

if __name__ == '__main__':
    create_bulk_data()