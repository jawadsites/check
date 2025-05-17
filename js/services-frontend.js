// مكوّن عرض الخدمات في الواجهة الأمامية

const servicesFrontend = (() => {
    // تهيئة النظام
    const init = () => {
        // تحميل وعرض الخدمات من localStorage فقط
        loadServicesFromLocalStorage();
        
        console.log('تم تهيئة مكوّن عرض الخدمات في الواجهة الأمامية');
    };
    
    // تحميل الخدمات من localStorage.social_services فقط
    const loadServicesFromLocalStorage = () => {
        // الحصول على الخدمات من localStorage
        let services = [];
        
        try {
            // الحصول على الخدمات المخزنة في localStorage.social_services
            const storedServices = localStorage.getItem('social_services');
            
            if (storedServices) {
                // تحويل البيانات من JSON إلى كائنات JavaScript
                services = JSON.parse(storedServices);
                
                // الحصول على قائمة المنصات المتاحة
                const platforms = JSON.parse(localStorage.getItem('social_platforms') || '[]');
                const platformIds = platforms.map(platform => platform.id);
                
                // تصفية الخدمات:
                // 1. يجب أن تكون الخدمة نشطة (active === true)
                // 2. يجب أن تكون المنصة موجودة في social_platforms
                services = services.filter(service => 
                    service.active === true && 
                    platformIds.includes(service.platformId)
                );
                
                console.log(`تم تحميل ${services.length} خدمة من localStorage.social_services`);
            } else {
                console.log('لم يتم العثور على أي خدمات في localStorage.social_services');
            }
        } catch (error) {
            console.error('خطأ أثناء تحميل الخدمات من localStorage:', error);
        }
        
        // عرض الخدمات في الواجهة
        renderServices(services);
    };
    
    // عرض الخدمات في الواجهة
    const renderServices = (services) => {
        const container = document.getElementById('services-container');
        if (!container) return;
        
        // تفريغ الحاوية
        container.innerHTML = '';
        
        // التحقق من وجود خدمات
        if (!services || services.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center p-8">
                    <div class="text-gray-400 mb-4"><i class="fas fa-box-open text-4xl"></i></div>
                    <h3 class="text-xl font-bold text-gray-700">لا توجد خدمات متاحة حالياً</h3>
                    <p class="text-gray-500 mt-2">يرجى التحقق من إعدادات الخدمات في لوحة التحكم.</p>
                </div>
            `;
            return;
        }
        
        // تجميع الخدمات حسب المنصة
        const servicesByPlatform = {};
        
        services.forEach(service => {
            if (!servicesByPlatform[service.platformId]) {
                servicesByPlatform[service.platformId] = [];
            }
            servicesByPlatform[service.platformId].push(service);
        });
        
        // عرض الخدمات لكل منصة
        Object.keys(servicesByPlatform).forEach(platformId => {
            const platform = getPlatformById(platformId);
            if (!platform) return;
            
            // إنشاء قسم المنصة
            const platformSection = document.createElement('div');
            platformSection.className = 'mb-10';
            platformSection.innerHTML = `
                <div class="flex items-center mb-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center mr-3" style="background-color: ${hexToRgba(platform.color, 0.15)}">
                        <i class="fab fa-${platform.icon} text-xl" style="color: ${platform.color}"></i>
                    </div>
                    <h2 class="text-xl font-bold">${platform.name}</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 services-grid"></div>
            `;
            
            const servicesGrid = platformSection.querySelector('.services-grid');
            
            // إضافة بطاقات الخدمات
            servicesByPlatform[platformId].forEach(service => {
                const serviceCard = document.createElement('div');
                serviceCard.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 border border-gray-100';
                serviceCard.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-blue-900">${service.name}</h3>
                        <span class="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                            ${formatPrice(service.price)}
                        </span>
                    </div>
                    <p class="text-gray-600 text-sm mb-4">${service.description || 'لا يوجد وصف'}</p>
                    <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <div>
                            <i class="fas fa-sort-numeric-up mr-1"></i> الحد الأدنى: ${service.minQuantity}
                        </div>
                        <div>
                            <i class="fas fa-sort-numeric-down mr-1"></i> الحد الأقصى: ${service.maxQuantity}
                        </div>
                    </div>
                    <button class="order-service-btn w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition" data-id="${service.id}">
                        <i class="fas fa-shopping-cart mr-2"></i> طلب الخدمة
                    </button>
                `;
                
                servicesGrid.appendChild(serviceCard);
            });
            
            container.appendChild(platformSection);
        });
        
        // تفعيل أزرار الطلب
        attachOrderButtonEvents();
    };
    
    // الحصول على معلومات المنصة بواسطة المعرف
    const getPlatformById = (platformId) => {
        try {
            const platforms = JSON.parse(localStorage.getItem('social_platforms') || '[]');
            return platforms.find(platform => platform.id === platformId);
        } catch (error) {
            console.error('خطأ أثناء الحصول على معلومات المنصة:', error);
            return null;
        }
    };
    
    // تنسيق السعر
    const formatPrice = (price) => {
        return `$${parseFloat(price).toFixed(2)}`;
    };
    
    // تحويل اللون السداسي إلى RGBA
    const hexToRgba = (hex, alpha = 1) => {
        if (!hex) return `rgba(107, 114, 128, ${alpha})`;
        
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    
    // إضافة أحداث لأزرار الطلب
    const attachOrderButtonEvents = () => {
        document.querySelectorAll('.order-service-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const serviceId = e.currentTarget.getAttribute('data-id');
                openOrderModal(serviceId);
            });
        });
    };
    
    // فتح نافذة الطلب
    const openOrderModal = (serviceId) => {
        // التحقق من وجود نافذة الطلب
        if (typeof socialCheckout !== 'undefined' && typeof socialCheckout.openOrderModal === 'function') {
            socialCheckout.openOrderModal(serviceId);
        } else {
            console.log(`طلب الخدمة: ${serviceId}`);
            alert('سيتم فتح نافذة الطلب قريباً');
        }
    };
    
    // الواجهة العامة
    return {
        init,
        loadServicesFromLocalStorage,
        renderServices
    };
})();

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    if (typeof servicesFrontend !== 'undefined') {
        servicesFrontend.init();
    }
});
