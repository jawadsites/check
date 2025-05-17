/**
 * Orders Dashboard Module (Status Functionality Removed)
 * Handles all operations related to orders management in the dashboard
 */

const ordersDashboard = {
    // State for orders management
    state: {
        orders: [],
        filteredOrders: [],
        activeOrder: null,
        editMode: false,
        initialized: false // إضافة متغير لتتبع ما إذا كانت التهيئة قد تمت بالفعل
    },    // Initialize the orders dashboard
    init: function() {
        console.log('Initializing orders dashboard...');
        // التحقق مما إذا كانت التهيئة قد تمت بالفعل
        if (this.state.initialized) {
            console.log('تم تهيئة لوحة الطلبات مسبقاً');
            return;
        }
        
        // إعادة تعيين متغيرات التصدير
        this._exporting = false;
        window.isExportingOrders = false;
        
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        
        // وضع علامة على أن التهيئة قد تمت
        this.state.initialized = true;
    },

    // Load orders from localStorage or API
    loadOrders: function() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;
        
        // Create filters and search
        const filtersHtml = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="flex flex-wrap justify-between items-center mb-4">
                    <div class="flex items-center mb-4 sm:mb-0">
                        <i class="fas fa-filter text-gray-500 mr-2"></i>
                        <span class="text-gray-700">تصفية:</span>
                        <select id="order-date-filter" class="mr-4 bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">جميع التواريخ</option>
                            <option value="today">اليوم</option>
                            <option value="week">هذا الأسبوع</option>
                            <option value="month">هذا الشهر</option>
                        </select>
                    </div>
                    <div class="relative w-full sm:w-auto">
                        <input type="text" id="order-search" placeholder="بحث عن طلب..." class="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-500"></i>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="dashboard-table" id="orders-table">
                        <thead>
                            <tr>
                                <th class="text-right">رقم الطلب</th>
                                <th class="text-right">العميل</th>
                                <th class="text-right">الخدمة</th>
                                <th class="text-right">المبلغ</th>
                                <th class="text-right">التاريخ</th>
                                <th class="text-right">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="orders-list"></tbody>
                    </table>
                </div>
            </div>
        `;
        
        ordersContainer.innerHTML = filtersHtml;
        this.populateOrdersTable();
    },

    // Save orders to localStorage
    saveOrders: function() {
        localStorage.setItem('dashboard_orders', JSON.stringify(this.state.orders));
    },

    // Get default orders for initialization
    getDefaultOrders: function() {
        return [
            {
                id: 'TX983712648',
                customerName: 'أحمد محمد',
                customerEmail: 'ahmed@example.com',
                service: 'متابعين انستغرام',
                amount: 25.00,
                currency: 'USD',
                quantity: 500,
                date: '2025-05-14',
                platform: 'instagram',
                accountUrl: '@ahmed_mohamed',
                paymentMethod: 'paypal',
                notes: ''
            },
            {
                id: 'TX983712647',
                customerName: 'سارة أحمد',
                customerEmail: 'sara@example.com',
                service: 'لايكات فيسبوك',
                amount: 15.00,
                currency: 'USD',
                quantity: 500,
                date: '2025-05-14',
                platform: 'facebook',
                accountUrl: 'facebook.com/sara.ahmed',
                paymentMethod: 'paypal',
                notes: ''
            },
            {
                id: 'TX983712646',
                customerName: 'خالد عبدالله',
                customerEmail: 'khaled@example.com',
                service: 'مشاهدات يوتيوب',
                amount: 40.00,
                currency: 'USD',
                quantity: 4000,
                date: '2025-05-13',
                platform: 'youtube',
                accountUrl: 'youtube.com/watch?v=xyz123',
                paymentMethod: 'paypal',
                notes: 'طلب استعجال التنفيذ'
            },
            {
                id: 'TX983712645',
                customerName: 'فاطمة علي',
                customerEmail: 'fatima@example.com',
                service: 'متابعين تيك توك',
                amount: 35.00,
                currency: 'USD',
                quantity: 1000,
                date: '2025-05-12',
                platform: 'tiktok',
                accountUrl: '@fatima_ali',
                paymentMethod: 'paypal',
                notes: ''
            },
            {
                id: 'TX983712644',
                customerName: 'محمد أحمد',
                customerEmail: 'mohammed@example.com',
                service: 'لايكات تيك توك',
                amount: 20.00,
                currency: 'USD',
                quantity: 700,
                date: '2025-05-11',
                platform: 'tiktok',
                accountUrl: '@mohammed_ahmed',
                paymentMethod: 'paypal',
                notes: ''
            },
            {
                id: 'TX983712643',
                customerName: 'عمر محمود',
                customerEmail: 'omar@example.com',
                service: 'تعليقات انستغرام',
                amount: 45.00,
                currency: 'USD',
                quantity: 150,
                date: '2025-05-10',
                platform: 'instagram',
                accountUrl: '@omar_mahmoud',
                paymentMethod: 'paypal',
                notes: 'تم إلغاء الطلب بواسطة العميل'
            },
            {
                id: 'TX983712642',
                customerName: 'لينا محمد',
                customerEmail: 'lina@example.com',
                service: 'إعجابات انستغرام',
                amount: 18.00,
                currency: 'USD',
                quantity: 600,
                date: '2025-05-09',
                platform: 'instagram',
                accountUrl: 'instagram.com/p/xyz123',
                paymentMethod: 'paypal',
                notes: ''
            }
        ];
    },    // Setup event listeners
    setupEventListeners: function() {
        // Setup search filter
        this.setupSearchFilter();
        
        // إزالة جميع مستمعات أحداث التصدير قبل إضافة جديدة
        const exportOrdersBtn = document.getElementById('export-orders-btn');
        if (exportOrdersBtn) {
            // إزالة جميع مستمعات أحداث التصدير السابقة
            const oldExportFunc = this._exportHandler;
            if (oldExportFunc) {
                exportOrdersBtn.removeEventListener('click', oldExportFunc);
            }
            
            // حفظ مرجع للدالة المرتبطة حتى نتمكن من إزالتها لاحقًا
            this._exportHandler = this.exportOrders.bind(this);
            
            // إضافة مستمع التصدير الجديد
            exportOrdersBtn.addEventListener('click', this._exportHandler);
            
            console.log('تم إعداد مستمع حدث التصدير');
        }
    },

    // Setup search filter
    setupSearchFilter: function() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;

        const filterHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex flex-wrap items-center justify-between">
                    <div class="mt-4 lg:mt-0">
                        <input type="text" id="order-search" placeholder="بحث عن طلب..." class="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
            </div>
        `;

        if (ordersContainer.innerHTML.indexOf('order-search') === -1) {
            ordersContainer.innerHTML = filterHTML + ordersContainer.innerHTML;
        }

        // Add event listener for search
        const orderSearch = document.getElementById('order-search');
        if (orderSearch) {
            orderSearch.addEventListener('input', this.handleOrderSearch.bind(this));
        }
    },    // Handle order search
    handleOrderSearch: function(e) {
        const searchQuery = e.target.value.toLowerCase();
        
        if (searchQuery) {
            this.state.filteredOrders = this.state.orders.filter(order => 
                order.id.toLowerCase().includes(searchQuery) ||
                order.customerName.toLowerCase().includes(searchQuery) ||
                order.service.toLowerCase().includes(searchQuery) ||
                order.platform.toLowerCase().includes(searchQuery)
            );
        } else {
            this.state.filteredOrders = [...this.state.orders];
        }
        
        this.renderOrders();
    },    // Delete an order
    deleteOrder: function(orderId) {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            // Delete order
            this.state.orders = this.state.orders.filter(order => order.id !== orderId);
            
            this.saveOrders();
            this.loadOrders(); // Reload and sort
            
            // Show notification in dashboard
            this.showNotification(`تم حذف الطلب ${orderId} بنجاح`, 'warning');
            
            // Update dashboard if needed
            if (typeof socialDashboard !== 'undefined' && typeof socialDashboard.updateDashboardData === 'function') {
                socialDashboard.updateDashboardData();
            }
        }
    },    // Create a new order with notification integration
    createOrder: function(orderData) {
        // Generate a unique Order ID
        const orderId = 'TX' + Date.now().toString().substring(3);
        
        // Set additional order data
        const newOrder = {
            id: orderId,
            date: new Date().toISOString().split('T')[0],
            ...orderData
        };
        
        // Add the order to the state
        this.state.orders.unshift(newOrder);
        this.state.filteredOrders = [...this.state.orders];
        
        // Save to storage
        this.saveOrders();
        
        // Show notification
        this.showNotification(`تم إنشاء طلب جديد برقم ${orderId}`, 'success');
        
        return newOrder;
    },

    // View order details
    viewOrderDetails: function(orderId) {
        const order = this.state.orders.find(order => order.id === orderId);
        if (!order) {
            this.showNotification('لم يتم العثور على الطلب المطلوب', 'error');
            return;
        }
        
        // Construct order details message
        const orderDetails = `
            رقم الطلب: ${order.id}
            العميل: ${order.customerName} (${order.customerEmail})
            الخدمة: ${order.service}
            المنصة: ${this.getPlatformName(order.platform)}
            الكمية: ${order.quantity.toLocaleString()}
            المبلغ: ${order.currency} ${order.amount.toFixed(2)}
            تاريخ الطلب: ${this.formatDate(order.date)}
            رابط الحساب: ${order.accountUrl}
            طريقة الدفع: ${order.paymentMethod}
            ${order.notes ? `ملاحظات: ${order.notes}` : ''}
        `;
        
        alert(orderDetails);
    },    // Export orders to CSV
    exportOrders: function() {
        // تحقق من منع التنفيذ المتكرر باستخدام متغير عام
        if (window.isExportingOrders === true) {
            console.log('عملية التصدير جارية بالفعل');
            return;
        }
        
        // تعيين علامة التصدير على مستوى النافذة
        window.isExportingOrders = true;
        
        // استخدام خاصية على المثيل أيضًا للمزيد من التأكيد
        this._exporting = true;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add CSV headers
        csvContent += "رقم الطلب,العميل,البريد الإلكتروني,الخدمة,الكمية,المبلغ,العملة,التاريخ,المنصة,رابط الحساب,طريقة الدفع,ملاحظات\n";
        
        // Add order data
        this.state.filteredOrders.forEach(order => {
            const row = [
                order.id,
                order.customerName,
                order.customerEmail,
                order.service,
                order.quantity,
                order.amount,
                order.currency,
                order.date,
                order.platform,
                order.accountUrl,
                order.paymentMethod,
                order.notes
            ].join(',');
            csvContent += row + "\n";
        });
        
        // استخدام ميزة URL.createObjectURL بدلاً من encodeURI فقط
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "orders_" + new Date().toISOString().split('T')[0] + ".csv");
        
        // إضافة وإزالة العنصر من المستند بطريقة أكثر أمانًا
        document.body.appendChild(link);
        
        // استخدام setTimeout للتأكد من عدم حدوث التنزيلات المتتالية
        setTimeout(() => {
            link.click();
            
            // نظف دائمًا مصادر URL لتجنب تسرب الذاكرة
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                // عرض الإشعار وإعادة تعيين العلامات
                this.showNotification('تم تصدير بيانات الطلبات بنجاح', 'success');
                
                // تأخير إعادة تعيين العلامات للتأكد من عدم بدء عملية تصدير جديدة قبل انتهاء التنزيل
                setTimeout(() => {
                    window.isExportingOrders = false;
                    this._exporting = false;
                }, 1000);
            }, 100);
        }, 100);
    },    // Show notification    showNotification: function(message, type = 'info') {
        // Prevent duplicate or rapid-fire notifications
        const now = Date.now();
        if (this.lastNotificationTime && now - this.lastNotificationTime < 1000) {
            console.log('Notification throttled:', message);
            return; // Throttle notifications that happen too quickly
        }
        
        this.lastNotificationTime = now;
        
        // Use simple alert to avoid any circular reference issues
        alert(message);
    },
    },

    // Render orders in the container
    renderOrders: function() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;
        
        // Check if the container already has the filter
        let tableContainer = null;
        if (ordersContainer.querySelector('table')) {
            tableContainer = ordersContainer.querySelector('table').parentNode;
        } else {
            tableContainer = document.createElement('div');
            tableContainer.className = 'bg-white rounded-lg shadow-md overflow-hidden';
            ordersContainer.appendChild(tableContainer);
        }
        
        if (this.state.filteredOrders.length === 0) {
            tableContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-xl">لم يتم العثور على طلبات</p>
                </div>
            `;
            return;
        }
          let tableHTML = `
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الخدمة</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المبلغ</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
        `;
        
        this.state.filteredOrders.forEach(order => {
            tableHTML += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${order.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.customerName}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="flex items-center">
                            <i class="${this.getPlatformIcon(order.platform)} text-blue-600 ml-2"></i>
                            ${order.service}
                        </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${order.quantity.toLocaleString()}</td>
                    <td class="px-6 py-4 whitespace-nowrap font-medium">${order.currency} ${order.amount.toFixed(2)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${this.formatDate(order.date)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <div class="flex space-x-2 space-x-reverse">
                            <button class="text-blue-600 hover:text-blue-900" onclick="ordersDashboard.viewOrderDetails('${order.id}')">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="text-red-600 hover:text-red-900" onclick="ordersDashboard.deleteOrder('${order.id}')">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        tableContainer.innerHTML = tableHTML;
    },

    // Get platform icon class
    getPlatformIcon: function(platform) {
        const icons = {
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook-f',
            'twitter': 'fab fa-twitter',
            'youtube': 'fab fa-youtube',
            'tiktok': 'fab fa-tiktok'
        };
        return icons[platform] || 'fas fa-globe';
    },

    // Get platform name translation
    getPlatformName: function(platform) {
        const names = {
            'instagram': 'انستغرام',
            'facebook': 'فيسبوك',
            'twitter': 'تويتر',
            'youtube': 'يوتيوب',
            'tiktok': 'تيك توك'
        };
        return names[platform] || platform;
    },

    // Format date for display
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('ar-EG', options);
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    if (typeof ordersDashboard !== 'undefined') {
        ordersDashboard.init();
    }
});
