#!/usr/bin/env python3
"""
Encryption-safe scalable data generator for HDIMS
Compatible with AES-encrypted models.
"""

from datetime import date, time, timedelta
import random
import string

from app import app, db
from models import User, Patient, Doctor, Appointment, MedicalRecord
from utils import (
    generate_patient_id,
    generate_doctor_id,
    generate_appointment_id,
    generate_record_id,
    initialize_system_data
)

# ================= CONFIG =================
NUM_PATIENTS = 50
NUM_DOCTORS = 10
AVG_APPOINTMENTS_PER_PATIENT = 3
HISTORY_DAYS = 365
# ==========================================

def random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase, k=length))


def seed_encrypted_demo_data():
    with app.app_context():
        print("🚀 Seeding encrypted demo data...")

        # 1️⃣ Initialize reference/system data safely
        initialize_system_data()

        # 2️⃣ Doctors
        print(f"👨‍⚕️ Creating {NUM_DOCTORS} doctors...")
        specialties = [
            "Cardiology", "Neurology", "Pediatrics", "Orthopedics",
            "Dermatology", "Psychiatry", "General Medicine"
        ]

        for _ in range(NUM_DOCTORS):
            email = f"doctor.{random_string()}@hdims.com"
            if User.query.filter_by(email=email).first():
                continue

            user = User(
                email=email,
                role="doctor",
                first_name="Dr " + random_string(4).capitalize(),
                last_name=random_string(5).capitalize(),
                phone=f"555-{random.randint(1000,9999)}",
                is_active=True
            )
            user.set_password("doctor123")
            db.session.add(user)
            db.session.flush()  # ensures user.id exists

            doctor = Doctor(
                user_id=user.id,
                doctor_id=generate_doctor_id(),
                specialization=random.choice(specialties),
                license_number=f"MD{random.randint(100000,999999)}",
                experience_years=random.randint(2, 30),
                consultation_fee=random.choice([200, 300, 400, 500]),
                monday_start=time(9), monday_end=time(17),
                tuesday_start=time(9), tuesday_end=time(17),
                wednesday_start=time(9), wednesday_end=time(17),
                thursday_start=time(9), thursday_end=time(17),
                friday_start=time(9), friday_end=time(17)
            )
            db.session.add(doctor)

        db.session.commit()
        doctors = Doctor.query.all()

        # 3️⃣ Patients
        print(f"🧑‍🤝‍🧑 Creating {NUM_PATIENTS} patients...")
        for _ in range(NUM_PATIENTS):
            email = f"patient.{random_string()}@demo.com"
            if User.query.filter_by(email=email).first():
                continue

            user = User(
                email=email,
                role="patient",
                first_name=random_string(5).capitalize(),
                last_name=random_string(6).capitalize(),
                phone=f"555-{random.randint(1000,9999)}",
                date_of_birth=date(
                    random.randint(1950, 2015),
                    random.randint(1, 12),
                    random.randint(1, 28)
                ),
                gender=random.choice(["Male", "Female"]),
                address=f"{random.randint(1,999)} {random_string(6)} Street",
                is_active=True
            )
            user.set_password("patient123")
            db.session.add(user)
            db.session.flush()

            patient = Patient(
                user_id=user.id,
                patient_id=generate_patient_id(),
                blood_type=random.choice(["A+", "B+", "O+", "AB+", "O-"]),
                insurance_provider=random.choice(
                    ["Aetna", "BlueCross", "Medicare", "None"]
                )
            )
            db.session.add(patient)

        db.session.commit()
        patients = Patient.query.all()

        # 4️⃣ Appointments + Medical Records
        print("📅 Generating appointment history...")
        total_appts = 0

        for patient in patients:
            for _ in range(AVG_APPOINTMENTS_PER_PATIENT):
                doctor = random.choice(doctors)
                days_ago = random.randint(0, HISTORY_DAYS)
                appt_date = date.today() - timedelta(days=days_ago)

                status = "completed" if days_ago > 7 else random.choice(
                    ["scheduled", "cancelled"]
                )

                appointment = Appointment(
                    appointment_id=generate_appointment_id(),
                    patient_id=patient.id,
                    doctor_id=doctor.id,
                    appointment_date=appt_date,
                    appointment_time=time(random.randint(9, 16), 0),
                    status=status,
                    appointment_type=random.choice(
                        ["consultation", "follow-up", "emergency", "routine"]
                    ),
                    symptoms="Auto-generated demo symptoms",
                    priority_score=random.randint(1, 100)
                )

                db.session.add(appointment)
                db.session.flush()  # 🔐 ensures appointment.id exists
                total_appts += 1

                if status == "completed":
                    record = MedicalRecord(
                        record_id=generate_record_id(),
                        patient_id=patient.id,
                        doctor_id=doctor.id,
                        appointment_id=appointment.id,
                        record_date=appt_date,
                        diagnosis=random.choice(
                            ["Flu", "Hypertension", "Diabetes", "Healthy"]
                        ),
                        treatment="Standard protocol applied",
                        follow_up_required=random.choice([True, False])
                    )
                    db.session.add(record)

        db.session.commit()
        print(f"✅ Done! {len(patients)} patients, {len(doctors)} doctors, {total_appts} appointments created.")


if __name__ == "__main__":
    seed_encrypted_demo_data()
