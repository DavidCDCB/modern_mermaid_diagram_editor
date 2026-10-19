import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Header from '../components/Header';
import { DarkModeProvider } from '../contexts/DarkModeContext';
import { LanguageProvider } from '../contexts/LanguageContext';

describe('Header repository links', () => {
  it('links to the new GitHub repository and omits the Discord link', () => {
    render(
      <DarkModeProvider>
        <LanguageProvider>
          <Header />
        </LanguageProvider>
      </DarkModeProvider>,
    );

    expect(screen.getByRole('link', { name: 'Visit our GitHub repository' })).toHaveAttribute(
      'href',
      'https://github.com/DavidCDCB/modern_mermaid_diagram_editor',
    );
    expect(screen.queryByRole('link', { name: 'Join our Discord community' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Modern Mermaid Editor', exact: true })).toBeInTheDocument();
  });
});