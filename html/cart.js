// Cart Management System with Backend Integration
class Cart {
    constructor() {
        this.items = [];
        this.apiUrl = 'http://localhost:3000/api';
    }

    // Load cart from backend
    async loadCart() {
        if (!auth.isLoggedIn()) return;
        
        try {
            const response = await fetch(`${this.apiUrl}/cart`, {
                headers: auth.getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success && data.cart) {
                this.items = data.cart.items || [];
            }
        } catch (error) {
            console.error('Load cart error:', error);
        }
    }

    // Add item to cart (backend)
    async addItem(item) {
        if (!auth.isLoggedIn()) {
            alert('Please login to add items to cart');
            return false;
        }
        
        try {
            const response = await fetch(`${this.apiUrl}/cart/add`, {
                method: 'POST',
                headers: auth.getAuthHeaders(),
                body: JSON.stringify({ bookData: item })
            });
            
            const data = await response.json();
            
            if (data.success) {
                await this.loadCart();
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Add to cart error:', error);
            return false;
        }
    }

    // Remove item from cart (backend)
    async removeItem(itemId) {
        try {
            const response = await fetch(`${this.apiUrl}/cart/remove/${itemId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                await this.loadCart();
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Remove from cart error:', error);
            return false;
        }
    }

    // Get all items
    getItems() {
        return this.items;
    }

    // Calculate total
    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.bookID?.price || 0;
            return total + (price * item.quantity);
        }, 0);
    }

    // Clear cart (backend)
    async clearCart() {
        try {
            const response = await fetch(`${this.apiUrl}/cart/clear`, {
                method: 'DELETE',
                headers: auth.getAuthHeaders()
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.items = [];
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Clear cart error:', error);
            return false;
        }
    }

    // Get item count
    getItemCount() {
        return this.items.length;
    }
}

// Initialize cart
const cart = new Cart();

// Load cart if user is logged in
if (auth.isLoggedIn()) {
    cart.loadCart();
}