/**
 * Alpine.js Data Module for the Social Media Dashboard
 * Contains all the required variables and functions for Alpine.js
 */

// Main Alpine.js data function for the app
function appData() {
    return {
        step: 1,
        serviceType: 'followers',
        platform: 'instagram',
        quantity: 1000,
        currency: 'USD',
        accountUrl: '',
        totalPrice: 0,
        orderId: null,
        
        // Available services data
        services: {
            'followers': {
                name: 'متابعين',
                basePrice: 5,
                platforms: {
                    'instagram': { name: 'انستغرام', factor: 1.0, icon: 'instagram', color: '#E1306C' },
                    'twitter': { name: 'تويتر', factor: 0.8, icon: 'twitter', color: '#1DA1F2' },
                    'facebook': { name: 'فيسبوك', factor: 0.9, icon: 'facebook', color: '#1877F2' },
                    'tiktok': { name: 'تيك توك', factor: 1.2, icon: 'tiktok', color: '#000000' },
                    'youtube': { name: 'يوتيوب', factor: 1.5, icon: 'youtube', color: '#FF0000' }
                }
            },
            'comments': {
                name: 'تعليقات',
                basePrice: 10,
                platforms: {
                    'instagram': { name: 'انستغرام', factor: 1.0, icon: 'instagram', color: '#E1306C' },
                    'youtube': { name: 'يوتيوب', factor: 1.2, icon: 'youtube', color: '#FF0000' },
                    'facebook': { name: 'فيسبوك', factor: 0.9, icon: 'facebook', color: '#1877F2' },
                    'tiktok': { name: 'تيك توك', factor: 1.1, icon: 'tiktok', color: '#000000' }
                }
            },
            'likes': {
                name: 'إعجابات',
                basePrice: 3,
                platforms: {
                    'instagram': { name: 'انستغرام', factor: 1.0, icon: 'instagram', color: '#E1306C' },
                    'twitter': { name: 'تويتر', factor: 0.8, icon: 'twitter', color: '#1DA1F2' },
                    'facebook': { name: 'فيسبوك', factor: 0.7, icon: 'facebook', color: '#1877F2' },
                    'youtube': { name: 'يوتيوب', factor: 1.1, icon: 'youtube', color: '#FF0000' },
                    'tiktok': { name: 'تيك توك', factor: 1.0, icon: 'tiktok', color: '#000000' }
                }
            },
            'views': {
                name: 'مشاهدات',
                basePrice: 2,
                platforms: {
                    'youtube': { name: 'يوتيوب', factor: 1.0, icon: 'youtube', color: '#FF0000' },
                    'instagram': { name: 'انستغرام', factor: 0.9, icon: 'instagram', color: '#E1306C' },
                    'tiktok': { name: 'تيك توك', factor: 0.8, icon: 'tiktok', color: '#000000' },
                    'facebook': { name: 'فيسبوك', factor: 0.7, icon: 'facebook', color: '#1877F2' }
                }
            },
            'shares': {
                name: 'مشاركات',
                basePrice: 8,
                platforms: {
                    'facebook': { name: 'فيسبوك', factor: 1.0, icon: 'facebook', color: '#1877F2' },
                    'twitter': { name: 'تويتر', factor: 1.1, icon: 'twitter', color: '#1DA1F2' },
                    'linkedin': { name: 'لينكد إن', factor: 1.5, icon: 'linkedin', color: '#0A66C2' }
                }
            }
        },
        
        // Exchange rates for different currencies
        exchangeRates: {
            'USD': 1.00,
            'EUR': 0.93,
            'GBP': 0.78,
            'AED': 3.67,
            'SAR': 3.75,
            'EGP': 30.90,
            'KWD': 0.31,
            'QAR': 3.64,
            'BHD': 0.38,
            'OMR': 0.38
        },
        
        // Currency symbols
        currencySymbols: {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'AED': 'د.إ',
            'SAR': 'ر.س',
            'EGP': 'ج.م',
            'KWD': 'د.ك',
            'QAR': 'ر.ق',
            'BHD': 'د.ب',
            'OMR': 'ر.ع'
        },
        
        // Custom pricing data
        customPricingData: {},
        
        // Get platform properties
        get availablePlatforms() {
            return this.services[this.serviceType].platforms;
        },
        
        // Initialize
        init() {
            // Load custom pricing data
            this.loadCustomPricingData();
            
            // Load platforms data
            this.loadPlatformsData();
            
            // Calculate initial price
            this.updatePrice();
            
            // Setup platform update event listener
            document.addEventListener('platformsUpdated', (event) => {
                console.log('تم استلام حدث تحديث المنصات:', event.detail);
                this.loadPlatformsData();
                this.updatePrice();
            });
            
            // Setup platform selection event listener
            document.addEventListener('platformSelected', (event) => {
                console.log('Platform selected event received:', event.detail);
                const platform = event.detail.platform;
                if (platform && platform.slug) {
                    // Set the selected platform if it's available for current service
                    if (this.services[this.serviceType].platforms[platform.slug]) {
                        this.platform = platform.slug;
                        this.updatePrice();
                    }
                }
            });
        },
        
        // Load custom pricing data from localStorage
        loadCustomPricingData() {
            try {
                const pricingData = localStorage.getItem('pricing_data_for_index');
                if (pricingData) {
                    this.customPricingData = JSON.parse(pricingData);
                    console.log("Custom pricing data loaded:", Object.keys(this.customPricingData).length);
                }
            } catch (e) {
                console.error('Error loading custom pricing data:', e);
            }
        },        // Load platforms data from localStorage
        loadPlatformsData() {
            try {
                console.log('تحميل بيانات المنصات من التخزين الموحد...');
                const platformsBySlug = {}; // Use slug as key to prevent duplicates
                
                // Use platformUtils if available
                if (typeof platformUtils !== 'undefined') {
                    // Get platforms array
                    const platformsArray = platformUtils.getAllPlatforms();
                    // Convert to map by slug to prevent duplicates
                    platformsArray.forEach(platform => {
                        if (platform.slug) {
                            platformsBySlug[platform.slug] = platform;
                        }
                    });
                    console.log('بيانات المنصات المستردة من platformUtils:', Object.keys(platformsBySlug).length);
                } else {
                    // Fall back to direct localStorage access - استخدام المفتاح الجديد 
                    const platformsData = localStorage.getItem('social_platforms');
                    
                    if (!platformsData) {
                        console.log('لا توجد بيانات منصات في localStorage');
                        return null;
                    }
                    
                    try {
                        // Parse platforms array
                        const platformsArray = JSON.parse(platformsData);
                        // Convert to map by slug to prevent duplicates
                        platformsArray.forEach(platform => {
                            if (platform.slug) {
                                platformsBySlug[platform.slug] = platform;
                            }
                        });
                        console.log('بيانات المنصات المستردة من localStorage مباشرة:', Object.keys(platformsBySlug).length);
                    } catch (e) {
                        console.warn('خطأ في تحليل بيانات المنصات:', e);
                        return null;
                    }
                }
                
                if (!platformsBySlug || Object.keys(platformsBySlug).length === 0) {
                    console.log('لا توجد منصات للتحميل');
                    return null;
                }
                
                // إعادة تعيين منصات كل خدمة لمنع التكرار
                for (const serviceKey in this.services) {
                    // إنشاء قائمة منصات جديدة للخدمة
                    const newPlatforms = {};
                    
                    // إضافة المنصات من localStorage باستخدام ال slug
                    for (const slug in platformsBySlug) {
                        const platform = platformsBySlug[slug];
                        if (platform && platform.active) {
                            newPlatforms[slug] = {
                                name: platform.name,
                                factor: 1.0,
                                icon: platform.icon || slug,
                                color: platform.color || '#cccccc'
                            };
                        }
                    }
                    
                    // تعيين المنصات الجديدة للخدمة
                    this.services[serviceKey].platforms = newPlatforms;
                    
                    console.log(`تم تحديث منصات الخدمة ${serviceKey}، عدد المنصات: ${Object.keys(newPlatforms).length}`);
                }
                
                // تحديث المنصة المحددة إذا لم تعد موجودة
                if (!this.services[this.serviceType].platforms[this.platform]) {
                    // اختيار أول منصة متوفرة
                    const availablePlatforms = Object.keys(this.services[this.serviceType].platforms);
                    if (availablePlatforms.length > 0) {
                        this.platform = availablePlatforms[0];
                        console.log(`تم تغيير المنصة المحددة إلى ${this.platform} لأن المنصة السابقة غير متاحة`);
                    }
                }
                
                return platformsBySlug;
            } catch (e) {
                console.error('خطأ في تحميل بيانات المنصات:', e);
                return null;
            }
        },
        
        // Generate consistent service key from name
        generateServiceKey(name) {
            // First check if this is a known service name with direct mapping
            const knownKeys = {
                'متابعين': 'followers',
                'إعجابات': 'likes',
                'تعليقات': 'comments',
                'مشاهدات': 'views',
                'مشاركات': 'shares'
            };
            
            // Try to match by exact name
            if (knownKeys[name]) {
                return knownKeys[name];
            }
            
            // Clean name to be used as key (lowercase with no spaces or special chars)
            return name
                .toLowerCase()
                .trim()
                .replace(/[^\w\s]/gi, '') // Remove special characters
                .replace(/\s+/g, '');     // Remove spaces
        },
        
        // Update price calculation
        updatePrice() {
            // Check if service type exists
            if (!this.services[this.serviceType]) {
                console.warn(`Service type ${this.serviceType} not found, using default.`);
                this.serviceType = Object.keys(this.services)[0] || 'followers';
            }
              // Try to get price from custom pricing system first
            const customPrice = this.getCustomPrice(this.serviceType, this.platform, this.quantity);
            
            if (customPrice !== null) {
                // Use custom price directly
                const priceInUSD = customPrice;
                
                // Get exchange rate for selected currency
                let exchangeRate = 1;
                if (this.exchangeRates && this.exchangeRates[this.currency]) {
                    exchangeRate = this.exchangeRates[this.currency];
                }
                
                // Convert to selected currency
                this.totalPrice = priceInUSD * exchangeRate;
                return;
            }
            
            // Fall back to standard pricing if no custom pricing found
            
            // Get base service price
            const basePrice = this.services[this.serviceType].basePrice;
            
            // Check if platform exists for this service
            const availablePlatforms = this.services[this.serviceType].platforms;
            if (!availablePlatforms[this.platform]) {
                console.warn(`Platform ${this.platform} not available for ${this.serviceType}, using first available.`);
                this.platform = Object.keys(availablePlatforms)[0] || 'instagram';
            }
            
            // Get platform factor (multiplier)
            let platformFactor = 1;
            if (availablePlatforms[this.platform]) {
                platformFactor = availablePlatforms[this.platform].factor;
            }
            
            // Calculate price based on quantity (with volume discount)
            let quantityFactor = 1;
            if (this.quantity >= 5000) {
                quantityFactor = 0.8; // 20% discount for large orders
            } else if (this.quantity >= 2000) {
                quantityFactor = 0.9; // 10% discount for medium orders
            }
              // Calculate price in USD
            const priceInUSD = basePrice * (this.quantity / 1000) * platformFactor * quantityFactor;
            
            // Get exchange rate for selected currency
            let exchangeRate = 1;
            if (this.exchangeRates && this.exchangeRates[this.currency]) {
                exchangeRate = this.exchangeRates[this.currency];
            }
            
            // Convert to selected currency
            this.totalPrice = priceInUSD * exchangeRate;
        },
        
        // Format price with currency symbol
        formatPrice(price) {
            const formattedPrice = price.toFixed(2);
            const currencySymbol = this.currencySymbols[this.currency] || '$';
            return `${currencySymbol}${formattedPrice} ${this.currency}`;
        },
        
        // Get service name
        getServiceName() {
            return this.services[this.serviceType].name;
        },
        
        // Get platform name
        getPlatformName() {
            if (this.services[this.serviceType].platforms[this.platform]) {
                return this.services[this.serviceType].platforms[this.platform].name;
            }
            return '';
        },
        
        // Get service icon class
        getServiceIconClass(serviceType) {
            const classes = {
                'followers': 'bg-indigo-100 text-indigo-600',
                'likes': 'bg-red-100 text-red-600',
                'comments': 'bg-green-100 text-green-600',
                'views': 'bg-blue-100 text-blue-600',
                'shares': 'bg-yellow-100 text-yellow-600',
                'premium': 'bg-purple-100 text-purple-600',
                'thebig': 'bg-pink-100 text-pink-600'
            };
            return classes[serviceType] || 'bg-gray-100 text-gray-600';
        },
        
        // Get service description
        getServiceDescription(serviceType) {
            const descriptions = {
                'followers': 'زيادة متابعي حسابك',
                'likes': 'زيادة تفاعل منشوراتك',
                'comments': 'تعليقات إيجابية على منشوراتك',
                'views': 'زيادة مشاهدات الفيديو الخاص بك',
                'shares': 'زيادة مشاركات المحتوى الخاص بك',
                'premium': 'حسابات موثقة ذات جودة عالية',
                'thebig': 'الباقة الشاملة لجميع الخدمات'
            };
            return descriptions[serviceType] || 'خدمة متميزة لحسابك';
        },
        
        // Get service icon
        getServiceIcon(serviceType) {
            const icons = {
                'followers': 'fas fa-user-plus',
                'likes': 'fas fa-heart',
                'comments': 'fas fa-comment',
                'views': 'fas fa-eye',
                'shares': 'fas fa-share',
                'premium': 'fas fa-star',
                'thebig': 'fas fa-crown'
            };
            return icons[serviceType] || 'fas fa-certificate';
        },
        
        // Get platform CSS class for styling
        getPlatformClass(platform) {
            // First check if the platform exists in current service
            if (this.services[this.serviceType].platforms[platform]) {
                const platformData = this.services[this.serviceType].platforms[platform];
                if (platformData.color) {
                    return `bg-white text-[${platformData.color}] border border-[${platformData.color}]`;
                }
            }
            
            // Fallback to default classes
            const classes = {
                'instagram': 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
                'facebook': 'bg-blue-600 text-white',
                'twitter': 'bg-blue-400 text-white',
                'youtube': 'bg-red-600 text-white',
                'tiktok': 'bg-black text-white',
                'linkedin': 'bg-blue-700 text-white'
            };
            return classes[platform] || 'bg-gray-200 text-gray-700';
        },
        
        // Get platform icon
        getPlatformIcon(platform) {
            // First check if the platform exists in current service
            if (this.services[this.serviceType].platforms[platform]) {
                const platformData = this.services[this.serviceType].platforms[platform];
                if (platformData.icon) {
                    return `fab fa-${platformData.icon}`;
                }
            }
            
            // Fallback to default icons
            const icons = {
                'instagram': 'fab fa-instagram',
                'facebook': 'fab fa-facebook-f',
                'twitter': 'fab fa-twitter',
                'youtube': 'fab fa-youtube',
                'tiktok': 'fab fa-tiktok'
            };
            return icons[platform] || 'fas fa-globe';
        },
        
        // Go to payment step
        goToPayment() {
            if (!this.accountUrl) {
                alert('الرجاء إدخال رابط أو اسم الحساب');
                return;
            }
            
            this.step = 2;
            window.scrollTo(0, 0);
        },
        
        // Handle direct payment (without PayPal)
        handleDirectPayment() {
            // Check for customer info
            const name = document.getElementById('customer-name').value;
            const email = document.getElementById('customer-email').value;
            
            if (!name || !email) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // Show loading state on button
            const payButton = document.querySelector('button.gradient-button');
            if (payButton) {
                payButton.disabled = true;
                payButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> جاري معالجة الدفع...';
            }
            
            // Save order to localStorage
            this.saveOrderToLocalStorage();
            
            // Go to success step after a brief delay
            setTimeout(() => {
                this.step = 3;
                window.scrollTo(0, 0);
                
                // Reset button state
                if (payButton) {
                    payButton.disabled = false;
                    payButton.innerHTML = 'إتمام الدفع <span class="mr-2">' + this.formatPrice(this.totalPrice) + '</span>';
                }
            }, 1500);
        },
        
        // Process payment through PayPal or direct
        processPayment() {
            // Check for customer info
            const name = document.getElementById('customer-name').value;
            const email = document.getElementById('customer-email').value;
            
            if (!name || !email) {
                alert('يرجى ملء جميع الحقول المطلوبة');
                return;
            }
            
            // Save order to localStorage
            this.saveOrderToLocalStorage();
            
            // Go directly to success step (for direct payment without PayPal)
            this.step = 3;
            window.scrollTo(0, 0);
        },
        
        // Simulate payment processing
        simulatePayment() {
            // Show loading
            const payButton = document.querySelector('button.gradient-button');
            if (payButton) {
                payButton.disabled = true;
                payButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> جاري معالجة الدفع...';
            }
            
            // Save order to localStorage
            this.saveOrderToLocalStorage();
            
            // Go to success step
            setTimeout(() => {
                this.step = 3;
                window.scrollTo(0, 0);
            }, 1500);
        },
        
        // Save order to localStorage
        saveOrderToLocalStorage() {
            // Check if localStorage is available
            if (!this.isLocalStorageAvailable()) {
                console.error('localStorage is not available. Orders cannot be saved.');
                alert('Your browser does not support saving orders locally. Please enable cookies or use a different browser.');
                return null;
            }
            
            // Use existing or generate order ID
            const orderId = this.orderId || ('TX' + Math.floor(Math.random() * 1000000000));
            this.orderId = orderId;
            
            // Create order object
            const order = {
                id: orderId,
                customerName: document.getElementById('customer-name')?.value || 'Guest User',
                customerEmail: document.getElementById('customer-email')?.value || '',
                service: `${this.getServiceName()} ${this.getPlatformName()}`,
                amount: this.totalPrice,
                currency: this.currency,
                quantity: this.quantity,
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                platform: this.platform,
                accountUrl: this.accountUrl,
                paymentMethod: 'paypal',
                paidAt: new Date().toISOString()
            };
            
            // Get existing orders or initialize empty array
            let orders = [];
            try {
                const storedOrders = localStorage.getItem('dashboard_orders');
                if (storedOrders) {
                    orders = JSON.parse(storedOrders);
                }
            } catch (e) {
                console.error('Error parsing orders:', e);
            }
            
            // Add new order
            orders.push(order);
            
            // Save updated orders
            try {
                localStorage.setItem('dashboard_orders', JSON.stringify(orders));
                localStorage.setItem('current_order_id', orderId);
            } catch (e) {
                console.error('Error saving orders:', e);
            }
            
            console.log('Order saved:', order);
            return order;
        },
        
        // Check if localStorage is available
        isLocalStorageAvailable() {
            try {
                const testKey = '__test_key__';
                localStorage.setItem(testKey, testKey);
                localStorage.removeItem(testKey);
                return true;
            } catch (e) {
                return false;
            }
        },
        
        // Get custom price for service, platform, and quantity
        getCustomPrice(serviceType, platform, quantity) {
            // Find service ID from type
            let serviceId = null;
            for (const id in this.customPricingData) {
                if (this.generateServiceKey(this.customPricingData[id].name) === serviceType) {
                    serviceId = id;
                    break;
                }
            }
            
            if (!serviceId || !this.customPricingData[serviceId]) {
                return null;
            }
            
            const service = this.customPricingData[serviceId];
            
            // Check if service has custom pricing for this platform
            if (service.customPricing && service.customPricing[platform]) {
                const tiers = service.customPricing[platform];
                
                // Find the applicable tier for this quantity
                const applicableTier = tiers.find(tier => 
                    quantity >= tier.minQuantity && 
                    quantity <= tier.maxQuantity && 
                    tier.active !== false
                );
                
                if (applicableTier) {
                    // Calculate price based on the tier
                    return (applicableTier.pricePerUnit / 1000) * quantity;
                }
            }
            
            // Fall back to platform price or base price
            const platformPrice = service.platformPrices && service.platformPrices[platform] ? 
                service.platformPrices[platform] : service.basePrice;
                
            return (platformPrice / 1000) * quantity;
        }
    };
}
