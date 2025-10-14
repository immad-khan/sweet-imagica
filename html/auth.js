// Authentication System with Backend Integration
class Auth {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiUrl = 'http://localhost:3000/api';
        this.loadUser();
    }

    // Load user from localStorage
    loadUser() {
        const userData = localStorage.getItem('currentUser');
        const token = localStorage.getItem('authToken');
        
        if (userData && token) {
            this.currentUser = JSON.parse(userData);
            this.token = token;
        }
    }

    // Login function with backend
    async login(username, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.token = data.token;
                
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token);
                
                return { success: true, user: data.user };
            }
            
            return { success: false, message: data.message || 'Login failed' };
            
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Register function with backend
    async register(username, email, password) {
        try {
            const response = await fetch(`${this.apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                this.token = data.token;
                
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                localStorage.setItem('authToken', data.token);
                
                return { success: true, user: data.user };
            }
            
            return { success: false, message: data.message || 'Registration failed' };
            
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: 'Network error. Please try again.' };
        }
    }

    // Logout function
    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        window.location.href = 'homepage.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null && this.token !== null;
    }

    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.isAdmin === true;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Get auth token
    getToken() {
        return this.token;
    }

    // Require login (redirect if not logged in)
    requireLogin() {
        if (!this.isLoggedIn()) {
            alert('⚠️ Please login to access this page');
            window.location.href = 'signup.html';
            return false;
        }
        return true;
    }

    // Require admin (redirect if not admin)
    requireAdmin() {
        if (!this.isLoggedIn()) {
            alert('⚠️ Please login to access this page');
            window.location.href = 'signup.html';
            return false;
        }
        if (!this.isAdmin()) {
            alert('⚠️ Admin access required');
            window.location.href = 'homepage.html';
            return false;
        }
        return true;
    }

    // Get auth headers for API calls
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
        };
    }
}

// Initialize auth system
const auth = new Auth();