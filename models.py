import os
import binascii
from datetime import datetime, date, time
from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Text, Date, Time, Integer, String, Boolean, DateTime, Float, ForeignKey, TypeDecorator
from sqlalchemy.orm import relationship
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

# --- Encryption Helper Class ---
class EncryptedString(TypeDecorator):
    """
    SQLAlchemy TypeDecorator that encrypts data before saving to DB
    and decrypts when loading from DB using AES-256-GCM.
    """
    impl = Text
    cache_ok = True

    def __init__(self, *args, **kwargs):
        super(EncryptedString, self).__init__(*args, **kwargs)
        # Fetch key from environment variable
        key_hex = os.environ.get('ENCRYPTION_KEY')
        if not key_hex:
            raise ValueError("CRITICAL SECURITY ERROR: 'ENCRYPTION_KEY' is missing from .env file. Please add a 32-byte hex key.")
        self.key = binascii.unhexlify(key_hex)
        self.aesgcm = AESGCM(self.key)

    def process_bind_param(self, value, dialect):
        """Encrypt data before saving to DB"""
        if value is None:
            return None
        if isinstance(value, str):
            value = value.encode('utf-8')
        
        # Generate a unique nonce for each encryption
        nonce = os.urandom(12)
        ciphertext = self.aesgcm.encrypt(nonce, value, None)
        
        # Store as: nonce + ciphertext (hex encoded for DB text storage)
        return binascii.hexlify(nonce + ciphertext).decode('utf-8')

    def process_result_value(self, value, dialect):
        """Decrypt data after loading from DB"""
        if value is None:
            return None
        try:
            # Decode from hex
            data = binascii.unhexlify(value)
            # Extract nonce (first 12 bytes) and ciphertext
            nonce = data[:12]
            ciphertext = data[12:]
            # Decrypt
            decrypted_data = self.aesgcm.decrypt(nonce, ciphertext, None)
            return decrypted_data.decode('utf-8')
        except Exception as e:
            # Handle cases where decryption fails (e.g., bad key or corrupted data)
            return f"[Decryption Failed]"

# --- Existing Models with Updates ---

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    # ... (No changes to User class)
    id = db.Column(Integer, primary_key=True)
    email = db.Column(String(120), unique=True, nullable=False)
    password_hash = db.Column(String(256), nullable=False)
    role = db.Column(String(20), nullable=False)
    first_name = db.Column(String(50), nullable=False)
    last_name = db.Column(String(50), nullable=False)
    phone = db.Column(String(20))
    date_of_birth = db.Column(Date)
    gender = db.Column(String(10))
    address = db.Column(Text)
    is_active = db.Column(Boolean, default=True)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Patient(db.Model):
    __tablename__ = 'patients'
    # ... (Keep existing fields)
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    patient_id = db.Column(String(20), unique=True, nullable=False)
    blood_type = db.Column(String(5))
    
    # Update potentially sensitive fields to use EncryptedString
    allergies = db.Column(EncryptedString)  # Encrypted
    emergency_contact_name = db.Column(String(100))
    emergency_contact_phone = db.Column(String(20))
    insurance_provider = db.Column(String(100))
    insurance_number = db.Column(EncryptedString) # Encrypted
    
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    medical_records = relationship("MedicalRecord", back_populates="patient")

class Doctor(db.Model):
    __tablename__ = 'doctors'
    # ... (No changes needed for Doctor unless you want to encrypt license_number)
    id = db.Column(Integer, primary_key=True)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)
    doctor_id = db.Column(String(20), unique=True, nullable=False)
    specialization = db.Column(String(100), nullable=False)
    license_number = db.Column(String(50), unique=True, nullable=False)
    experience_years = db.Column(Integer)
    education = db.Column(Text)
    consultation_fee = db.Column(Float)
    rating = db.Column(Float, default=0.0)
    total_reviews = db.Column(Integer, default=0)
    
    # Working hours
    monday_start = db.Column(Time)
    monday_end = db.Column(Time)
    tuesday_start = db.Column(Time)
    tuesday_end = db.Column(Time)
    wednesday_start = db.Column(Time)
    wednesday_end = db.Column(Time)
    thursday_start = db.Column(Time)
    thursday_end = db.Column(Time)
    friday_start = db.Column(Time)
    friday_end = db.Column(Time)
    saturday_start = db.Column(Time)
    saturday_end = db.Column(Time)
    sunday_start = db.Column(Time)
    sunday_end = db.Column(Time)
    
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    medical_records = relationship("MedicalRecord", back_populates="doctor")

class Appointment(db.Model):
    __tablename__ = 'appointments'
    
    id = db.Column(Integer, primary_key=True)
    appointment_id = db.Column(String(20), unique=True, nullable=False)
    patient_id = db.Column(Integer, ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(Integer, ForeignKey('doctors.id'), nullable=False)
    appointment_date = db.Column(Date, nullable=False)
    appointment_time = db.Column(Time, nullable=False)
    status = db.Column(String(20), default='scheduled')
    priority_score = db.Column(Integer, default=0)
    appointment_type = db.Column(String(50))
    symptoms = db.Column(EncryptedString) # Encrypted
    notes = db.Column(Text) # General notes might not need encryption, or change to EncryptedString if needed
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")

class MedicalRecord(db.Model):
    __tablename__ = 'medical_records'
    
    id = db.Column(Integer, primary_key=True)
    record_id = db.Column(String(20), unique=True, nullable=False)
    patient_id = db.Column(Integer, ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(Integer, ForeignKey('doctors.id'), nullable=False)
    appointment_id = db.Column(Integer, ForeignKey('appointments.id'))
    record_date = db.Column(Date, nullable=False)
    
    # IMPORTANT: These fields are now encrypted
    diagnosis = db.Column(EncryptedString) 
    symptoms = db.Column(EncryptedString)
    treatment = db.Column(EncryptedString)
    prescription = db.Column(EncryptedString)
    lab_results = db.Column(EncryptedString)
    notes = db.Column(EncryptedString)
    
    follow_up_required = db.Column(Boolean, default=False)
    follow_up_date = db.Column(Date)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    
    patient = relationship("Patient", back_populates="medical_records")
    doctor = relationship("Doctor", back_populates="medical_records")
    appointment = relationship("Appointment")

# ... (Keep Specialization, Disease, DoctorReferral, SystemMetrics classes as they are)
class Specialization(db.Model):
    __tablename__ = 'specializations'
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(100), unique=True, nullable=False)
    description = db.Column(Text)

class Disease(db.Model):
    __tablename__ = 'diseases'
    id = db.Column(Integer, primary_key=True)
    name = db.Column(String(200), unique=True, nullable=False)
    description = db.Column(Text)
    symptoms = db.Column(Text)
    category = db.Column(String(100))

class DoctorReferral(db.Model):
    __tablename__ = 'doctor_referrals'
    id = db.Column(Integer, primary_key=True)
    referring_doctor_id = db.Column(Integer, ForeignKey('doctors.id'), nullable=False)
    referred_doctor_id = db.Column(Integer, ForeignKey('doctors.id'), nullable=False)
    patient_id = db.Column(Integer, ForeignKey('patients.id'), nullable=False)
    referral_reason = db.Column(Text)
    referral_date = db.Column(Date, default=date.today)
    status = db.Column(String(20), default='pending')
    
    referring_doctor = relationship("Doctor", foreign_keys=[referring_doctor_id])
    referred_doctor = relationship("Doctor", foreign_keys=[referred_doctor_id])
    patient = relationship("Patient")

class SystemMetrics(db.Model):
    __tablename__ = 'system_metrics'
    id = db.Column(Integer, primary_key=True)
    metric_date = db.Column(Date, nullable=False)
    total_appointments = db.Column(Integer, default=0)
    total_patients = db.Column(Integer, default=0)
    total_doctors = db.Column(Integer, default=0)
    revenue = db.Column(Float, default=0.0)
    average_wait_time = db.Column(Float, default=0.0)
    patient_satisfaction = db.Column(Float, default=0.0)
    created_at = db.Column(DateTime, default=datetime.utcnow)