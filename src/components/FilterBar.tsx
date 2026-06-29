import React from 'react';
import { CATEGORIES } from '../utils/categories';
import type { MarkerType } from '../types';
import { useI18n } from '../utils/i18n';
import { tCategory } from '../utils/translateContent';

interface FilterBarProps {
  activeFilters: MarkerType[];
  onToggleFilter: (type: MarkerType) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onToggleFilter,
  onClearFilters,
}) => {
  const { t, lang } = useI18n();
  return (
    <div className="filter-bar">
      <span className="filter-label">{t('filter.label')}</span>
      {Object.values(CATEGORIES).map((cat) => {
        const isActive = activeFilters.includes(cat.type);
        return (
          <button
            key={cat.type}
            className={`filter-chip ${isActive ? 'active' : ''}`}
            style={{
              '--chip-color': cat.color,
              '--chip-bg': cat.bgColor,
            } as React.CSSProperties}
            onClick={() => onToggleFilter(cat.type)}
          >
            {cat.icon} {tCategory(cat.type, lang)}
          </button>
        );
      })}
      {activeFilters.length > 0 && (
        <button className="filter-clear" onClick={onClearFilters}>
          {t('filter.clear')}
        </button>
      )}
    </div>
  );
};

export default FilterBar;
