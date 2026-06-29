import type { Language } from '../utils/i18n';
import type { MapMarker, MarkerType, TerrainType } from '../types';

type ContentDict = Record<string, Record<Language, string>>;

const CATEGORY_LABELS: ContentDict = {
  terremoto:            { es: 'Terremoto / Epicentro',      en: 'Earthquake / Epicenter',      pt: 'Terremoto / Epicentro',      zh: '地震 / 震中',        ar: 'زلزال / مركز الزلزال' },
  edificio_derrumbado:  { es: 'Edificio Derrumbado',        en: 'Collapsed Building',          pt: 'Edifício Desabado',          zh: '倒塌建筑',           ar: 'مبنى منهار' },
  zona_riesgo:          { es: 'Zona de Riesgo',             en: 'Risk Zone',                   pt: 'Zona de Risco',              zh: '风险区域',           ar: 'منطقة خطر' },
  zona_acopio:          { es: 'Zona de Acopio',             en: 'Supply Collection Point',     pt: 'Ponto de Coleta',            zh: '物资收集点',         ar: 'نقطة تجميع' },
  via_obstruida:        { es: 'Vía Obstruida',              en: 'Blocked Road',                pt: 'Via Obstruída',              zh: '道路堵塞',           ar: 'طريق مسدود' },
  personas_atrapadas:   { es: 'Personas Atrapadas',         en: 'Trapped People',              pt: 'Pessoas Presas',             zh: '被困人员',           ar: 'أشخاص محاصرون' },
  zona_refugio:         { es: 'Zona Refugio / Segura',      en: 'Safe Shelter',                pt: 'Abrigo Seguro',              zh: '安全避难所',         ar: 'ملجأ آمن' },
  supermercado:         { es: 'Supermercado',               en: 'Supermarket',                 pt: 'Supermercado',               zh: '超市',               ar: 'سوبر ماركت' },
  tienda_comida:        { es: 'Tienda de Comida',           en: 'Food Store',                  pt: 'Loja de Comida',             zh: '食品店',             ar: 'متجر طعام' },
  farmacia:             { es: 'Farmacia Activa',            en: 'Active Pharmacy',             pt: 'Farmácia Ativa',             zh: '营业药店',           ar: 'صيدلية نشطة' },
};

const TERRAIN_LABELS: ContentDict = {
  urbano:     { es: 'Urbano',      en: 'Urban',        pt: 'Urbano',      zh: '城市',      ar: 'حضري' },
  montañoso:  { es: 'Montañoso',   en: 'Mountainous',  pt: 'Montanhoso',  zh: '山区',      ar: 'جبلي' },
  costero:    { es: 'Costero',     en: 'Coastal',      pt: 'Costeiro',    zh: '沿海',      ar: 'ساحلي' },
  rural:      { es: 'Rural',       en: 'Rural',        pt: 'Rural',       zh: '农村',      ar: 'ريفي' },
  industrial: { es: 'Industrial',  en: 'Industrial',   pt: 'Industrial',  zh: '工业区',    ar: 'صناعي' },
  mixin:      { es: 'Mixto',       en: 'Mixed',        pt: 'Misto',       zh: '混合',      ar: 'مختلط' },
};

const TERRAIN_DESCS: ContentDict = {
  urbano:     { es: 'Zonas densamente pobladas con edificios y vías principales', en: 'Densely populated areas with buildings and main roads', pt: 'Áreas densamente povoadas com edifícios e vias principais', zh: '人口密集区，有建筑物和主干道', ar: 'مناطق مكتظة بالسكان بها مبانٍ وطرق رئيسية' },
  montañoso:  { es: 'Áreas de alta pendiente con riesgo de deslizamientos', en: 'High slope areas with landslide risk', pt: 'Áreas de alta inclinação com risco de deslizamentos', zh: '高坡度地区，有滑坡风险', ar: 'مناطق شديدة الانحدار مع خطر الانهيارات الأرضية' },
  costero:    { es: 'Zonas costeras con riesgo de maremoto y erosión', en: 'Coastal areas with tsunami and erosion risk', pt: 'Zonas costeiras com risco de tsunami e erosão', zh: '沿海区域，有海啸和侵蚀风险', ar: 'مناطق ساحلية مع خطر تسونامي وتآكل' },
  rural:      { es: 'Zonas agrícolas y de baja densidad poblacional', en: 'Agricultural and low-density areas', pt: 'Zonas agrícolas e de baixa densidade populacional', zh: '农业和低密度居住区', ar: 'مناطق زراعية ومنخفضة الكثافة السكانية' },
  industrial: { es: 'Zonas industriales con riesgo de derrame químico', en: 'Industrial areas with chemical spill risk', pt: 'Zonas industriais com risco de derramamento químico', zh: '工业区，有化学品泄漏风险', ar: 'مناطق صناعية مع خطر تسرب كيميائي' },
  mixin:      { es: 'Zonas con combinación de terrenos', en: 'Mixed terrain areas', pt: 'Zonas com combinação de terrenos', zh: '混合地形区域', ar: 'مناطق ذات تضاريس مختلطة' },
};

const SEVERITY_LABELS: ContentDict = {
  baja:    { es: 'Baja',     en: 'Low',       pt: 'Baixa',     zh: '低',    ar: 'منخفضة' },
  media:   { es: 'Media',    en: 'Medium',    pt: 'Média',     zh: '中',    ar: 'متوسطة' },
  alta:    { es: 'Alta',     en: 'High',      pt: 'Alta',      zh: '高',    ar: 'عالية' },
  critica: { es: 'Crítica',  en: 'Critical',  pt: 'Crítica',   zh: '危急',  ar: 'حرجة' },
};

const SERVICE_LABELS: ContentDict = {
  disponible:    { es: 'Disponible',     en: 'Available',      pt: 'Disponível',     zh: '可用',       ar: 'متاح' },
  parcial:       { es: 'Parcial',        en: 'Partial',        pt: 'Parcial',        zh: '部分',       ar: 'جزئي' },
  dañado:        { es: 'Dañado',         en: 'Damaged',        pt: 'Danificado',     zh: '受损',       ar: 'متضرر' },
  no_disponible: { es: 'No Disponible',  en: 'Unavailable',    pt: 'Indisponível',   zh: '不可用',     ar: 'غير متاح' },
};

const SPECIALIZATION_LABELS: ContentDict = {
  medico:           { es: 'Médico',              en: 'Doctor',                pt: 'Médico',              zh: '医生',           ar: 'طبيب' },
  bombero:          { es: 'Bombero',             en: 'Firefighter',           pt: 'Bombeiro',            zh: '消防员',          ar: 'رجل إطفاء' },
  ingeniero:        { es: 'Ingeniero',           en: 'Engineer',              pt: 'Engenheiro',          zh: '工程师',          ar: 'مهندس' },
  psicologo:        { es: 'Psicólogo',           en: 'Psychologist',          pt: 'Psicólogo',           zh: '心理学家',        ar: 'طبيب نفسي' },
  paramedico:       { es: 'Paramédico',          en: 'Paramedic',             pt: 'Paramédico',          zh: '护理人员',        ar: 'مسعف' },
  rescate_urbano:   { es: 'Rescate Urbano',      en: 'Urban Rescue',          pt: 'Resgate Urbano',      zh: '城市救援',        ar: 'إنقاذ حضري' },
  busqueda_rescate: { es: 'Búsqueda y Rescate',  en: 'Search and Rescue',     pt: 'Busca e Resgate',     zh: '搜索与救援',      ar: 'بحث وإنقاذ' },
  logistica:        { es: 'Logística',           en: 'Logistics',             pt: 'Logística',           zh: '后勤',            ar: 'لوجستيات' },
  comunicaciones:   { es: 'Comunicaciones',      en: 'Communications',        pt: 'Comunicações',        zh: '通信',            ar: 'اتصالات' },
  seguridad:        { es: 'Seguridad',           en: 'Security',              pt: 'Segurança',           zh: '安全',            ar: 'أمن' },
  coccion:          { es: 'Cocina',              en: 'Cooking',               pt: 'Cozinha',             zh: '烹饪',            ar: 'طبخ' },
  general:          { es: 'General',             en: 'General',               pt: 'Geral',               zh: '一般',            ar: 'عام' },
};

const CHECKIN_LABELS: ContentDict = {
  en_zona:    { es: 'En Zona',      en: 'In Zone',      pt: 'Na Zona',      zh: '在区域中',    ar: 'في المنطقة' },
  descanso:   { es: 'Descanso',     en: 'Resting',      pt: 'Descanso',     zh: '休息中',      ar: 'استراحة' },
  regresando: { es: 'Regresando',   en: 'Returning',    pt: 'Retornando',   zh: '返回中',      ar: 'عائد' },
  fuera:      { es: 'Fuera',        en: 'Away',         pt: 'Fora',         zh: '离开',        ar: 'خارج' },
};

const LINK_CATEGORY_LABELS: ContentDict = {
  whatsapp:          { es: 'Grupo WhatsApp',      en: 'WhatsApp Group',       pt: 'Grupo WhatsApp',      zh: 'WhatsApp 群组',    ar: 'مجموعة واتساب' },
  canal_informativo: { es: 'Canal Informativo',   en: 'Information Channel',  pt: 'Canal Informativo',   zh: '信息频道',          ar: 'قناة إخبارية' },
  pagina:            { es: 'Página Web',          en: 'Web Page',             pt: 'Página Web',          zh: '网页',              ar: 'صفحة ويب' },
};

function lookup(dict: ContentDict, key: string, lang: Language): string {
  return dict[key]?.[lang] || dict[key]?.es || key;
}

export function tCategory(type: MarkerType, lang: Language): string {
  return lookup(CATEGORY_LABELS, type, lang);
}

export function tTerrain(terrain: TerrainType | undefined, lang: Language): string {
  if (!terrain) return '';
  return lookup(TERRAIN_LABELS, terrain, lang);
}

export function tTerrainDesc(terrain: TerrainType | undefined, lang: Language): string {
  if (!terrain) return '';
  return lookup(TERRAIN_DESCS, terrain, lang);
}

export function tSeverity(severity: string | undefined, lang: Language): string {
  if (!severity) return '';
  return lookup(SEVERITY_LABELS, severity, lang);
}

export function tService(status: string, lang: Language): string {
  return lookup(SERVICE_LABELS, status, lang);
}

export function tSpecialization(spec: string, lang: Language): string {
  return lookup(SPECIALIZATION_LABELS, spec, lang);
}

export function tCheckin(status: string, lang: Language): string {
  return lookup(CHECKIN_LABELS, status, lang);
}

export function tLinkCategory(cat: string, lang: Language): string {
  return lookup(LINK_CATEGORY_LABELS, cat, lang);
}

export function tMarkerContent(marker: MapMarker, lang: Language, field: 'title' | 'description'): string {
  if (lang === 'es') return marker[field];
  return marker.translations?.[lang]?.[field] || marker[field];
}

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)}\]"'»])/g;

export function linkifyText(text: string): (string | { href: string; label: string })[] {
  const parts: (string | { href: string; label: string })[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const url = match[1].replace(/[.,;:!?)\]}"']+$/, '');
    parts.push({ href: url, label: url.length > 50 ? url.slice(0, 47) + '...' : url });
    lastIndex = match.index + match[1].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
