/**
 * Services Dashboard Module - Updated Version
 * Handles all operations related to services management in the dashboard
 * Uses social_services key in localStorage with platformId instead of platforms array
 */

const servicesUpdated = {
    // State for services management
    state: {
        services: [],
        filteredServices: [],
        activeService: null,
        editMode: false,
        lastNotificationTime: 0
    },

    // Initialize the services dashboard
    init: function() {
        this.loadServices();
        this.setupEventListeners();
        this.renderServices();
    },

    // Load services from serviceUtils
    loadServices: function() {
        // التحقق من وجود serviceUtils
        if (typeof serviceUtils !== 'undefined') {
            // استخدام serviceUtils للحصول على الخدمات
            const services = serviceUtils.getAllServices();
            if (services && services.length > 0) {
                this.state.services = services;
                this.state.filteredServices = this.filterServicesByActivePlatforms();
                console.log(`تم تحميل ${services.length} خدمة من التخزين المحلي الموحد`);
                console.log(`تم تصفية ${this.state.filteredServices.length} خدمة مرتبطة بمنصات نشطة`);
                return;
            }
        }
        
        // الحل البديل: استخدام مفتاح التخزين القديم
        const storedServices = localStorage.getItem('dashboard_services');
        if (storedServices) {
            try {
                const parsedServices = JSON.parse(storedServices);
                if (parsedServices && parsedServices.length > 0) {
                    // تحويل الهيكل القديم إلى الهيكل الجديد
                    this.state.services = this.migrateOldServicesToNewFormat(parsedServices);
                    this.state.filteredServices = this.filterServicesByActivePlatforms();
                    this.saveServices();
                    console.log(`تم تحميل وتحويل ${this.state.services.length} خدمة من التخزين القديم`);
                } else {
                    this.initDefaultServices();
                }
                
                // ترحيل البيانات إلى التخزين الموحد الجديد إذا كان متاحًا
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.migrateOldData();
                    // إعادة تحميل الخدمات بعد الترحيل
                    this.state.services = serviceUtils.getAllServices();
                    this.state.filteredServices = this.filterServicesByActivePlatforms();
                }
            } catch (e) {
                console.error('خطأ في تحليل الخدمات المخزنة:', e);
                this.initDefaultServices();
            }
        } else {
            this.initDefaultServices();
        }
    },
    
    // تحويل الهيكل القديم (platforms) إلى الهيكل الجديد (platformId)
    migrateOldServicesToNewFormat: function(oldServices) {
        const newServices = [];
        
        oldServices.forEach(service => {
            if (service.platforms && service.platforms.length > 0) {
                // لكل منصة في المصفوفة القديمة، إنشاء خدمة جديدة
                service.platforms.forEach((platform, index) => {
                    const newService = {
                        id: index === 0 ? service.id : `${service.id}-${platform}`,
                        name: `${service.name} - ${this.getPlatformName(platform)}`,
                        description: service.description,
                        platformId: platform,
                        price: service.platformPrices && service.platformPrices[platform] 
                            ? service.platformPrices[platform] 
                            : service.basePrice,
                        minQuantity: service.minQuantity || 100,
                        maxQuantity: service.maxQuantity || 10000,
                        active: service.active !== undefined ? service.active : true,
                        createdAt: service.dateCreated || new Date().toISOString()
                    };
                    
                    newServices.push(newService);
                });
            } else {
                // إذا لم تكن هناك منصات، نستخدم منصة افتراضية
                const newService = {
                    id: service.id,
                    name: service.name,
                    description: service.description,
                    platformId: 'instagram', // افتراضي
                    price: service.basePrice || 0,
                    minQuantity: service.minQuantity || 100,
                    maxQuantity: service.maxQuantity || 10000,
                    active: service.active !== undefined ? service.active : true,
                    createdAt: service.dateCreated || new Date().toISOString()
                };
                
                newServices.push(newService);
            }
        });
        
        return newServices;
    },
    
    // تهيئة الخدمات الافتراضية
    initDefaultServices: function() {
        if (typeof serviceUtils !== 'undefined') {
            const defaultServices = serviceUtils.getDefaultServices();
            this.state.services = defaultServices;
            this.state.filteredServices = this.filterServicesByActivePlatforms();
            this.saveServices();
        } else {
            this.state.services = this.getDefaultServices();
            this.state.filteredServices = this.filterServicesByActivePlatforms();
            this.saveServices();
        }
    },
    
    // تصفية الخدمات بناءً على المنصات النشطة
    filterServicesByActivePlatforms: function() {
        if (typeof serviceUtils !== 'undefined' && typeof serviceUtils.filterServicesByActivePlatforms === 'function') {
            return serviceUtils.filterServicesByActivePlatforms();
        }
        
        // في حالة عدم وجود serviceUtils، نقوم بتنفيذ التصفية محلياً
        const activePlatforms = this.getActivePlatforms();
        return this.state.services.filter(service => activePlatforms.includes(service.platformId));
    },
    
    // الحصول على المنصات النشطة
    getActivePlatforms: function() {
        try {
            const storedPlatforms = localStorage.getItem('social_platforms');
            if (storedPlatforms) {
                const platforms = JSON.parse(storedPlatforms);
                return platforms
                    .filter(platform => platform.active)
                    .map(platform => platform.slug);
            }
        } catch (error) {
            console.error('خطأ في الحصول على المنصات النشطة:', error);
        }
        
        return [];
    },

    // Save services to serviceUtils and localStorage
    saveServices: function() {
        // حفظ الخدمات باستخدام serviceUtils إذا كان متاحًا
        if (typeof serviceUtils !== 'undefined') {
            serviceUtils.saveServices(this.state.services);
        } else {
            // الحل البديل: استخدام مفتاح التخزين الموحد
            localStorage.setItem('social_services', JSON.stringify(this.state.services));
        }
        
        // إعادة تصفية الخدمات بعد الحفظ
        this.state.filteredServices = this.filterServicesByActivePlatforms();
        
        // Export data for the index page
        if (typeof pricingCustomizer !== 'undefined' && typeof pricingCustomizer.exportPricingData === 'function') {
            pricingCustomizer.exportPricingData();
        } else {
            // الحل البديل إذا كان pricingCustomizer غير متاح
            this.exportPricingDataForIndex();
        }
    },
    
    // Export pricing data for index.html if pricingCustomizer is not available
    exportPricingDataForIndex: function() {
        const pricingData = {};
        
        this.state.services.forEach(service => {
            pricingData[service.id] = {
                id: service.id,
                name: service.name,
                price: service.price,
                platformId: service.platformId,
                minQuantity: service.minQuantity,
                maxQuantity: service.maxQuantity
            };
        });
        
        // Save to localStorage for access from index page
        localStorage.setItem('pricing_data_for_index', JSON.stringify(pricingData));
    },

    // Get default services for initialization
    getDefaultServices: function() {
        return [
            {
                id: 'service-1',
                name: 'متابعين انستغرام',
                description: 'زيادة عدد المتابعين لحسابك على انستغرام',
                platformId: 'instagram',
                price: 5.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-2',
                name: 'إعجابات فيسبوك',
                description: 'زيادة الإعجابات على منشوراتك في فيسبوك',
                platformId: 'facebook',
                price: 3.00,
                minQuantity: 50,
                maxQuantity: 5000,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-3',
                name: 'مشاهدات يوتيوب',
                description: 'زيادة عدد مشاهدات فيديوهاتك على يوتيوب',
                platformId: 'youtube',
                price: 10.00,
                minQuantity: 500,
                maxQuantity: 50000,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-4',
                name: 'متابعين تيك توك',
                description: 'زيادة عدد المتابعين لحسابك على تيك توك',
                platformId: 'tiktok',
                price: 6.00,
                minQuantity: 100,
                maxQuantity: 10000,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-5',
                name: 'إعجابات تويتر',
                description: 'زيادة عدد الإعجابات لتغريداتك على تويتر',
                platformId: 'twitter',
                price: 4.25,
                minQuantity: 100,
                maxQuantity: 5000,
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
    },

    // Setup event listeners for service management
    setupEventListeners: function() {
        // Service filter dropdown
        const serviceFilter = document.getElementById('service-filter');
        if (serviceFilter) {
            serviceFilter.addEventListener('change', this.handleServiceFilter.bind(this));
        }

        // Service search input
        const serviceSearch = document.getElementById('service-search');
        if (serviceSearch) {
            serviceSearch.addEventListener('input', this.handleServiceSearch.bind(this));
        }

        // Add service button
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', this.showAddServiceModal.bind(this));
        }

        // Close service modal button
        const closeServiceModal = document.getElementById('close-service-modal');
        if (closeServiceModal) {
            closeServiceModal.addEventListener('click', this.closeServiceModal.bind(this));
        }

        // Cancel service button
        const cancelService = document.getElementById('cancel-service');
        if (cancelService) {
            cancelService.addEventListener('click', this.closeServiceModal.bind(this));
        }

        // Save service button
        const saveService = document.getElementById('save-service');
        if (saveService) {
            saveService.addEventListener('click', this.saveService.bind(this));
        }

        // Export services button
        const exportServicesBtn = document.getElementById('export-services-btn');
        if (exportServicesBtn) {
            exportServicesBtn.addEventListener('click', this.exportServices.bind(this));
        }
    },

    // Handle service filtering
    handleServiceFilter: function(e) {
        const filterValue = e.target.value;
        
        if (filterValue === 'all') {
            this.state.filteredServices = this.filterServicesByActivePlatforms();
        } else {
            this.state.filteredServices = this.filterServicesByActivePlatforms().filter(service => 
                service.platformId === filterValue
            );
        }
        
        this.renderServices();
    },

    // Handle service search
    handleServiceSearch: function(e) {
        const searchQuery = e.target.value.toLowerCase();
        
        if (searchQuery === '') {
            this.state.filteredServices = this.filterServicesByActivePlatforms();
        } else {
            this.state.filteredServices = this.filterServicesByActivePlatforms().filter(service => 
                service.name.toLowerCase().includes(searchQuery) || 
                service.description.toLowerCase().includes(searchQuery)
            );
        }
        
        this.renderServices();
    },

    // Show add service modal
    showAddServiceModal: function() {
        this.state.editMode = false;
        this.state.activeService = null;
        
        const serviceForm = document.getElementById('add-service-form');
        if (serviceForm) {
            serviceForm.reset();
            serviceForm.setAttribute('data-mode', 'add');
            
            // التحقق من وجود قائمة المنصات وملء المنصات النشطة فقط
            const platformSelect = document.getElementById('service-platform');
            if (platformSelect) {
                platformSelect.innerHTML = '';
                const activePlatforms = this.getActivePlatforms();
                const platformsData = this.getPlatformsData();
                
                activePlatforms.forEach(platformId => {
                    const platform = platformsData.find(p => p.slug === platformId) || { name: this.getPlatformName(platformId) };
                    const option = document.createElement('option');
                    option.value = platformId;
                    option.textContent = platform.name;
                    platformSelect.appendChild(option);
                });
            }
        }
        
        const addServiceModal = document.getElementById('add-service-modal');
        if (addServiceModal) {
            addServiceModal.classList.remove('hidden');
        }
    },
    
    // الحصول على بيانات المنصات
    getPlatformsData: function() {
        try {
            const storedPlatforms = localStorage.getItem('social_platforms');
            if (storedPlatforms) {
                return JSON.parse(storedPlatforms);
            }
        } catch (error) {
            console.error('خطأ في الحصول على بيانات المنصات:', error);
        }
        
        return [];
    },

    // Show edit service modal
    showEditServiceModal: function(serviceId) {
        this.state.editMode = true;
        this.state.activeService = this.state.services.find(service => service.id === serviceId);
        
        const serviceForm = document.getElementById('add-service-form');
        if (serviceForm && this.state.activeService) {
            // Populate form with service data
            const nameInput = serviceForm.querySelector('input[type="text"]');
            const descriptionInput = serviceForm.querySelector('textarea');
            const priceInput = document.getElementById('service-price');
            const platformSelect = document.getElementById('service-platform');
            const minQuantityInput = document.getElementById('min-quantity');
            const maxQuantityInput = document.getElementById('max-quantity');
            const activeInput = document.getElementById('service-active');
            
            nameInput.value = this.state.activeService.name;
            descriptionInput.value = this.state.activeService.description;
            priceInput.value = this.state.activeService.price || 0;
            
            // ملء المنصات النشطة
            if (platformSelect) {
                platformSelect.innerHTML = '';
                const activePlatforms = this.getActivePlatforms();
                const platformsData = this.getPlatformsData();
                
                activePlatforms.forEach(platformId => {
                    const platform = platformsData.find(p => p.slug === platformId) || { name: this.getPlatformName(platformId) };
                    const option = document.createElement('option');
                    option.value = platformId;
                    option.textContent = platform.name;
                    platformSelect.appendChild(option);
                    
                    // تحديد المنصة الحالية للخدمة
                    if (platformId === this.state.activeService.platformId) {
                        option.selected = true;
                    }
                });
            }
            
            // تعيين قيم الحد الأدنى والأقصى للكمية
            minQuantityInput.value = this.state.activeService.minQuantity || 100;
            maxQuantityInput.value = this.state.activeService.maxQuantity || 10000;
            
            // Set active status
            activeInput.checked = this.state.activeService.active !== false;
            
            serviceForm.setAttribute('data-mode', 'edit');
        }
        
        const addServiceModal = document.getElementById('add-service-modal');
        if (addServiceModal) {
            addServiceModal.classList.remove('hidden');
        }
    },

    // Close service modal
    closeServiceModal: function() {
        const addServiceModal = document.getElementById('add-service-modal');
        if (addServiceModal) {
            addServiceModal.classList.add('hidden');
        }
    },

    // Save new or edited service
    saveService: function() {
        const serviceForm = document.getElementById('add-service-form');
        if (!serviceForm) return;
        
        const nameInput = serviceForm.querySelector('input[type="text"]');
        const descriptionInput = serviceForm.querySelector('textarea');
        const priceInput = document.getElementById('service-price');
        const platformSelect = document.getElementById('service-platform');
        const minQuantityInput = document.getElementById('min-quantity');
        const maxQuantityInput = document.getElementById('max-quantity');
        const activeInput = document.getElementById('service-active');
        
        // التحقق من إدخال البيانات المطلوبة
        if (!nameInput.value.trim()) {
            this.showNotification('يرجى إدخال اسم الخدمة', 'error');
            return;
        }
        
        if (!descriptionInput.value.trim()) {
            this.showNotification('يرجى إدخال وصف الخدمة', 'error');
            return;
        }
        
        if (!priceInput.value || parseFloat(priceInput.value) <= 0) {
            this.showNotification('يرجى إدخال سعر صحيح للخدمة', 'error');
            return;
        }
        
        if (!platformSelect.value) {
            this.showNotification('يرجى اختيار منصة للخدمة', 'error');
            return;
        }
        
        // جمع بيانات المنصة
        const platformId = platformSelect.value;
        const price = parseFloat(priceInput.value) || 0;
        const minQuantity = parseInt(minQuantityInput.value) || 100;
        const maxQuantity = parseInt(maxQuantityInput.value) || 10000;
        const isActive = activeInput.checked;
        
        if (this.state.editMode && this.state.activeService) {
            // تحديث الخدمة الحالية
            this.state.activeService.name = nameInput.value;
            this.state.activeService.description = descriptionInput.value;
            this.state.activeService.platformId = platformId;
            this.state.activeService.price = price;
            this.state.activeService.minQuantity = minQuantity;
            this.state.activeService.maxQuantity = maxQuantity;
            this.state.activeService.active = isActive;
            this.state.activeService.updatedAt = new Date().toISOString();
            
            // تحديث المصفوفة
            const index = this.state.services.findIndex(service => service.id === this.state.activeService.id);
            if (index !== -1) {
                this.state.services[index] = this.state.activeService;
            }
            
            // استخدام serviceUtils لتحديث الخدمة إذا كان متاحًا
            if (typeof serviceUtils !== 'undefined') {
                serviceUtils.updateService(this.state.activeService.id, this.state.activeService);
            }
            
            this.showNotification('تم تحديث الخدمة بنجاح', 'success');
        } else {
            // التحقق من وجود خدمة بنفس الاسم والمنصة
            const existingService = this.state.services.find(
                service => service.name.toLowerCase() === nameInput.value.toLowerCase() && service.platformId === platformId
            );
            
            if (existingService) {
                // تحديث الخدمة الموجودة
                existingService.description = descriptionInput.value;
                existingService.price = price;
                existingService.minQuantity = minQuantity;
                existingService.maxQuantity = maxQuantity;
                existingService.active = isActive;
                existingService.updatedAt = new Date().toISOString();
                
                // استخدام serviceUtils لتحديث الخدمة إذا كان متاحًا
                if (typeof serviceUtils !== 'undefined') {
                    serviceUtils.updateService(existingService.id, existingService);
                }
                
                this.state.activeService = existingService;
                this.showNotification('تم تحديث الخدمة الموجودة بنجاح', 'info');
            } else {
                // إنشاء خدمة جديدة
                const newService = {
                    id: `service-${Date.now()}`,
                    name: nameInput.value,
                    description: descriptionInput.value,
                    platformId: platformId,
                    price: price,
                    minQuantity: minQuantity,
                    maxQuantity: maxQuantity,
                    active: isActive,
                    createdAt: new Date().toISOString()
                };
                
                // استخدام serviceUtils لإضافة الخدمة إذا كان متاحًا
                if (typeof serviceUtils !== 'undefined') {
                    const addedService = serviceUtils.addService(newService);
                    this.state.activeService = addedService || newService;
                } else {
                    this.state.services.push(newService);
                    this.state.activeService = newService;
                }
                
                this.showNotification('تم إضافة الخدمة بنجاح', 'success');
            }
        }
        
        // Save to storage and update UI
        this.saveServices();
        this.closeServiceModal();
    },

    // Delete a service
    deleteService: function(serviceId) {
        if (confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            // استخدام serviceUtils لحذف الخدمة إذا كان متاحًا
            if (typeof serviceUtils !== 'undefined') {
                serviceUtils.deleteService(serviceId);
                // تحديث المصفوفة المحلية
                this.state.services = serviceUtils.getAllServices();
            } else {
                // حذف مباشر من المصفوفة المحلية
                this.state.services = this.state.services.filter(service => service.id !== serviceId);
            }
            
            // تحديث الواجهة
            this.saveServices();
            this.showNotification('تم حذف الخدمة بنجاح', 'success');
        }
    },

    // Toggle service active status
    toggleServiceStatus: function(serviceId) {
        const serviceIndex = this.state.services.findIndex(service => service.id === serviceId);
        if (serviceIndex !== -1) {
            this.state.services[serviceIndex].active = !this.state.services[serviceIndex].active;
            
            // تحديث آخر تعديل
            this.state.services[serviceIndex].updatedAt = new Date().toISOString();
            
            // استخدام serviceUtils لتحديث الخدمة إذا كان متاحًا
            if (typeof serviceUtils !== 'undefined') {
                serviceUtils.updateService(serviceId, this.state.services[serviceIndex]);
            }
            
            this.saveServices();
            
            this.showNotification(
                this.state.services[serviceIndex].active ? 'تم تفعيل الخدمة' : 'تم تعطيل الخدمة',
                'info'
            );
        }
    },

    // Export services data to CSV
    exportServices: function() {
        const services = this.state.services;
        let csvContent = "data:text/csv;charset=utf-8," 
            + "ID,الاسم,الوصف,المنصة,السعر,الحد الأدنى,الحد الأقصى,مفعلة,تاريخ الإنشاء\n";
        
        services.forEach(service => {
            const row = [
                service.id,
                service.name,
                service.description,
                service.platformId,
                service.price,
                service.minQuantity,
                service.maxQuantity,
                service.active ? 'نعم' : 'لا',
                service.createdAt
            ].join(',');
            csvContent += row + "\n";
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "services_" + new Date().toISOString().split('T')[0] + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('تم تصدير بيانات الخدمات بنجاح', 'success');
    },

    // Show notification
    showNotification: function(message, type = 'info') {
        // منع الإشعارات المتكررة السريعة
        const now = Date.now();
        if (this.state.lastNotificationTime && now - this.state.lastNotificationTime < 1000) {
            console.log('Notification throttled:', message);
            return;
        }
        
        this.state.lastNotificationTime = now;
        
        // استخدام notificationHelper إذا كان متاحًا
        if (typeof notificationHelper !== 'undefined' && typeof notificationHelper.show === 'function') {
            notificationHelper.show(message, type);
        } else {
            // الحل البديل: استخدام تنبيه بسيط
            alert(message);
        }
    },

    // Render services in the container
    renderServices: function() {
        const servicesContainer = document.getElementById('services-container');
        if (!servicesContainer) return;
        
        if (this.state.filteredServices.length === 0) {
            servicesContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-search text-gray-400 text-5xl mb-4"></i>
                    <p class="text-gray-500 text-xl">لم يتم العثور على خدمات</p>
                </div>
            `;
            return;
        }
        
        let servicesHTML = '';
        this.state.filteredServices.forEach(service => {
            // منصة واحدة لكل خدمة في الهيكل الجديد
            const platform = service.platformId;
            const platformIcon = this.getPlatformIcon(platform);
            const price = service.price ? `$${service.price.toFixed(2)}` : `$0.00`;
            
            const platformHTML = `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1 mb-1">
                <i class="${platformIcon} ml-1"></i>
                ${this.getPlatformName(platform)} (${price})
            </span>`;
            
            servicesHTML += `
                <div class="service-card bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 mb-4">
                    <div class="flex items-center justify-between p-4 border-b border-gray-100">
                        <div class="flex items-center">
                            <div class="w-10 h-10 flex items-center justify-center rounded-full ${service.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}">
                                <i class="fas fa-${service.active ? 'check' : 'times'}"></i>
                            </div>
                            <div class="mr-3">
                                <h3 class="text-lg font-bold text-gray-800">${service.name}</h3>
                                <p class="text-sm text-gray-500">${this.getPlatformName(platform)}</p>
                            </div>
                        </div>
                        <div class="text-gray-700 font-bold text-lg">
                            ${price}
                        </div>
                    </div>
                    <div class="p-4">
                        <p class="text-gray-600 mb-3">${service.description}</p>
                        <div class="mb-3 flex flex-wrap">
                            ${platformHTML}
                        </div>
                        <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <span>الحد الأدنى: ${service.minQuantity || 0}</span>
                            <span>الحد الأقصى: ${(service.maxQuantity ? service.maxQuantity.toLocaleString() : '0')}</span>
                        </div>
                        <div class="flex justify-between border-t border-gray-100 pt-3">
                            <button class="text-blue-600 hover:text-blue-800 transition" onclick="servicesUpdated.showEditServiceModal('${service.id}')">
                                <i class="fas fa-edit ml-1"></i> تعديل
                            </button>
                            <button class="text-yellow-600 hover:text-yellow-800 transition" onclick="servicesUpdated.toggleServiceStatus('${service.id}')">
                                <i class="fas fa-${service.active ? 'pause' : 'play'} ml-1"></i> ${service.active ? 'تعطيل' : 'تفعيل'}
                            </button>
                            <button class="text-red-600 hover:text-red-800 transition" onclick="servicesUpdated.deleteService('${service.id}')">
                                <i class="fas fa-trash-alt ml-1"></i> حذف
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        servicesContainer.innerHTML = servicesHTML;
    },

    // Get platform icon class
    getPlatformIcon: function(platform) {
        const icons = {
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook-f',
            'twitter': 'fab fa-twitter',
            'youtube': 'fab fa-youtube',
            'tiktok': 'fab fa-tiktok',
            'linkedin': 'fab fa-linkedin'
        };
        return icons[platform] || 'fas fa-globe';
    },

    // Get platform name
    getPlatformName: function(platform) {
        const names = {
            'instagram': 'انستغرام',
            'facebook': 'فيسبوك',
            'twitter': 'تويتر',
            'youtube': 'يوتيوب',
            'tiktok': 'تيك توك',
            'linkedin': 'لينكد إن'
        };
        return names[platform] || platform;
    }
};
