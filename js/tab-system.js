/**
 * نظام التبويب
 * يتعامل مع تبديل علامات التبويب في واجهة المستخدم
 */

// نظام إدارة علامات التبويب
function setupTabSystem() {
    // الحصول على جميع روابط التبويب ومحتويات التبويب
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');
      // إضافة مستمع نقر لكل رابط تبويب
    tabLinks.forEach(tabLink => {
        // استخدام addEventListener مباشرة بدون استنساخ العنصر
        tabLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tab clicked:', this.getAttribute('data-tab'));
            
            // الحصول على التبويب المراد تنشيطه
            const tabId = this.getAttribute('data-tab');
            
            // إزالة الفئة النشطة من جميع روابط التبويب والمحتويات
            tabLinks.forEach(link => {
                link.classList.remove('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
                link.classList.add('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
            });
            
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // إضافة الفئة النشطة إلى رابط المحتوى الحالي
            this.classList.add('text-blue-600', 'border-r-4', 'border-blue-600', 'bg-blue-50');
            this.classList.remove('text-gray-700', 'hover:bg-blue-50', 'hover:text-blue-600');
            
            // تنشيط التبويب المحدد
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.classList.add('active');
                
                // تأخير تنفيذ التهيئة قليلاً لضمان تحميل العناصر
                setTimeout(() => {                    console.log('تهيئة التبويب:', tabId);
                    // تهيئة الوحدات النمطية المحددة عند تنشيط تبويبها
                    // Platform management functionality removed
                    if (tabId === 'services' && typeof servicesDashboard !== 'undefined') {
                        // تهيئة مكون إدارة الخدمات
                        servicesDashboard.init();
                    } else if (tabId === 'orders' && typeof ordersDashboard !== 'undefined') {
                        // تهيئة مكون إدارة الطلبات
                        ordersDashboard.init();
                    } else if (tabId === 'pricing' && typeof pricingCustomizer !== 'undefined') {
                        // تهيئة مكون تخصيص الأسعار
                        pricingCustomizer.init();
                    }
                }, 100); // تأخير كافٍ للتأكد من جاهزية العناصر
            }
        });
    });
}

// إعداد النوافذ المنبثقة
function setupModals() {
    // الحصول على جميع أزرار إغلاق النوافذ المنبثقة
    const closeButtons = document.querySelectorAll('[id$="-modal"] [id^="close-"]');
    
    // إضافة مستمع نقر لكل زر إغلاق
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // العثور على النافذة المنبثقة الأصل
            const modal = this.closest('[id$="-modal"]');
            if (modal) {
                modal.classList.add('hidden');
            }
        });
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارج محتوى النافذة المنبثقة
    document.addEventListener('click', function(e) {
        document.querySelectorAll('[id$="-modal"]').forEach(modal => {
            const modalContent = modal.querySelector('.bg-white');
            if (modal && !modal.classList.contains('hidden') && modalContent && !modalContent.contains(e.target) && e.target !== modalContent) {
                // إغلاق فقط عند النقر على الطبقة المتراكبة، وليس على محتوى النافذة المنبثقة
                if (modal.contains(e.target)) {
                    modal.classList.add('hidden');
                }
            }
        });
    });
}

// تصدير الدوال لاستخدامها في الملفات الأخرى
window.setupTabSystem = setupTabSystem;
window.setupModals = setupModals;

// تهيئة النظام عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    setupTabSystem();
    setupModals();
});