/**
 * نظام تهيئة الخدمات الافتراضية وتخزينها في localStorage
 */
const defaultServicesInitializer = {
    // حالة التهيئة
    initialized: false,

    // تهيئة النظام
    init() {
        console.log("جاري تهيئة نظام الخدمات الافتراضية...");
        
        // التحقق ما إذا كانت الخدمات موجودة بالفعل
        const existingServices = localStorage.getItem('social_services');
        
        if (!existingServices || JSON.parse(existingServices).length === 0) {
            console.log("لا توجد خدمات مخزنة، جاري إنشاء الخدمات الافتراضية...");
            this.createDefaultServices();
        } else {
            console.log("تم العثور على خدمات مخزنة: " + JSON.parse(existingServices).length + " خدمة");
            this.initialized = true;
        }

        // إضافة زر لحذف جميع الخدمات وإعادة التهيئة (للاختبار)
        this.addDebugButtons();
    },

    // إنشاء الخدمات الافتراضية
    createDefaultServices() {
        // التأكد من وجود المنصات أولاً
        const platformsData = localStorage.getItem('social_platforms');
        if (!platformsData) {
            console.error("لا توجد منصات مخزنة! يجب تهيئة المنصات أولاً.");
            return;
        }

        const platforms = JSON.parse(platformsData);
        if (platforms.length === 0) {
            console.error("قائمة المنصات فارغة! يجب إضافة منصات أولاً.");
            return;
        }

        // إنشاء قائمة الخدمات الافتراضية
        const defaultServices = [];
        let serviceId = 1;

        // إنشاء خدمات لكل منصة
        platforms.forEach(platform => {
            if (platform.active !== true) {
                return; // تخطي المنصات غير المفعلة
            }

            // خدمة المتابعين
            defaultServices.push({
                id: serviceId++,
                name: `متابعين ${platform.name}`,
                description: `زيادة عدد متابعين حسابك على ${platform.name}`,
                type: 'followers',
                platformId: platform.id,
                price: 5.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true
            });

            // خدمة الإعجابات
            defaultServices.push({
                id: serviceId++,
                name: `إعجابات ${platform.name}`,
                description: `زيادة عدد الإعجابات على منشوراتك في ${platform.name}`,
                type: 'likes',
                platformId: platform.id,
                price: 3.50,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true
            });

            // خدمة المشاهدات (إذا كانت منصة فيديو)
            if (platform.type === 'video' || ['instagram', 'tiktok', 'youtube', 'facebook'].includes(platform.code)) {
                defaultServices.push({
                    id: serviceId++,
                    name: `مشاهدات ${platform.name}`,
                    description: `زيادة عدد مشاهدات الفيديو الخاص بك على ${platform.name}`,
                    type: 'views',
                    platformId: platform.id,
                    price: 2.00,
                    minQuantity: 200,
                    maxQuantity: 20000,
                    active: true
                });
            }

            // خدمة التعليقات
            defaultServices.push({
                id: serviceId++,
                name: `تعليقات ${platform.name}`,
                description: `إضافة تعليقات متنوعة على محتواك في ${platform.name}`,
                type: 'comments',
                platformId: platform.id,
                price: 8.00,
                minQuantity: 10,
                maxQuantity: 1000,
                active: true
            });
        });

        // حفظ الخدمات في localStorage
        console.log(`تم إنشاء ${defaultServices.length} خدمة افتراضية`);
        localStorage.setItem('social_services', JSON.stringify(defaultServices));
        this.initialized = true;
    },

    // إضافة أزرار للاختبار (تظهر فقط في بيئة التطوير)
    addDebugButtons() {
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return;
        }

        // إنشاء زر لإعادة تهيئة الخدمات
        document.addEventListener('DOMContentLoaded', () => {
            const servicesContainer = document.getElementById('services');
            if (!servicesContainer) return;

            const debugButtonsContainer = document.createElement('div');
            debugButtonsContainer.className = 'debug-tools flex flex-wrap gap-2 mb-4 p-3 bg-yellow-100 rounded-lg';
            debugButtonsContainer.innerHTML = `
                <button id="reset-services-btn" class="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                    <i class="fas fa-trash mr-1"></i> حذف وإعادة تهيئة الخدمات
                </button>
                <button id="count-services-btn" class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    <i class="fas fa-info-circle mr-1"></i> عدد الخدمات الحالية
                </button>
            `;

            // إضافة إلى DOM بعد العنوان مباشرة
            const servicesHeader = servicesContainer.querySelector('h2').parentNode.parentNode;
            servicesHeader.parentNode.insertBefore(debugButtonsContainer, servicesHeader.nextSibling);

            // إضافة مستمعي الأحداث
            document.getElementById('reset-services-btn').addEventListener('click', () => {
                if (confirm('هل أنت متأكد من حذف جميع الخدمات وإعادة التهيئة؟')) {
                    localStorage.removeItem('social_services');
                    this.init();
                    setTimeout(() => {
                        location.reload();
                    }, 300);
                }
            });

            document.getElementById('count-services-btn').addEventListener('click', () => {
                const services = localStorage.getItem('social_services') ? JSON.parse(localStorage.getItem('social_services')) : [];
                const activeServices = services.filter(s => s.active === true);
                alert(`إجمالي الخدمات: ${services.length}\nالخدمات النشطة: ${activeServices.length}`);
            });
        });
    }
};

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    defaultServicesInitializer.init();
});
