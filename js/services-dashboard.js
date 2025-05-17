/**
 * نظام إدارة الخدمات في لوحة التحكم
 */
const servicesDashboard = {
    // حالة تهيئة النظام
    initialized: false,

    // تهيئة النظام
    init() {
        if (this.initialized) return;
        console.log("تهيئة مكون إدارة الخدمات...");
        
        this.loadPlatforms();
        this.loadServices();
        this.setupAddServiceForm();
        this.setupEventListeners();
        this.setupFilterSearch();
        this.initialized = true;
    },

    // تحميل المنصات للاستخدام في النماذج
    loadPlatforms() {
        try {
            const platformsData = localStorage.getItem('social_platforms');
            if (!platformsData) {
                console.warn("لا توجد منصات مخزنة!");
                return;
            }

            const platforms = JSON.parse(platformsData);
            const activePlatforms = platforms.filter(platform => platform.active === true);
            
            // تحديث قائمة المنصات في نموذج إضافة الخدمة
            const platformSelect = document.getElementById('service-platform');
            if (platformSelect) {
                platformSelect.innerHTML = '<option value="" disabled selected>اختر المنصة</option>';
                
                activePlatforms.forEach(platform => {
                    const option = document.createElement('option');
                    option.value = platform.id;
                    option.textContent = platform.name;
                    platformSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error("خطأ في تحميل المنصات:", error);
        }
    },

    // تحميل الخدمات من localStorage وعرضها
    loadServices() {
        try {
            const servicesContainer = document.getElementById('services-container');
            if (!servicesContainer) return;

            // تفريغ الحاوية
            servicesContainer.innerHTML = '';

            // تحميل الخدمات من localStorage
            const servicesData = localStorage.getItem('social_services');
            if (!servicesData) {
                this.showEmptyState(servicesContainer);
                return;
            }

            const services = JSON.parse(servicesData);
            
            if (services.length === 0) {
                this.showEmptyState(servicesContainer);
                return;
            }

            // تحميل المنصات للربط مع الخدمات
            const platformsData = localStorage.getItem('social_platforms');
            const platforms = platformsData ? JSON.parse(platformsData) : [];
            const platformMap = {};
            platforms.forEach(platform => {
                platformMap[platform.id] = platform;
            });

            // عرض كل خدمة
            services.forEach(service => {
                const platform = platformMap[service.platformId] || { name: 'غير معروفة', icon: 'fa-globe', colorClass: 'bg-gray-500' };
                const serviceCard = this.createServiceCard(service, platform);
                servicesContainer.appendChild(serviceCard);
            });

            // إضافة معلومات إحصائية عن عدد الخدمات
            const activeServices = services.filter(s => s.active === true);
            const statsDiv = document.createElement('div');
            statsDiv.className = 'col-span-3 text-center py-3 text-sm text-gray-500 mt-4 border-t border-gray-200';
            statsDiv.textContent = `إجمالي الخدمات: ${services.length} | الخدمات النشطة: ${activeServices.length}`;
            servicesContainer.appendChild(statsDiv);

        } catch (error) {
            console.error("خطأ في تحميل الخدمات:", error);
        }
    },

    // إظهار حالة فارغة عندما لا توجد خدمات
    showEmptyState(container) {
        container.innerHTML = `
            <div class="col-span-3 flex flex-col items-center justify-center py-12">
                <div class="text-center">
                    <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-bold mb-2 text-gray-700">لا توجد خدمات</h3>
                    <p class="text-gray-500 mb-6">لم يتم العثور على أي خدمات في النظام</p>
                    <button id="add-first-service-btn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">
                        <i class="fas fa-plus mr-1"></i> إضافة خدمة جديدة
                    </button>
                </div>
            </div>
        `;

        // إضافة مستمع حدث لزر إضافة الخدمة
        const addServiceBtn = document.getElementById('add-first-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                const modal = document.getElementById('add-service-modal');
                if (modal) modal.classList.remove('hidden');
            });
        }
    },

    // إنشاء بطاقة خدمة
    createServiceCard(service, platform) {
        const div = document.createElement('div');
        div.className = 'service-card';
        div.setAttribute('data-service-id', service.id);
        div.setAttribute('data-service-type', service.type);
        div.setAttribute('data-platform-id', service.platformId);
        div.setAttribute('data-active', service.active);

        // تحديد لون ورمز نوع الخدمة
        const serviceTypeIcons = {
            'followers': 'fas fa-user-plus',
            'likes': 'fas fa-heart',
            'views': 'fas fa-eye',
            'comments': 'fas fa-comment',
            'default': 'fas fa-star'
        };

        const serviceTypeColors = {
            'followers': 'bg-blue-500',
            'likes': 'bg-red-500',
            'views': 'bg-purple-500',
            'comments': 'bg-green-500',
            'default': 'bg-gray-500'
        };

        const serviceIcon = serviceTypeIcons[service.type] || serviceTypeIcons.default;
        const serviceColor = serviceTypeColors[service.type] || serviceTypeColors.default;
        const platformIcon = `fab fa-${platform.icon}` || 'fas fa-globe';
        const statusBadgeClass = service.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
        const statusText = service.active ? 'نشط' : 'غير نشط';

        div.innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center">
                        <div class="w-12 h-12 ${serviceColor} text-white rounded-full flex items-center justify-center mr-3">
                            <i class="${serviceIcon} text-xl"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold">${service.name}</h3>
                            <div class="flex items-center text-sm text-gray-500 mt-1">
                                <span class="platform-tag">
                                    <i class="${platformIcon} mr-1"></i> ${platform.name}
                                </span>
                                <span class="px-2 py-1 rounded-full ${statusBadgeClass} text-xs font-medium mr-2">
                                    ${statusText}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="text-xl font-bold text-indigo-600">$${service.price.toFixed(2)}</div>
                </div>
                
                <p class="text-gray-600 mb-4">${service.description || 'لا يوجد وصف للخدمة'}</p>
                
                <div class="flex justify-between items-center text-sm text-gray-500 border-t pt-4">
                    <div>
                        <i class="fas fa-tag mr-1"></i> ${this.getServiceTypeName(service.type)}
                    </div>
                    <div>
                        <i class="fas fa-chart-line mr-1"></i> ${service.minQuantity} - ${service.maxQuantity}
                    </div>
                </div>
                
                <div class="flex justify-end mt-4 space-x-2 rtl:space-x-reverse">
                    <button class="edit-service-btn px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200" data-id="${service.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="toggle-service-btn px-3 py-1 ${service.active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'} rounded hover:bg-opacity-80" data-id="${service.id}">
                        <i class="fas ${service.active ? 'fa-toggle-off' : 'fa-toggle-on'}"></i>
                    </button>
                    <button class="delete-service-btn px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200" data-id="${service.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;

        // إضافة مستمعي الأحداث للأزرار
        setTimeout(() => {
            const editBtn = div.querySelector('.edit-service-btn');
            const toggleBtn = div.querySelector('.toggle-service-btn');
            const deleteBtn = div.querySelector('.delete-service-btn');
            
            if (editBtn) editBtn.addEventListener('click', () => this.editService(service.id));
            if (toggleBtn) toggleBtn.addEventListener('click', () => this.toggleService(service.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteService(service.id));
        }, 0);

        return div;
    },

    // إعداد نموذج إضافة الخدمات
    setupAddServiceForm() {
        const addServiceForm = document.getElementById('add-service-form');
        const saveServiceBtn = document.getElementById('save-service');
        const cancelServiceBtn = document.getElementById('cancel-service');
        
        if (!addServiceForm || !saveServiceBtn || !cancelServiceBtn) return;

        saveServiceBtn.addEventListener('click', () => {
            const serviceNameInput = document.getElementById('service-name');
            const serviceDescriptionInput = document.getElementById('service-description');
            const servicePlatformSelect = document.getElementById('service-platform');
            const servicePriceInput = document.getElementById('service-price');
            const minQuantityInput = document.getElementById('min-quantity');
            const maxQuantityInput = document.getElementById('max-quantity');
            const serviceActiveCheckbox = document.getElementById('service-active');

            // التحقق من الحقول المطلوبة
            if (!serviceNameInput.value.trim()) {
                alert('الرجاء إدخال اسم الخدمة');
                return;
            }
            
            if (!servicePlatformSelect.value) {
                alert('الرجاء اختيار منصة');
                return;
            }

            if (!servicePriceInput.value || isNaN(parseFloat(servicePriceInput.value))) {
                alert('الرجاء إدخال سعر صحيح');
                return;
            }

            // تحديد ما إذا كان هذا تعديلًا أو إضافة جديدة
            const isEdit = addServiceForm.getAttribute('data-mode') === 'edit';
            const serviceId = isEdit ? parseInt(addServiceForm.getAttribute('data-service-id')) : this.generateServiceId();
            
            // تحديد نوع الخدمة بناءً على اسم الخدمة
            let serviceType = 'default';
            if (serviceNameInput.value.includes('متابعين')) serviceType = 'followers';
            else if (serviceNameInput.value.includes('إعجابات')) serviceType = 'likes';
            else if (serviceNameInput.value.includes('مشاهدات')) serviceType = 'views';
            else if (serviceNameInput.value.includes('تعليقات')) serviceType = 'comments';
            
            // إنشاء كائن الخدمة
            const service = {
                id: serviceId,
                name: serviceNameInput.value.trim(),
                description: serviceDescriptionInput.value.trim(),
                type: serviceType,
                platformId: servicePlatformSelect.value,
                price: parseFloat(servicePriceInput.value),
                minQuantity: parseInt(minQuantityInput.value) || 100,
                maxQuantity: parseInt(maxQuantityInput.value) || 1000,
                active: serviceActiveCheckbox.checked
            };

            // حفظ الخدمة في localStorage
            this.saveService(service, isEdit);
            
            // إغلاق النموذج وإعادة تحميل الخدمات
            document.getElementById('add-service-modal').classList.add('hidden');
            this.loadServices();
        });

        cancelServiceBtn.addEventListener('click', () => {
            document.getElementById('add-service-modal').classList.add('hidden');
        });

        // إعادة تعيين النموذج عند الإغلاق
        document.getElementById('close-service-modal').addEventListener('click', () => {
            document.getElementById('add-service-modal').classList.add('hidden');
        });
    },

    // توليد معرف فريد للخدمة
    generateServiceId() {
        const servicesData = localStorage.getItem('social_services');
        if (!servicesData) return 1;
        
        const services = JSON.parse(servicesData);
        if (services.length === 0) return 1;
        
        const maxId = Math.max(...services.map(s => s.id));
        return maxId + 1;
    },

    // حفظ الخدمة في localStorage
    saveService(service, isEdit) {
        try {
            const servicesData = localStorage.getItem('social_services');
            const services = servicesData ? JSON.parse(servicesData) : [];
            
            if (isEdit) {
                // تحديث الخدمة الموجودة
                const index = services.findIndex(s => s.id === service.id);
                if (index !== -1) {
                    services[index] = service;
                }
            } else {
                // إضافة خدمة جديدة
                services.push(service);
            }
            
            localStorage.setItem('social_services', JSON.stringify(services));
            console.log(`تم ${isEdit ? 'تحديث' : 'إضافة'} الخدمة بنجاح:`, service);
        } catch (error) {
            console.error("خطأ في حفظ الخدمة:", error);
        }
    },

    // تحرير خدمة موجودة
    editService(serviceId) {
        try {
            const servicesData = localStorage.getItem('social_services');
            if (!servicesData) return;
            
            const services = JSON.parse(servicesData);
            const service = services.find(s => s.id === serviceId);
            
            if (!service) {
                console.error(`الخدمة ذات المعرف ${serviceId} غير موجودة`);
                return;
            }
            
            // تعبئة النموذج بمعلومات الخدمة
            document.getElementById('service-name').value = service.name;
            document.getElementById('service-description').value = service.description || '';
            document.getElementById('service-platform').value = service.platformId;
            document.getElementById('service-price').value = service.price;
            document.getElementById('min-quantity').value = service.minQuantity;
            document.getElementById('max-quantity').value = service.maxQuantity;
            document.getElementById('service-active').checked = service.active;
            
            // تعيين وضع التحرير ومعرف الخدمة
            document.getElementById('add-service-form').setAttribute('data-mode', 'edit');
            document.getElementById('add-service-form').setAttribute('data-service-id', serviceId);
            
            // تغيير عنوان النموذج وإظهاره
            const modalTitle = document.querySelector('#add-service-modal .text-xl');
            if (modalTitle) modalTitle.textContent = 'تحرير الخدمة';
            
            document.getElementById('add-service-modal').classList.remove('hidden');
        } catch (error) {
            console.error("خطأ في تحرير الخدمة:", error);
        }
    },

    // تبديل حالة الخدمة (نشط/غير نشط)
    toggleService(serviceId) {
        try {
            const servicesData = localStorage.getItem('social_services');
            if (!servicesData) return;
            
            const services = JSON.parse(servicesData);
            const index = services.findIndex(s => s.id === serviceId);
            
            if (index === -1) {
                console.error(`الخدمة ذات المعرف ${serviceId} غير موجودة`);
                return;
            }
            
            // تبديل الحالة
            services[index].active = !services[index].active;
            
            // حفظ التغييرات
            localStorage.setItem('social_services', JSON.stringify(services));
            
            // إعادة تحميل الخدمات
            this.loadServices();
        } catch (error) {
            console.error("خطأ في تبديل حالة الخدمة:", error);
        }
    },

    // حذف خدمة
    deleteService(serviceId) {
        if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) {
            return;
        }
        
        try {
            const servicesData = localStorage.getItem('social_services');
            if (!servicesData) return;
            
            const services = JSON.parse(servicesData);
            const updatedServices = services.filter(s => s.id !== serviceId);
            
            localStorage.setItem('social_services', JSON.stringify(updatedServices));
            
            // إعادة تحميل الخدمات
            this.loadServices();
        } catch (error) {
            console.error("خطأ في حذف الخدمة:", error);
        }
    },

    // إعداد أزرار الفلترة والبحث
    setupFilterSearch() {
        const serviceFilter = document.getElementById('service-filter');
        const serviceSearch = document.getElementById('service-search');
        
        if (serviceFilter) {
            serviceFilter.addEventListener('change', () => this.applyFilters());
        }
        
        if (serviceSearch) {
            serviceSearch.addEventListener('input', () => this.applyFilters());
        }
    },

    // تطبيق عوامل التصفية والبحث
    applyFilters() {
        const filterType = document.getElementById('service-filter')?.value || 'all';
        const searchQuery = document.getElementById('service-search')?.value.toLowerCase() || '';
        
        const serviceCards = document.querySelectorAll('.service-card');
        
        serviceCards.forEach(card => {
            const serviceType = card.getAttribute('data-service-type');
            const serviceName = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const serviceDesc = card.querySelector('p')?.textContent.toLowerCase() || '';
            
            const matchesFilter = filterType === 'all' || serviceType === filterType;
            const matchesSearch = !searchQuery || 
                                 serviceName.includes(searchQuery) || 
                                 serviceDesc.includes(searchQuery);
            
            if (matchesFilter && matchesSearch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    },

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        // زر إضافة خدمة جديدة
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                // إعادة تعيين النموذج
                const form = document.getElementById('add-service-form');
                if (form) {
                    form.reset();
                    form.setAttribute('data-mode', 'add');
                }
                
                // تغيير عنوان النموذج
                const modalTitle = document.querySelector('#add-service-modal .text-xl');
                if (modalTitle) modalTitle.textContent = 'إضافة خدمة جديدة';
                
                // عرض النموذج
                document.getElementById('add-service-modal').classList.remove('hidden');
            });
        }

        // زر تصدير الخدمات
        const exportServicesBtn = document.getElementById('export-services-btn');
        if (exportServicesBtn) {
            exportServicesBtn.addEventListener('click', () => {
                this.exportServices();
            });
        }

        // زر اختبار الترحيل
        const testMigrationBtn = document.getElementById('test-migration-btn');
        if (testMigrationBtn) {
            testMigrationBtn.addEventListener('click', () => {
                if (typeof platformUtils !== 'undefined' && typeof platformUtils.migrateOldData === 'function') {
                    platformUtils.migrateOldData();
                    alert('تم اختبار ترحيل البيانات بنجاح!');
                } else {
                    alert('وحدة ترحيل البيانات غير متوفرة!');
                }
            });
        }

        // زر اختبار المنصات
        const testPlatformsBtn = document.getElementById('test-platforms-btn');
        if (testPlatformsBtn) {
            testPlatformsBtn.addEventListener('click', () => {
                if (typeof platformStorageValidator !== 'undefined' && typeof platformStorageValidator.displayResults === 'function') {
                    platformStorageValidator.displayResults();
                } else {
                    this.testPlatforms();
                }
            });
        }
    },

    // تصدير الخدمات كملف JSON
    exportServices() {
        try {
            const servicesData = localStorage.getItem('social_services');
            if (!servicesData) {
                alert('لا توجد خدمات للتصدير!');
                return;
            }
            
            const services = JSON.parse(servicesData);
            const dataStr = JSON.stringify(services, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = 'social_services_' + new Date().toISOString().slice(0,10) + '.json';
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } catch (error) {
            console.error("خطأ في تصدير الخدمات:", error);
            alert('حدث خطأ أثناء تصدير الخدمات!');
        }
    },

    // اختبار المنصات والخدمات
    testPlatforms() {
        try {
            const platformsData = localStorage.getItem('social_platforms');
            const servicesData = localStorage.getItem('social_services');
            
            const platforms = platformsData ? JSON.parse(platformsData) : [];
            const services = servicesData ? JSON.parse(servicesData) : [];
            
            const activePlatforms = platforms.filter(p => p.active === true);
            const activeServices = services.filter(s => s.active === true);
            
            const report = `
                === تقرير حالة البيانات ===
                
                المنصات:
                - إجمالي المنصات: ${platforms.length}
                - المنصات النشطة: ${activePlatforms.length}
                
                الخدمات:
                - إجمالي الخدمات: ${services.length}
                - الخدمات النشطة: ${activeServices.length}
                
                تفاصيل الخدمات حسب النوع:
                - متابعين: ${services.filter(s => s.type === 'followers').length}
                - إعجابات: ${services.filter(s => s.type === 'likes').length}
                - مشاهدات: ${services.filter(s => s.type === 'views').length}
                - تعليقات: ${services.filter(s => s.type === 'comments').length}
                - أخرى: ${services.filter(s => !['followers', 'likes', 'views', 'comments'].includes(s.type)).length}
            `;
            
            alert(report);
        } catch (error) {
            console.error("خطأ في اختبار المنصات والخدمات:", error);
            alert('حدث خطأ أثناء اختبار المنصات والخدمات!');
        }
    },

    // الحصول على اسم نوع الخدمة بالعربية
    getServiceTypeName(type) {
        const typeNames = {
            'followers': 'متابعين',
            'likes': 'إعجابات',
            'views': 'مشاهدات',
            'comments': 'تعليقات',
            'default': 'خدمة'
        };
        
        return typeNames[type] || typeNames.default;
    }
};

// تنفيذ التهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    servicesDashboard.init();
});