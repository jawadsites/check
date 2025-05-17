/**
 * نقل المنصات من مفتاح platforms إلى social_platforms
 * يقوم هذا الملف بنقل بيانات المنصات من المفتاح القديم إلى المفتاح الجديد في localStorage
 */

// تنفيذ الميجرِيشن عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        migratePlatforms();
    }, 200); // تأخير قليل لضمان تهيئة نظام إدارة المنصات
});
}

// وظيفة لنقل بيانات المنصات من المفتاح القديم إلى المفتاح الجديد
function migratePlatforms() {
    console.log('بدء عملية نقل بيانات المنصات من المفتاح القديم (platforms) إلى المفتاح الجديد (social_platforms)...');

    // قراءة البيانات من المفتاح القديم
    const oldPlatformsData = localStorage.getItem('platforms');
    
    // إذا كانت البيانات القديمة موجودة
    if (oldPlatformsData) {
        try {
            // تحويل البيانات من نص JSON إلى كائن جافاسكريبت
            const oldPlatforms = JSON.parse(oldPlatformsData);
            console.log('تم العثور على', oldPlatforms.length, 'منصة في المفتاح القديم');
            
            // استخدام مدير المنصات إذا كان متاحًا
            if (typeof window.platformsManager !== 'undefined') {
                console.log('استخدام نظام إدارة المنصات لنقل المنصات من المفتاح القديم...');
                
                // إضافة كل منصة باستخدام وظيفة addPlatform التي ستتحقق من وجود المنصة قبل إضافتها
                let addedCount = 0;
                oldPlatforms.forEach(platform => {
                    if (platform.slug) {
                        // التحقق من وجود المنصة قبل إضافتها يتم في وظيفة addPlatform
                        window.platformsManager.addPlatform(platform);
                        addedCount++;
                    }
                });
                
                console.log(`تم نقل ${addedCount} منصة من المفتاح القديم إلى نظام إدارة المنصات`);
                
                // حذف المفتاح القديم بعد نقل البيانات بنجاح
                localStorage.removeItem('platforms');
                console.log('تم حذف المفتاح القديم (platforms) بعد نقل البيانات بنجاح');
            } else {
                console.log('نظام إدارة المنصات غير متاح، استخدام الطريقة المباشرة لنقل البيانات...');
                
                // قراءة البيانات من المفتاح الجديد (إن وجدت)
                const newPlatformsData = localStorage.getItem('social_platforms');
                let newPlatforms = [];
                
                if (newPlatformsData) {
                    try {
                        newPlatforms = JSON.parse(newPlatformsData);
                        console.log('تم العثور على', newPlatforms.length, 'منصة في المفتاح الجديد');
                    } catch (e) {
                        console.error('خطأ في قراءة بيانات المنصات من المفتاح الجديد:', e);
                    }
                }
                
                // دمج البيانات من المصدرين مع منع التكرار
                // إنشاء قاموس للمنصات الموجودة بالفعل في المفتاح الجديد (باستخدام slug كمفتاح)
                const existingPlatforms = {};
                newPlatforms.forEach(platform => {
                    if (platform.slug) {
                        existingPlatforms[platform.slug] = true;
                    }
                });
                
                // إضافة المنصات من المفتاح القديم إلى المفتاح الجديد إذا لم تكن موجودة بالفعل
                let addedCount = 0;
                for (const platform of oldPlatforms) {
                    if (platform.slug && !existingPlatforms[platform.slug]) {
                        newPlatforms.push(platform);
                        console.log('إضافة منصة', platform.name, 'إلى المفتاح الجديد');
                        addedCount++;
                    }
                }
                
                // حفظ البيانات المدمجة في المفتاح الجديد
                localStorage.setItem('social_platforms', JSON.stringify(newPlatforms));
                console.log(`تم نقل ${addedCount} منصة من المفتاح القديم إلى المفتاح الجديد بنجاح`);
                
                // حذف المفتاح القديم بعد نقل البيانات بنجاح
                localStorage.removeItem('platforms');
                console.log('تم حذف المفتاح القديم (platforms) بعد نقل البيانات بنجاح');
                
                // تحديث واجهة المستخدم إذا كان platformsManager متاحًا
                if (typeof platformsManager !== 'undefined' && platformsManager.loadPlatforms) {
                    console.log('إعادة تحميل بيانات المنصات في واجهة المستخدم...');
                    platformsManager.state.isInitialized = false;
                    platformsManager.loadPlatforms();
                    platformsManager.renderPlatformTable();
                }
            }
            
        } catch (e) {
            console.error('خطأ في عملية نقل بيانات المنصات:', e);
        }
    } else {
        console.log('لم يتم العثور على بيانات في المفتاح القديم (platforms). لا حاجة للنقل.');
    }
}
