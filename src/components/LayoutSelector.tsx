import type React from 'react';
import { Workflow } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MERMAID_LAYOUT_OPTIONS, type MermaidLayout } from '../utils/mermaidLayout';

interface LayoutSelectorProps {
  selectedLayout: MermaidLayout;
  onSelectLayout: (layout: MermaidLayout) => void;
}

const LayoutSelector: React.FC<LayoutSelectorProps> = ({ selectedLayout, onSelectLayout }) => {
  const { t } = useLanguage();

  return (
    <label className="flex h-9 items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2 shadow-sm dark:border-gray-600 dark:bg-gray-800">
      <Workflow className="h-4 w-4 text-gray-600 dark:text-gray-300" aria-hidden="true" />
      <span className="hidden text-xs font-medium text-gray-600 dark:text-gray-300 sm:inline">{t.layout}</span>
      <select
        aria-label={t.layout}
        title={t.layout}
        value={selectedLayout}
        onChange={(event) => onSelectLayout(event.currentTarget.value as MermaidLayout)}
        className="max-w-36 cursor-pointer bg-transparent text-xs font-medium text-gray-700 outline-none dark:text-gray-200 dark:scheme-dark sm:text-sm"
      >
        {MERMAID_LAYOUT_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100">
            {t[label]}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LayoutSelector;