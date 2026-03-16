from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Profile information
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    phone = db.Column(db.String(20))
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    
    # Location (for therapist recommendations)
    city = db.Column(db.String(50), default='Dwarka')
    state = db.Column(db.String(50), default='Delhi')
    pincode = db.Column(db.String(10))
    
    # Mental health profile
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    medical_conditions = db.Column(db.Text)  # JSON string
    current_medications = db.Column(db.Text)  # JSON string
    therapy_history = db.Column(db.Text)
    
    # App settings
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    privacy_settings = db.Column(db.Text)  # JSON string
    notification_preferences = db.Column(db.Text)  # JSON string
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self, include_sensitive=False):
        """Convert user to dictionary for JSON response"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'is_active': self.is_active,
            'email_verified': self.email_verified,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }
        return data
    
    def __repr__(self):
        return f'<User {self.username}>'

class Therapist(db.Model):
    __tablename__ = 'therapists'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.Float, default=4.0)
    experience_years = db.Column(db.Integer, default=0)
    specializations = db.Column(db.Text)  # JSON string of specializations array
    bio = db.Column(db.Text)
    education = db.Column(db.Text)
    languages = db.Column(db.Text)  # JSON string of languages array
    
    # Location data
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String(200))
    sector = db.Column(db.String(50))  # Dwarka sector
    
    # Availability
    available_now = db.Column(db.Boolean, default=False)
    consultation_fee = db.Column(db.Integer, default=500)
    session_duration = db.Column(db.Integer, default=60)  # minutes
    
    # Profile
    profile_image = db.Column(db.String(200))
    license_number = db.Column(db.String(50))
    verified = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_specializations(self):
        """Get specializations as a list"""
        if self.specializations:
            return json.loads(self.specializations)
        return []
    
    def set_specializations(self, specializations_list):
        """Set specializations from a list"""
        self.specializations = json.dumps(specializations_list)
    
    def get_languages(self):
        """Get languages as a list"""
        if self.languages:
            return json.loads(self.languages)
        return []
    
    def set_languages(self, languages_list):
        """Set languages from a list"""
        self.languages = json.dumps(languages_list)
    
    def to_dict(self):
        """Convert therapist to dictionary for JSON response"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'rating': self.rating,
            'experience_years': self.experience_years,
            'specializations': self.get_specializations(),
            'bio': self.bio,
            'education': self.education,
            'languages': self.get_languages(),
            'location': {
                'type': 'Point',
                'coordinates': [self.longitude, self.latitude]
            },
            'address': self.address,
            'sector': self.sector,
            'available_now': self.available_now,
            'consultation_fee': self.consultation_fee,
            'session_duration': self.session_duration,
            'profile_image': self.profile_image,
            'license_number': self.license_number,
            'verified': self.verified,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<Therapist {self.name}>'

class ChatLog(db.Model):
    __tablename__ = 'chat_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # nullable for anonymous users
    session_id = db.Column(db.String(100), nullable=False)  # to group conversation
    
    # Message details
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='general')  # general, crisis, therapy_suggestion
    
    # AI analysis
    sentiment_score = db.Column(db.Float)  # -1 to 1 (negative to positive)
    urgency_level = db.Column(db.String(20), default='low')  # low, medium, high, crisis
    detected_issues = db.Column(db.Text)  # JSON string of detected mental health issues
    
    # Metadata
    response_time_ms = db.Column(db.Integer)  # AI response time in milliseconds
    model_used = db.Column(db.String(50), default='gemini-pro')
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('chat_logs', lazy=True))
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'session_id': self.session_id,
            'user_message': self.user_message,
            'ai_response': self.ai_response,
            'message_type': self.message_type,
            'sentiment_score': self.sentiment_score,
            'urgency_level': self.urgency_level,
            'response_time_ms': self.response_time_ms,
            'model_used': self.model_used,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<ChatLog {self.id} - Session {self.session_id}>'

