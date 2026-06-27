export type MarkerType =
  | 'terremoto'
  | 'edificio_derrumbado'
  | 'zona_riesgo'
  | 'zona_acopio'
  | 'via_obstruida'
  | 'personas_atrapadas'
  | 'zona_refugio'
  | 'supermercado'
  | 'tienda_comida'
  | 'farmacia';

export interface Supply {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  status: 'needed' | 'available' | 'delivered';
}

export interface HelpGroup {
  id: string;
  name: string;
  contact: string;
  memberCount: number;
  arrivedAt: string;
}

export type TerrainType = 'urbano' | 'montañoso' | 'costero' | 'rural' | 'industrial' | 'mixin';

export const TERRAIN_LABELS: Record<TerrainType, { label: string; icon: string; color: string; desc: string }> = {
  urbano: { label: 'Urbano', icon: '🏙️', color: '#3B82F6', desc: 'Zonas densamente pobladas con edificios y vías principales' },
  montañoso: { label: 'Montañoso', icon: '🏔️', color: '#22C55E', desc: 'Áreas de alta pendencia con riesgo de deslizamientos' },
  costero: { label: 'Costero', icon: '🏖️', color: '#06B6D4', desc: 'Zonas costeras con riesgo de maremoto y erosión' },
  rural: { label: 'Rural', icon: '🌾', color: '#F59E0B', desc: 'Zonas agrícolas y de baja densidad poblacional' },
  industrial: { label: 'Industrial', icon: '🏭', color: '#8B5CF6', desc: 'Zonas industriales con riesgo de derrame químico' },
  mixin: { label: 'Mixto', icon: '🔀', color: '#EC4899', desc: 'Zonas con combinación de terrenos' },
};

export interface MapMarker {
  id: string;
  type: MarkerType;
  title: string;
  description: string;
  lat: number;
  lng: number;
  severity?: 'baja' | 'media' | 'alta' | 'critica';
  terrain?: TerrainType;
  groups: HelpGroup[];
  supplies: Supply[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  verified?: boolean;
  verifiedSource?: string;
}

// ===== PERSONAS RESCATADAS =====
export interface RescuedPerson {
  id: string;
  name: string;
  age: number;
  gender: 'masculino' | 'femenino' | 'otro';
  zoneId: string;
  zoneName: string;
  lat: number;
  lng: number;
  terrain?: TerrainType;
  rescuedAt: string;
  rescuedBy: string;
  condition: 'bueno' | 'herido' | 'critico';
  notes?: string;
  verified: boolean;
  verificationUrl?: string;
  createdAt: string;
}

export interface Category {
  type: MarkerType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export type NotificationType =
  | 'nuevo_marcador'
  | 'severidad_cambiada'
  | 'insumo_necesitado'
  | 'grupo_llego'
  | 'zona_cerrada'
  | 'emergencia'
  | 'actualizacion';

export interface EmergencyNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  markerId?: string;
  markerTitle?: string;
  severity: 'info' | 'warning' | 'critical';
  read: boolean;
  createdAt: string;
}

// ===== MODO RESCATISTA =====
export type ServiceStatus = 'disponible' | 'parcial' | 'dañado' | 'no_disponible';

export interface ZoneServices {
  agua: ServiceStatus;
  luz: ServiceStatus;
  gasolina: ServiceStatus;
  internet: ServiceStatus;
  telefono: ServiceStatus;
  gas: ServiceStatus;
}

export interface RescueTool {
  id: string;
  name: string;
  description: string;
  icon: string;
  priority: 'alta' | 'media' | 'baja';
  category: 'rescate' | 'comunicacion' | 'salud' | 'logistica' | 'seguridad';
}

export interface ChatMessage {
  id: string;
  groupId: string;
  sender: string;
  message: string;
  timestamp: string;
  isSystem?: boolean;
}

// ===== ENLACES DE RESCATE =====
export type RescueLinkCategory = 'whatsapp' | 'canal_informativo' | 'pagina';

export interface RescueLink {
  id: string;
  title: string;
  url: string;
  category: RescueLinkCategory;
  zoneId: string;
  zoneName: string;
  createdAt: string;
  description?: string;
}

export const RESCUE_LINK_CATEGORIES: Record<RescueLinkCategory, { label: string; icon: string; color: string }> = {
  whatsapp: { label: 'Grupo WhatsApp', icon: '💬', color: '#25D366' },
  canal_informativo: { label: 'Canal Informativo', icon: '📢', color: '#3B82F6' },
  pagina: { label: 'Página Web', icon: '🌐', color: '#8B5CF6' },
};

// ===== VOLUNTARIOS =====
export type Specialization =
  | 'medico'
  | 'bombero'
  | 'ingeniero'
  | 'psicologo'
  | 'paramedico'
  | 'rescate_urbano'
  | 'busqueda_rescate'
  | 'logistica'
  | 'comunicaciones'
  | 'seguridad'
  | 'coccion'
  | 'general';

export type CheckInStatus = 'en_zona' | 'descanso' | 'regresando' | 'fuera';

export interface VolunteerMember {
  id: string;
  name: string;
  specialization: Specialization;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  arrivedAt: string;
  checkedOutAt?: string;
  status: CheckInStatus;
  notes?: string;
}

export interface VolunteerGroup {
  id: string;
  name: string;
  organization: string;
  members: VolunteerMember[];
  leaderName: string;
  leaderPhone: string;
  createdAt: string;
}

export const SPECIALIZATION_LABELS: Record<Specialization, { label: string; icon: string; color: string }> = {
  medico: { label: 'Médico', icon: '🩺', color: '#22C55E' },
  bombero: { label: 'Bombero', icon: '🧑‍🚒', color: '#EF4444' },
  ingeniero: { label: 'Ingeniero', icon: '👷', color: '#F59E0B' },
  psicologo: { label: 'Psicólogo', icon: '🧠', color: '#8B5CF6' },
  paramedico: { label: 'Paramédico', icon: '🚑', color: '#DC2626' },
  rescate_urbano: { label: 'Rescate Urbano', icon: '⛏️', color: '#EA580C' },
  busqueda_rescate: { label: 'Búsqueda y Rescate', icon: '🔍', color: '#0891B2' },
  logistica: { label: 'Logística', icon: '📦', color: '#6366F1' },
  comunicaciones: { label: 'Comunicaciones', icon: '📡', color: '#2563EB' },
  seguridad: { label: 'Seguridad', icon: '🦺', color: '#7C3AED' },
  coccion: { label: 'Cocina', icon: '🍳', color: '#D97706' },
  general: { label: 'General', icon: '🤝', color: '#64748B' },
};

export const CHECKIN_STATUS_LABELS: Record<CheckInStatus, { label: string; color: string; bg: string }> = {
  en_zona: { label: 'En Zona', color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
  descanso: { label: 'Descanso', color: '#EAB308', bg: 'rgba(234,179,8,0.15)' },
  regresando: { label: 'Regresando', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  fuera: { label: 'Fuera', color: '#64748B', bg: 'rgba(100,116,139,0.15)' },
};
