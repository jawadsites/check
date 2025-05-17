/**
 * Social Media Payment Module
 * Handles payment processing for the social media services
 */

const socialPayment = {
    // Payment state
    state: {
        orderId: null,
        orderDetails: null,
        paymentMethod: 'paypal',
        isProcessing: false,
        paypalInitialized: false
    },

    // Initialize payment system
    init: function() {
        // Get current order ID from localStorage
        this.state.orderId = localStorage.getItem('current_order_id');
        
        // Load order details if we have an order ID
        if (this.state.orderId) {
            this.loadOrderDetails();
            this.displayOrderDetails();
        }

        // Initialize PayPal button if needed
        if (document.getElementById('paypal-button-container')) {
            this.initializePayPal();
        }

        // Initialize success page if we're on it
        if (document.getElementById('order-success-details')) {
            this.initializeSuccessPage();
        }
    },    // Load order details from localStorage
    loadOrderDetails: function() {
        const orderId = this.state.orderId;
        console.log('Loading order details for ID:', orderId);
        
        if (!orderId) {
            console.error('No order ID found in localStorage');
            return;
        }

        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                console.log('Found', orders.length, 'orders in localStorage');
                
                this.state.orderDetails = orders.find(order => order.id === orderId);
                
                if (this.state.orderDetails) {
                    console.log('Order details loaded successfully:', this.state.orderDetails.id);
                } else {
                    console.error('Order not found with ID:', orderId);
                    console.log('Available order IDs:', orders.map(o => o.id).join(', '));
                }
            } else {
                console.error('No orders found in localStorage');
            }
        } catch (e) {
            console.error('Error loading order details:', e);
        }
    },

    // Display order details on the payment page
    displayOrderDetails: function() {
        const order = this.state.orderDetails;
        if (!order) return;

        // Update order summary elements
        const elements = {
            'order-id': order.id,
            'order-service': order.service,
            'order-platform': this.getPlatformName(order.platform),
            'order-quantity': this.formatNumber(order.quantity),
            'order-price': `${this.formatPrice(order.amount)} ${order.currency}`
        };

        // Update elements if they exist
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    },

    // Initialize PayPal button
    initializePayPal: function() {
        if (this.state.paypalInitialized || !window.paypal) return;

        const order = this.state.orderDetails;
        if (!order) return;

        const self = this;
        
        // Render PayPal button
        window.paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: order.amount.toFixed(2),
                            currency_code: order.currency
                        },
                        description: `${order.service} - ${order.quantity} - ${order.accountUrl}`
                    }]
                });
            },
            onApprove: function(data, actions) {
                self.state.isProcessing = true;
                
                // Update UI to show processing
                self.updateProcessingUI(true);
                
                return actions.order.capture().then(function(details) {
                    // Payment succeeded
                    self.handlePaymentSuccess(details);
                });
            },
            onError: function(err) {
                console.error('PayPal Error:', err);
                self.state.isProcessing = false;
                self.updateProcessingUI(false);
                self.showError('حدث خطأ أثناء معالجة الدفع. يرجى المحاولة مرة أخرى.');
            }
        }).render('#paypal-button-container');

        this.state.paypalInitialized = true;
    },    // Handle successful payment
    handlePaymentSuccess: function(details) {
        // Update order status in localStorage
        this.updateOrderStatus('completed', details.id);
        
        // Create a payment success notification
        if (typeof notificationSystem !== 'undefined' && this.state.orderDetails) {
            const notification = {
                title: 'دفع ناجح',
                message: `تم استلام الدفع للطلب: ${this.state.orderDetails.id}`,
                type: 'order',
                data: { 
                    orderId: this.state.orderDetails.id,
                    transactionId: details.id
                }
            };
            notificationSystem.addNotification(notification);
        }
        
        // Redirect to success page
        window.location.href = 'success.html';
    },

    // Update order status in localStorage
    updateOrderStatus: function(status, transactionId) {
        const orderId = this.state.orderId;
        if (!orderId) return;

        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                const orders = JSON.parse(storedOrders);
                const orderIndex = orders.findIndex(order => order.id === orderId);
                
                if (orderIndex !== -1) {
                    orders[orderIndex].status = status;
                    if (transactionId) {
                        orders[orderIndex].transactionId = transactionId;
                    }
                    localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                }
            }
        } catch (e) {
            console.error('Error updating order status:', e);
        }
    },    // Initialize success page
    initializeSuccessPage: function() {
        console.log('Initializing success page with order ID:', this.state.orderId);
        const order = this.state.orderDetails;
        
        if (!order) {
            console.error('No order details found for ID:', this.state.orderId);
            return;
        }
        
        console.log('Order details found:', order.id, order.service);

        // Mark the order as completed if it's pending
        if (order.status === 'pending') {
            // Get the orders array to update the order
            try {
                const storedOrders = localStorage.getItem('dashboard_orders');
                if (storedOrders) {
                    const orders = JSON.parse(storedOrders);
                    const orderIndex = orders.findIndex(o => o.id === order.id);
                    
                    if (orderIndex !== -1) {
                        orders[orderIndex].status = 'completed';
                        localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                        
                        // Update local state as well
                        this.state.orderDetails.status = 'completed';
                        
                        console.log('Order marked as completed:', order.id);
                    }
                }
            } catch (e) {
                console.error('Error updating order status:', e);
            }
        }

        // Update success page elements
        const elements = {
            'success-order-id': order.id,
            'success-service': order.service,
            'success-quantity': this.formatNumber(order.quantity),
            'success-amount': `${this.formatPrice(order.amount)} ${order.currency}`,
            'success-date': this.formatDate(order.date),
            'success-account': order.accountUrl
        };

        // Update elements if they exist
        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    },

    // Update UI during payment processing
    updateProcessingUI: function(isProcessing) {
        const processingOverlay = document.getElementById('payment-processing');
        if (processingOverlay) {
            if (isProcessing) {
                processingOverlay.classList.remove('hidden');
            } else {
                processingOverlay.classList.add('hidden');
            }
        }
    },

    // Show error message
    showError: function(message) {
        const errorElement = document.getElementById('payment-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },

    // Helper functions
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatPrice: function(price) {
        return price.toFixed(2);
    },

    formatDate: function(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('ar-EG', options);
    },

    getPlatformName: function(platform) {
        const platformNames = {
            'instagram': 'انستغرام',
            'facebook': 'فيسبوك',
            'twitter': 'تويتر',
            'tiktok': 'تيك توك',
            'youtube': 'يوتيوب',
            'linkedin': 'لينكد إن'
        };
        return platformNames[platform] || platform;
    }
};

// Initialize the payment module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    socialPayment.init();
});

// Make accessible globally
window.socialPayment = socialPayment;