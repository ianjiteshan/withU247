// WithU247 Main JavaScript
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
    
    setupEventListeners() {
        // Navigation toggle for mobile
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }
        
        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
        });
        
        // Form submissions
        this.setupAuthForms();
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
        
        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    this.closeModal(activeModal.id);
                }
            }
        });
    }
    
    setupNavigation() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupAuthForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.authToken = data.access_token;
                localStorage.setItem('authToken', this.authToken);
                this.showNotification('Login successful!', 'success');
                this.closeModal('loginModal');
                this.updateAuthUI();
                this.loadUserProfile();
            } else {
                this.showNotification(data.msg || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }
    
    async handleSignup() {
        const username = document.getElementById('signupUsername').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        
        if (!username || !email || !password) {
            this.showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBase}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showNotification('Account created successfully! Please login.', 'success');
                this.closeModal('signupModal');
                this.showLoginModal();
            } else {
                this.showNotification(data.msg || 'Signup failed', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        }
    }
    
    async loadUserProfile() {
        if (!this.authToken) return;
        
        try {
            const response = await fetch(`${this.apiBase}/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                this.updateAuthUI();
            } else if (response.status === 401) {
                this.logout();
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    }
    
    async loadTherapists() {
        try {
            const response = await fetch(`${this.apiBase}/therapists?minRating=4`);
            const therapists = await response.json();
            
            if (response.ok) {
                this.displayTherapists(therapists.slice(0, 6)); // Show first 6 therapists
            }
        } catch (error) {
            console.error('Error loading therapists:', error);
        }
    }
    
    displayTherapists(therapists) {
        const carousel = document.getElementById('therapists-carousel');
        if (!carousel) return;
        
        carousel.innerHTML = therapists.map(therapist => `
            <div class="therapist-card" data-aos="fade-up">
                <div class="therapist-avatar">
                    ${therapist.name.charAt(0)}
                </div>
                <h4>${therapist.name}</h4>
                <p class="therapist-specialization">
                    ${therapist.specializations ? therapist.specializations.slice(0, 2).join(', ') : 'General Counseling'}
                </p>
                <div class="therapist-rating">
                    ⭐ ${therapist.rating}/5.0
                </div>
                <button class="feature-btn" onclick="app.viewTherapist(${therapist.id})">
                    View Profile
                </button>
            </div>
        `).join('');
    }
    
    checkAuthStatus() {
        if (this.authToken) {
            this.loadUserProfile();
        }
    }
    
    updateAuthUI() {
        const navAuth = document.querySelector('.nav-auth');
        if (!navAuth) return;
        
        if (this.currentUser) {
            navAuth.innerHTML = `
                <span class="user-greeting">Hi, ${this.currentUser.username}!</span>
                <button class="btn-secondary" onclick="app.logout()">Logout</button>
            `;
        } else {
            navAuth.innerHTML = `
                <button class="btn-secondary" onclick="showLoginModal()">Login</button>
                <button class="btn-primary" onclick="showSignupModal()">Get Started</button>
            `;
        }
    }
    
    logout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('authToken');
        this.updateAuthUI();
        this.showNotification('Logged out successfully', 'info');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Add notification styles if not already present
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    padding: 16px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 3000;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    min-width: 300px;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
                    animation: slideInRight 0.3s ease;
                }
                
                .notification-success { background: #46d369; }
                .notification-error { background: #e50914; }
                .notification-info { background: #0071eb; }
                
                .notification button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background 0.2s ease;
                }
                
                .notification button:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    // Modal functions
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Clear form inputs
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
        }
    }
    
    // Navigation functions
    viewTherapist(therapistId) {
        window.location.href = `/therapist.html?id=${therapistId}`;
    }
    
    startQuiz() {
        window.location.href = '/quiz.html';
    }
    
    exploreTherapists() {
        window.location.href = '/map.html';
    }
}

// Global functions for HTML onclick handlers
function showLoginModal() {
    app.showModal('loginModal');
}

function showSignupModal() {
    app.showModal('signupModal');
}

function closeModal(modalId) {
    app.closeModal(modalId);
}

function switchToSignup() {
    app.closeModal('loginModal');
    app.showModal('signupModal');
}

function switchToLogin() {
    app.closeModal('signupModal');
    app.showModal('loginModal');
}

function startQuiz() {
    app.startQuiz();
}

function exploreTherapists() {
    app.exploreTherapists();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WithU247App();
});

// GSAP Animations (if GSAP is loaded)
if (typeof gsap !== 'undefined') {
    // Hero text animation
    gsap.from('.hero-title', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.2
    });
    
    gsap.from('.hero-subtitle', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.4
    });
    
    gsap.from('.hero-actions', {
        duration: 1,
        y: 30,
        opacity: 0,
        ease: 'power3.out',
        delay: 0.6
    });
    
    // Feature cards stagger animation
    gsap.from('.feature-card', {
        duration: 0.8,
        y: 50,
        opacity: 0,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 80%'
        }
    });
}

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WithU247App;
}

