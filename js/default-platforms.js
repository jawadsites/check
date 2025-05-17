/**
 * Default Platform Data Module
 * Provides default platform data to ensure there are always platforms available in the system
 */

// Define default platforms with complete data
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
        description: 'منصة مشاركة الفيديو الأشهر عالمياً',
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
        description: 'منصة التدوينات القصيرة والأخبار',
        type: 'social',
        website: 'https://twitter.com',
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'linkedin-default',
        name: 'لينكد إن',
        slug: 'linkedin',
        icon: 'linkedin',
        color: '#0A66C2',
        description: 'منصة التواصل الاجتماعي المهنية',
        type: 'social',
        website: 'https://linkedin.com',
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'pinterest-default',
        name: 'بنترست',
        slug: 'pinterest',
        icon: 'pinterest',
        color: '#BD081C',
        description: 'منصة مشاركة الصور والأفكار',
        type: 'social',
        website: 'https://pinterest.com',
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'snapchat-default',
        name: 'سناب شات',
        slug: 'snapchat',
        icon: 'snapchat',
        color: '#FFFC00',
        description: 'منصة مشاركة الصور والفيديو المؤقتة',
        type: 'messaging',
        website: 'https://snapchat.com',
        active: true,
        createdAt: new Date().toISOString()
    },
    {
        id: 'telegram-default',
        name: 'تلغرام',
        slug: 'telegram',
        icon: 'telegram',
        color: '#0088cc',
        description: 'منصة مراسلة فورية آمنة',
        type: 'messaging',
        website: 'https://telegram.org',
        active: true,
        createdAt: new Date().toISOString()
    }
];

// Function to check and initialize default platforms if needed
function initializeDefaultPlatforms() {
    try {
        // Check if platforms already exist in localStorage
        const storedPlatforms = localStorage.getItem('social_platforms');
        
        if (!storedPlatforms || JSON.parse(storedPlatforms).length === 0) {
            // No platforms in localStorage, add default platforms
            localStorage.setItem('social_platforms', JSON.stringify(defaultPlatforms));
            console.log('تم تهيئة المنصات الافتراضية في localStorage');
            
            // Trigger update in UI if needed
            if (typeof window.updateIndexPlatforms === 'function') {
                window.updateIndexPlatforms();
            }
            
            // Update Alpine.js data if needed
            if (typeof window.platformIntegration !== 'undefined' && 
                typeof window.platformIntegration.updateAlpineDataWithPlatforms === 'function') {
                setTimeout(() => window.platformIntegration.updateAlpineDataWithPlatforms(), 500);
            }
        } else {
            console.log('تم العثور على منصات محفظة في localStorage');
        }
    } catch (e) {
        console.error('خطأ في تهيئة المنصات الافتراضية:', e);
    }
}

// Initialize default platforms when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDefaultPlatforms);

// Export function for use in other files
window.defaultPlatforms = {
    initializeDefaultPlatforms,
    platforms: defaultPlatforms
};
