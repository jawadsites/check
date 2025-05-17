/**
 * Add Test Order Function
 * This function creates a test order and adds it to localStorage
 */

// Add this function to the socialDashboard object
socialDashboard.addTestOrder = function() {
    // Get existing orders
    let orders = [];
    const storedOrders = localStorage.getItem('dashboard_orders');
    
    if (storedOrders) {
        try {
            orders = JSON.parse(storedOrders);
        } catch (e) {
            console.error('Error parsing orders:', e);
            orders = this.getDefaultOrders();
        }
    } else {
        orders = this.getDefaultOrders();
    }
    
    // Generate a unique order ID
    const orderId = 'TX' + Math.floor(100000000 + Math.random() * 900000000);
    
    // Generate random service and amount
    const services = ['متابعين انستغرام', 'لايكات فيسبوك', 'مشاهدات يوتيوب', 'لايكات تيك توك'];
    const platforms = ['instagram', 'facebook', 'youtube', 'tiktok'];
    const serviceIndex = Math.floor(Math.random() * services.length);
    
    const amounts = [10.00, 15.00, 25.00, 30.00, 50.00];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];
    
    const quantities = [100, 200, 500, 1000, 2000];
    const quantity = quantities[Math.floor(Math.random() * quantities.length)];
    
    // Create new test order
    const newOrder = {
        id: orderId,
        customerName: 'عميل اختبار',
        customerEmail: 'test' + Math.floor(Math.random() * 100) + '@example.com',
        service: services[serviceIndex],
        amount: amount,
        currency: 'USD',
        quantity: quantity,
        date: new Date().toISOString().split('T')[0],
        status: 'processing',
        platform: platforms[serviceIndex],
        accountUrl: '@test_account',
        paymentMethod: 'paypal',
        notes: 'طلب اختبار تم إنشاؤه للتجربة'
    };
    
    // Add to beginning of orders array
    orders.unshift(newOrder);
      // Save to localStorage
    localStorage.setItem('dashboard_orders', JSON.stringify(orders));
    
    // Refresh stats and service visualizations
    this.loadStats();
    this.loadRecentOrders();
    this.renderServicesSummary();
    this.renderTopServicesChart();
    
    console.log('Test order added:', newOrder);
    this.showNotification('تم إضافة طلب اختبار بنجاح', 'success');
    
    return newOrder;
};

// Add event listener for the add test order button
document.addEventListener('DOMContentLoaded', function() {
    const addTestOrderBtn = document.getElementById('add-test-order');
    if (addTestOrderBtn) {
        addTestOrderBtn.addEventListener('click', function() {
            socialDashboard.addTestOrder();
        });
    }
});
