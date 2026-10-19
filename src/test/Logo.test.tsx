import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Logo from '../components/Logo';

describe('Logo', () => {
  it('renders three connected diagram nodes instead of the robot mark', () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector('svg');

    expect(svg?.querySelectorAll('.logo-node')).toHaveLength(3);
    expect(svg?.querySelector('.logo-connector')).toBeInTheDocument();
    expect(svg?.querySelector('.logo-robot')).not.toBeInTheDocument();
  });
});