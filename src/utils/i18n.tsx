import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Language = 'es' | 'en' | 'zh' | 'ar' | 'pt';

export const LANGUAGES: Record<Language, { label: string; icon: string; dir: 'ltr' | 'rtl' }> = {
  es: { label: 'Español', icon: '🇻🇪', dir: 'ltr' },
  en: { label: 'English', icon: '🇺🇸', dir: 'ltr' },
  zh: { label: '中文', icon: '🇨🇳', dir: 'ltr' },
  ar: { label: 'العربية', icon: '🇸🇦', dir: 'rtl' },
  pt: { label: 'Português', icon: '🇧🇷', dir: 'ltr' },
};

type TranslationKeys = {
  // Header
  'app.title': string;
  'app.subtitle': string;
  // Buttons
  'btn.data': string;
  'btn.exportJson': string;
  'btn.exportCsv': string;
  'btn.importJson': string;
  'btn.rescuedPersons': string;
  'btn.rescueMode': string;
  'btn.readOnly': string;
  'btn.editMode': string;
  'btn.login': string;
  'btn.logout': string;
  // Filters
  'filter.label': string;
  'filter.clear': string;
  // Sidebar
  'sidebar.search': string;
  'sidebar.addZone': string;
  'sidebar.zones': string;
  // Detail Panel
  'detail.helpGroups': string;
  'detail.supplies': string;
  'detail.coords': string;
  'detail.noGroups': string;
  'detail.noSupplies': string;
  // Rescue Mode
  'rescue.badge': string;
  'rescue.volunteers': string;
  'rescue.services': string;
  'rescue.tools': string;
  'rescue.chat': string;
  'rescue.bitchat': string;
  // Rescued Persons
  'rescued.title': string;
  'rescued.search': string;
  'rescued.noResults': string;
  'rescued.total': string;
  'rescued.good': string;
  'rescued.injured': string;
  'rescued.critical': string;
  'rescued.addPerson': string;
  'rescued.verifyNotice': string;
  'rescued.exportJson': string;
  'rescued.exportCsv': string;
  'rescued.name': string;
  'rescued.age': string;
  'rescued.gender': string;
  'rescued.male': string;
  'rescued.female': string;
  'rescued.other': string;
  'rescued.condition': string;
  'rescued.goodCondition': string;
  'rescued.injuredCondition': string;
  'rescued.criticalCondition': string;
  'rescued.zone': string;
  'rescued.terrain': string;
  'rescued.rescuedBy': string;
  'rescued.notes': string;
  'rescued.lat': string;
  'rescued.lng': string;
  'rescued.register': string;
  // Map
  'map.layerToggle': string;
  'map.placeMarker': string;
  'map.cancel': string;
  'map.apiRequired': string;
  // Notifications
  'notif.markAllRead': string;
  'notif.empty': string;
  // Markers
  'marker.earthquake': string;
  'marker.buildingCollapsed': string;
  'marker.riskZone': string;
  'marker.supplyCenter': string;
  'marker.blockedRoad': string;
  'marker.trappedPeople': string;
  'marker.shelter': string;
  'marker.supermarket': string;
  'marker.foodStore': string;
  'marker.pharmacy': string;
  // Form
  'form.zoneType': string;
  'form.title': string;
  'form.titlePlaceholder': string;
  'form.description': string;
  'form.descriptionPlaceholder': string;
  'form.severity': string;
  'form.terrain': string;
  'form.status': string;
  'form.active': string;
  'form.inactive': string;
  'form.coords': string;
  'form.save': string;
  'form.create': string;
  'form.cancel': string;
  // Login
  'login.title': string;
  'login.subtitle': string;
  'login.username': string;
  'login.password': string;
  'login.error': string;
  // Terrain
  'terrain.urban': string;
  'terrain.mountain': string;
  'terrain.coastal': string;
  'terrain.rural': string;
  'terrain.industrial': string;
  'terrain.mixed': string;
};

const translations: Record<Language, TranslationKeys> = {
  es: {
    'app.title': '🏠 Mapa de Terremoto - Venezuela',
    'app.subtitle': 'zonas registradas',
    'btn.data': '📥 Datos',
    'btn.exportJson': '📄 Exportar JSON',
    'btn.exportCsv': '📊 Exportar CSV',
    'btn.importJson': '📥 Importar JSON',
    'btn.rescuedPersons': '🏥 Personas Rescatadas',
    'btn.rescueMode': '🆘 Modo Rescatista',
    'btn.readOnly': '👁️ Solo Lectura',
    'btn.editMode': '✏️ Modo Edición',
    'btn.login': '🔐 Iniciar Sesión',
    'btn.logout': '🚪 Salir',
    'filter.label': 'Filtros',
    'filter.clear': '✕ Limpiar',
    'sidebar.search': 'Buscar zona...',
    'sidebar.addZone': '➕ Agregar Zona',
    'sidebar.zones': 'zonas',
    'detail.helpGroups': '👥 Grupos de Ayuda',
    'detail.supplies': '📦 Insumos',
    'detail.coords': '📍 Coordenadas',
    'detail.noGroups': 'No hay grupos asignados a esta zona',
    'detail.noSupplies': 'No hay insumos registrados',
    'rescue.badge': '🆘 MODO RESCATISTA',
    'rescue.volunteers': 'Voluntarios',
    'rescue.services': 'Servicios',
    'rescue.tools': 'Herramientas',
    'rescue.chat': 'Chat',
    'rescue.bitchat': 'Bitchat',
    'rescued.title': '🏥 Personas Rescatadas',
    'rescued.search': 'Buscar por nombre, zona o rescatista...',
    'rescued.noResults': 'No se encontraron personas con ese término',
    'rescued.total': 'Total',
    'rescued.good': 'Buen Estado',
    'rescued.injured': 'Heridos',
    'rescued.critical': 'Crítico',
    'rescued.addPerson': '➕ Registrar Persona Rescatada',
    'rescued.verifyNotice': 'Puedes verificar el estado de las personas en',
    'rescued.exportJson': '📥 Exportar JSON',
    'rescued.exportCsv': '📊 Exportar CSV',
    'rescued.name': 'Nombre *',
    'rescued.age': 'Edad',
    'rescued.gender': 'Sexo',
    'rescued.male': '👨 Masculino',
    'rescued.female': '👩 Femenino',
    'rescued.other': '🧑 Otro',
    'rescued.condition': 'Condición',
    'rescued.goodCondition': '✅ Bueno',
    'rescued.injuredCondition': '⚠️ Herido',
    'rescued.criticalCondition': '🔴 Crítico',
    'rescued.zone': 'Zona de Rescate *',
    'rescued.terrain': 'Terreno',
    'rescued.rescuedBy': 'Rescatado por',
    'rescued.notes': 'Notas',
    'rescued.lat': 'Latitud',
    'rescued.lng': 'Longitud',
    'rescued.register': '✅ Registrar Persona',
    'map.layerToggle': 'Rescatados',
    'map.placeMarker': '📍 Haz clic en el mapa para colocar la nueva zona',
    'map.cancel': 'Cancelar',
    'map.apiRequired': 'Google Maps API Key Requerida',
    'notif.markAllRead': 'Marcar todo leído',
    'notif.empty': 'Sin notificaciones',
    'marker.earthquake': 'Terremoto',
    'marker.buildingCollapsed': 'Edificio Derrumbado',
    'marker.riskZone': 'Zona de Riesgo',
    'marker.supplyCenter': 'Zona de Acopio',
    'marker.blockedRoad': 'Vía Obstruida',
    'marker.trappedPeople': 'Personas Atrapadas',
    'marker.shelter': 'Zona Refugio',
    'marker.supermarket': 'Supermercado',
    'marker.foodStore': 'Tienda de Comida',
    'marker.pharmacy': 'Farmacia',
    'form.zoneType': 'Tipo de Zona',
    'form.title': 'Título *',
    'form.titlePlaceholder': 'Nombre de la zona',
    'form.description': 'Descripción',
    'form.descriptionPlaceholder': 'Describe la situación en esta zona...',
    'form.severity': 'Severidad',
    'form.terrain': '🏔️ Tipo de Terreno',
    'form.status': 'Estado',
    'form.active': '✅ Activo / Abierto',
    'form.inactive': '❌ Inactivo / Cerrado',
    'form.coords': '📍 Coordenadas',
    'form.save': '💾 Guardar Cambios',
    'form.create': '➕ Crear Zona',
    'form.cancel': 'Cancelar',
    'login.title': '🔐 Iniciar Sesión',
    'login.subtitle': 'Accede para editar zonas y gestionar datos',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.error': 'Credenciales incorrectas',
    'terrain.urban': '🏙️ Urbano',
    'terrain.mountain': '🏔️ Montañoso',
    'terrain.coastal': '🏖️ Costero',
    'terrain.rural': '🌾 Rural',
    'terrain.industrial': '🏭 Industrial',
    'terrain.mixed': '🔀 Mixto',
  },
  en: {
    'app.title': '🏠 Earthquake Map - Venezuela',
    'app.subtitle': 'registered zones',
    'btn.data': '📥 Data',
    'btn.exportJson': '📄 Export JSON',
    'btn.exportCsv': '📊 Export CSV',
    'btn.importJson': '📥 Import JSON',
    'btn.rescuedPersons': '🏥 Rescued Persons',
    'btn.rescueMode': '🆘 Rescue Mode',
    'btn.readOnly': '👁️ Read Only',
    'btn.editMode': '✏️ Edit Mode',
    'btn.login': '🔐 Login',
    'btn.logout': '🚪 Logout',
    'filter.label': 'Filters',
    'filter.clear': '✕ Clear',
    'sidebar.search': 'Search zone...',
    'sidebar.addZone': '➕ Add Zone',
    'sidebar.zones': 'zones',
    'detail.helpGroups': '👥 Help Groups',
    'detail.supplies': '📦 Supplies',
    'detail.coords': '📍 Coordinates',
    'detail.noGroups': 'No groups assigned to this zone',
    'detail.noSupplies': 'No supplies registered',
    'rescue.badge': '🆘 RESCUE MODE',
    'rescue.volunteers': 'Volunteers',
    'rescue.services': 'Services',
    'rescue.tools': 'Tools',
    'rescue.chat': 'Chat',
    'rescue.bitchat': 'Bitchat',
    'rescued.title': '🏥 Rescued Persons',
    'rescued.search': 'Search by name, zone or rescuer...',
    'rescued.noResults': 'No persons found matching that term',
    'rescued.total': 'Total',
    'rescued.good': 'Good Condition',
    'rescued.injured': 'Injured',
    'rescued.critical': 'Critical',
    'rescued.addPerson': '➕ Register Rescued Person',
    'rescued.verifyNotice': 'You can verify the status of persons at',
    'rescued.exportJson': '📥 Export JSON',
    'rescued.exportCsv': '📊 Export CSV',
    'rescued.name': 'Name *',
    'rescued.age': 'Age',
    'rescued.gender': 'Gender',
    'rescued.male': '👨 Male',
    'rescued.female': '👩 Female',
    'rescued.other': '🧑 Other',
    'rescued.condition': 'Condition',
    'rescued.goodCondition': '✅ Good',
    'rescued.injuredCondition': '⚠️ Injured',
    'rescued.criticalCondition': '🔴 Critical',
    'rescued.zone': 'Rescue Zone *',
    'rescued.terrain': 'Terrain',
    'rescued.rescuedBy': 'Rescued by',
    'rescued.notes': 'Notes',
    'rescued.lat': 'Latitude',
    'rescued.lng': 'Longitude',
    'rescued.register': '✅ Register Person',
    'map.layerToggle': 'Rescued',
    'map.placeMarker': '📍 Click on the map to place the new zone',
    'map.cancel': 'Cancel',
    'map.apiRequired': 'Google Maps API Key Required',
    'notif.markAllRead': 'Mark all read',
    'notif.empty': 'No notifications',
    'marker.earthquake': 'Earthquake',
    'marker.buildingCollapsed': 'Building Collapsed',
    'marker.riskZone': 'Risk Zone',
    'marker.supplyCenter': 'Supply Center',
    'marker.blockedRoad': 'Blocked Road',
    'marker.trappedPeople': 'Trapped People',
    'marker.shelter': 'Shelter',
    'marker.supermarket': 'Supermarket',
    'marker.foodStore': 'Food Store',
    'marker.pharmacy': 'Pharmacy',
    'form.zoneType': 'Zone Type',
    'form.title': 'Title *',
    'form.titlePlaceholder': 'Zone name',
    'form.description': 'Description',
    'form.descriptionPlaceholder': 'Describe the situation in this zone...',
    'form.severity': 'Severity',
    'form.terrain': '🏔️ Terrain Type',
    'form.status': 'Status',
    'form.active': '✅ Active / Open',
    'form.inactive': '❌ Inactive / Closed',
    'form.coords': '📍 Coordinates',
    'form.save': '💾 Save Changes',
    'form.create': '➕ Create Zone',
    'form.cancel': 'Cancel',
    'login.title': '🔐 Login',
    'login.subtitle': 'Access to edit zones and manage data',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.error': 'Invalid credentials',
    'terrain.urban': '🏙️ Urban',
    'terrain.mountain': '🏔️ Mountainous',
    'terrain.coastal': '🏖️ Coastal',
    'terrain.rural': '🌾 Rural',
    'terrain.industrial': '🏭 Industrial',
    'terrain.mixed': '🔀 Mixed',
  },
  zh: {
    'app.title': '🏠 地震地图 - 委内瑞拉',
    'app.subtitle': '已注册区域',
    'btn.data': '📥 数据',
    'btn.exportJson': '📄 导出 JSON',
    'btn.exportCsv': '📊 导出 CSV',
    'btn.importJson': '📥 导入 JSON',
    'btn.rescuedPersons': '🏥 被救人员',
    'btn.rescueMode': '🆘 救援模式',
    'btn.readOnly': '👁️ 只读',
    'btn.editMode': '✏️ 编辑模式',
    'btn.login': '🔐 登录',
    'btn.logout': '🚪 退出',
    'filter.label': '筛选',
    'filter.clear': '✕ 清除',
    'sidebar.search': '搜索区域...',
    'sidebar.addZone': '➕ 添加区域',
    'sidebar.zones': '区域',
    'detail.helpGroups': '👥 援助小组',
    'detail.supplies': '📦 物资',
    'detail.coords': '📍 坐标',
    'detail.noGroups': '该区域未分配小组',
    'detail.noSupplies': '暂无物资登记',
    'rescue.badge': '🆘 救援模式',
    'rescue.volunteers': '志愿者',
    'rescue.services': '服务',
    'rescue.tools': '工具',
    'rescue.chat': '聊天',
    'rescue.bitchat': 'Bitchat',
    'rescued.title': '🏥 被救人员',
    'rescued.search': '按姓名、区域或救援者搜索...',
    'rescued.noResults': '未找到匹配的人员',
    'rescued.total': '总计',
    'rescued.good': '状况良好',
    'rescued.injured': '受伤',
    'rescued.critical': '危急',
    'rescued.addPerson': '➕ 登记被救人员',
    'rescued.verifyNotice': '您可以在以下网站验证人员状态',
    'rescued.exportJson': '📥 导出 JSON',
    'rescued.exportCsv': '📊 导出 CSV',
    'rescued.name': '姓名 *',
    'rescued.age': '年龄',
    'rescued.gender': '性别',
    'rescued.male': '👨 男',
    'rescued.female': '👩 女',
    'rescued.other': '🧑 其他',
    'rescued.condition': '状况',
    'rescued.goodCondition': '✅ 良好',
    'rescued.injuredCondition': '⚠️ 受伤',
    'rescued.criticalCondition': '🔴 危急',
    'rescued.zone': '救援区域 *',
    'rescued.terrain': '地形',
    'rescued.rescuedBy': '救援者',
    'rescued.notes': '备注',
    'rescued.lat': '纬度',
    'rescued.lng': '经度',
    'rescued.register': '✅ 登记人员',
    'map.layerToggle': '被救人员',
    'map.placeMarker': '📍 点击地图放置新区域',
    'map.cancel': '取消',
    'map.apiRequired': '需要 Google Maps API 密钥',
    'notif.markAllRead': '全部标为已读',
    'notif.empty': '暂无通知',
    'marker.earthquake': '地震',
    'marker.buildingCollapsed': '建筑倒塌',
    'marker.riskZone': '危险区域',
    'marker.supplyCenter': '物资中心',
    'marker.blockedRoad': '道路堵塞',
    'marker.trappedPeople': '被困人员',
    'marker.shelter': '避难所',
    'marker.supermarket': '超市',
    'marker.foodStore': '食品店',
    'marker.pharmacy': '药店',
    'form.zoneType': '区域类型',
    'form.title': '标题 *',
    'form.titlePlaceholder': '区域名称',
    'form.description': '描述',
    'form.descriptionPlaceholder': '描述该区域的情况...',
    'form.severity': '严重程度',
    'form.terrain': '🏔️ 地形类型',
    'form.status': '状态',
    'form.active': '✅ 活跃 / 开放',
    'form.inactive': '❌ 停用 / 关闭',
    'form.coords': '📍 坐标',
    'form.save': '💾 保存更改',
    'form.create': '➕ 创建区域',
    'form.cancel': '取消',
    'login.title': '🔐 登录',
    'login.subtitle': '登录以编辑区域和管理数据',
    'login.username': '用户名',
    'login.password': '密码',
    'login.error': '凭证无效',
    'terrain.urban': '🏙️ 城市',
    'terrain.mountain': '🏔️ 山区',
    'terrain.coastal': '🏖️ 沿海',
    'terrain.rural': '🌾 农村',
    'terrain.industrial': '🏭 工业区',
    'terrain.mixed': '🔀 混合',
  },
  ar: {
    'app.title': '🏠 خريطة زلازل - فنزويلا',
    'app.subtitle': 'مناطق مسجلة',
    'btn.data': '📥 البيانات',
    'btn.exportJson': '📄 تصدير JSON',
    'btn.exportCsv': '📊 تصدير CSV',
    'btn.importJson': '📥 استيراد JSON',
    'btn.rescuedPersons': '🏥 الأشخاص المنقذون',
    'btn.rescueMode': '🆘 وضع الإنقاذ',
    'btn.readOnly': '👁️ للقراءة فقط',
    'btn.editMode': '✏️ وضع التحرير',
    'btn.login': '🔐 تسجيل الدخول',
    'btn.logout': '🚪 تسجيل الخروج',
    'filter.label': 'الفلاتر',
    'filter.clear': '✕ مسح',
    'sidebar.search': 'بحث عن منطقة...',
    'sidebar.addZone': '➕ إضافة منطقة',
    'sidebar.zones': 'مناطق',
    'detail.helpGroups': '👥 مجموعات المساعدة',
    'detail.supplies': '📦 الإمدادات',
    'detail.coords': '📍 الإحداثيات',
    'detail.noGroups': 'لا توجد مجموعات مخصصة لهذه المنطقة',
    'detail.noSupplies': 'لا توجد إمدادات مسجلة',
    'rescue.badge': '🆘 وضع الإنقاذ',
    'rescue.volunteers': 'المتطوعون',
    'rescue.services': 'الخدمات',
    'rescue.tools': 'الأدوات',
    'rescue.chat': 'المحادثة',
    'rescue.bitchat': 'Bitchat',
    'rescued.title': '🏥 الأشخاص المنقذون',
    'rescued.search': 'بحث بالاسم أو المنطقة أو المنقذ...',
    'rescued.noResults': 'لم يتم العثور على أشخاص',
    'rescued.total': 'المجموع',
    'rescued.good': 'حالة جيدة',
    'rescued.injured': 'جرحى',
    'rescued.critical': 'حرج',
    'rescued.addPerson': '➕ تسجيل شخص منقذ',
    'rescued.verifyNotice': 'يمكنك التحقق من حالة الأشخاص على',
    'rescued.exportJson': '📥 تصدير JSON',
    'rescued.exportCsv': '📊 تصدير CSV',
    'rescued.name': 'الاسم *',
    'rescued.age': 'العمر',
    'rescued.gender': 'الجنس',
    'rescued.male': '👨 ذكر',
    'rescued.female': '👩 أنثى',
    'rescued.other': '🧑 آخر',
    'rescued.condition': 'الحالة',
    'rescued.goodCondition': '✅ جيدة',
    'rescued.injuredCondition': '⚠️ جريح',
    'rescued.criticalCondition': '🔴 حرج',
    'rescued.zone': 'منطقة الإنقاذ *',
    'rescued.terrain': 'التضاريس',
    'rescued.rescuedBy': 'المنقذ',
    'rescued.notes': 'ملاحظات',
    'rescued.lat': 'خط العرض',
    'rescued.lng': 'خط الطول',
    'rescued.register': '✅ تسجيل الشخص',
    'map.layerToggle': 'المنقذون',
    'map.placeMarker': '📍 انقر على الخريطة لوضع المنطقة الجديدة',
    'map.cancel': 'إلغاء',
    'map.apiRequired': 'مفتاح Google Maps API مطلوب',
    'notif.markAllRead': 'تحديد الكل كمقروء',
    'notif.empty': 'لا توجد إشعارات',
    'marker.earthquake': 'زلزال',
    'marker.buildingCollapsed': 'مبنى منهار',
    'marker.riskZone': 'منطقة خطر',
    'marker.supplyCenter': 'مركز إمدادات',
    'marker.blockedRoad': 'طريق مسدود',
    'marker.trappedPeople': 'أشخاص عالقون',
    'marker.shelter': 'مأوى',
    'marker.supermarket': 'سوبر ماركت',
    'marker.foodStore': 'محل طعام',
    'marker.pharmacy': 'صيدلية',
    'form.zoneType': 'نوع المنطقة',
    'form.title': 'العنوان *',
    'form.titlePlaceholder': 'اسم المنطقة',
    'form.description': 'الوصف',
    'form.descriptionPlaceholder': 'صف الوضع في هذه المنطقة...',
    'form.severity': 'الخطورة',
    'form.terrain': '🏔️ نوع التضاريس',
    'form.status': 'الحالة',
    'form.active': '✅ نشط / مفتوح',
    'form.inactive': '❌ غير نشط / مغلق',
    'form.coords': '📍 الإحداثيات',
    'form.save': '💾 حفظ التغييرات',
    'form.create': '➕ إنشاء منطقة',
    'form.cancel': 'إلغاء',
    'login.title': '🔐 تسجيل الدخول',
    'login.subtitle': 'الدخول لتحرير المناطق وإدارة البيانات',
    'login.username': 'اسم المستخدم',
    'login.password': 'كلمة المرور',
    'login.error': 'بيانات اعتماد غير صالحة',
    'terrain.urban': '🏙️ حضري',
    'terrain.mountain': '🏔️ جبلي',
    'terrain.coastal': '🏖️ ساحلي',
    'terrain.rural': '🌾 ريفي',
    'terrain.industrial': '🏭 صناعي',
    'terrain.mixed': '🔀 مختلط',
  },
  pt: {
    'app.title': '🏠 Mapa de Terremoto - Venezuela',
    'app.subtitle': 'zonas registradas',
    'btn.data': '📥 Dados',
    'btn.exportJson': '📄 Exportar JSON',
    'btn.exportCsv': '📊 Exportar CSV',
    'btn.importJson': '📥 Importar JSON',
    'btn.rescuedPersons': '🏥 Pessoas Resgatadas',
    'btn.rescueMode': '🆘 Modo Resgate',
    'btn.readOnly': '👁️ Somente Leitura',
    'btn.editMode': '✏️ Modo Edição',
    'btn.login': '🔐 Entrar',
    'btn.logout': '🚪 Sair',
    'filter.label': 'Filtros',
    'filter.clear': '✕ Limpar',
    'sidebar.search': 'Pesquisar zona...',
    'sidebar.addZone': '➕ Adicionar Zona',
    'sidebar.zones': 'zonas',
    'detail.helpGroups': '👥 Grupos de Ajuda',
    'detail.supplies': '📦 Suprimentos',
    'detail.coords': '📍 Coordenadas',
    'detail.noGroups': 'Nenhum grupo atribuído a esta zona',
    'detail.noSupplies': 'Nenhum suprimento registrado',
    'rescue.badge': '🆘 MODO RESGATE',
    'rescue.volunteers': 'Voluntários',
    'rescue.services': 'Serviços',
    'rescue.tools': 'Ferramentas',
    'rescue.chat': 'Chat',
    'rescue.bitchat': 'Bitchat',
    'rescued.title': '🏥 Pessoas Resgatadas',
    'rescued.search': 'Pesquisar por nome, zona ou resgatador...',
    'rescued.noResults': 'Nenhuma pessoa encontrada',
    'rescued.total': 'Total',
    'rescued.good': 'Bom Estado',
    'rescued.injured': 'Feridos',
    'rescued.critical': 'Crítico',
    'rescued.addPerson': '➕ Registrar Pessoa Resgatada',
    'rescued.verifyNotice': 'Você pode verificar o status das pessoas em',
    'rescued.exportJson': '📥 Exportar JSON',
    'rescued.exportCsv': '📊 Exportar CSV',
    'rescued.name': 'Nome *',
    'rescued.age': 'Idade',
    'rescued.gender': 'Sexo',
    'rescued.male': '👨 Masculino',
    'rescued.female': '👩 Feminino',
    'rescued.other': '🧑 Outro',
    'rescued.condition': 'Condição',
    'rescued.goodCondition': '✅ Bom',
    'rescued.injuredCondition': '⚠️ Ferido',
    'rescued.criticalCondition': '🔴 Crítico',
    'rescued.zone': 'Zona de Resgate *',
    'rescued.terrain': 'Terreno',
    'rescued.rescuedBy': 'Resgatado por',
    'rescued.notes': 'Notas',
    'rescued.lat': 'Latitude',
    'rescued.lng': 'Longitude',
    'rescued.register': '✅ Registrar Pessoa',
    'map.layerToggle': 'Resgatados',
    'map.placeMarker': '📍 Clique no mapa para colocar a nova zona',
    'map.cancel': 'Cancelar',
    'map.apiRequired': 'Chave da API do Google Maps Necessária',
    'notif.markAllRead': 'Marcar tudo como lido',
    'notif.empty': 'Sem notificações',
    'marker.earthquake': 'Terremoto',
    'marker.buildingCollapsed': 'Prédio Desabado',
    'marker.riskZone': 'Zona de Risco',
    'marker.supplyCenter': 'Centro de Suprimentos',
    'marker.blockedRoad': 'Estrada Bloqueada',
    'marker.trappedPeople': 'Pessoas Presas',
    'marker.shelter': 'Abrigo',
    'marker.supermarket': 'Supermercado',
    'marker.foodStore': 'Loja de Comida',
    'marker.pharmacy': 'Farmácia',
    'form.zoneType': 'Tipo de Zona',
    'form.title': 'Título *',
    'form.titlePlaceholder': 'Nome da zona',
    'form.description': 'Descrição',
    'form.descriptionPlaceholder': 'Descreva a situação nesta zona...',
    'form.severity': 'Severidade',
    'form.terrain': '🏔️ Tipo de Terreno',
    'form.status': 'Estado',
    'form.active': '✅ Ativo / Aberto',
    'form.inactive': '❌ Inativo / Fechado',
    'form.coords': '📍 Coordenadas',
    'form.save': '💾 Salvar Alterações',
    'form.create': '➕ Criar Zona',
    'form.cancel': 'Cancelar',
    'login.title': '🔐 Entrar',
    'login.subtitle': 'Acesse para editar zonas e gerenciar dados',
    'login.username': 'Usuário',
    'login.password': 'Senha',
    'login.error': 'Credenciais inválidas',
    'terrain.urban': '🏙️ Urbano',
    'terrain.mountain': '🏔️ Montanhoso',
    'terrain.coastal': '🏖️ Costeiro',
    'terrain.rural': '🌾 Rural',
    'terrain.industrial': '🏭 Industrial',
    'terrain.mixed': '🔀 Misto',
  },
};

// ===== CONTEXT =====
interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'es',
  setLang: () => {},
  t: (key) => key,
  dir: 'ltr',
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('app_lang') as Language) || 'es';
    } catch { return 'es'; }
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_lang', newLang);
    document.documentElement.dir = LANGUAGES[newLang].dir;
    document.documentElement.lang = newLang;
  }, []);

  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[lang][key] || translations['es'][key] || key;
  }, [lang]);

  const dir = LANGUAGES[lang].dir;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
