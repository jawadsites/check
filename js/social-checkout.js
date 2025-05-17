/**
 * Social Media Checkout Module
 * Handles all checkout and payment related operations
 */

const socialCheckout = {
    // Checkout state
    state: {
        services: [],
        platforms: [],
        currencies: {},
        selectedService: null,
        selectedPlatform: null,
        quantity: 100,
        currency: 'USD',
        totalPrice: 0,
        userInfo: {
            name: '',
            email: '',
            socialLink: ''
        }
    },

    // Initialize checkout
    init: function() {
        this.loadServices();
        this.loadCurrencies();
        this.setupEventListeners();
        this.updatePriceDisplay();
    },    // Load services from serviceUtils or fallback to localStorage
    loadServices: function() {
        // Try to use serviceUtils first (preferred method)
        if (typeof serviceUtils !== 'undefined') {
            const services = serviceUtils.getAllServices();
            if (services && services.length > 0) {
                this.state.services = services;
                console.log(`تم تحميل ${services.length} خدمة من التخزين الموحد`);
                return;
            }
        }
        
        // Fallback: Try to get from localStorage
        const storedServices = localStorage.getItem('dashboard_services');
        if (storedServices) {
            try {
                this.state.services = JSON.parse(storedServices);
                
                // Try to migrate data if serviceUtils is available
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.migrateOldData();
                }
            } catch (e) {
                console.error('Error parsing stored services:', e);
                this.loadDefaultData();
            }
        } else {
            this.loadDefaultData();
        }

        // Extract platforms
        const platformsSet = new Set();
        this.state.services.forEach(service => {
            service.platforms.forEach(platform => {
                platformsSet.add(platform);
            });
        });
        this.state.platforms = Array.from(platformsSet);

        // Set defaults
        this.state.selectedService = this.state.services[0]?.id || null;
        this.state.selectedPlatform = this.state.platforms[0] || null;
    },

    // Load currencies from main app data
    loadCurrencies: function() {
        if (typeof appData !== 'undefined' && appData.currencies) {
            this.state.currencies = appData.currencies;
        } else {
            // Default currencies if appData not available
            this.state.currencies = {
                'USD': { name: 'دولار أمريكي', rate: 1.0 },
                'EUR': { name: 'يورو', rate: 0.85 },
                'SAR': { name: 'ريال سعودي', rate: 3.75 }
            };
        }
    },

    // Load default data from main.js if available
    loadDefaultData: function() {
        if (typeof appData !== 'undefined' && appData.services) {
            // Convert appData format to our service format
            this.state.services = Object.keys(appData.services).map((key, index) => {
                const service = appData.services[key];
                return {
                    id: index + 1,
                    name: service.name,
                    basePrice: service.basePrice,
                    platforms: Object.keys(service.platforms),
                    platformFactors: service.platforms,
                    minQuantity: 100,
                    maxQuantity: 10000,
                    active: true
                };
            });
        } else {
            // Default services if appData not available
            this.state.services = [
                {
                    id: 1,
                    name: 'متابعين',
                    basePrice: 5.00,
                    platforms: ['instagram', 'twitter', 'facebook', 'tiktok'],
                    minQuantity: 100,
                    maxQuantity: 10000,
                    active: true
                },
                {
                    id: 2,
                    name: 'إعجابات',
                    basePrice: 3.00,
                    platforms: ['instagram', 'twitter', 'facebook'],
                    minQuantity: 100,
                    maxQuantity: 5000,
                    active: true
                }
            ];
        }
    },

    // Setup event listeners for checkout form
    setupEventListeners: function() {
        // Service selection
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', this.handleServiceChange.bind(this));
        }

        // Platform selection
        const platformOptions = document.querySelectorAll('.platform-option');
        platformOptions.forEach(option => {
            option.addEventListener('click', this.handlePlatformSelect.bind(this));
        });

        // Quantity slider
        const quantitySlider = document.getElementById('quantity');
        if (quantitySlider) {
            quantitySlider.addEventListener('input', this.handleQuantityChange.bind(this));
        }

        // Currency selection
        const currencySelect = document.getElementById('currency');
        if (currencySelect) {
            currencySelect.addEventListener('change', this.handleCurrencyChange.bind(this));
        }

        // Checkout form
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', this.handleCheckoutSubmit.bind(this));
        }
    },

    // Handle service selection change
    handleServiceChange: function(e) {
        this.state.selectedService = parseInt(e.target.value);
        this.updateAvailablePlatforms();
        this.updatePriceDisplay();
    },

    // Handle platform selection
    handlePlatformSelect: function(e) {
        const platform = e.currentTarget.dataset.platform;
        
        // Update UI
        document.querySelectorAll('.platform-option').forEach(option => {
            option.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
        
        // Update state
        this.state.selectedPlatform = platform;
        this.updatePriceDisplay();
    },

    // Handle quantity change
    handleQuantityChange: function(e) {
        this.state.quantity = parseInt(e.target.value);
        document.getElementById('quantity-display').textContent = this.formatNumber(this.state.quantity);
        this.updatePriceDisplay();
    },

    // Handle currency change
    handleCurrencyChange: function(e) {
        this.state.currency = e.target.value;
        this.updatePriceDisplay();
    },

    // Update available platforms based on selected service
    updateAvailablePlatforms: function() {
        const service = this.state.services.find(s => s.id === this.state.selectedService);
        if (!service) return;

        // Update platform options
        const platformContainer = document.getElementById('platform-options');
        if (platformContainer) {
            platformContainer.innerHTML = '';
            
            service.platforms.forEach(platform => {
                const option = document.createElement('div');
                option.className = 'platform-option p-3 border rounded-lg cursor-pointer flex items-center';
                option.dataset.platform = platform;
                
                // Set active if it's the selected platform
                if (platform === this.state.selectedPlatform) {
                    option.classList.add('active');
                }
                
                option.innerHTML = `
                    <i class="fab fa-${platform} text-xl ml-2"></i>
                    <span>${this.getPlatformName(platform)}</span>
                `;
                
                option.addEventListener('click', this.handlePlatformSelect.bind(this));
                platformContainer.appendChild(option);
            });
        }
    },

    // Update price display
    updatePriceDisplay: function() {
        const service = this.state.services.find(s => s.id === this.state.selectedService);
        if (!service || !this.state.selectedPlatform) {
            this.state.totalPrice = 0;
            return;
        }

        // Get platform factor and calculate price
        let platformFactor = 1.0;
        if (service.platformFactors && service.platformFactors[this.state.selectedPlatform]) {
            platformFactor = service.platformFactors[this.state.selectedPlatform].factor;
        }
        
        const basePrice = service.basePrice;
        const quantity = this.state.quantity;
        const currencyRate = this.state.currencies[this.state.currency].rate;
        
        // Calculate total
        this.state.totalPrice = (basePrice * platformFactor * quantity / 100) / currencyRate;
        
        // Update UI
        const priceDisplay = document.getElementById('total-price');
        if (priceDisplay) {
            priceDisplay.textContent = `${this.formatPrice(this.state.totalPrice)} ${this.state.currency}`;
        }

        // Update order summary
        this.updateOrderSummary();
    },

    // Update order summary
    updateOrderSummary: function() {
        const service = this.state.services.find(s => s.id === this.state.selectedService);
        if (!service) return;

        const summaryServiceElem = document.getElementById('summary-service');
        const summaryPlatformElem = document.getElementById('summary-platform');
        const summaryQuantityElem = document.getElementById('summary-quantity');
        const summaryPriceElem = document.getElementById('summary-price');

        if (summaryServiceElem) summaryServiceElem.textContent = service.name;
        if (summaryPlatformElem) summaryPlatformElem.textContent = this.getPlatformName(this.state.selectedPlatform);
        if (summaryQuantityElem) summaryQuantityElem.textContent = this.formatNumber(this.state.quantity);
        if (summaryPriceElem) summaryPriceElem.textContent = `${this.formatPrice(this.state.totalPrice)} ${this.state.currency}`;
    },    // Handle checkout form submission
    handleCheckoutSubmit: function(e) {
        e.preventDefault();
        
        // Get user information
        this.state.userInfo = {
            name: document.getElementById('customer-name').value,
            email: document.getElementById('customer-email').value,
            socialLink: document.getElementById('social-link').value
        };

        // Validate form
        if (!this.validateForm()) {
            if (window.notificationSystem) {
                notificationSystem.showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            }
            return;
        }

        // Save order to localStorage
        this.saveOrder();
        
        // Proceed to payment
        this.proceedToPayment();
    },
    
    // Validate checkout form
    validateForm: function() {
        const requiredFields = ['customer-name', 'customer-email', 'social-link'];
        let isValid = true;
        
        requiredFields.forEach(field => {
            const fieldElement = document.getElementById(field);
            if (!fieldElement || !fieldElement.value.trim()) {
                isValid = false;
                
                // Add error styling
                if (fieldElement) {
                    fieldElement.classList.add('border-red-500');
                    fieldElement.addEventListener('input', function() {
                        this.classList.remove('border-red-500');
                    }, { once: true });
                }
            }
        });
        
        return isValid;
    },// Save order to localStorage for dashboard
    saveOrder: function() {
        const service = this.state.services.find(s => s.id === this.state.selectedService);
        if (!service) return;

        // Generate order ID
        const orderId = 'TX' + Math.floor(Math.random() * 1000000000);
        
        // Create order object
        const order = {
            id: orderId,
            customerName: this.state.userInfo.name,
            customerEmail: this.state.userInfo.email,
            service: `${service.name} ${this.getPlatformName(this.state.selectedPlatform)}`,
            amount: this.state.totalPrice,
            currency: this.state.currency,
            quantity: this.state.quantity,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            platform: this.state.selectedPlatform,
            accountUrl: this.state.userInfo.socialLink,
            paymentMethod: 'paypal',
            notes: ''
        };

        // Get existing orders or initialize empty array
        let orders = [];
        try {
            const storedOrders = localStorage.getItem('dashboard_orders');
            if (storedOrders) {
                orders = JSON.parse(storedOrders);
            }
        } catch (e) {
            console.error('Error parsing stored orders:', e);
        }

        // Add new order and save
        orders.push(order);
        localStorage.setItem('dashboard_orders', JSON.stringify(orders));
        
        // Also save order ID for success page
        localStorage.setItem('current_order_id', orderId);
        
        // Create a notification for the new order
        if (typeof notificationSystem !== 'undefined') {
            const notification = notificationSystem.createOrderNotification(order);
            notificationSystem.addNotification(notification);
        }
        
        return order;
    },    // Proceed to payment gateway
    proceedToPayment: function() {
        // Check payment method
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        
        if (paymentMethod === 'paypal') {
            // PayPal is handled by the PayPal button directly
            // No need to do anything here
        } else {
            // For credit card payments, redirect to success page for now
            // In a real implementation, this would be replaced with actual credit card processing
            window.location.href = 'success.html';
        }
    },

    // Helper functions
    formatNumber: function(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    formatPrice: function(price) {
        return price.toFixed(2);
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

// Initialize the checkout module when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    socialCheckout.init();
});

// Make accessible globally
window.socialCheckout = socialCheckout;