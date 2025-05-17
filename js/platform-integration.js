/**
 * Platform Integration Module
 * Integrates the platforms from localStorage with Alpine.js data
 */

// Function to load platforms from localStorage
function loadPlatformsFromLocalStorage() {
    try {
        const platforms = JSON.parse(localStorage.getItem('social_platforms') || '[]');
        console.log(`تم تحميل ${platforms.length} منصة من التخزين المحلي للتكامل مع Alpine.js`);
        return platforms.filter(p => p.active);
    } catch (e) {
        console.error('خطأ في تحميل المنصات من التخزين المحلي:', e);
        return [];
    }
}

// Function to convert platforms to the format expected by Alpine.js
function convertPlatformsForAlpine(platforms) {
    const result = {};
    
    platforms.forEach(platform => {
        if (platform.active) {
            result[platform.slug] = {
                name: platform.name,
                icon: platform.icon || platform.slug,
                color: platform.color || '#cccccc',
                factor: 1.0 // Default factor, can be customized
            };
        }
    });
    
    return result;
}

// Function to update Alpine.js services with platforms from localStorage
function updateAlpineDataWithPlatforms() {
    // Check if appData is already initialized
    if (typeof window.Alpine === 'undefined') {
        console.log('Alpine.js not loaded yet, will try again later...');
        setTimeout(updateAlpineDataWithPlatforms, 500);
        return;
    }

    // Get platforms from localStorage
    const platforms = loadPlatformsFromLocalStorage();
    if (!platforms || platforms.length === 0) {
        console.log('No active platforms found in localStorage');
        return;
    }
    
    // Convert platforms to Alpine.js format
    const alpinePlatforms = convertPlatformsForAlpine(platforms);
    
    // Update Alpine.js data
    console.log('Updating Alpine.js with platforms from localStorage');
    
    // Get the Alpine.js data component
    document.querySelectorAll('[x-data]').forEach(el => {
        // Get the Alpine.js data from the element
        const alpineData = Alpine.$data(el);
        
        // Check if it's our app data
        if (alpineData && alpineData.services) {
            // Update the platforms for each service type
            Object.keys(alpineData.services).forEach(serviceType => {
                // Get the current platforms
                const currentPlatforms = alpineData.services[serviceType].platforms || {};
                
                // Merge the platforms from localStorage
                Object.keys(alpinePlatforms).forEach(platformKey => {
                    // Only add if not already in the service's platforms
                    if (!currentPlatforms[platformKey]) {
                        currentPlatforms[platformKey] = alpinePlatforms[platformKey];
                    }
                });
                
                // Update the service's platforms
                alpineData.services[serviceType].platforms = currentPlatforms;
            });
            
            // Update available platforms computed property
            if (typeof alpineData.updateAvailablePlatforms === 'function') {
                alpineData.updateAvailablePlatforms();
            }
            
            console.log('Alpine.js data updated with platforms from localStorage');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Update Alpine.js data with platforms from localStorage
    setTimeout(updateAlpineDataWithPlatforms, 500); // Give Alpine.js time to initialize
});

// Export functions for use in other files
window.platformIntegration = {
    loadPlatformsFromLocalStorage,
    convertPlatformsForAlpine,
    updateAlpineDataWithPlatforms
};
