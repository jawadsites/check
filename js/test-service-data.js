/**
 * Add Test Service Data
 * This file adds functionality to generate test service data
 */

// Add function to the socialDashboard object
socialDashboard.addTestServiceData = function() {
    // Get existing services
    let services = this.loadServices();
    
    // If we already have services, just enhance them with sales data
    if (services.length > 0) {
        // Update services with random sales data if not already present
        services.forEach(service => {
            if (!service.hasOwnProperty('sales')) {
                service.sales = Math.floor(Math.random() * 50) + 10;
            }
            
            if (!service.hasOwnProperty('trend')) {
                service.trend = Math.random() > 0.5 ? 'up' : 'down';
            }
            
            if (!service.hasOwnProperty('trendPercentage')) {
                service.trendPercentage = Math.floor(Math.random() * 30) + 5;
            }
        });
          // Save updated services using serviceUtils if available
        if (typeof serviceUtils !== 'undefined') {
            serviceUtils.saveServices(services);
        } else {
            // Fallback to direct localStorage
            localStorage.setItem('dashboard_services', JSON.stringify(services));
        }
        
        // Update visualizations
        this.renderServicesSummary();
        this.renderTopServicesChart();
        
        console.log('Test service data updated:', services);
        this.showNotification('تم تحديث بيانات الخدمات للتجربة', 'success');
        
        return services;
    }
    
    // If no services exist, create default ones
    services = [
        {
            id: 1,
            name: 'متابعين انستغرام',
            description: 'إضافة متابعين حقيقيين لحسابات انستغرام بشكل آمن.',
            platforms: ['instagram'],
            basePrice: 5.00,
            minQuantity: 100,
            maxQuantity: 10000,
            active: true,
            sales: 68,
            trend: 'up',
            trendPercentage: 12,
            dateCreated: new Date().toISOString()
        },
        {
            id: 2,
            name: 'لايكات فيسبوك',
            description: 'زيادة الإعجابات على منشورات وصور فيسبوك.',
            platforms: ['facebook'],
            basePrice: 3.00,
            minQuantity: 50,
            maxQuantity: 5000,
            active: true,
            sales: 42,
            trend: 'up',
            trendPercentage: 8,
            dateCreated: new Date().toISOString()
        },
        {
            id: 3,
            name: 'مشاهدات يوتيوب',
            description: 'زيادة عدد المشاهدات للفيديوهات على يوتيوب.',
            platforms: ['youtube'],
            basePrice: 2.00,
            minQuantity: 100,
            maxQuantity: 50000,
            active: true,
            sales: 55,
            trend: 'up',
            trendPercentage: 15,
            dateCreated: new Date().toISOString()
        },
        {
            id: 4,
            name: 'متابعين تيك توك',
            description: 'زيادة متابعين تيك توك بشكل آمن وفعال.',
            platforms: ['tiktok'],
            basePrice: 4.00,
            minQuantity: 100,
            maxQuantity: 10000,
            active: true,
            sales: 35,
            trend: 'up',
            trendPercentage: 20,
            dateCreated: new Date().toISOString()
        },
        {
            id: 5,
            name: 'تعليقات انستغرام',
            description: 'إضافة تعليقات إيجابية على منشورات انستغرام.',
            platforms: ['instagram'],
            basePrice: 10.00,
            minQuantity: 10,
            maxQuantity: 1000,
            active: true,
            sales: 22,
            trend: 'up',
            trendPercentage: 5,
            dateCreated: new Date().toISOString()
        }
    ];
      // Save services using serviceUtils if available
    if (typeof serviceUtils !== 'undefined') {
        serviceUtils.saveServices(services);
    } else {
        // Fallback to direct localStorage
        localStorage.setItem('dashboard_services', JSON.stringify(services));
    }
    
    // Also update servicesDashboard if available
    if (typeof servicesDashboard !== 'undefined' && servicesDashboard.state) {
        servicesDashboard.state.services = services;
        if (typeof servicesDashboard.renderServices === 'function') {
            servicesDashboard.renderServices();
        }
    }
    
    // Update visualizations
    this.renderServicesSummary();
    this.renderTopServicesChart();
    
    console.log('Test service data created:', services);
    this.showNotification('تم إنشاء بيانات خدمات للتجربة', 'success');
    
    return services;
};

// Add function to generate test currency distribution data
socialDashboard.addTestCurrencyData = function() {
    // Get existing orders
    let orders = this.loadOrders();
    
    // If we have orders, update their currency distribution
    if (orders.length > 0) {
        // Available currencies with their distribution
        const currencies = [
            { code: 'USD', weight: 40 },  // 40% chance
            { code: 'EUR', weight: 25 },  // 25% chance
            { code: 'SAR', weight: 15 },  // 15% chance
            { code: 'AED', weight: 10 },  // 10% chance
            { code: 'EGP', weight: 5 },   // 5% chance
            { code: 'GBP', weight: 5 }    // 5% chance
        ];
        
        // Update orders with random currency data
        orders.forEach(order => {
            // Randomly select a currency based on weight
            const totalWeight = currencies.reduce((sum, curr) => sum + curr.weight, 0);
            let random = Math.random() * totalWeight;
            let selectedCurrency = currencies[0].code;
            
            for (const currency of currencies) {
                random -= currency.weight;
                if (random <= 0) {
                    selectedCurrency = currency.code;
                    break;
                }
            }
            
            // Update order currency
            order.currency = selectedCurrency;
        });
        
        // Save updated orders to localStorage
        localStorage.setItem('dashboard_orders', JSON.stringify(orders));
        
        // Update currency distribution chart
        this.renderCurrencyDistribution();
        
        console.log('Test currency data updated in orders:', orders);
        this.showNotification('تم تحديث بيانات العملات للتجربة', 'success');
        
        return orders;
    }
    
    // If no orders exist, use addTestOrder functionality to create some
    this.addTestOrder();
    this.addTestOrder();
    this.addTestOrder();
    
    // Then apply currency distribution to the new orders
    return this.addTestCurrencyData();
};

// Add function to ensure we have service data
socialDashboard.ensureServiceData = function() {
    // Load existing services
    const services = this.loadServices();
    
    // If no services data exists, create test data
    if (services.length === 0) {
        console.log('No service data found, creating test data...');
        this.addTestServiceData();
    }
};

// Add function to ensure we have currency data
socialDashboard.ensureCurrencyData = function() {
    // Load existing orders
    const orders = this.loadOrders();
    
    // Check if orders have currency data
    let hasCurrencyData = false;
    if (orders.length > 0) {
        hasCurrencyData = orders.some(order => order.currency !== undefined);
    }
    
    // If no currency data exists, create test data
    if (!hasCurrencyData) {
        console.log('No currency data found, creating test data...');
        this.addTestCurrencyData();
    }
};

// Add event listener to run once when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Ensure we have service and currency data for visualizations
    setTimeout(function() {
        if (typeof socialDashboard !== 'undefined') {
            socialDashboard.ensureServiceData();
            socialDashboard.ensureCurrencyData();
        }
    }, 1000); // Wait for 1 second to ensure dashboard is fully loaded
});
