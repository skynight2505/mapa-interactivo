import type { Category, MarkerType } from '../types';

export const CATEGORIES: Record<MarkerType, Category> = {
  terremoto: {
    type: 'terremoto',
    label: 'Terremoto / Epicentro',
    icon: '🔴',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
  edificio_derrumbado: {
    type: 'edificio_derrumbado',
    label: 'Edificio Derrumbado',
    icon: '🏚️',
    color: '#92400E',
    bgColor: '#FEF3C7',
  },
  zona_riesgo: {
    type: 'zona_riesgo',
    label: 'Zona de Riesgo',
    icon: '⚠️',
    color: '#D97706',
    bgColor: '#FFFBEB',
  },
  zona_acopio: {
    type: 'zona_acopio',
    label: 'Zona de Acopio',
    icon: '📦',
    color: '#2563EB',
    bgColor: '#DBEAFE',
  },
  via_obstruida: {
    type: 'via_obstruida',
    label: 'Vía Obstruida',
    icon: '🚧',
    color: '#EA580C',
    bgColor: '#FFF7ED',
  },
  personas_atrapadas: {
    type: 'personas_atrapadas',
    label: 'Personas Atrapadas',
    icon: '🆘',
    color: '#BE123C',
    bgColor: '#FFF1F2',
  },
  zona_refugio: {
    type: 'zona_refugio',
    label: 'Zona Refugio / Segura',
    icon: '🏠',
    color: '#16A34A',
    bgColor: '#F0FDF4',
  },
  supermercado: {
    type: 'supermercado',
    label: 'Supermercado',
    icon: '🛒',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
  },
  tienda_comida: {
    type: 'tienda_comida',
    label: 'Tienda de Comida',
    icon: '🍽️',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  farmacia: {
    type: 'farmacia',
    label: 'Farmacia Activa',
    icon: '💊',
    color: '#0891B2',
    bgColor: '#ECFEFF',
  },
};

export const SEVERITY_COLORS: Record<string, string> = {
  baja: '#22C55E',
  media: '#EAB308',
  alta: '#F97316',
  critica: '#EF4444',
};
