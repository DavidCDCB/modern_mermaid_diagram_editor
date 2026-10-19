import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../contexts/LanguageContext';
import LayoutSelector from '../components/LayoutSelector';

describe('LayoutSelector', () => {
  it('shows the available layouts and reports the selected option', () => {
    const onSelectLayout = vi.fn();

    render(
      <LanguageProvider>
        <LayoutSelector selectedLayout="auto" onSelectLayout={onSelectLayout} />
      </LanguageProvider>,
    );

    const selector = screen.getByRole('combobox', { name: 'Layout' });
    expect(selector).toHaveValue('auto');
    expect(selector.parentElement?.querySelector('svg.lucide-workflow')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'ELK Force' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /COSE-Bilkent/ })).not.toBeInTheDocument();

    const automaticOption = screen.getByRole('option', { name: 'Automatic' });
    expect(automaticOption).toHaveClass('bg-white', 'text-gray-900', 'dark:bg-gray-800', 'dark:text-gray-100');

    fireEvent.change(selector, { target: { value: 'elk.force' } });

    expect(onSelectLayout).toHaveBeenCalledWith('elk.force');
  });

});