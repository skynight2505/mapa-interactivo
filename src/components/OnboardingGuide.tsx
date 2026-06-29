import { useState, useEffect } from 'react';
import { useI18n } from '../utils/i18n';

const STORAGE_KEY = 'mapa-onboarding-done';

const STEPS = [
  {
    icon: '🌍',
    title: 'Mapa Interactivo de Emergencia',
    desc: 'Plataforma colaborativa para coordinar ayuda en emergencias y desastres. Marca zonas de riesgo, refugios, vías obstruidas y más.',
  },
  {
    icon: '📍',
    title: 'Marcadores en el Mapa',
    desc: 'Cada ícono representa una situación: 🏚️ edificio derrumbado, 🚧 vía obstruida, 🏠 refugio, ⚠️ zona de riesgo, 👥 personas atrapadas.',
  },
  {
    icon: '🌊',
    title: 'Terremotos en Tiempo Real',
    desc: 'Los terremotos M4.5+ se muestran automáticamente desde USGS. Actívalos con el botón "🌍 Terremotos ON/OFF" en el mapa.',
  },
  {
    icon: '🔔',
    title: 'Notificaciones',
    desc: 'Recibe alertas de emergencias, terremotos y cambios importantes. El ícono de campana muestra las notificaciones activas.',
  },
  {
    icon: '✏️',
    title: 'Modo Edición',
    desc: 'Activa "Editar" en el header para agregar, modificar o eliminar marcadores. Útil para reportar nuevas situaciones.',
  },
  {
    icon: '🚑',
    title: 'Modo Rescatista',
    desc: 'Activa "Rescatista" para registrar personas rescatadas, gestionar suministros y ver grupos de ayuda por zona.',
  },
];

export default function OnboardingGuide() {
  useI18n();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) setOpen(true);
  }, []);

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else finish();
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  if (!open) return null;

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-step-dots">
          {STEPS.map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} />
          ))}
        </div>
        <div className="onboarding-icon">{s.icon}</div>
        <h2 className="onboarding-title">{s.title}</h2>
        <p className="onboarding-desc">{s.desc}</p>
        <div className="onboarding-footer">
          <button className="btn btn-secondary" onClick={finish}>Saltar</button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && <button className="btn btn-secondary" onClick={prev}>Anterior</button>}
            <button className="btn btn-primary" onClick={next}>
              {isLast ? '¡Empezar!' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
