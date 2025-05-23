/**
 * ملف تهيئة المنصات الافتراضية
 * يقوم بالتحقق من وجود المنصات الأساسية وإضافتها إذا كانت غير موجودة
 */

// تنفيذ الوظيفة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تهيئة فحص المنصات الافتراضية...');
    // تأخير قليل للتأكد من تهيئة مدير المنصات
    setTimeout(() => {
        checkAndAddDefaultPlatforms();
    }, 100);
});

// وظيفة للتحقق من وجود المنصات الافتراضية وإضافتها إذا لم تكن موجودة
function checkAndAddDefaultPlatforms() {
    console.log('التحقق من وجود المنصات الافتراضية في المفتاح social_platforms...');
    
    // استخدام نظام إدارة المنصات إذا كان متاحًا
    if (typeof window.platformsManager !== 'undefined') {
        console.log('استخدام نظام إدارة المنصات لإضافة المنصات الافتراضية...');
        
        // التحقق مما إذا كانت هناك منصات موجودة بالفعل
        const existingPlatforms = window.platformsManager.getPlatforms();
        
        if (!existingPlatforms || existingPlatforms.length === 0) {
            console.log('لا توجد منصات. إضافة المنصات الافتراضية باستخدام نظام إدارة المنصات...');
            window.platformsManager.addDefaultPlatforms();
        } else {
            // التحقق من وجود المنصات الأساسية
            const essentialPlatforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];
            const missingPlatforms = [];
            const existingSlugs = existingPlatforms.map(p => p.slug);
            
            // التحقق من وجود كل منصة أساسية
            essentialPlatforms.forEach(platformSlug => {
                if (!existingSlugs.includes(platformSlug)) {
                    missingPlatforms.push(platformSlug);
                }
            });
            
            // إضافة المنصات الأساسية المفقودة
            if (missingPlatforms.length > 0) {
                console.log(`إضافة المنصات الأساسية المفقودة: ${missingPlatforms.join(', ')}`);
                
                const defaultPlatformsData = [
                    {
                        name: 'انستغرام',
                        slug: 'instagram',
                        icon: 'instagram',
                        color: '#E1306C',
                        description: 'منصة مشاركة الصور ومقاطع الفيديو القصيرة',
                        type: 'social',
                        website: 'https://instagram.com',
                        active: true
                    },
                    {
                        name: 'فيسبوك',
                        slug: 'facebook',
                        icon: 'facebook',
                        color: '#1877F2',
                        description: 'أكبر شبكة تواصل اجتماعي في العالم',
                        type: 'social',
                        website: 'https://facebook.com',
                        active: true
                    },
                    {
                        name: 'تيك توك',
                        slug: 'tiktok',
                        icon: 'tiktok',
                        color: '#000000',
                        description: 'منصة مقاطع فيديو قصيرة وترفيهية',
                        type: 'video',
                        website: 'https://tiktok.com',
                        active: true
                    },
                    {
                        name: 'يوتيوب',
                        slug: 'youtube',
                        icon: 'youtube',
                        color: '#FF0000',
                        description: 'منصة مشاركة الفيديو الأشهر عالمياً',
                        type: 'video',
                        website: 'https://youtube.com',
                        active: true
                    },
                    {
                        name: 'تويتر',
                        slug: 'twitter',
                        icon: 'twitter',
                        color: '#1DA1F2',
                        description: 'منصة التدوينات القصيرة والأخبار',
                        type: 'social',
                        website: 'https://twitter.com',
                        active: true
                    }
                ];
                
                // إضافة فقط المنصات المفقودة
                defaultPlatformsData
                    .filter(platform => missingPlatforms.includes(platform.slug))
                    .forEach(platform => {
                        window.platformsManager.addPlatform(platform);
                    });
            } else {
                console.log('جميع المنصات الأساسية موجودة بالفعل.');
            }
        }
    } else {
        // استخدام النهج القديم إذا كان مدير المنصات غير متاح
        const platformsData = localStorage.getItem('social_platforms');
        
        if (!platformsData || JSON.parse(platformsData).length === 0) {
            console.log('لا توجد منصات في مفتاح social_platforms. إضافة المنصات الافتراضية...');
            
            // المنصات الافتراضية
            const defaultPlatforms = [
                {
                    id: 'instagram-default',
                    name: 'انستغرام',
                    slug: 'instagram',
                    icon: 'instagram',
                    color: '#E1306C',
                    description: 'منصة مشاركة الصور ومقاطع الفيديو القصيرة',
                    type: 'social',
                    website: 'https://instagram.com',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'facebook-default',
                    name: 'فيسبوك',
                    slug: 'facebook',
                    icon: 'facebook',
                    color: '#1877F2',
                    description: 'أكبر شبكة تواصل اجتماعي في العالم',
                    type: 'social',
                    website: 'https://facebook.com',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'tiktok-default',
                    name: 'تيك توك',
                    slug: 'tiktok',
                    icon: 'tiktok',
                    color: '#000000',
                    description: 'منصة مقاطع فيديو قصيرة وترفيهية',
                    type: 'video',
                    website: 'https://tiktok.com',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'youtube-default',
                    name: 'يوتيوب',
                    slug: 'youtube',
                    icon: 'youtube',
                    color: '#FF0000',
                    description: 'منصة مشاركة الفيديو الأشهر عالميا',
                    type: 'video',
                    website: 'https://youtube.com',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: 'twitter-default',
                    name: 'تويتر',
                    slug: 'twitter',
                    icon: 'twitter',
                    color: '#1DA1F2',
                    description: 'منصة للتدوينات القصيرة والأخبار',
                    type: 'social',
                    website: 'https://twitter.com',
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            
            // حفظ المنصات الافتراضية في localStorage
            localStorage.setItem('social_platforms', JSON.stringify(defaultPlatforms));
            console.log('تمت إضافة المنصات الافتراضية إلى مفتاح social_platforms');
            
            // تحديث واجهة المستخدم إذا كان platformsManager متاحا
            if (typeof platformsManager !== 'undefined' && platformsManager.loadPlatforms) {
                console.log('إعادة تحميل بيانات المنصات في واجهة المستخدم...');
                platformsManager.state.isInitialized = false;
                platformsManager.loadPlatforms();
                platformsManager.renderPlatformTable();
            }
        } else {
        console.log('تم العثور على ' + JSON.parse(platformsData).length + ' منصة في مفتاح social_platforms');
        
        // التحقق مما إذا كانت هناك منصات أساسية مفقودة
        const existingPlatforms = JSON.parse(platformsData);
        const slugs = existingPlatforms.map(p => p.slug);
        const missingPlatforms = [];
        
        // قائمة المنصات الأساسية التي يجب أن تكون موجودة
        const essentialPlatforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];
        
        // التحقق من وجود كل منصة أساسية
        for (const essential of essentialPlatforms) {
            if (!slugs.includes(essential)) {
                console.log('المنصة الأساسية \
 + essential + 
\ غير موجودة. سيتم إضافتها.');
                
                // إنشاء منصة جديدة بناء على نوع المنصة المفقودة
                let newPlatform;
                
                switch(essential) {
                    case 'instagram':
                        newPlatform = {
                            id: 'instagram-default',
                            name: 'انستغرام',
                            slug: 'instagram',
                            icon: 'instagram',
                            color: '#E1306C',
                            description: 'منصة مشاركة الصور ومقاطع الفيديو القصيرة',
                            type: 'social',
                            website: 'https://instagram.com',
                            active: true,
                            createdAt: new Date().toISOString()
                        };
                        break;
                    case 'facebook':
                        newPlatform = {
                            id: 'facebook-default',
                            name: 'فيسبوك',
                            slug: 'facebook',
                            icon: 'facebook',
                            color: '#1877F2',
                            description: 'أكبر شبكة تواصل اجتماعي في العالم',
                            type: 'social',
                            website: 'https://facebook.com',
                            active: true,
                            createdAt: new Date().toISOString()
                        };
                        break;
                    case 'twitter':
                        newPlatform = {
                            id: 'twitter-default',
                            name: 'تويتر',
                            slug: 'twitter',
                            icon: 'twitter',
                            color: '#1DA1F2',
                            description: 'منصة للتدوينات القصيرة والأخبار',
                            type: 'social',
                            website: 'https://twitter.com',
                            active: true,
                            createdAt: new Date().toISOString()
                        };
                        break;
                    case 'youtube':
                        newPlatform = {
                            id: 'youtube-default',
                            name: 'يوتيوب',
                            slug: 'youtube',
                            icon: 'youtube',
                            color: '#FF0000',
                            description: 'منصة مشاركة الفيديو الأشهر عالميا',
                            type: 'video',
                            website: 'https://youtube.com',
                            active: true,
                            createdAt: new Date().toISOString()
                        };
                        break;
                    case 'tiktok':
                        newPlatform = {
                            id: 'tiktok-default',
                            name: 'تيك توك',
                            slug: 'tiktok',
                            icon: 'tiktok',
                            color: '#000000',
                            description: 'منصة مقاطع فيديو قصيرة وترفيهية',
                            type: 'video',
                            website: 'https://tiktok.com',
                            active: true,
                            createdAt: new Date().toISOString()
                        };
                        break;
                }
                
                if (newPlatform) {
                    missingPlatforms.push(newPlatform);
                }
            }
        }
        
        // إذا كانت هناك منصات مفقودة أضفها إلى المفتاح
        if (missingPlatforms.length > 0) {
            console.log('إضافة ' + missingPlatforms.length + ' منصة مفقودة إلى social_platforms...');
            const updatedPlatforms = [...existingPlatforms, ...missingPlatforms];
            localStorage.setItem('social_platforms', JSON.stringify(updatedPlatforms));
            
            // تحديث واجهة المستخدم إذا كان platformsManager متاحا
            if (typeof platformsManager !== 'undefined' && platformsManager.loadPlatforms) {
                console.log('إعادة تحميل بيانات المنصات في واجهة المستخدم...');
                platformsManager.state.isInitialized = false;
                platformsManager.loadPlatforms();
                platformsManager.renderPlatformTable();
            }
        }
    }
}
