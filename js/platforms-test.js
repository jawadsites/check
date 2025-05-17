/**
 * ملف اختبار نظام إدارة المنصات
 * يمكن تشغيل هذا الملف في وحدة تحكم المتصفح للتحقق من صحة عمل النظام
 */

// دالة اختبار نظام إدارة المنصات
function testPlatformsSystem() {
    console.group('=== اختبار نظام إدارة المنصات ===');
    
    // التحقق من وجود localStorage
    console.log('التحقق من وجود localStorage...');
    if (typeof localStorage === 'undefined') {
        console.error('❌ localStorage غير متاح في هذا المتصفح');
        console.groupEnd();
        return false;
    }
    console.log('✅ localStorage متاح');
    
    // التحقق من وجود بيانات المنصات
    const platformsData = localStorage.getItem('social_platforms');
    if (!platformsData) {
        console.warn('⚠️ لا توجد بيانات منصات محفوظة في localStorage');
    } else {
        try {
            const platforms = JSON.parse(platformsData);
            console.log(`✅ تم العثور على ${platforms.length} منصة في localStorage`);
            
            // عرض بعض المعلومات عن المنصات
            if (platforms.length > 0) {
                console.table(platforms.map(p => ({
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    type: p.type,
                    active: p.active
                })));
            }
        } catch (e) {
            console.error('❌ خطأ في تحليل بيانات المنصات:', e);
        }
    }
    
    // التحقق من وجود platformsManager
    console.log('التحقق من وجود platformsManager...');
    if (typeof window.platformsManager === 'undefined') {
        console.warn('⚠️ platformsManager غير متاح. هل أنت في صفحة لوحة التحكم؟');
    } else {
        console.log('✅ platformsManager متاح');
    }
    
    // التحقق من وجود واجهة التطبيق
    console.log('التحقق من وجود واجهة تطبيق المنصات...');
    if (typeof window.platformsAPI === 'undefined') {
        console.warn('⚠️ platformsAPI غير متاح');
    } else {
        console.log('✅ platformsAPI متاح');
        console.log('عدد المنصات:', window.platformsAPI.getPlatforms().length);
    }
    
    // التحقق من وجود الدالة المسؤولة عن تحديث المنصات في الصفحة الرئيسية
    console.log('التحقق من وجود updateIndexPlatforms...');
    if (typeof window.updateIndexPlatforms === 'undefined') {
        console.warn('⚠️ updateIndexPlatforms غير متاح. هل أنت في الصفحة الرئيسية؟');
    } else {
        console.log('✅ updateIndexPlatforms متاح');
    }
    
    // التحقق من وجود العناصر المطلوبة في الصفحة
    console.log('التحقق من وجود العناصر في الصفحة...');
    
    if (window.location.href.includes('dashboard.html')) {
        // اختبار عناصر لوحة التحكم
        const dashboardElements = [
            'platforms-container',
            'platform-filter',
            'platform-search',
            'add-platform-btn'
        ];
        
        dashboardElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`✅ تم العثور على العنصر: ${id}`);
            } else {
                console.warn(`⚠️ العنصر غير موجود: ${id}`);
            }
        });
    } else if (window.location.href.includes('index.html') || window.location.pathname === '/') {
        // اختبار عناصر الصفحة الرئيسية
        const indexElements = [
            'social-platforms-container',
            'filter-all',
            'filter-social',
            'filter-video',
            'filter-messaging'
        ];
        
        indexElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`✅ تم العثور على العنصر: ${id}`);
            } else {
                console.warn(`⚠️ العنصر غير موجود: ${id}`);
            }
        });
    }
    
    console.groupEnd();
    return true;
}

// اختبار طباعة منصة عشوائية
function printRandomPlatform() {
    const platformsData = localStorage.getItem('social_platforms');
    if (!platformsData) {
        console.log('❌ لا توجد منصات في localStorage');
        return;
    }
    
    try {
        const platforms = JSON.parse(platformsData);
        if (platforms.length === 0) {
            console.log('❌ قائمة المنصات فارغة');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * platforms.length);
        const platform = platforms[randomIndex];
        
        console.log('📋 منصة عشوائية:', platform);
        return platform;
    } catch (e) {
        console.error('❌ خطأ في تحليل بيانات المنصات:', e);
        return null;
    }
}

// تشغيل الاختبار تلقائياً
testPlatformsSystem();

// تعليمات للمستخدم
console.log('\n🧪 لتشغيل الاختبار يدوياً: testPlatformsSystem()');
console.log('🔄 لعرض منصة عشوائية: printRandomPlatform()');
console.log('📖 متاح أيضاً في لوحة التحكم: platformsManager.getPlatforms()');
