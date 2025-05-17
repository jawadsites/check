/**
 * Error Tester for Service and Platform Storage
 * This file provides test functions to verify deduplication of services and platforms
 */

const errorTester = {
    /**
     * Test deduplication of services
     * Creates duplicate services, saves them, and then checks if deduplication works
     */
    testServiceDeduplication: function() {
        console.log('Starting service deduplication test...');
        
        // Check if serviceUtils exists
        if (typeof serviceUtils === 'undefined') {
            console.error('serviceUtils not available. Cannot run test.');
            return {
                success: false,
                error: 'serviceUtils not available'
            };
        }
        
        // Get current services
        const originalServices = serviceUtils.getAllServices();
        console.log(`Current services count: ${originalServices.length}`);
        
        // Create duplicate services with same IDs
        const testServices = [...originalServices];
        
        // Add duplicates of first 2 services (if available)
        if (originalServices.length >= 2) {
            testServices.push(JSON.parse(JSON.stringify(originalServices[0])));
            testServices.push(JSON.parse(JSON.stringify(originalServices[1])));
        } else {
            // Create test service if none exist
            const testService = {
                id: 'test-service-1',
                name: 'Test Service 1',
                description: 'Test service for deduplication',
                platform: 'instagram',
                price: 5.00,
                active: true,
                createdAt: new Date().toISOString()
            };
            testServices.push(testService);
            testServices.push(JSON.parse(JSON.stringify(testService))); // Duplicate
        }
        
        console.log(`Test services with duplicates count: ${testServices.length}`);
        
        // Save services with duplicates directly to localStorage
        localStorage.setItem('dashboard_services', JSON.stringify(testServices));
        console.log('Saved duplicated services to dashboard_services');
        
        // Trigger migration
        serviceUtils.migrateOldData();
        console.log('Migration triggered');
        
        // Check if deduplication worked
        const dedupedServices = serviceUtils.getAllServices();
        console.log(`Services after deduplication: ${dedupedServices.length}`);
        
        // Check service IDs for uniqueness
        const serviceIds = dedupedServices.map(s => s.id);
        const uniqueIds = new Set(serviceIds);
        
        const result = {
            success: uniqueIds.size === serviceIds.length,
            originalCount: originalServices.length,
            duplicatedCount: testServices.length,
            dedupedCount: dedupedServices.length,
            uniqueIdsCount: uniqueIds.size
        };
        
        console.log('Service deduplication test result:', result);
        return result;
    },
    
    /**
     * Restore original data after tests
     * This function should be called after testing to restore the application to its original state
     */
    restoreOriginalData: function() {
        console.log('Restoring original data...');
        
        // If we have serviceUtils, initialize default services
        if (typeof serviceUtils !== 'undefined') {
            serviceUtils.initializeServices();
            console.log('Services restored using serviceUtils');
        }
        
        // If we have platformUtils, initialize default platforms
        if (typeof platformUtils !== 'undefined') {
            platformUtils.initializePlatforms();
            console.log('Platforms restored using platformUtils');
        }
        
        console.log('Original data restored');
        return true;
    },
    
    /**
     * Run all tests
     */
    runAllTests: function() {
        console.log('Starting all deduplication tests...');
        
        const results = {
            serviceDeduplication: this.testServiceDeduplication()
        };
        
        console.log('All tests completed:', results);
        return results;
    }
};

// Auto-run tests if on error-test.html page
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('run-tests-btn')) {
        document.getElementById('run-tests-btn').addEventListener('click', function() {
            const results = errorTester.runAllTests();
            
            // Display results in the UI
            const resultsEl = document.getElementById('test-results');
            if (resultsEl) {
                resultsEl.innerHTML = '<h3>Test Results</h3>' + 
                                      '<pre>' + JSON.stringify(results, null, 2) + '</pre>';
                
                // Add restore button
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'btn btn-warning mt-3';
                restoreBtn.innerText = 'استعادة البيانات الأصلية';
                restoreBtn.addEventListener('click', function() {
                    errorTester.restoreOriginalData();
                    resultsEl.innerHTML += '<p class="text-success">تم استعادة البيانات الأصلية</p>';
                });
                
                resultsEl.appendChild(restoreBtn);
            }
        });
    }
});