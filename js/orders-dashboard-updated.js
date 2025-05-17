/**
 * Orders Dashboard Module
 * Handles all operations related to orders management in the dashboard
 */

const ordersDashboard = {
    // State for orders management
    state: {
        orders: [],
        filteredOrders: [],
        activeOrder: null,
        editMode: false,
        filterStatus: 'all'
    },

    // Initialize the orders dashboard
    init: function() {
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
    },

    // Load orders from localStorage or API
    loadOrders: function() {
        const storedOrders = localStorage.getItem('dashboard_orders');
        if (storedOrders) {
            try {
                this.state.orders = JSON.parse(storedOrders);
                this.state.filteredOrders = [...this.state.orders];
            } catch (e) {
                console.error('Error parsing stored orders:', e);
                this.state.orders = this.getDefaultOrders();
                this.state.filteredOrders = [...this.state.orders];
            }
        } else {
            this.state.orders = this.getDefaultOrders();
            this.state.filteredOrders = [...this.state.orders];
            this.saveOrders();
        }

        // Sort orders by date (most recent first)
        this.state.orders.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.state.filteredOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
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
                status: 'completed',
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
                status: 'inProgress',
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
                status: 'processing',
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
                status: 'pending',
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
                status: 'completed',
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
                status: 'cancelled',
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
                status: 'completed',
                platform: 'instagram',
                accountUrl: 'instagram.com/p/xyz123',
                paymentMethod: 'paypal',
                notes: ''
            }
        ];
    },

    // Setup event listeners
    setupEventListeners: function() {
        this.setupStatusFilter();
        
        const addOrderBtn = document.getElementById('add-order-btn');
        if (addOrderBtn) {
            addOrderBtn.addEventListener('click', this.showAddOrderModal.bind(this));
        }
        
        const exportOrdersBtn = document.getElementById('export-orders-btn');
        if (exportOrdersBtn) {
            exportOrdersBtn.addEventListener('click', this.exportOrders.bind(this));
        }
    },

    // Setup status filter dropdown
    setupStatusFilter: function() {
        const ordersContainer = document.getElementById('orders-container');
        if (!ordersContainer) return;

        const filterHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                <div class="flex flex-wrap items-center justify-between">
                    <div class="flex items-center space-x-4 space-x-reverse">
                        <span class="text-gray-700">تصفية حسب الحالة:</span>
                        <select id="order-status-filter" class="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            <option value="all">جميع الطلبات</option>
                            <option value="completed">مكتملة</option>
                            <option value="processing">قيد المعالجة</option>
                            <option value="inProgress">قيد التنفيذ</option>
                            <option value="pending">معلقة</option>
                            <option value="cancelled">ملغاة</option>
                        </select>
                    </div>
                    <div class="mt-4 lg:mt-0">
                        <input type="text" id="order-search" placeholder="بحث عن طلب..." class="bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
            </div>
        `;

        if (ordersContainer.innerHTML.indexOf('order-status-filter') === -1) {
            ordersContainer.innerHTML = filterHTML + ordersContainer.innerHTML;
        }

        // Add event listener for status filter
        const statusFilter = document.getElementById('order-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', this.handleStatusFilter.bind(this));
        }

        // Add event listener for search
        const orderSearch = document.getElementById('order-search');
        if (orderSearch) {
            orderSearch.addEventListener('input', this.handleOrderSearch.bind(this));
        }
    },

    // Handle status filter
    handleStatusFilter: function(e) {
        const status = e.target.value;
        this.state.filterStatus = status;
        
        if (status === 'all') {
            this.state.filteredOrders = [...this.state.orders];
        } else {
            this.state.filteredOrders = this.state.orders.filter(order => order.status === status);
        }
        
        this.renderOrders();
    },

    // Handle order search
    handleOrderSearch: function(e) {
        const searchQuery = e.target.value.toLowerCase();
        
        // First filter by status (if applicable)
        let baseFiltered = this.state.filterStatus === 'all' 
            ? [...this.state.orders] 
            : this.state.orders.filter(order => order.status === this.state.filterStatus);
        
        // Then filter by search query
        if (searchQuery) {
            this.state.filteredOrders = baseFiltered.filter(order => 
                order.id.toLowerCase().includes(searchQuery) ||
                order.customerName.toLowerCase().includes(searchQuery) ||
                order.service.toLowerCase().includes(searchQuery) ||
                order.platform.toLowerCase().includes(searchQuery)
            );
        } else {
            this.state.filteredOrders = baseFiltered;
        }
        
        this.renderOrders();
    },

    // Show add order modal
    showAddOrderModal: function() {
        // In a real implementation, this would show a modal to add a new order
        // For the demo, we'll just create a random order
        
        this.createRandomOrder();
    },

    // Create a random order for demo purposes
    createRandomOrder: function() {
        const platforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];
        const services = {
            'instagram': 'متابعين انستغرام',
            'facebook': 'لايكات فيسبوك',
            'twitter': 'متابعين تويتر',
            'youtube': 'مشاهدات يوتيوب',
            'tiktok': 'متابعين تيك توك'
        };
        
        const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
        const randomService = services[randomPlatform];
        const randomQuantity = Math.floor(Math.random() * 900) + 100;
        const randomAmount = (randomQuantity / 100) * (3 + Math.random() * 5);
        
        const newOrder = {
            customerName: 'عميل جديد',
            customerEmail: 'newcustomer@example.com',
            service: randomService,
            amount: parseFloat(randomAmount.toFixed(2)),
            currency: 'USD',
            quantity: randomQuantity,
            platform: randomPlatform,
            accountUrl: '@new_customer',
            paymentMethod: 'paypal',
            notes: 'طلب تجريبي'
        };
        
        // Use the integrated order creation method
        this.createOrder(newOrder);
        this.renderOrders();
    },

    // Update order status
    updateOrderStatus: function(orderId, newStatus) {
        const orderIndex = this.state.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            this.state.orders[orderIndex].status = newStatus;
            
            this.saveOrders();
            this.loadOrders(); // Reload and sort
            
            // Show notification in dashboard
            this.showNotification(`تم تحديث حالة الطلب ${orderId} إلى ${this.getStatusText(newStatus)}`, 'info');
            
            // Create a notification using notification system
            if (typeof notificationSystem !== 'undefined') {
                const order = this.state.orders[orderIndex];
                const notification = {
                    title: 'تحديث حالة الطلب',
                    message: `تم تحديث حالة الطلب ${order.id} إلى "${this.getStatusText(newStatus)}"`,
                    type: 'order',
                    data: { orderId: order.id }
                };
                notificationSystem.addNotification(notification);
            }
        }
    },

    // Delete an order
    deleteOrder: function(orderId) {
        if (confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
            // Find order before deleting for notification
            const order = this.state.orders.find(order => order.id === orderId);
            
            // Delete order
            this.state.orders = this.state.orders.filter(order => order.id !== orderId);
            
            this.saveOrders();
            this.loadOrders(); // Reload and sort
            
            // Show notification in dashboard
            this.showNotification(`تم حذف الطلب ${orderId} بنجاح`, 'warning');
            
            // Create a notification using notification system
            if (typeof notificationSystem !== 'undefined' && order) {
                const notification = {
                    title: 'حذف طلب',
                    message: `تم حذف الطلب ${orderId} (${order.service})`,
                    type: 'order',
                    data: { orderId: orderId }
                };
                notificationSystem.addNotification(notification);
            }
            
            // Update dashboard if needed
            if (typeof socialDashboard !== 'undefined' && typeof socialDashboard.updateDashboardData === 'function') {
                socialDashboard.updateDashboardData();
            }
        }
    },

    // Create a new order
    createOrder: function(orderData) {
        // Generate a unique order ID
        const orderId = 'TX' + Math.floor(Math.random() * 900000000 + 100000000);
        
        // Create the new order object
        const newOrder = {
            id: orderId,
            customerName: orderData.customerName,
            customerEmail: orderData.customerEmail,
            service: orderData.service,
            amount: orderData.amount,
            currency: orderData.currency || 'USD',
            quantity: orderData.quantity,
            date: new Date().toISOString().split('T')[0],
            status: orderData.status || 'pending',
            platform: orderData.platform,
            accountUrl: orderData.accountUrl,
            paymentMethod: orderData.paymentMethod || 'paypal',
            notes: orderData.notes || ''
        };
        
        // Add the order to the state
        this.state.orders.unshift(newOrder);
        this.state.filteredOrders = [...this.state.orders];
        
        // Save to storage
        this.saveOrders();
        
        // Show notification
        this.showNotification(`تم إنشاء طلب جديد برقم ${orderId}`, 'success');
        
        // Create a notification
        if (typeof notificationSystem !== 'undefined') {
            const notification = {
                title: 'طلب جديد',
                message: `تم استلام طلب جديد برقم ${orderId}`,
                type: 'order',
                data: { orderId: orderId }
            };
            notificationSystem.addNotification(notification);
        }
        
        // Update dashboard if needed
        if (typeof socialDashboard !== 'undefined' && typeof socialDashboard.updateDashboardData === 'function') {
            socialDashboard.updateDashboardData();
        }
        
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
            الحالة: ${this.getStatusText(order.status)}
            رابط الحساب: ${order.accountUrl}
            طريقة الدفع: ${order.paymentMethod}
            ${order.notes ? `ملاحظات: ${order.notes}` : ''}
        `;
        
        alert(orderDetails);
    },

    // Export orders to CSV
    exportOrders: function() {
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
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "orders_" + new Date().toISOString().split('T')[0] + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('تم تصدير بيانات الطلبات بنجاح', 'success');
    },

    // Show notification    showNotification: function(message, type = 'info') {
        // Use direct alert to prevent circular references
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
            const statusClass = this.getStatusClass(order.status);
            const statusText = this.getStatusText(order.status);
            
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
                            <div class="relative inline-block text-left" x-data="{ open: false }">
                                <button @click="open = !open" class="text-gray-600 hover:text-gray-900">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div @click.away="open = false" x-show="open" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10" style="display: none;">
                                    <div class="py-1">
                                        <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onclick="ordersDashboard.updateOrderStatus('${order.id}', 'completed')">
                                            تحديث إلى: مكتمل
                                        </a>
                                        <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onclick="ordersDashboard.updateOrderStatus('${order.id}', 'processing')">
                                            تحديث إلى: قيد المعالجة
                                        </a>
                                        <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onclick="ordersDashboard.updateOrderStatus('${order.id}', 'inProgress')">
                                            تحديث إلى: قيد التنفيذ
                                        </a>
                                        <a href="#" class="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100" onclick="ordersDashboard.updateOrderStatus('${order.id}', 'cancelled')">
                                            تحديث إلى: ملغي
                                        </a>
                                    </div>
                                    <div class="py-1">
                                        <a href="#" class="text-red-700 block px-4 py-2 text-sm hover:bg-gray-100" onclick="ordersDashboard.deleteOrder('${order.id}')">
                                            حذف الطلب
                                        </a>
                                    </div>
                                </div>
                            </div>
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

    // Get status class for styling
    getStatusClass: function(status) {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inProgress':
                return 'bg-indigo-100 text-indigo-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    },

    // Get status text translation
    getStatusText: function(status) {
        switch (status) {
            case 'completed':
                return 'مكتمل';
            case 'processing':
                return 'قيد المعالجة';
            case 'pending':
                return 'معلق';
            case 'inProgress':
                return 'قيد التنفيذ';
            case 'cancelled':
                return 'ملغي';
            default:
                return 'غير محدد';
        }
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
        return date.toLocaleDateString('ar-SA', options);
    }
};

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    ordersDashboard.init();
});
