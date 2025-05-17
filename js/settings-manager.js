/**
 * settings-manager.js
 * مدير إعدادات النظام - يربط جميع الخدمات والإعدادات بالمكان المناسب
 */

const settingsManager = {
    // حالة الإعدادات
    state: {
        initialized: false,
        settings: {
            general: {
                siteName: 'خدمات التواصل الاجتماعي',
                siteDescription: 'منصة لخدمات التواصل الاجتماعي',
                contactEmail: 'info@example.com',
                defaultCurrency: 'USD',
                enableNotifications: true,
                enableAutoSync: true,
                syncInterval: 30000
            },
            services: {},
            platforms: {},
            integrations: {
                paypal: {
                    enabled: true,
                    clientId: 'AeAK1HSgtUTaOIWew8Hw5Ts-fcAXRJbEkhDsmwUNhoAtThAUFer3s5vXQYnM_GeKGuJhRQ6rMSu_8OzJ'
                }
            }
        }
    },
    
    // تهيئة مدير الإعدادات
    init: function() {
        if (this.state.initialized) return;
        
        console.log('تهيئة مدير الإعدادات...');
        
        // تحميل الإعدادات من التخزين المحلي
        this.loadSettings();
        
        // تهيئة خدمات الربط
        this.setupConnectors();
        
        // إعداد مستمعي الأحداث
        this.setupEventListeners();
        
        this.state.initialized = true;
    },
    
    // تحميل الإعدادات من التخزين المحلي
    loadSettings: function() {
        try {
            // تحميل الإعدادات العامة
            const generalSettings = localStorage.getItem('dashboard_general_settings');
            if (generalSettings) {
                this.state.settings.general = { ...this.state.settings.general, ...JSON.parse(generalSettings) };
            }
              // تحميل إعدادات الخدمات من وحدة الخدمات الموحدة
            if (typeof serviceUtils !== 'undefined') {
                this.state.settings.services = serviceUtils.getAllServices();
            } else {
                // الحل البديل: استخدام مفتاح التخزين القديم
                const servicesSettings = localStorage.getItem('dashboard_services');
                if (servicesSettings) {
                    this.state.settings.services = JSON.parse(servicesSettings);
                }
            }
              // تحميل إعدادات المنصات من الوحدة الموحدة
            if (typeof platformUtils !== 'undefined') {
                this.state.settings.platforms = platformUtils.getAllPlatforms();
            }
            
            // تحميل إعدادات التكاملات
            const integrationsSettings = localStorage.getItem('dashboard_integrations');
            if (integrationsSettings) {
                this.state.settings.integrations = { ...this.state.settings.integrations, ...JSON.parse(integrationsSettings) };
            }
            
            console.log('تم تحميل الإعدادات بنجاح');
        } catch (err) {
            console.error('خطأ في تحميل الإعدادات:', err);
        }
    },
    
    // حفظ الإعدادات في التخزين المحلي
    saveSettings: function() {
        try {
            // حفظ الإعدادات العامة
            localStorage.setItem('dashboard_general_settings', JSON.stringify(this.state.settings.general));
            
            // حفظ إعدادات التكاملات
            localStorage.setItem('dashboard_integrations', JSON.stringify(this.state.settings.integrations));
            
            // إرسال حدث تحديث الإعدادات
            document.dispatchEvent(new CustomEvent('settingsUpdated', {
                detail: { source: 'settingsManager' }
            }));
            
            // مزامنة الإعدادات مع الصفحة الرئيسية
            this.syncSettingsWithIndex();
            
            console.log('تم حفظ الإعدادات بنجاح');
            return true;
        } catch (err) {
            console.error('خطأ في حفظ الإعدادات:', err);
            return false;
        }
    },
    
    // إعداد الموصلات مع الوحدات الأخرى
    setupConnectors: function() {
        // ربط إدارة الخدمات
        if (typeof servicesDashboard !== 'undefined') {
            // التأكد من أن servicesDashboard مهيأ
            if (typeof servicesDashboard.init === 'function' && !servicesDashboard.state.initialized) {
                servicesDashboard.init();
            }
        }
        
        // ربط إدارة المنصات
        if (typeof platformsDashboard !== 'undefined') {
            // التأكد من أن platformsDashboard مهيأ
            if (typeof platformsDashboard.init === 'function' && !platformsDashboard.state.initialized) {
                platformsDashboard.init();
            }
        }
        
        // ربط مخصص الأسعار
        if (typeof pricingCustomizer !== 'undefined') {
            // التأكد من أن pricingCustomizer مهيأ
            if (typeof pricingCustomizer.init === 'function' && !pricingCustomizer.state?.initialized) {
                pricingCustomizer.init();
            }
        }
        
        // ربط إدارة الطلبات
        if (typeof ordersDashboard !== 'undefined') {
            // التأكد من أن ordersDashboard مهيأ
            if (typeof ordersDashboard.init === 'function' && !ordersDashboard.state?.initialized) {
                ordersDashboard.init();
            }
        }
    },
    
    // إعداد مستمعي الأحداث
    setupEventListeners: function() {
        // الاستماع لتغييرات الخدمات
        document.addEventListener('servicesUpdated', this.handleServicesUpdate.bind(this));
        
        // الاستماع لتغييرات المنصات
        document.addEventListener('platformsUpdated', this.handlePlatformsUpdate.bind(this));
        
        // الاستماع لتغييرات الأسعار
        document.addEventListener('pricingUpdated', this.handlePricingUpdate.bind(this));
        
        // الاستماع لتحديثات إعدادات الموقع
        document.addEventListener('generalSettingsUpdated', (event) => {
            if (event.detail && event.detail.settings) {
                this.state.settings.general = { ...this.state.settings.general, ...event.detail.settings };
                this.saveSettings();
            }
        });
    },
    
    // معالجة تحديث الخدمات
    handleServicesUpdate: function(event) {
        console.log('تحديث الخدمات من المصدر:', event.detail?.source);
        
        // تحديث إعدادات الخدمات إذا كانت البيانات متوفرة
        if (event.detail && event.detail.services) {
            this.state.settings.services = event.detail.services;
            
            // إذا لم يكن المصدر هو مدير الإعدادات، قم بالمزامنة مع الصفحة الرئيسية
            if (event.detail.source !== 'settingsManager') {
                this.syncSettingsWithIndex();
            }
        } else {
            // إذا لم تكن البيانات متوفرة، قم بتحميلها من التخزين المحلي
            const servicesSettings = localStorage.getItem('dashboard_services');
            if (servicesSettings) {
                this.state.settings.services = JSON.parse(servicesSettings);
            }
        }
    },
    
    // معالجة تحديث المنصات
    handlePlatformsUpdate: function(event) {
        console.log('تحديث المنصات من المصدر:', event.detail?.source);
        
        // تحديث إعدادات المنصات إذا كانت البيانات متوفرة
        if (event.detail && event.detail.platforms) {
            this.state.settings.platforms = event.detail.platforms;
            
            // إذا لم يكن المصدر هو مدير الإعدادات، قم بالمزامنة مع الصفحة الرئيسية
            if (event.detail.source !== 'settingsManager') {
                this.syncSettingsWithIndex();
            }
        } else {            // إذا لم تكن البيانات متوفرة، قم بتحميلها من وحدة المنصات الموحدة
            if (typeof platformUtils !== 'undefined') {
                this.state.settings.platforms = platformUtils.getAllPlatforms();
            }
        }
    },
    
    // معالجة تحديث الأسعار
    handlePricingUpdate: function(event) {
        console.log('تحديث الأسعار من المصدر:', event.detail?.source);
        
        // إذا لم تكن البيانات متوفرة، قم بتحميلها من التخزين المحلي
        const pricingSettings = localStorage.getItem('dashboard_pricing');
        if (pricingSettings) {
            try {
                // ربط بيانات التسعير بالخدمات المناسبة
                const pricing = JSON.parse(pricingSettings);
                
                // تحديث أسعار الخدمات
                for (const serviceId in pricing) {
                    const service = this.findServiceById(serviceId);
                    if (service) {
                        service.customPricing = pricing[serviceId].customPricing || {};
                        service.platformPrices = pricing[serviceId].platformPrices || {};
                    }
                }
                
                // المزامنة مع الصفحة الرئيسية
                if (event.detail?.source !== 'settingsManager') {
                    this.syncSettingsWithIndex();
                }
            } catch (err) {
                console.error('خطأ في معالجة بيانات الأسعار:', err);
            }
        }
    },
    
    // البحث عن خدمة حسب المعرف
    findServiceById: function(serviceId) {
        if (!this.state.settings.services || !Array.isArray(this.state.settings.services)) {
            return null;
        }
        
        return this.state.settings.services.find(service => service.id.toString() === serviceId.toString());
    },
    
    // مزامنة الإعدادات مع الصفحة الرئيسية
    syncSettingsWithIndex: function() {
        try {
            // مزامنة الخدمات
            if (this.state.settings.services) {
                localStorage.setItem('services_data_for_index', JSON.stringify(this.state.settings.services));
            }
            
            // مزامنة المنصات
            if (this.state.settings.platforms) {
                localStorage.setItem('platforms_data_for_index', JSON.stringify(this.state.settings.platforms));
            }
            
            // مزامنة الأسعار
            this.exportPricingDataForIndex();
            
            console.log('تمت مزامنة الإعدادات مع الصفحة الرئيسية');
        } catch (err) {
            console.error('خطأ في مزامنة الإعدادات مع الصفحة الرئيسية:', err);
        }
    },
    
    // تصدير بيانات التسعير للصفحة الرئيسية
    exportPricingDataForIndex: function() {
        try {
            const pricingData = {};
            
            if (this.state.settings.services && Array.isArray(this.state.settings.services)) {
                this.state.settings.services.forEach(service => {
                    if (service && service.id) {
                        pricingData[service.id] = {
                            id: service.id,
                            name: service.name,
                            basePrice: service.basePrice,
                            platformPrices: service.platformPrices || {},
                            customPricing: service.customPricing || {},
                            minQuantity: service.minQuantity || 100,
                            maxQuantity: service.maxQuantity || 10000,
                            active: service.active
                        };
                    }
                });
            }
            
            localStorage.setItem('pricing_data_for_index', JSON.stringify(pricingData));
        } catch (err) {
            console.error('خطأ في تصدير بيانات التسعير للصفحة الرئيسية:', err);
        }
    },
    
    // تحديث قسم الإعدادات في لوحة التحكم
    renderSettingsUI: function() {
        const settingsContainer = document.getElementById('settings-container');
        if (!settingsContainer) return;
        
        settingsContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="section-header">
                    <h3 class="section-title">الإعدادات العامة</h3>
                    <p class="section-subtitle">تخصيص إعدادات الموقع الأساسية</p>
                </div>
                
                <form id="general-settings-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-gray-700 mb-2">اسم الموقع</label>
                            <input type="text" id="site-name" value="${this.state.settings.general.siteName}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2">البريد الإلكتروني للتواصل</label>
                            <input type="email" id="contact-email" value="${this.state.settings.general.contactEmail}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2">العملة الافتراضية</label>
                            <select id="default-currency" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="USD" ${this.state.settings.general.defaultCurrency === 'USD' ? 'selected' : ''}>دولار أمريكي ($)</option>
                                <option value="SAR" ${this.state.settings.general.defaultCurrency === 'SAR' ? 'selected' : ''}>ريال سعودي (ر.س)</option>
                                <option value="AED" ${this.state.settings.general.defaultCurrency === 'AED' ? 'selected' : ''}>درهم إماراتي (د.إ)</option>
                                <option value="EUR" ${this.state.settings.general.defaultCurrency === 'EUR' ? 'selected' : ''}>يورو (€)</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-gray-700 mb-2">وقت المزامنة التلقائية (بالثواني)</label>
                            <input type="number" id="sync-interval" value="${this.state.settings.general.syncInterval / 1000}" min="10" max="300" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                    </div>
                    
                    <div class="space-y-4 bg-gray-50 p-4 rounded-lg">
                        <div class="flex items-center">
                            <input type="checkbox" id="enable-notifications" class="w-4 h-4 text-blue-600 rounded" ${this.state.settings.general.enableNotifications ? 'checked' : ''}>
                            <label for="enable-notifications" class="mr-2 text-gray-700">تفعيل الإشعارات</label>
                        </div>
                        
                        <div class="flex items-center">
                            <input type="checkbox" id="enable-auto-sync" class="w-4 h-4 text-blue-600 rounded" ${this.state.settings.general.enableAutoSync ? 'checked' : ''}>
                            <label for="enable-auto-sync" class="mr-2 text-gray-700">تفعيل المزامنة التلقائية</label>
                        </div>
                    </div>
                </form>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6 mb-8">
                <div class="section-header">
                    <h3 class="section-title">إعدادات الدفع</h3>
                    <p class="section-subtitle">تكوين وسائل الدفع وبوابات الدفع</p>
                </div>
                
                <form id="payment-settings-form" class="space-y-6">
                    <div class="bg-blue-50 p-4 rounded-lg mb-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <i class="fab fa-paypal text-blue-600 text-2xl ml-3"></i>
                                <div>
                                    <h4 class="font-bold">بوابة دفع PayPal</h4>
                                    <p class="text-sm text-gray-600">تمكين الدفع عبر PayPal وبطاقات الائتمان</p>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <span class="ml-2 text-sm">الوضع:</span>
                                <label class="switch">
                                    <input type="checkbox" id="paypal-enabled" ${this.state.settings.integrations.paypal.enabled ? 'checked' : ''}>
                                    <span class="slider round"></span>
                                </label>
                            </div>
                        </div>
                        
                        <div class="mt-4 ${this.state.settings.integrations.paypal.enabled ? '' : 'hidden'}" id="paypal-settings">
                            <div class="space-y-4">
                                <div>
                                    <label class="block text-gray-700 mb-2">معرف العميل (Client ID)</label>
                                    <input type="text" id="paypal-client-id" value="${this.state.settings.integrations.paypal.clientId}" class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                </div>
                                <div class="text-xs text-gray-500">
                                    <p>للحصول على معرف العميل (Client ID)، قم بإنشاء حساب مطور على موقع PayPal Developer.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
  
        `;
        
        // إضافة مستمعي الأحداث بعد إنشاء العناصر
        this.setupSettingsUIEventListeners();
    },
    
    // إعداد مستمعي الأحداث لواجهة الإعدادات
    setupSettingsUIEventListeners: function() {
        // زر حفظ الإعدادات العامة
        const saveSettingsBtn = document.querySelector('#settings button[class*="bg-blue-600"]');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveGeneralSettings();
            });
        }
          // تبديل حالة PayPal
        const paypalEnabledCheckbox = document.getElementById('paypal-enabled');
        const paypalSettings = document.getElementById('paypal-settings');
        
        if (paypalEnabledCheckbox && paypalSettings) {
            paypalEnabledCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    paypalSettings.classList.remove('hidden');
                } else {
                    paypalSettings.classList.add('hidden');
                }
            });
        }
    },
      // حفظ الإعدادات العامة
    saveGeneralSettings: function() {
        const siteName = document.getElementById('site-name')?.value;
        const contactEmail = document.getElementById('contact-email')?.value;
        const defaultCurrency = document.getElementById('default-currency')?.value;
        const syncInterval = document.getElementById('sync-interval')?.value;
        const enableNotifications = document.getElementById('enable-notifications')?.checked;
        const enableAutoSync = document.getElementById('enable-auto-sync')?.checked;
        const paypalEnabled = document.getElementById('paypal-enabled')?.checked;
        const paypalClientId = document.getElementById('paypal-client-id')?.value;
        
        // تحديث الإعدادات العامة
        if (siteName) this.state.settings.general.siteName = siteName;
        if (contactEmail) this.state.settings.general.contactEmail = contactEmail;
        if (defaultCurrency) this.state.settings.general.defaultCurrency = defaultCurrency;
        if (syncInterval) this.state.settings.general.syncInterval = parseInt(syncInterval) * 1000;
        if (enableNotifications !== undefined) this.state.settings.general.enableNotifications = enableNotifications;
        if (enableAutoSync !== undefined) this.state.settings.general.enableAutoSync = enableAutoSync;
        
        // تحديث إعدادات PayPal
        if (paypalEnabled !== undefined) this.state.settings.integrations.paypal.enabled = paypalEnabled;
        if (paypalClientId) this.state.settings.integrations.paypal.clientId = paypalClientId;
        
        // حفظ الإعدادات
        if (this.saveSettings()) {
            this.showNotification('تم حفظ الإعدادات بنجاح!', 'success');
        } else {
            this.showNotification('حدث خطأ أثناء حفظ الإعدادات.', 'error');
        }
    },
    
    // عرض إشعار
    showNotification: function(message, type = 'info') {
        if (typeof notificationHelper !== 'undefined' && typeof notificationHelper.show === 'function') {
            // استخدام نظام الإشعارات إذا كان متاحًا
            notificationHelper.show(message, type);
        } else {
            // إشعار بسيط إذا لم يكن نظام الإشعارات متاحًا
            alert(message);
        }
    }
};

// تهيئة مدير الإعدادات عند تحميل المستند
document.addEventListener('DOMContentLoaded', function() {
    // تحقق من أننا في صفحة لوحة التحكم
    const settingsTab = document.getElementById('settings');
    if (settingsTab) {
        // تهيئة مدير الإعدادات
        settingsManager.init();
        
        // عرض واجهة الإعدادات إذا كنا في تبويب الإعدادات
        if (settingsTab.classList.contains('active')) {
            settingsManager.renderSettingsUI();
        }
        
        // إضافة مستمع لتحميل واجهة الإعدادات عند النقر على تبويب الإعدادات
        const settingsTabLink = document.querySelector('a[data-tab="settings"]');
        if (settingsTabLink) {
            settingsTabLink.addEventListener('click', function() {
                setTimeout(() => {
                    settingsManager.renderSettingsUI();
                }, 100);
            });
        }
    }
});
