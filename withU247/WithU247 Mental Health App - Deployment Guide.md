# WithU247 Mental Health App - Deployment Guide

## 🚀 Project Overview

WithU247 is a comprehensive mental health platform designed specifically for Dwarka residents, featuring:

- **Netflix-inspired UI** with dark theme and smooth animations
- **AI-powered chatbot** using Google Gemini for mental health support
- **Therapist directory** with geospatial search and ratings
- **Mental health assessment** quiz system
- **Mood tracking** and journaling capabilities
- **Booking system** for therapy appointments
- **Responsive design** for all devices

## 📁 Project Structure

```
withu247-backend/
├── src/
│   ├── main.py                 # Flask application entry point
│   ├── models.py              # Database models (User, Therapist, ChatLog)
│   ├── routes/
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── user.py            # User management
│   │   ├── therapist.py       # Therapist directory API
│   │   └── chat.py            # AI chatbot API
│   ├── static/
│   │   ├── index.html         # Landing page
│   │   ├── chat.html          # AI chatbot interface
│   │   ├── css/
│   │   │   ├── main.css       # Main styling
│   │   │   └── chat.css       # Chat-specific styles
│   │   └── js/
│   │       ├── main.js        # Core functionality
│   │       └── chat.js        # Chat functionality
│   └── database/
│       └── app.db             # SQLite database
```

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.11+
- pip package manager
- Git

### Installation Steps

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd withu247-backend
```

2. **Install dependencies:**
```bash
pip install Flask Flask-SQLAlchemy Flask-JWT-Extended Flask-CORS google-generativeai
```

3. **Set up environment variables:**
```bash
export GOOGLE_API_KEY="your_gemini_api_key_here"
export FLASK_ENV="development"
```

4. **Run the application:**
```bash
python src/main.py
```

5. **Access the application:**
- Open browser to `http://localhost:5000`
- The app will automatically create sample therapist data

## 🌐 Production Deployment

### Option 1: Railway Deployment (Recommended)

1. **Prepare for deployment:**
```bash
# Create requirements.txt
pip freeze > requirements.txt

# Create Procfile
echo "web: python src/main.py" > Procfile
```

2. **Deploy to Railway:**
- Connect your GitHub repository to Railway
- Set environment variables in Railway dashboard:
  - `GOOGLE_API_KEY`: Your Google Gemini API key
  - `FLASK_ENV`: production
- Deploy automatically from main branch

### Option 2: Render Deployment

1. **Create render.yaml:**
```yaml
services:
  - type: web
    name: withu247-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python src/main.py
    envVars:
      - key: GOOGLE_API_KEY
        value: your_gemini_api_key_here
```

2. **Deploy to Render:**
- Connect repository to Render
- Configure environment variables
- Deploy from dashboard

### Option 3: Heroku Deployment

1. **Install Heroku CLI and login:**
```bash
heroku login
```

2. **Create Heroku app:**
```bash
heroku create withu247-app
```

3. **Set environment variables:**
```bash
heroku config:set GOOGLE_API_KEY=your_gemini_api_key_here
```

4. **Deploy:**
```bash
git push heroku main
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google Gemini API key for AI chatbot | Yes |
| `FLASK_ENV` | Environment (development/production) | No |
| `SECRET_KEY` | Flask secret key for sessions | Recommended |
| `JWT_SECRET_KEY` | JWT token secret | Recommended |

### Database Configuration

The app uses SQLite by default for simplicity. For production, consider upgrading to PostgreSQL:

```python
# In main.py, replace SQLite URI with PostgreSQL
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
```

## 🔐 Security Considerations

### Production Security Checklist

- [ ] Change default secret keys in `main.py`
- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting for API endpoints
- [ ] Add input validation and sanitization
- [ ] Set up proper CORS policies
- [ ] Use secure session cookies
- [ ] Implement proper error handling

### Recommended Security Updates

```python
# In main.py, add these configurations for production:
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'fallback-jwt-key')
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
```

## 📊 API Documentation

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
```

### Therapist Directory

```
GET /api/therapists              # Get all therapists
GET /api/therapists?minRating=4  # Filter by rating
GET /api/therapists/nearby       # Geospatial search
```

### AI Chatbot

```
POST /api/chat                   # Send message to AI
```

### User Management

```
GET /api/users                   # Get all users (admin)
POST /api/users                  # Create user
GET /api/users/<id>              # Get user profile
PUT /api/users/<id>              # Update user
```

## 🎨 Frontend Customization

### Styling

The app uses CSS custom properties for easy theming:

```css
:root {
    --primary-red: #e50914;
    --dark-bg: #141414;
    --card-bg: #1f1f1f;
    --text-primary: #ffffff;
    --text-secondary: #b3b3b3;
}
```

### Adding New Features

1. **Create new HTML page** in `src/static/`
2. **Add corresponding CSS** in `src/static/css/`
3. **Implement JavaScript** in `src/static/js/`
4. **Create API endpoints** in `src/routes/`
5. **Update navigation** in existing pages

## 🧪 Testing

### Manual Testing Checklist

- [ ] Landing page loads correctly
- [ ] Navigation works between pages
- [ ] AI chatbot responds to messages
- [ ] Therapist cards display properly
- [ ] Authentication modals function
- [ ] Responsive design on mobile
- [ ] All buttons and links work
- [ ] Error handling displays properly

### API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Test therapist API
curl http://localhost:5000/api/therapists

# Test chat API
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test123"}'
```

## 📈 Performance Optimization

### Frontend Optimization

- Minify CSS and JavaScript files
- Optimize images and use WebP format
- Implement lazy loading for images
- Use CDN for external libraries
- Enable gzip compression

### Backend Optimization

- Implement database indexing
- Add caching for frequently accessed data
- Use connection pooling for database
- Implement API rate limiting
- Monitor and log performance metrics

## 🔍 Monitoring & Analytics

### Recommended Tools

- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **Performance**: New Relic or DataDog
- **Uptime Monitoring**: Pingdom or UptimeRobot

### Health Check Endpoint

Add a health check endpoint for monitoring:

```python
@app.route('/health')
def health_check():
    return {'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}
```

## 🚀 Future Enhancements

### Planned Features

1. **Google Maps Integration**
   - Interactive map with therapist markers
   - Directions and distance calculation
   - Real-time availability updates

2. **Advanced Quiz System**
   - Personalized mental health assessments
   - Progress tracking over time
   - Therapist recommendations based on results

3. **Video Calling**
   - WebRTC integration for therapy sessions
   - Screen sharing capabilities
   - Session recording (with consent)

4. **Mobile App**
   - React Native or Flutter implementation
   - Push notifications for appointments
   - Offline mood tracking

### Technical Improvements

- Migrate to PostgreSQL for better scalability
- Implement Redis for caching and sessions
- Add comprehensive test suite
- Set up CI/CD pipeline
- Implement microservices architecture

## 📞 Support & Maintenance

### Regular Maintenance Tasks

- Update dependencies monthly
- Monitor error logs weekly
- Backup database daily
- Review security patches
- Update API documentation

### Contact Information

For technical support or questions about deployment:
- Email: support@withu247.com
- Documentation: [Project Wiki]
- Issues: [GitHub Issues]

---

## 🎉 Congratulations!

You now have a fully functional mental health platform ready for deployment. The WithU247 app provides a solid foundation for supporting mental wellness in the Dwarka community with modern technology and user-friendly design.

Remember to regularly update dependencies, monitor performance, and gather user feedback to continuously improve the platform.

**Happy Deploying! 🚀**

