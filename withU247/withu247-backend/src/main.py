import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from src.models import db, User, Therapist, ChatLog
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.therapist import therapist_bp
from src.routes.chat import chat_bp
from flask_jwt_extended import JWTManager
from flask_cors import CORS

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'your_super_secret_key_here' # TODO: Change this to a strong, random key
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key_here' # TODO: Change this to a strong, random key

CORS(app) # Enable CORS for all routes

jwt = JWTManager(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(therapist_bp, url_prefix='/api')
app.register_blueprint(chat_bp, url_prefix='/api')

# Create database directory if it doesn't exist
db_dir = os.path.join(os.path.dirname(__file__), 'database')
os.makedirs(db_dir, exist_ok=True)

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(db_dir, 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db.init_app(app)

with app.app_context():
    db.create_all()
    
    # Add sample therapists if none exist
    if Therapist.query.count() == 0:
        sample_therapists = [
            {
                'name': 'Dr. Priya Sharma',
                'email': 'priya.sharma@withu247.com',
                'phone': '+91-9876543210',
                'rating': 4.8,
                'experience_years': 8,
                'specializations': ['Anxiety', 'Depression', 'Stress Management'],
                'bio': 'Experienced clinical psychologist specializing in cognitive behavioral therapy.',
                'education': 'PhD in Clinical Psychology, AIIMS Delhi',
                'languages': ['Hindi', 'English'],
                'latitude': 28.5921,
                'longitude': 77.0460,
                'address': 'Sector 12, Dwarka, New Delhi',
                'sector': 'Sector 12',
                'available_now': True,
                'consultation_fee': 800,
                'verified': True
            },
            {
                'name': 'Dr. Rajesh Kumar',
                'email': 'rajesh.kumar@withu247.com',
                'phone': '+91-9876543211',
                'rating': 4.6,
                'experience_years': 12,
                'specializations': ['Family Therapy', 'Relationship Counseling', 'Trauma'],
                'bio': 'Family therapist with extensive experience in relationship counseling.',
                'education': 'MD Psychiatry, PGIMER Chandigarh',
                'languages': ['Hindi', 'English', 'Punjabi'],
                'latitude': 28.5985,
                'longitude': 77.0516,
                'address': 'Sector 18, Dwarka, New Delhi',
                'sector': 'Sector 18',
                'available_now': False,
                'consultation_fee': 1000,
                'verified': True
            },
            {
                'name': 'Dr. Anita Verma',
                'email': 'anita.verma@withu247.com',
                'phone': '+91-9876543212',
                'rating': 4.9,
                'experience_years': 6,
                'specializations': ['Child Psychology', 'ADHD', 'Learning Disabilities'],
                'bio': 'Child psychologist specializing in developmental disorders.',
                'education': 'M.Phil Clinical Psychology, JMI Delhi',
                'languages': ['Hindi', 'English'],
                'latitude': 28.5889,
                'longitude': 77.0583,
                'address': 'Sector 21, Dwarka, New Delhi',
                'sector': 'Sector 21',
                'available_now': True,
                'consultation_fee': 700,
                'verified': True
            }
        ]
        
        for therapist_data in sample_therapists:
            therapist = Therapist(**therapist_data)
            therapist.set_specializations(therapist_data['specializations'])
            therapist.set_languages(therapist_data['languages'])
            db.session.add(therapist)
        
        db.session.commit()
        print("Sample therapists added to database")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    """Serve static files and handle SPA routing"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

