/**
 * ملف تنشيط تبويب المنصات
 * يقوم بتنشيط تبويب المنصات وتحميل البيانات عند فتح لوحة التحكم
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('تنفيذ ملف تنشيط المنصات...');

    // التحقق إذا كنا في صفحة لوحة التحكم
    if (document.getElementById('platforms')) {
        console.log('العثور على قسم المنصات، جاري التهيئة...');
        
        // ضمان عرض المنصات بالشكل المفصل (بطاقات المنصات)
        if (typeof platformsManager !== 'undefined') {
            // تأخير صغير لضمان تحميل الصفحة بالكامل
            setTimeout(() => {
                console.log('تنفيذ عرض بطاقات المنصات المفصلة...');
                // إعادة ضبط حالة التهيئة للسماح بإعادة تحميل المنصات
                platformsManager.state.isInitialized = false;
                platformsManager.init();
                // ضمان عرض المنصات بالشكل المفصل
                platformsManager.renderPlatformTable();
            }, 300);
            
            // إضافة مستمع حدث للتأكد من عرض المنصات عند النقر على تبويب المنصات
            document.querySelectorAll('.tab-link[data-tab="platforms"]').forEach(tabLink => {
                tabLink.addEventListener('click', function() {
                    console.log('تم النقر على تبويب المنصات، تحديث العرض المفصل...');
                    setTimeout(() => {
                        // إعادة ضبط حالة التهيئة للسماح بإعادة تحميل المنصات
                        platformsManager.state.isInitialized = false;
                        platformsManager.init();
                    }, 100);
                });
            });
        }
    }
});