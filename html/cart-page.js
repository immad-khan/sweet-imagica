// Load cart items (Update in cart-page.js)
async function loadCartItems() {
    await cart.loadCart();
    
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const items = cart.getItems();
    
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-cart-x" style="font-size: 4rem; color: #9b587c;"></i>
                <h4 class="mt-3">Your cart is empty</h4>
                <p>Add some magical storybooks to get started!</p>
                <a href="shop.html" class="btn btn-purple mt-3">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = items.map(item => {
        const book = item.bookID;
        const customData = book?.customData || {};
        
        return `
            <div class="cart-item-card mb-3">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5>📖 ${book?.title || 'Custom Storybook'}</h5>
                        <p class="mb-1"><strong>Child Name:</strong> ${customData.childName || 'N/A'}</p>
                        <p class="mb-1"><strong>Age:</strong> ${customData.childAge || 'N/A'}</p>
                        <p class="mb-1"><strong>Theme:</strong> ${customData.theme || 'N/A'}</p>
                        <p class="mb-1"><strong>Language:</strong> ${customData.storyLanguage || 'N/A'}</p>
                    </div>
                    <div class="col-md-4 text-end">
                        <h4 class="text-purple">$${book?.price?.toFixed(2) || '0.00'}</h4>
                        <button class="btn btn-sm btn-danger mt-2" onclick="removeFromCart('${item._id}')">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    updateOrderSummary();
}

// Remove from cart (Make async)
async function removeFromCart(itemId) {
    if (confirm('Are you sure you want to remove this item?')) {
        const success = await cart.removeItem(itemId);
        if (success) {
            loadCartItems();
        } else {
            alert('Failed to remove item');
        }
    }
}