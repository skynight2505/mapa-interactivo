import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

// ===== Language types =====
export type Language = 'es' | 'en' | 'zh' | 'ar' | 'pt';

export const LANGUAGES: Record<Language, { label: string; icon: string; dir: 'ltr' | 'rtl' }> = {
  es: { label: 'Español', icon: '🇪🇸', dir: 'ltr' },
  en: { label: 'English', icon: '🇬🇧', dir: 'ltr' },
  zh: { label: '中文', icon: '🇨🇳', dir: 'ltr' },
  ar: { label: 'العربية', icon: '🇸🇦', dir: 'rtl' },
  pt: { label: 'Português', icon: '🇧🇷', dir: 'ltr' },
};

// ===== Translation keys =====
export type TranslationKeys = {
  // App
  'app.title': string;
  'app.subtitle': string;
  'app.verifiedOnly': string;
  // Header
  'btn.data': string;
  'btn.exportJson': string;
  'btn.exportCsv': string;
  'btn.importJson': string;
  'btn.rescuedPersons': string;
  'btn.rescueMode': string;
  'btn.logout': string;
  'btn.login': string;
  'btn.edit': string;
  'btn.addView': string;
  'btn.readOnly': string;
  'btn.admin': string;
  'btn.guide': string;
  'header.syncCloud': string;
  'header.syncLocal': string;
  // Import Modal
  'import.title': string;
  'import.desc': string;
  'import.desc2': string;
  'import.dropzone': string;
  'import.cancel': string;
  'import.error': string;
  // Map
  'map.clickToPlace': string;
  'map.cancel': string;
  'map.loading': string;
  'map.clickForOptions': string;
  'map.removeMarker': string;
  'map.layerHide': string;
  'map.layerShow': string;
  // FilterBar
  'filter.label': string;
  'filter.clear': string;
  // Sidebar
  'sidebar.search': string;
  'sidebar.noResults': string;
  'sidebar.noZones': string;
  'sidebar.showing': string;
  'sidebar.of': string;
  'sidebar.zones': string;
  'sidebar.addNew': string;
  'sidebar.edit': string;
  'sidebar.delete': string;
  'sidebar.confirmDelete': string;
  // MarkerPopup
  'popup.severity': string;
  'popup.helpGroups': string;
  'popup.noGroups': string;
  'popup.members': string;
  'popup.supplies': string;
  'popup.noSupplies': string;
  'popup.needed': string;
  'popup.available': string;
  'popup.delivered': string;
  'popup.coords': string;
  'popup.created': string;
  'popup.updated': string;
  'popup.verifiedBy': string;
  'popup.verified': string;
  'popup.photos': string;
  'popup.noLinks': string;
  'popup.addLink': string;
  'popup.linkTitle': string;
  'popup.linkUrl': string;
  'popup.linkCategory': string;
  'popup.linkDesc': string;
  'popup.linkSubmit': string;
  'popup.linkCancel': string;
  // MarkerForm
  'form.newZone': string;
  'form.editZone': string;
  'form.zoneType': string;
  'form.title': string;
  'form.titlePlaceholder': string;
  'form.description': string;
  'form.descriptionPlaceholder': string;
  'form.terrain': string;
  'form.severity': string;
  'form.status': string;
  'form.sevLow': string;
  'form.sevMed': string;
  'form.sevHigh': string;
  'form.sevCritical': string;
  'form.statusActive': string;
  'form.statusInactive': string;
  'form.coordinates': string;
  'form.saveChanges': string;
  'form.createZone': string;
  'form.helpGroups': string;
  'form.addGroup': string;
  'form.supplies': string;
  'form.addSupply': string;
  'form.groupName': string;
  'form.groupContact': string;
  'form.supplyName': string;
  'form.quantity': string;
  'form.unit': string;
  'form.cancel': string;
  'form.latPlaceholder': string;
  'form.latHint': string;
  'form.lngPlaceholder': string;
  'form.lngHint': string;
  'form.membersPlaceholder': string;
  'form.maxImages': string;
  'form.translations': string;
  // Login
  'login.title': string;
  'login.subtitle': string;
  'login.username': string;
  'login.password': string;
  'login.usernamePlaceholder': string;
  'login.passwordPlaceholder': string;
  'login.submitting': string;
  'login.submit': string;
  // Notification
  'notif.title': string;
  'notif.markAllRead': string;
  'notif.empty': string;
  'notif.now': string;
  'notif.minutesAgo': string;
  'notif.hoursAgo': string;
  'notif.daysAgo': string;
  'notif.delete': string;
  'notif.emergencyTitle': string;
  // Rescuer Mode
  'rescue.mode': string;
  'rescue.tabVolunteers': string;
  'rescue.tabServices': string;
  'rescue.tabTools': string;
  'rescue.tabChat': string;
  'rescue.tabBitchat': string;
  'rescue.tabSupplies': string;
  'rescue.tabRescued': string;
  'rescue.tabLinks': string;
  'rescue.tabPriority': string;
  // Rescued Persons
  'rescued.title': string;
  'rescued.verifyTitle': string;
  'rescued.verifyDesc': string;
  'rescued.searchPlaceholder': string;
  'rescued.resultsFor': string;
  'rescued.noResults': string;
  'rescued.total': string;
  'rescued.goodCondition': string;
  'rescued.injured': string;
  'rescued.critical': string;
  'rescued.registerPerson': string;
  'rescued.exportJson': string;
  'rescued.exportCsv': string;
  'rescued.formName': string;
  'rescued.formAge': string;
  'rescued.formGender': string;
  'rescued.formCondition': string;
  'rescued.formZone': string;
  'rescued.formTerrain': string;
  'rescued.formRescuedBy': string;
  'rescued.formNotes': string;
  'rescued.formLat': string;
  'rescued.formLng': string;
  'rescued.formMale': string;
  'rescued.formFemale': string;
  'rescued.formOther': string;
  'rescued.formGood': string;
  'rescued.formInjured': string;
  'rescued.formCritical': string;
  'rescued.formSubmit': string;
  'rescued.yearsOld': string;
  'rescued.noRecord': string;
  'rescued.viewOnMap': string;
  'rescued.verifyOnSite': string;
  'rescued.editPerson': string;
  'rescued.saveChanges': string;
  'rescued.verificationUrl': string;
  'rescued.linkLabel': string;
  'rescued.linkUrl': string;
  'rescued.addLink': string;
  // Search
  'search.placeholder': string;
  'search.clearTitle': string;
  'search.nearbyZones': string;
  'search.removeMarker': string;
  'search.addMarkerHere': string;
  // Error
  'error.title': string;
  'error.desc': string;
  'error.unknown': string;
  'error.reload': string;
  // Admin
  'admin.title': string;
  'admin.users': string;
  'admin.admin': string;
  'admin.editor': string;
  'admin.viewer': string;
  'admin.newUser': string;
  'admin.sync': string;
  'admin.syncing': string;
  'admin.changePass': string;
  'admin.usernamePlaceholder': string;
  'admin.passwordPlaceholder': string;
  'admin.displayNamePlaceholder': string;
  'admin.roleEditor': string;
  'admin.roleAdmin': string;
  'admin.roleViewer': string;
  'admin.createUser': string;
};

// ===== Translations =====
const translations: Record<Language, TranslationKeys> = {
  es: {
    'app.title': 'Mapa Interactivo Terremoto Venezuela',
    'app.subtitle': 'zonas de emergencia',
    'app.verifiedOnly': '✅ Solo verificados',
    'btn.data': 'Datos',
    'btn.exportJson': '📥 Exportar JSON',
    'btn.exportCsv': '📊 Exportar CSV',
    'btn.importJson': '📥 Importar JSON',
    'btn.rescuedPersons': '🏥 Personas Rescatadas',
    'btn.rescueMode': 'Modo Rescatista',
    'btn.logout': 'Salir',
    'btn.login': 'Entrar',
    'btn.edit': 'Edición',
    'btn.addView': 'Agregar',
    'btn.readOnly': 'Solo ver',
    'btn.admin': 'Admin',
    'btn.guide': 'Guía',
    'header.syncCloud': 'Sincronizado con la nube (KV)',
    'header.syncLocal': 'Solo almacenamiento local',
    'import.title': '📥 Importar Datos',
    'import.desc': 'Selecciona un archivo JSON exportado desde esta aplicación para importar los datos.',
    'import.desc2': 'Los marcadores existentes se mantendrán y se agregarán los nuevos.',
    'import.dropzone': '📁 Haz clic aquí para seleccionar un archivo JSON',
    'import.cancel': 'Cancelar',
    'import.error': 'Error al importar',
    'map.clickToPlace': '📍 Haz clic en el mapa para colocar la nueva zona',
    'map.cancel': 'Cancelar',
    'map.loading': 'Cargando mapa...',
    'map.clickForOptions': 'Click para opciones',
    'map.removeMarker': '🗑️ Quitar marcador',
    'map.layerHide': 'Ocultar personas rescatadas',
    'map.layerShow': 'Mostrar personas rescatadas',
    'filter.label': '🔍 Filtrar:',
    'filter.clear': '✕ Limpiar',
    'sidebar.search': 'Buscar zonas...',
    'sidebar.noResults': 'No se encontraron resultados',
    'sidebar.noZones': 'No hay zonas registradas',
    'sidebar.showing': 'Mostrando',
    'sidebar.of': 'de',
    'sidebar.zones': 'zonas',
    'sidebar.addNew': '➕ Agregar nueva zona',
    'sidebar.edit': 'Editar',
    'sidebar.delete': 'Eliminar',
    'sidebar.confirmDelete': '¿Eliminar esta zona?',
    'popup.severity': 'Severidad:',
    'popup.helpGroups': '👥 Grupos de Ayuda',
    'popup.noGroups': 'No hay grupos asignados a esta zona',
    'popup.members': 'miembros',
    'popup.supplies': '📦 Insumos',
    'popup.noSupplies': 'No hay insumos registrados',
    'popup.needed': '⚠️ Necesitado',
    'popup.available': '✅ Disponible',
    'popup.delivered': '🚚 Entregado',
    'popup.coords': '📍 Coordenadas:',
    'popup.created': 'Creado:',
    'popup.updated': 'Actualizado:',
    'popup.verifiedBy': 'Verificado por',
    'popup.verified': '✅ Verificado',
    'popup.photos': '📷 Fotos',
    'popup.noLinks': 'No hay enlaces disponibles para esta zona.',
    'popup.addLink': '➕ Agregar grupo o canal',
    'popup.linkTitle': 'Título',
    'popup.linkUrl': 'Enlace (URL)',
    'popup.linkCategory': 'Categoría',
    'popup.linkDesc': 'Descripción (opcional)',
    'popup.linkSubmit': '✅ Agregar',
    'popup.linkCancel': 'Cancelar',
    'form.newZone': '➕ Nueva Zona',
    'form.editZone': '✏️ Editar Zona',
    'form.zoneType': 'Tipo de Zona',
    'form.title': 'Título *',
    'form.titlePlaceholder': 'Nombre de la zona',
    'form.description': 'Descripción',
    'form.descriptionPlaceholder': 'Describe la situación en esta zona...',
    'form.terrain': '🏔️ Tipo de Terreno',
    'form.severity': 'Severidad',
    'form.status': 'Estado',
    'form.sevLow': '🟢 Baja',
    'form.sevMed': '🟡 Media',
    'form.sevHigh': '🟠 Alta',
    'form.sevCritical': '🔴 Crítica',
    'form.statusActive': '✅ Activo / Abierto',
    'form.statusInactive': '❌ Inactivo / Cerrado',
    'form.coordinates': '📍 Coordenadas',
    'form.saveChanges': '💾 Guardar Cambios',
    'form.createZone': '➕ Crear Zona',
    'form.helpGroups': '👥 Grupos de Ayuda',
    'form.addGroup': '➕ Agregar grupo',
    'form.supplies': '📦 Insumos',
    'form.addSupply': '➕ Agregar insumo',
    'form.groupName': 'Nombre del grupo',
    'form.groupContact': 'Contacto (teléfono)',
    'form.supplyName': 'Nombre del insumo',
    'form.quantity': 'Cantidad',
    'form.unit': 'Unidad',
    'form.cancel': 'Cancelar',
    'form.latPlaceholder': 'Latitud',
    'form.latHint': 'Lat (ej: 10.4806)',
    'form.lngPlaceholder': 'Longitud',
    'form.lngHint': 'Lng (ej: -66.9036)',
    'form.membersPlaceholder': 'Miembros',
    'form.maxImages': 'Máximo 50 imágenes',
    'form.translations': 'Traducciones',
    'login.title': 'Acceso de Administración',
    'login.subtitle': 'Inicia sesión para editar el mapa de terremoto',
    'login.username': 'Usuario',
    'login.password': 'Contraseña',
    'login.usernamePlaceholder': 'Tu usuario',
    'login.passwordPlaceholder': 'Tu contraseña',
    'login.submitting': '⏳ Entrando...',
    'login.submit': '🚪 Iniciar Sesión',
    'notif.title': 'Notificaciones',
    'notif.markAllRead': '✅ Marcar todo leído',
    'notif.empty': 'No hay notificaciones',
    'notif.now': 'Ahora',
    'notif.minutesAgo': 'Hace Xm',
    'notif.hoursAgo': 'Hace Xh',
    'notif.daysAgo': 'Hace Xd',
    'notif.delete': 'Eliminar',
    'notif.emergencyTitle': 'Notificaciones de emergencia',
    'rescue.mode': '🆘 MODO RESCATISTA',
    'rescue.tabVolunteers': 'Voluntarios',
    'rescue.tabServices': 'Servicios',
    'rescue.tabTools': 'Herramientas',
    'rescue.tabChat': 'Chat',
    'rescue.tabBitchat': 'Bitchat',
    'rescue.tabSupplies': 'Insumos',
    'rescue.tabRescued': 'Rescatados',
    'rescue.tabLinks': 'Grupos',
    'rescue.tabPriority': 'Prioridad',
    'rescued.title': '🏥 Personas Rescatadas',
    'rescued.verifyTitle': 'Verificación de Desaparecidos',
    'rescued.verifyDesc': 'Puedes verificar el estado de las personas en',
    'rescued.searchPlaceholder': 'Buscar por nombre, zona o rescatista...',
    'rescued.resultsFor': 'resultado(s) para',
    'rescued.noResults': 'No se encontraron personas con ese término',
    'rescued.total': 'Total',
    'rescued.goodCondition': 'Buen Estado',
    'rescued.injured': 'Heridos',
    'rescued.critical': 'Crítico',
    'rescued.registerPerson': '➕ Registrar Persona Rescatada',
    'rescued.exportJson': '📥 Exportar JSON',
    'rescued.exportCsv': '📊 Exportar CSV',
    'rescued.formName': 'Nombre *',
    'rescued.formAge': 'Edad',
    'rescued.formGender': 'Sexo',
    'rescued.formCondition': 'Condición',
    'rescued.formZone': 'Zona de Rescate *',
    'rescued.formTerrain': 'Terreno',
    'rescued.formRescuedBy': 'Rescatado por',
    'rescued.formNotes': 'Notas',
    'rescued.formLat': 'Latitud',
    'rescued.formLng': 'Longitud',
    'rescued.formMale': '👨 Masculino',
    'rescued.formFemale': '👩 Femenino',
    'rescued.formOther': '🧑 Otro',
    'rescued.formGood': '✅ Bueno',
    'rescued.formInjured': '⚠️ Herido',
    'rescued.formCritical': '🔴 Crítico',
    'rescued.formSubmit': '✅ Registrar Persona',
    'rescued.yearsOld': 'años',
    'rescued.noRecord': 'Sin registro',
    'rescued.viewOnMap': 'Ver en mapa',
    'rescued.verifyOnSite': 'Verificar en desaparecidos',
    'rescued.editPerson': '✏️ Editar Persona',
    'rescued.saveChanges': '💾 Guardar Cambios',
    'rescued.verificationUrl': 'URL de verificación',
    'rescued.linkLabel': 'Etiqueta',
    'rescued.linkUrl': 'URL',
    'rescued.addLink': '➕ Agregar enlace',
    // Search
    'search.placeholder': 'Buscar ciudad, hospital, escuela, centro comercial, urbanización...',
    'search.clearTitle': 'Limpiar búsqueda',
    'search.nearbyZones': 'Zona registrada',
    'search.removeMarker': '🗑️ Quitar marcador',
    'search.addMarkerHere': '➕ Agregar marcador aquí',
    // Error
    'error.title': 'Error en la aplicación',
    'error.desc': 'Ocurrió un error inesperado. Revisa la consola del navegador (F12) para más detalles.',
    'error.unknown': 'Error desconocido',
    'error.reload': '🔄 Recargar página',
    // Admin
    'admin.title': '🛡️ Administración de Usuarios',
    'admin.users': 'Usuarios Actuales',
    'admin.newUser': 'Nuevo Usuario',
    'admin.sync': 'Actualizar mapa desde la nube',
    'admin.syncing': 'Sincronizando desde la nube…',
    'admin.admin': 'Admin',
    'admin.editor': 'Editor',
    'admin.viewer': 'Visor',
    'admin.changePass': 'Cambiar contraseña',
    'admin.usernamePlaceholder': 'Usuario',
    'admin.passwordPlaceholder': 'Contraseña',
    'admin.displayNamePlaceholder': 'Nombre visible (opcional)',
    'admin.roleEditor': 'Editor (solo agregar)',
    'admin.roleAdmin': 'Administrador (todo)',
    'admin.roleViewer': 'Visor (solo leer)',
    'admin.createUser': '➕ Crear Usuario',
  },
  en: {
    'app.title': 'Interactive Earthquake Map Venezuela',
    'app.subtitle': 'emergency zones',
    'app.verifiedOnly': '✅ Verified only',
    'btn.data': 'Data',
    'btn.exportJson': '📥 Export JSON',
    'btn.exportCsv': '📊 Export CSV',
    'btn.importJson': '📥 Import JSON',
    'btn.rescuedPersons': '🏥 Rescued Persons',
    'btn.rescueMode': 'Rescue Mode',
    'btn.logout': 'Logout',
    'btn.login': 'Login',
    'btn.edit': 'Editing',
    'btn.addView': 'Add',
    'btn.readOnly': 'View only',
    'btn.admin': 'Admin',
    'btn.guide': 'Guide',
    'header.syncCloud': 'Synced with cloud (KV)',
    'header.syncLocal': 'Local storage only',
    'import.title': '📥 Import Data',
    'import.desc': 'Select a JSON file exported from this application to import the data.',
    'import.desc2': 'Existing markers will be kept and new ones will be added.',
    'import.dropzone': '📁 Click here to select a JSON file',
    'import.cancel': 'Cancel',
    'import.error': 'Import error',
    'map.clickToPlace': '📍 Click on the map to place the new zone',
    'map.cancel': 'Cancel',
    'map.loading': 'Loading map...',
    'map.clickForOptions': 'Click for options',
    'map.removeMarker': '🗑️ Remove marker',
    'map.layerHide': 'Hide rescued persons',
    'map.layerShow': 'Show rescued persons',
    'filter.label': '🔍 Filter:',
    'filter.clear': '✕ Clear',
    'sidebar.search': 'Search zones...',
    'sidebar.noResults': 'No results found',
    'sidebar.noZones': 'No zones registered',
    'sidebar.showing': 'Showing',
    'sidebar.of': 'of',
    'sidebar.zones': 'zones',
    'sidebar.addNew': '➕ Add new zone',
    'sidebar.edit': 'Edit',
    'sidebar.delete': 'Delete',
    'sidebar.confirmDelete': 'Delete this zone?',
    'popup.severity': 'Severity:',
    'popup.helpGroups': '👥 Help Groups',
    'popup.noGroups': 'No groups assigned to this zone',
    'popup.members': 'members',
    'popup.supplies': '📦 Supplies',
    'popup.noSupplies': 'No supplies registered',
    'popup.needed': '⚠️ Needed',
    'popup.available': '✅ Available',
    'popup.delivered': '🚚 Delivered',
    'popup.coords': '📍 Coordinates:',
    'popup.created': 'Created:',
    'popup.updated': 'Updated:',
    'popup.verifiedBy': 'Verified by',
    'popup.verified': '✅ Verified',
    'popup.photos': '📷 Photos',
    'popup.noLinks': 'No links available for this zone.',
    'popup.addLink': '➕ Add group or channel',
    'popup.linkTitle': 'Title',
    'popup.linkUrl': 'Link (URL)',
    'popup.linkCategory': 'Category',
    'popup.linkDesc': 'Description (optional)',
    'popup.linkSubmit': '✅ Add',
    'popup.linkCancel': 'Cancel',
    'form.newZone': '➕ New Zone',
    'form.editZone': '✏️ Edit Zone',
    'form.zoneType': 'Zone Type',
    'form.title': 'Title *',
    'form.titlePlaceholder': 'Zone name',
    'form.description': 'Description',
    'form.descriptionPlaceholder': 'Describe the situation in this zone...',
    'form.terrain': '🏔️ Terrain Type',
    'form.severity': 'Severity',
    'form.status': 'Status',
    'form.sevLow': '🟢 Low',
    'form.sevMed': '🟡 Medium',
    'form.sevHigh': '🟠 High',
    'form.sevCritical': '🔴 Critical',
    'form.statusActive': '✅ Active / Open',
    'form.statusInactive': '❌ Inactive / Closed',
    'form.coordinates': '📍 Coordinates',
    'form.saveChanges': '💾 Save Changes',
    'form.createZone': '➕ Create Zone',
    'form.helpGroups': '👥 Help Groups',
    'form.addGroup': '➕ Add group',
    'form.supplies': '📦 Supplies',
    'form.addSupply': '➕ Add supply',
    'form.groupName': 'Group name',
    'form.groupContact': 'Contact (phone)',
    'form.supplyName': 'Supply name',
    'form.quantity': 'Quantity',
    'form.unit': 'Unit',
    'form.cancel': 'Cancel',
    'form.latPlaceholder': 'Latitude',
    'form.latHint': 'Lat (e.g. 10.4806)',
    'form.lngPlaceholder': 'Longitude',
    'form.lngHint': 'Lng (e.g. -66.9036)',
    'form.membersPlaceholder': 'Members',
    'form.maxImages': 'Maximum 50 images',
    'form.translations': 'Translations',
    'login.title': 'Administration Access',
    'login.subtitle': 'Sign in to edit the earthquake map',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.usernamePlaceholder': 'Your username',
    'login.passwordPlaceholder': 'Your password',
    'login.submitting': '⏳ Signing in...',
    'login.submit': '🚪 Sign In',
    'notif.title': 'Notifications',
    'notif.markAllRead': '✅ Mark all as read',
    'notif.empty': 'No notifications',
    'notif.now': 'Now',
    'notif.minutesAgo': 'Xm ago',
    'notif.hoursAgo': 'Xh ago',
    'notif.daysAgo': 'Xd ago',
    'notif.delete': 'Delete',
    'notif.emergencyTitle': 'Emergency notifications',
    'rescue.mode': '🆘 RESCUE MODE',
    'rescue.tabVolunteers': 'Volunteers',
    'rescue.tabServices': 'Services',
    'rescue.tabTools': 'Tools',
    'rescue.tabChat': 'Chat',
    'rescue.tabBitchat': 'Bitchat',
    'rescue.tabSupplies': 'Supplies',
    'rescue.tabRescued': 'Rescued',
    'rescue.tabLinks': 'Groups',
    'rescue.tabPriority': 'Priority',
    'rescued.title': '🏥 Rescued Persons',
    'rescued.verifyTitle': 'Missing Persons Verification',
    'rescued.verifyDesc': 'You can verify people\'s status at',
    'rescued.searchPlaceholder': 'Search by name, zone or rescuer...',
    'rescued.resultsFor': 'result(s) for',
    'rescued.noResults': 'No persons found with that term',
    'rescued.total': 'Total',
    'rescued.goodCondition': 'Good Condition',
    'rescued.injured': 'Injured',
    'rescued.critical': 'Critical',
    'rescued.registerPerson': '➕ Register Rescued Person',
    'rescued.exportJson': '📥 Export JSON',
    'rescued.exportCsv': '📊 Export CSV',
    'rescued.formName': 'Name *',
    'rescued.formAge': 'Age',
    'rescued.formGender': 'Gender',
    'rescued.formCondition': 'Condition',
    'rescued.formZone': 'Rescue Zone *',
    'rescued.formTerrain': 'Terrain',
    'rescued.formRescuedBy': 'Rescued by',
    'rescued.formNotes': 'Notes',
    'rescued.formLat': 'Latitude',
    'rescued.formLng': 'Longitude',
    'rescued.formMale': '👨 Male',
    'rescued.formFemale': '👩 Female',
    'rescued.formOther': '🧑 Other',
    'rescued.formGood': '✅ Good',
    'rescued.formInjured': '⚠️ Injured',
    'rescued.formCritical': '🔴 Critical',
    'rescued.formSubmit': '✅ Register Person',
    'rescued.yearsOld': 'years old',
    'rescued.noRecord': 'No record',
    'rescued.viewOnMap': 'View on map',
    'rescued.verifyOnSite': 'Verify on missing persons site',
    'rescued.editPerson': '✏️ Edit Person',
    'rescued.saveChanges': '💾 Save Changes',
    'rescued.verificationUrl': 'Verification URL',
    'rescued.linkLabel': 'Label',
    'rescued.linkUrl': 'URL',
    'rescued.addLink': '➕ Add link',
    // Search
    'search.placeholder': 'Search city, hospital, school, mall, neighborhood...',
    'search.clearTitle': 'Clear search',
    'search.nearbyZones': 'Registered zone',
    'search.removeMarker': '🗑️ Remove marker',
    'search.addMarkerHere': '➕ Add marker here',
    // Error
    'error.title': 'Application Error',
    'error.desc': 'An unexpected error occurred. Check the browser console (F12) for details.',
    'error.unknown': 'Unknown error',
    'error.reload': '🔄 Reload page',
    // Admin
    'admin.title': '🛡️ User Administration',
    'admin.users': 'Current Users',
    'admin.newUser': 'New User',
    'admin.sync': 'Update map from cloud',
    'admin.syncing': 'Syncing from cloud…',
    'admin.admin': 'Admin',
    'admin.editor': 'Editor',
    'admin.viewer': 'Viewer',
    'admin.changePass': 'Change password',
    'admin.usernamePlaceholder': 'Username',
    'admin.passwordPlaceholder': 'Password',
    'admin.displayNamePlaceholder': 'Display name (optional)',
    'admin.roleEditor': 'Editor (add only)',
    'admin.roleAdmin': 'Administrator (all)',
    'admin.roleViewer': 'Viewer (read only)',
    'admin.createUser': '➕ Create User',
  },
  zh: {
    'app.title': '委内瑞拉地震交互地图',
    'app.subtitle': '紧急区域',
    'btn.data': '数据',
    'btn.exportJson': '📥 导出 JSON',
    'btn.exportCsv': '📊 导出 CSV',
    'btn.importJson': '📥 导入 JSON',
    'btn.rescuedPersons': '🏥 被救人员',
    'btn.rescueMode': '救援模式',
    'btn.logout': '退出',
    'btn.login': '登录',
    'btn.edit': '编辑',
    'btn.addView': '添加',
    'btn.readOnly': '只读',
    'btn.admin': '管理',
    'import.title': '📥 导入数据',
    'import.desc': '选择从此应用程序导出的 JSON 文件以导入数据。',
    'import.desc2': '现有标记将保留，并将添加新的标记。',
    'import.dropzone': '📁 点击此处选择 JSON 文件',
    'import.cancel': '取消',
    'import.error': '导入错误',
    'map.clickToPlace': '📍 点击地图放置新区域',
    'map.cancel': '取消',
    'filter.label': '🔍 筛选:',
    'filter.clear': '✕ 清除',
    'sidebar.search': '搜索区域...',
    'sidebar.noResults': '未找到结果',
    'sidebar.noZones': '暂无注册区域',
    'sidebar.showing': '显示',
    'sidebar.of': '/',
    'sidebar.zones': '个区域',
    'sidebar.addNew': '➕ 添加新区域',
    'popup.severity': '严重程度:',
    'popup.helpGroups': '👥 援助小组',
    'popup.noGroups': '该区域没有分配的小组',
    'popup.members': '名成员',
    'popup.supplies': '📦 物资',
    'popup.noSupplies': '暂无登记物资',
    'popup.needed': '⚠️ 需要',
    'popup.available': '✅ 可用',
    'popup.delivered': '🚚 已送达',
    'popup.coords': '📍 坐标:',
    'popup.created': '创建:',
    'popup.updated': '更新:',
    'form.newZone': '➕ 新区域',
    'form.editZone': '✏️ 编辑区域',
    'form.zoneType': '区域类型',
    'form.title': '标题 *',
    'form.titlePlaceholder': '区域名称',
    'form.description': '描述',
    'form.descriptionPlaceholder': '描述该区域的情况...',
    'form.terrain': '🏔️ 地形类型',
    'form.severity': '严重程度',
    'form.status': '状态',
    'form.sevLow': '🟢 低',
    'form.sevMed': '🟡 中',
    'form.sevHigh': '🟠 高',
    'form.sevCritical': '🔴 危急',
    'form.statusActive': '✅ 活跃 / 开放',
    'form.statusInactive': '❌ 不活跃 / 关闭',
    'form.coordinates': '📍 坐标',
    'form.saveChanges': '💾 保存更改',
    'form.createZone': '➕ 创建区域',
    'form.helpGroups': '👥 援助小组',
    'form.addGroup': '➕ 添加小组',
    'form.supplies': '📦 物资',
    'form.addSupply': '➕ 添加物资',
    'form.groupName': '小组名称',
    'form.groupContact': '联系方式（电话）',
    'form.supplyName': '物资名称',
    'form.quantity': '数量',
    'form.unit': '单位',
    'form.cancel': '取消',
    'login.title': '管理员登录',
    'login.subtitle': '登录以编辑地震地图',
    'login.username': '用户名',
    'login.password': '密码',
    'login.usernamePlaceholder': '请输入用户名',
    'login.passwordPlaceholder': '请输入密码',
    'login.submitting': '⏳ 登录中...',
    'login.submit': '🚪 登录',
    'notif.title': '通知',
    'notif.markAllRead': '✅ 全部标为已读',
    'notif.empty': '暂无通知',
    'notif.now': '刚刚',
    'notif.minutesAgo': 'X分钟前',
    'notif.hoursAgo': 'X小时前',
    'notif.daysAgo': 'X天前',
    'notif.delete': '删除',
    'notif.emergencyTitle': '紧急通知',
    'rescue.mode': '🆘 救援模式',
    'rescue.tabVolunteers': '志愿者',
    'rescue.tabServices': '服务',
    'rescue.tabTools': '工具',
    'rescue.tabChat': '聊天',
    'rescue.tabBitchat': 'Bitchat',
    'rescue.tabSupplies': '物资',
    'rescue.tabRescued': '被救者',
    'rescue.tabLinks': '群组',
    'rescue.tabPriority': '优先级',
    'rescued.title': '🏥 被救人员',
    'rescued.verifyTitle': '失踪人口验证',
    'rescued.verifyDesc': '您可以在以下网站验证人员状态',
    'rescued.searchPlaceholder': '按姓名、区域或救援者搜索...',
    'rescued.resultsFor': '个结果匹配',
    'rescued.noResults': '未找到匹配的人员',
    'rescued.total': '总计',
    'rescued.goodCondition': '状况良好',
    'rescued.injured': '受伤',
    'rescued.critical': '危急',
    'rescued.registerPerson': '➕ 登记被救人员',
    'rescued.exportJson': '📥 导出 JSON',
    'rescued.exportCsv': '📊 导出 CSV',
    'rescued.formName': '姓名 *',
    'rescued.formAge': '年龄',
    'rescued.formGender': '性别',
    'rescued.formCondition': '状况',
    'rescued.formZone': '救援区域 *',
    'rescued.formTerrain': '地形',
    'rescued.formRescuedBy': '救援者',
    'rescued.formNotes': '备注',
    'rescued.formLat': '纬度',
    'rescued.formLng': '经度',
    'rescued.formMale': '👨 男性',
    'rescued.formFemale': '👩 女性',
    'rescued.formOther': '🧑 其他',
    'rescued.formGood': '✅ 良好',
    'rescued.formInjured': '⚠️ 受伤',
    'rescued.formCritical': '🔴 危急',
    'rescued.formSubmit': '✅ 登记人员',
    'rescued.yearsOld': '岁',
    'rescued.noRecord': '无记录',
    'rescued.viewOnMap': '在地图上查看',
    'rescued.verifyOnSite': '在失踪人员网站验证',
    'rescued.editPerson': '✏️ 编辑人员',
    'rescued.saveChanges': '💾 保存更改',
    'rescued.verificationUrl': '验证 URL',
    'rescued.linkLabel': '标签',
    'rescued.linkUrl': 'URL',
    'rescued.addLink': '➕ 添加链接',
    // App
    'app.verifiedOnly': '✅ 仅验证',
    'btn.guide': '指南',
    'header.syncCloud': '已与云端同步 (KV)',
    'header.syncLocal': '仅本地存储',
    'map.loading': '地图加载中...',
    'map.clickForOptions': '点击获取选项',
    'map.removeMarker': '🗑️ 移除标记',
    'map.layerHide': '隐藏被救人员',
    'map.layerShow': '显示被救人员',
    'sidebar.edit': '编辑',
    'sidebar.delete': '删除',
    'sidebar.confirmDelete': '删除此区域？',
    'popup.verifiedBy': '已验证者',
    'popup.verified': '✅ 已验证',
    'popup.photos': '📷 照片',
    'popup.noLinks': '此区域没有可用的链接。',
    'popup.addLink': '➕ 添加群组或频道',
    'popup.linkTitle': '标题',
    'popup.linkUrl': '链接 (URL)',
    'popup.linkCategory': '类别',
    'popup.linkDesc': '描述（可选）',
    'popup.linkSubmit': '✅ 添加',
    'popup.linkCancel': '取消',
    'form.latPlaceholder': '纬度',
    'form.latHint': '纬度 (例如 10.4806)',
    'form.lngPlaceholder': '经度',
    'form.lngHint': '经度 (例如 -66.9036)',
    'form.membersPlaceholder': '成员',
    'form.maxImages': '最多 50 张图片',
    'form.translations': '翻译',
    'search.placeholder': '搜索城市、医院、学校、商场、住宅区...',
    'search.clearTitle': '清除搜索',
    'search.nearbyZones': '已注册区域',
    'search.removeMarker': '🗑️ 移除标记',
    'search.addMarkerHere': '➕ 在此添加标记',
    'error.title': '应用程序错误',
    'error.desc': '发生意外错误。请查看浏览器控制台 (F12) 了解详情。',
    'error.unknown': '未知错误',
    'error.reload': '🔄 重新加载页面',
    'admin.title': '🛡️ 用户管理',
    'admin.users': '当前用户',
    'admin.newUser': '新用户',
    'admin.sync': '从云端更新地图',
    'admin.syncing': '正在从云端同步…',
    'admin.admin': '管理员',
    'admin.editor': '编辑者',
    'admin.viewer': '查看者',
    'admin.changePass': '修改密码',
    'admin.usernamePlaceholder': '用户名',
    'admin.passwordPlaceholder': '密码',
    'admin.displayNamePlaceholder': '显示名称（可选）',
    'admin.roleEditor': '编辑者（仅添加）',
    'admin.roleAdmin': '管理员（全部）',
    'admin.roleViewer': '查看者（仅阅读）',
    'admin.createUser': '➕ 创建用户',
  },
  ar: {
    'app.title': 'خريطة زلزال فنزويلا التفاعلية',
    'app.subtitle': 'مناطق الطوارئ',
    'btn.data': 'البيانات',
    'btn.exportJson': '📥 تصدير JSON',
    'btn.exportCsv': '📊 تصدير CSV',
    'btn.importJson': '📥 استيراد JSON',
    'btn.rescuedPersons': '🏥 الأشخاص المنقذون',
    'btn.rescueMode': 'وضع الإنقاذ',
    'btn.logout': 'خروج',
    'btn.login': 'دخول',
    'btn.edit': 'تحرير',
    'btn.addView': 'إضافة',
    'btn.readOnly': 'عرض فقط',
    'btn.admin': 'الإدارة',
    'import.title': '📥 استيراد البيانات',
    'import.desc': 'اختر ملف JSON تم تصديره من هذا التطبيق لاستيراد البيانات.',
    'import.desc2': 'سيتم الاحتفاظ بالعلامات الموجودة وسيتم إضافة علامات جديدة.',
    'import.dropzone': '📁 انقر هنا لاختيار ملف JSON',
    'import.cancel': 'إلغاء',
    'import.error': 'خطأ في الاستيراد',
    'map.clickToPlace': '📍 انقر على الخريطة لوضع المنطقة الجديدة',
    'map.cancel': 'إلغاء',
    'filter.label': '🔍 تصفية:',
    'filter.clear': '✕ مسح',
    'sidebar.search': 'البحث عن مناطق...',
    'sidebar.noResults': 'لم يتم العثور على نتائج',
    'sidebar.noZones': 'لا توجد مناطق مسجلة',
    'sidebar.showing': 'عرض',
    'sidebar.of': 'من',
    'sidebar.zones': 'مناطق',
    'sidebar.addNew': '➕ إضافة منطقة جديدة',
    'popup.severity': 'الخطورة:',
    'popup.helpGroups': '👥 مجموعات المساعدة',
    'popup.noGroups': 'لا توجد مجموعات مخصصة لهذه المنطقة',
    'popup.members': 'أعضاء',
    'popup.supplies': '📦 الإمدادات',
    'popup.noSupplies': 'لا توجد إمدادات مسجلة',
    'popup.needed': '⚠️ مطلوب',
    'popup.available': '✅ متاح',
    'popup.delivered': '🚚 تم التوصيل',
    'popup.coords': '📍 الإحداثيات:',
    'popup.created': 'أنشئ:',
    'popup.updated': 'حُدث:',
    'form.newZone': '➕ منطقة جديدة',
    'form.editZone': '✏️ تحرير المنطقة',
    'form.zoneType': 'نوع المنطقة',
    'form.title': 'العنوان *',
    'form.titlePlaceholder': 'اسم المنطقة',
    'form.description': 'الوصف',
    'form.descriptionPlaceholder': 'صف الوضع في هذه المنطقة...',
    'form.terrain': '🏔️ نوع التضاريس',
    'form.severity': 'الخطورة',
    'form.status': 'الحالة',
    'form.sevLow': '🟢 منخفضة',
    'form.sevMed': '🟡 متوسطة',
    'form.sevHigh': '🟠 عالية',
    'form.sevCritical': '🔴 حرجة',
    'form.statusActive': '✅ نشط / مفتوح',
    'form.statusInactive': '❌ غير نشط / مغلق',
    'form.coordinates': '📍 الإحداثيات',
    'form.saveChanges': '💾 حفظ التغييرات',
    'form.createZone': '➕ إنشاء المنطقة',
    'form.helpGroups': '👥 مجموعات المساعدة',
    'form.addGroup': '➕ إضافة مجموعة',
    'form.supplies': '📦 الإمدادات',
    'form.addSupply': '➕ إضافة إمداد',
    'form.groupName': 'اسم المجموعة',
    'form.groupContact': 'جهة الاتصال (الهاتف)',
    'form.supplyName': 'اسم الإمداد',
    'form.quantity': 'الكمية',
    'form.unit': 'الوحدة',
    'form.cancel': 'إلغاء',
    'login.title': 'دخول الإدارة',
    'login.subtitle': 'سجّل الدخول لتحرير خريطة الزلزال',
    'login.username': 'اسم المستخدم',
    'login.password': 'كلمة المرور',
    'login.usernamePlaceholder': 'اسم المستخدم الخاص بك',
    'login.passwordPlaceholder': 'كلمة المرور الخاصة بك',
    'login.submitting': '⏳ جارٍ الدخول...',
    'login.submit': '🚪 تسجيل الدخول',
    'notif.title': 'الإشعارات',
    'notif.markAllRead': '✅ تحديد الكل كمقروء',
    'notif.empty': 'لا توجد إشعارات',
    'notif.now': 'الآن',
    'notif.minutesAgo': 'منذ Xm',
    'notif.hoursAgo': 'منذ Xh',
    'notif.daysAgo': 'منذ Xd',
    'notif.delete': 'حذف',
    'notif.emergencyTitle': 'إشعارات الطوارئ',
    'rescue.mode': '🆘 وضع الإنقاذ',
    'rescue.tabVolunteers': 'المتطوعون',
    'rescue.tabServices': 'الخدمات',
    'rescue.tabTools': 'الأدوات',
    'rescue.tabChat': 'المحادثة',
    'rescue.tabBitchat': 'Bitchat',
    'rescue.tabSupplies': 'الإمدادات',
    'rescue.tabRescued': 'المنقذون',
    'rescue.tabLinks': 'المجموعات',
    'rescue.tabPriority': 'الأولوية',
    'rescued.title': '🏥 الأشخاص المنقذون',
    'rescued.verifyTitle': 'التحقق من المفقودين',
    'rescued.verifyDesc': 'يمكنك التحقق من حالة الأشخاص على',
    'rescued.searchPlaceholder': 'البحث بالاسم أو المنطقة أو المنقذ...',
    'rescued.resultsFor': 'نتيجة(نتائج) لـ',
    'rescued.noResults': 'لم يتم العثور على أشخاص بهذا المصطلح',
    'rescued.total': 'الإجمالي',
    'rescued.goodCondition': 'حالة جيدة',
    'rescued.injured': 'جرحى',
    'rescued.critical': 'حرج',
    'rescued.registerPerson': '➕ تسجيل شخص منقذ',
    'rescued.exportJson': '📥 تصدير JSON',
    'rescued.exportCsv': '📊 تصدير CSV',
    'rescued.formName': 'الاسم *',
    'rescued.formAge': 'العمر',
    'rescued.formGender': 'الجنس',
    'rescued.formCondition': 'الحالة',
    'rescued.formZone': 'منطقة الإنقاذ *',
    'rescued.formTerrain': 'التضاريس',
    'rescued.formRescuedBy': 'نقذه',
    'rescued.formNotes': 'ملاحظات',
    'rescued.formLat': 'خط العرض',
    'rescued.formLng': 'خط الطول',
    'rescued.formMale': '👨 ذكر',
    'rescued.formFemale': '👩 أنثى',
    'rescued.formOther': '🧑 آخر',
    'rescued.formGood': '✅ جيد',
    'rescued.formInjured': '⚠️ مصاب',
    'rescued.formCritical': '🔴 حرج',
    'rescued.formSubmit': '✅ تسجيل الشخص',
    'rescued.yearsOld': 'سنوات',
    'rescued.noRecord': 'بدون سجل',
    'rescued.viewOnMap': 'عرض على الخريطة',
    'rescued.verifyOnSite': 'التحقق على موقع المفقودين',
    'rescued.editPerson': '✏️ تعديل الشخص',
    'rescued.saveChanges': '💾 حفظ التغييرات',
    'rescued.verificationUrl': 'رابط التحقق',
    'rescued.linkLabel': 'تسمية',
    'rescued.linkUrl': 'URL',
    'rescued.addLink': '➕ إضافة رابط',
    // App
    'app.verifiedOnly': '✅ تم التحقق فقط',
    'btn.guide': 'الدليل',
    'header.syncCloud': 'متزامن مع السحابة (KV)',
    'header.syncLocal': 'تخزين محلي فقط',
    'map.loading': 'جاري تحميل الخريطة...',
    'map.clickForOptions': 'انقر للخيارات',
    'map.removeMarker': '🗑️ إزالة العلامة',
    'map.layerHide': 'إخفاء الأشخاص المنقذين',
    'map.layerShow': 'إظهار الأشخاص المنقذين',
    'sidebar.edit': 'تعديل',
    'sidebar.delete': 'حذف',
    'sidebar.confirmDelete': 'هل تريد حذف هذه المنطقة؟',
    'popup.verifiedBy': 'تم التحقق بواسطة',
    'popup.verified': '✅ تم التحقق',
    'popup.photos': '📷 الصور',
    'popup.noLinks': 'لا توجد روابط متاحة لهذه المنطقة.',
    'popup.addLink': '➕ إضافة مجموعة أو قناة',
    'popup.linkTitle': 'العنوان',
    'popup.linkUrl': 'الرابط (URL)',
    'popup.linkCategory': 'الفئة',
    'popup.linkDesc': 'الوصف (اختياري)',
    'popup.linkSubmit': '✅ إضافة',
    'popup.linkCancel': 'إلغاء',
    'form.latPlaceholder': 'خط العرض',
    'form.latHint': 'خط العرض (مثال: 10.4806)',
    'form.lngPlaceholder': 'خط الطول',
    'form.lngHint': 'خط الطول (مثال: -66.9036)',
    'form.membersPlaceholder': 'الأعضاء',
    'form.maxImages': 'الحد الأقصى 50 صورة',
    'form.translations': 'الترجمات',
    'search.placeholder': 'ابحث عن مدينة، مستشفى، مدرسة، مركز تجاري...',
    'search.clearTitle': 'مسح البحث',
    'search.nearbyZones': 'منطقة مسجلة',
    'search.removeMarker': '🗑️ إزالة العلامة',
    'search.addMarkerHere': '➕ إضافة علامة هنا',
    'error.title': 'خطأ في التطبيق',
    'error.desc': 'حدث خطأ غير متوقع. تحقق من وحدة تحكم المتصفح (F12) للتفاصيل.',
    'error.unknown': 'خطأ غير معروف',
    'error.reload': '🔄 إعادة تحميل الصفحة',
    'admin.title': '🛡️ إدارة المستخدمين',
    'admin.users': 'المستخدمون الحاليون',
    'admin.newUser': 'مستخدم جديد',
    'admin.sync': 'تحديث الخريطة من السحابة',
    'admin.syncing': 'جارٍ المزامنة من السحابة…',
    'admin.admin': 'مدير',
    'admin.editor': 'محرر',
    'admin.viewer': 'مشاهد',
    'admin.changePass': 'تغيير كلمة المرور',
    'admin.usernamePlaceholder': 'اسم المستخدم',
    'admin.passwordPlaceholder': 'كلمة المرور',
    'admin.displayNamePlaceholder': 'الاسم الظاهر (اختياري)',
    'admin.roleEditor': 'محرر (إضافة فقط)',
    'admin.roleAdmin': 'مدير (الكل)',
    'admin.roleViewer': 'مشاهد (قراءة فقط)',
    'admin.createUser': '➕ إنشاء مستخدم',
  },
  pt: {
    'app.title': 'Mapa Interativo do Terremoto da Venezuela',
    'app.subtitle': 'zonas de emergência',
    'btn.data': 'Dados',
    'btn.exportJson': '📥 Exportar JSON',
    'btn.exportCsv': '📊 Exportar CSV',
    'btn.importJson': '📥 Importar JSON',
    'btn.rescuedPersons': '🏥 Pessoas Resgatadas',
    'btn.rescueMode': 'Modo de Resgate',
    'btn.logout': 'Sair',
    'btn.login': 'Entrar',
    'btn.edit': 'Edição',
    'btn.addView': 'Adicionar',
    'btn.readOnly': 'Somente visualização',
    'btn.admin': 'Admin',
    'import.title': '📥 Importar Dados',
    'import.desc': 'Selecione um arquivo JSON exportado desta aplicação para importar os dados.',
    'import.desc2': 'Os marcadores existentes serão mantidos e novos serão adicionados.',
    'import.dropzone': '📁 Clique aqui para selecionar um arquivo JSON',
    'import.cancel': 'Cancelar',
    'import.error': 'Erro ao importar',
    'map.clickToPlace': '📍 Clique no mapa para colocar a nova zona',
    'map.cancel': 'Cancelar',
    'filter.label': '🔍 Filtrar:',
    'filter.clear': '✕ Limpar',
    'sidebar.search': 'Buscar zonas...',
    'sidebar.noResults': 'Nenhum resultado encontrado',
    'sidebar.noZones': 'Nenhuma zona registrada',
    'sidebar.showing': 'Mostrando',
    'sidebar.of': 'de',
    'sidebar.zones': 'zonas',
    'sidebar.addNew': '➕ Adicionar nova zona',
    'popup.severity': 'Severidade:',
    'popup.helpGroups': '👥 Grupos de Ajuda',
    'popup.noGroups': 'Nenhum grupo atribuído a esta zona',
    'popup.members': 'membros',
    'popup.supplies': '📦 Suprimentos',
    'popup.noSupplies': 'Nenhum suprimento registrado',
    'popup.needed': '⚠️ Necessário',
    'popup.available': '✅ Disponível',
    'popup.delivered': '🚚 Entregue',
    'popup.coords': '📍 Coordenadas:',
    'popup.created': 'Criado:',
    'popup.updated': 'Atualizado:',
    'form.newZone': '➕ Nova Zona',
    'form.editZone': '✏️ Editar Zona',
    'form.zoneType': 'Tipo de Zona',
    'form.title': 'Título *',
    'form.titlePlaceholder': 'Nome da zona',
    'form.description': 'Descrição',
    'form.descriptionPlaceholder': 'Descreva a situação nesta zona...',
    'form.terrain': '🏔️ Tipo de Terreno',
    'form.severity': 'Severidade',
    'form.status': 'Estado',
    'form.sevLow': '🟢 Baixa',
    'form.sevMed': '🟡 Média',
    'form.sevHigh': '🟠 Alta',
    'form.sevCritical': '🔴 Crítica',
    'form.statusActive': '✅ Ativo / Aberto',
    'form.statusInactive': '❌ Inativo / Fechado',
    'form.coordinates': '📍 Coordenadas',
    'form.saveChanges': '💾 Salvar Alterações',
    'form.createZone': '➕ Criar Zona',
    'form.helpGroups': '👥 Grupos de Ajuda',
    'form.addGroup': '➕ Adicionar grupo',
    'form.supplies': '📦 Suprimentos',
    'form.addSupply': '➕ Adicionar suprimento',
    'form.groupName': 'Nome do grupo',
    'form.groupContact': 'Contato (telefone)',
    'form.supplyName': 'Nome do suprimento',
    'form.quantity': 'Quantidade',
    'form.unit': 'Unidade',
    'form.cancel': 'Cancelar',
    'login.title': 'Acesso Administrativo',
    'login.subtitle': 'Faça login para editar o mapa do terremoto',
    'login.username': 'Usuário',
    'login.password': 'Senha',
    'login.usernamePlaceholder': 'Seu usuário',
    'login.passwordPlaceholder': 'Sua senha',
    'login.submitting': '⏳ Entrando...',
    'login.submit': '🚪 Entrar',
    'notif.title': 'Notificações',
    'notif.markAllRead': '✅ Marcar tudo como lido',
    'notif.empty': 'Nenhuma notificação',
    'notif.now': 'Agora',
    'notif.minutesAgo': 'Há Xm',
    'notif.hoursAgo': 'Há Xh',
    'notif.daysAgo': 'Há Xd',
    'notif.delete': 'Excluir',
    'notif.emergencyTitle': 'Notificações de emergência',
    'rescue.mode': '🆘 MODO DE RESGATE',
    'rescue.tabVolunteers': 'Voluntários',
    'rescue.tabServices': 'Serviços',
    'rescue.tabTools': 'Ferramentas',
    'rescue.tabChat': 'Chat',
    'rescue.tabBitchat': 'Bitchat',
    'rescue.tabSupplies': 'Insumos',
    'rescue.tabRescued': 'Resgatados',
    'rescue.tabLinks': 'Grupos',
    'rescue.tabPriority': 'Prioridade',
    'rescued.title': '🏥 Pessoas Resgatadas',
    'rescued.verifyTitle': 'Verificação de Desaparecidos',
    'rescued.verifyDesc': 'Você pode verificar o status das pessoas em',
    'rescued.searchPlaceholder': 'Buscar por nome, zona ou resgatador...',
    'rescued.resultsFor': 'resultado(s) para',
    'rescued.noResults': 'Nenhuma pessoa encontrada com esse termo',
    'rescued.total': 'Total',
    'rescued.goodCondition': 'Bom Estado',
    'rescued.injured': 'Feridos',
    'rescued.critical': 'Crítico',
    'rescued.registerPerson': '➕ Registrar Pessoa Resgatada',
    'rescued.exportJson': '📥 Exportar JSON',
    'rescued.exportCsv': '📊 Exportar CSV',
    'rescued.formName': 'Nome *',
    'rescued.formAge': 'Idade',
    'rescued.formGender': 'Sexo',
    'rescued.formCondition': 'Condição',
    'rescued.formZone': 'Zona de Resgate *',
    'rescued.formTerrain': 'Terreno',
    'rescued.formRescuedBy': 'Resgatado por',
    'rescued.formNotes': 'Notas',
    'rescued.formLat': 'Latitude',
    'rescued.formLng': 'Longitude',
    'rescued.formMale': '👨 Masculino',
    'rescued.formFemale': '👩 Feminino',
    'rescued.formOther': '🧑 Outro',
    'rescued.formGood': '✅ Bom',
    'rescued.formInjured': '⚠️ Ferido',
    'rescued.formCritical': '🔴 Crítico',
    'rescued.formSubmit': '✅ Registrar Pessoa',
    'rescued.yearsOld': 'anos',
    'rescued.noRecord': 'Sem registro',
    'rescued.viewOnMap': 'Ver no mapa',
    'rescued.verifyOnSite': 'Verificar no site de desaparecidos',
    'rescued.editPerson': '✏️ Editar Pessoa',
    'rescued.saveChanges': '💾 Salvar Alterações',
    'rescued.verificationUrl': 'URL de verificação',
    'rescued.linkLabel': 'Rótulo',
    'rescued.linkUrl': 'URL',
    'rescued.addLink': '➕ Adicionar link',
    // App
    'app.verifiedOnly': '✅ Verificados apenas',
    'btn.guide': 'Guia',
    'header.syncCloud': 'Sincronizado com a nuvem (KV)',
    'header.syncLocal': 'Apenas armazenamento local',
    'map.loading': 'Carregando mapa...',
    'map.clickForOptions': 'Clique para opções',
    'map.removeMarker': '🗑️ Remover marcador',
    'map.layerHide': 'Ocultar pessoas resgatadas',
    'map.layerShow': 'Mostrar pessoas resgatadas',
    'sidebar.edit': 'Editar',
    'sidebar.delete': 'Excluir',
    'sidebar.confirmDelete': 'Excluir esta zona?',
    'popup.verifiedBy': 'Verificado por',
    'popup.verified': '✅ Verificado',
    'popup.photos': '📷 Fotos',
    'popup.noLinks': 'Nenhum link disponível para esta zona.',
    'popup.addLink': '➕ Adicionar grupo ou canal',
    'popup.linkTitle': 'Título',
    'popup.linkUrl': 'Link (URL)',
    'popup.linkCategory': 'Categoria',
    'popup.linkDesc': 'Descrição (opcional)',
    'popup.linkSubmit': '✅ Adicionar',
    'popup.linkCancel': 'Cancelar',
    'form.latPlaceholder': 'Latitude',
    'form.latHint': 'Lat (ex: 10.4806)',
    'form.lngPlaceholder': 'Longitude',
    'form.lngHint': 'Lng (ex: -66.9036)',
    'form.membersPlaceholder': 'Membros',
    'form.maxImages': 'Máximo 50 imagens',
    'form.translations': 'Traduções',
    'search.placeholder': 'Buscar cidade, hospital, escola, shopping, bairro...',
    'search.clearTitle': 'Limpar busca',
    'search.nearbyZones': 'Zona registrada',
    'search.removeMarker': '🗑️ Remover marcador',
    'search.addMarkerHere': '➕ Adicionar marcador aqui',
    'error.title': 'Erro na Aplicação',
    'error.desc': 'Ocorreu um erro inesperado. Verifique o console do navegador (F12) para detalhes.',
    'error.unknown': 'Erro desconhecido',
    'error.reload': '🔄 Recarregar página',
    'admin.title': '🛡️ Administração de Usuários',
    'admin.users': 'Usuários Atuais',
    'admin.newUser': 'Novo Usuário',
    'admin.sync': 'Atualizar mapa da nuvem',
    'admin.syncing': 'Sincronizando da nuvem…',
    'admin.admin': 'Admin',
    'admin.editor': 'Editor',
    'admin.viewer': 'Visualizador',
    'admin.changePass': 'Alterar senha',
    'admin.usernamePlaceholder': 'Usuário',
    'admin.passwordPlaceholder': 'Senha',
    'admin.displayNamePlaceholder': 'Nome visível (opcional)',
    'admin.roleEditor': 'Editor (apenas adicionar)',
    'admin.roleAdmin': 'Administrador (tudo)',
    'admin.roleViewer': 'Visualizador (apenas ler)',
    'admin.createUser': '➕ Criar Usuário',
  },
};

// ===== Context =====
interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextValue | null>(null);

// ===== Provider =====
const STORAGE_KEY = 'app_language';

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in translations) return saved as Language;
  } catch { /* ignore */ }
  return 'es';
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(getInitialLanguage);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try { localStorage.setItem(STORAGE_KEY, newLang); } catch { /* ignore */ }
    // Set document direction for RTL
    document.documentElement.dir = LANGUAGES[newLang].dir;
    document.documentElement.lang = newLang;
  }, []);

  // Set initial direction on mount and language change
  useEffect(() => {
    document.documentElement.dir = LANGUAGES[lang].dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[lang]?.[key] || translations['es']?.[key] || key;
  }, [lang]);

  const dir = LANGUAGES[lang].dir;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
};

// ===== Hook =====
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
