import type { MapMarker, RescuedPerson } from '../types';
import { CATEGORIES } from './categories';

// ===== EXPORT JSON =====
export function exportToJSON(markers: MapMarker[]): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'Mapa de Terremoto - Venezuela',
    markers,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `mapa-terremoto-${getTimestamp()}.json`);
}

// ===== EXPORT CSV =====
export function exportToCSV(markers: MapMarker[]): void {
  const headers = [
    'ID',
    'Tipo',
    'Título',
    'Descripción',
    'Latitud',
    'Longitud',
    'Severidad',
    'Activo',
    'Grupos de Ayuda',
    'Insumos',
    'Creado',
    'Actualizado',
  ];

  const rows = markers.map((m) => [
    m.id,
    CATEGORIES[m.type].label,
    m.title,
    m.description,
    m.lat.toString(),
    m.lng.toString(),
    m.severity || '',
    m.isActive ? 'Sí' : 'No',
    m.groups.map((g) => `${g.name} (${g.contact})`).join(' | '),
    m.supplies
      .map((s) => `${s.name}: ${s.quantity} ${s.unit} [${statusLabel(s.status)}]`)
      .join(' | '),
    m.createdAt,
    m.updatedAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `mapa-terremoto-${getTimestamp()}.csv`);
}

// ===== IMPORT JSON =====
export function importFromJSON(file: File): Promise<MapMarker[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);

        let markers: MapMarker[];

        if (Array.isArray(data)) {
          markers = data;
        } else if (data.markers && Array.isArray(data.markers)) {
          markers = data.markers;
        } else {
          reject(new Error('Formato de archivo no reconocido'));
          return;
        }

        const valid = markers.filter(validateMarker);
        if (valid.length === 0) {
          reject(new Error('No se encontraron marcadores válidos en el archivo'));
          return;
        }

        resolve(valid);
      } catch {
        reject(new Error('Error al leer el archivo JSON. Verifica que sea un archivo válido.'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

// ===== HELPERS =====
function validateMarker(m: unknown): m is MapMarker {
  if (typeof m !== 'object' || m === null) return false;
  const obj = m as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.lat === 'number' &&
    typeof obj.lng === 'number' &&
    typeof obj.description === 'string'
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case 'needed': return 'Necesitado';
    case 'available': return 'Disponible';
    case 'delivered': return 'Entregado';
    default: return status;
  }
}

function getTimestamp(): string {
  return new Date().toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ===== EXPORT RESCUED PERSONS JSON =====
export function exportRescuedJSON(persons: RescuedPerson[]): void {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'Mapa de Terremoto - Venezuela',
    totalRescued: persons.length,
    verificationUrl: 'http://desaparecidosterremotovenezuela.com',
    persons,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, `personas-rescatadas-${getTimestamp()}.json`);
}

// ===== EXPORT RESCUED PERSONS CSV =====
export function exportRescuedCSV(persons: RescuedPerson[]): void {
  const headers = [
    'ID', 'Nombre', 'Edad', 'Sexo', 'Zona', 'Terreno', 'Latitud', 'Longitud',
    'Condición', 'Rescatado por', 'Fecha Rescate', 'Notas', 'Verificado',
  ];
  const rows = persons.map(p => [
    p.id, p.name, p.age.toString(), p.gender, p.zoneName,
    p.terrain || '', p.lat.toString(), p.lng.toString(),
    p.condition, p.rescuedBy, p.rescuedAt, p.notes || '',
    p.verified ? 'Sí' : 'No',
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `personas-rescatadas-${getTimestamp()}.csv`);
}
