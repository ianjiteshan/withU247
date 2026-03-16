# WithU247 Mental Health App - Technical Documentation

## 🏗️ Architecture Overview

WithU247 is a full-stack web application built with Flask backend and vanilla JavaScript frontend, designed to provide comprehensive mental health support for Dwarka residents.

### Technology Stack

**Backend:**
- **Framework**: Flask (Python 3.11+)
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (Flask-JWT-Extended)
- **AI Integration**: Google Gemini Pro API
- **CORS**: Flask-CORS

**Frontend:**
- **Languages**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Custom CSS with CSS Grid/Flexbox
- **Animations**: AOS (Animate On Scroll), GSAP
- **Icons**: SVG icons (inline)
- **Responsive**: Mobile-first design

**External APIs:**
- Google Gemini Pro (AI Chatbot)
- Google Maps API (Future integration)

## 📊 Database Schema

### User Model
```python
class User(db.Model):
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
    
    # Location
    city = db.Column(db.String(50), default='Dwarka')
    state = db.Column(db.String(50), default='Delhi')
    pincode = db.Column(db.String(10))
    
    # Mental health profile
    emergency_contact_name = db.Column(db.String(100))
    emergency_contact_phone = db.Column(db.String(20))
    medical_conditions = db.Column(db.Text)  # JSON
    current_medications = db.Column(db.Text)  # JSON
    therapy_history = db.Column(db.Text)
    
    # App settings
    is_active = db.Column(db.Boolean, default=True)
    email_verified = db.Column(db.Boolean, default=False)
    privacy_settings = db.Column(db.Text)  # JSON
    notification_preferences = db.Column(db.Text)  # JSON
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
```

### Therapist Model
```python
class Therapist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    rating = db.Column(db.Float, default=4.0)
    experience_years = db.Column(db.Integer, default=0)
    specializations = db.Column(db.Text)  # JSON array
    bio = db.Column(db.Text)
    education = db.Column(db.Text)
    languages = db.Column(db.Text)  # JSON array
    
    # Location data for geospatial queries
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
```

### ChatLog Model
```python
class ChatLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    session_id = db.Column(db.String(100), nullable=False)
    
    # Message details
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(50), default='general')
    
    # AI analysis
    sentiment_score = db.Column(db.Float)  # -1 to 1
    urgency_level = db.Column(db.String(20), default='low')
    detected_issues = db.Column(db.Text)  # JSON
    
    # Metadata
    response_time_ms = db.Column(db.Integer)
    model_used = db.Column(db.String(50), default='gemini-pro')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "msg": "User created successfully",
    "user_id": 1
}
```

#### POST /api/auth/login
Authenticate user and return JWT token.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response:**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com"
    }
}
```

### Therapist Routes (`/api/therapists`)

#### GET /api/therapists
Get list of therapists with optional filtering.

**Query Parameters:**
- `minRating` (float): Minimum rating filter
- `specialization` (string): Filter by specialization
- `available` (boolean): Filter by availability
- `sector` (string): Filter by Dwarka sector

**Response:**
```json
[
    {
        "id": 1,
        "name": "Dr. Priya Sharma",
        "rating": 4.8,
        "experience_years": 8,
        "specializations": ["Anxiety", "Depression", "Stress Management"],
        "location": {
            "type": "Point",
            "coordinates": [77.0460, 28.5921]
        },
        "address": "Sector 12, Dwarka, New Delhi",
        "available_now": true,
        "consultation_fee": 800,
        "verified": true
    }
]
```

#### GET /api/therapists/nearby
Get therapists near a specific location using geospatial queries.

**Query Parameters:**
- `lat` (float): Latitude
- `lng` (float): Longitude
- `radius` (float): Search radius in kilometers (default: 5)

### Chat Routes (`/api/chat`)

#### POST /api/chat
Send message to AI chatbot and get response.

**Request Body:**
```json
{
    "message": "I'm feeling anxious about work",
    "session_id": "chat_1234567890"
}
```

**Response:**
```json
{
    "response": "I understand you're feeling anxious about work. That's a common experience...",
    "session_id": "chat_1234567890",
    "urgency_level": "medium",
    "suggested_actions": ["breathing_exercise", "therapist_consultation"]
}
```

### User Routes (`/api/users`)

#### GET /api/users
Get all users (admin only).

#### POST /api/users
Create a new user.

#### GET /api/users/<id>
Get specific user profile.

#### PUT /api/users/<id>
Update user profile.

## 🎨 Frontend Architecture

### File Structure
```
static/
├── index.html              # Landing page
├── chat.html              # AI chatbot interface
├── css/
│   ├── main.css           # Core styles and Netflix theme
│   └── chat.css           # Chat-specific styles
└── js/
    ├── main.js            # Core app functionality
    └── chat.js            # Chat functionality
```

### CSS Architecture

The styling follows a component-based approach with CSS custom properties for theming:

```css
:root {
    /* Netflix-inspired Color Palette */
    --primary-red: #e50914;
    --primary-red-dark: #b20710;
    --dark-bg: #141414;
    --darker-bg: #0a0a0a;
    --card-bg: #1f1f1f;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
    --text-muted: #8c8c8c;
    --accent-blue: #0071eb;
    --accent-green: #46d369;
    --border-color: #333333;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #e50914 0%, #b20710 100%);
    --gradient-secondary: linear-gradient(135deg, #0071eb 0%, #0056b3 100%);
    --gradient-text: linear-gradient(135deg, #e50914 0%, #ff6b6b 100%);
    
    /* Shadows */
    --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
    --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.2);
    --shadow-heavy: 0 8px 32px rgba(0, 0, 0, 0.3);
    --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.4);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-medium: 0.3s ease;
    --transition-slow: 0.5s ease;
}
```

### JavaScript Architecture

#### Main App Class (`main.js`)
```javascript
class WithU247App {
    constructor() {
        this.apiBase = '/api';
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.loadTherapists();
        this.checkAuthStatus();
    }
    
    // Authentication methods
    async handleLogin() { /* ... */ }
    async handleSignup() { /* ... */ }
    
    // UI methods
    showNotification(message, type) { /* ... */ }
    updateAuthUI() { /* ... */ }
}
```

#### Chat App Class (`chat.js`)
```javascript
class ChatApp {
    constructor() {
        this.apiBase = '/api';
        this.sessionId = this.generateSessionId();
        this.isTyping = false;
        this.chatHistory = [];
        this.init();
    }
    
    async sendMessage() { /* ... */ }
    addMessage(text, sender) { /* ... */ }
    checkForCrisisKeywords(message) { /* ... */ }
}
```

## 🔐 Security Implementation

### Authentication Flow

1. **User Registration:**
   - Password hashing using Werkzeug's `generate_password_hash`
   - Email validation and uniqueness check
   - User profile creation with default settings

2. **User Login:**
   - Password verification using `check_password_hash`
   - JWT token generation with expiration
   - Token storage in localStorage (frontend)

3. **Protected Routes:**
   - JWT token validation using `@jwt_required` decorator
   - User identity extraction from token
   - Authorization checks for sensitive operations

### Security Features

- **Password Security**: Werkzeug password hashing
- **CORS Protection**: Flask-CORS with configurable origins
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: SQLAlchemy ORM parameterized queries
- **XSS Prevention**: Proper output encoding
- **CSRF Protection**: JWT tokens instead of session cookies

## 🤖 AI Integration

### Google Gemini Integration

The AI chatbot uses Google's Gemini Pro model for generating responses:

```python
import google.generativeai as genai

# Configure Gemini
genai.configure(api_key=os.environ.get('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

# Generate response
def generate_ai_response(user_message, context=""):
    prompt = f"""
    You are a compassionate mental health assistant for WithU247, 
    a platform serving Dwarka residents. Provide supportive, 
    empathetic responses while being mindful of crisis situations.
    
    User message: {user_message}
    Context: {context}
    
    Respond with care and suggest professional help when appropriate.
    """
    
    response = model.generate_content(prompt)
    return response.text
```

### Crisis Detection

The system includes basic crisis keyword detection:

```javascript
const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die', 
    'hurt myself', 'self harm', 'cutting', 'overdose'
];

function checkForCrisisKeywords(message) {
    const messageText = message.toLowerCase();
    return crisisKeywords.some(keyword => 
        messageText.includes(keyword)
    );
}
```

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
/* Base styles: 320px+ */

@media (max-width: 768px) {
    /* Tablet and below */
    .nav-menu { display: none; }
    .nav-toggle { display: flex; }
    .features-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
    /* Mobile */
    .container { padding: 0 16px; }
    .hero-title { font-size: 2.5rem; }
    .stats-grid { grid-template-columns: 1fr; }
}
```

### Mobile Optimizations

- Touch-friendly button sizes (minimum 44px)
- Optimized typography scaling
- Simplified navigation for mobile
- Gesture-friendly chat interface
- Responsive images and media

## 🚀 Performance Optimizations

### Frontend Performance

1. **CSS Optimizations:**
   - CSS custom properties for consistent theming
   - Efficient selectors and minimal specificity
   - Hardware-accelerated animations using `transform`

2. **JavaScript Optimizations:**
   - Event delegation for dynamic content
   - Debounced input handlers
   - Lazy loading for non-critical features

3. **Asset Optimizations:**
   - SVG icons for scalability
   - WebP images where supported
   - Minified CSS and JavaScript

### Backend Performance

1. **Database Optimizations:**
   - Indexed columns for frequent queries
   - Efficient relationship loading
   - Connection pooling for production

2. **API Optimizations:**
   - Pagination for large datasets
   - Response caching for static data
   - Gzip compression for responses

## 🧪 Testing Strategy

### Manual Testing Checklist

**Frontend Testing:**
- [ ] Page loading and navigation
- [ ] Responsive design on different devices
- [ ] Form validation and submission
- [ ] Animation performance
- [ ] Cross-browser compatibility

**Backend Testing:**
- [ ] API endpoint functionality
- [ ] Authentication flow
- [ ] Database operations
- [ ] Error handling
- [ ] Security validations

**Integration Testing:**
- [ ] Frontend-backend communication
- [ ] AI chatbot responses
- [ ] User registration and login
- [ ] Data persistence

### Automated Testing (Future)

```python
# Example test structure
import unittest
from src.main import app, db

class TestAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app_context = app.app_context()
        self.app_context.push()
        db.create_all()
    
    def test_therapist_list(self):
        response = self.app.get('/api/therapists')
        self.assertEqual(response.status_code, 200)
    
    def test_user_registration(self):
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.app.post('/api/auth/register', json=data)
        self.assertEqual(response.status_code, 201)
```

## 📈 Monitoring & Analytics

### Error Tracking

Implement error tracking for production:

```python
import logging
from flask import request

@app.errorhandler(500)
def internal_error(error):
    logging.error(f'Server Error: {error}, Route: {request.url}')
    return {'error': 'Internal server error'}, 500

@app.errorhandler(404)
def not_found(error):
    logging.warning(f'404 Error: {request.url}')
    return {'error': 'Resource not found'}, 404
```

### Performance Monitoring

```python
import time
from functools import wraps

def monitor_performance(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        result = f(*args, **kwargs)
        end_time = time.time()
        
        # Log slow requests
        if end_time - start_time > 1.0:
            logging.warning(f'Slow request: {f.__name__} took {end_time - start_time:.2f}s')
        
        return result
    return decorated_function
```

## 🔮 Future Enhancements

### Technical Roadmap

1. **Database Migration:**
   - Migrate from SQLite to PostgreSQL
   - Implement database migrations
   - Add database backup strategies

2. **Caching Layer:**
   - Redis for session storage
   - API response caching
   - Static asset caching

3. **Microservices:**
   - Separate chat service
   - Dedicated user service
   - Independent therapist service

4. **Real-time Features:**
   - WebSocket integration
   - Live chat notifications
   - Real-time availability updates

5. **Advanced AI:**
   - Sentiment analysis
   - Personalized recommendations
   - Multi-language support

### Infrastructure Improvements

- Container deployment (Docker)
- Kubernetes orchestration
- CI/CD pipeline setup
- Automated testing suite
- Load balancing
- CDN integration

---

This technical documentation provides a comprehensive overview of the WithU247 application architecture, implementation details, and future enhancement possibilities. The codebase is designed to be maintainable, scalable, and secure while providing an excellent user experience for mental health support in the Dwarka community.

