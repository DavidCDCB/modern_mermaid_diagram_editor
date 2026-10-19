import { describe, expect, it } from 'vitest';
import { applyLayoutOverride, getLayoutForDiagram, MERMAID_LAYOUT_OPTIONS } from '../utils/mermaidLayout';

describe('getLayoutForDiagram', () => {
  it('uses ELK in automatic mode for entity relationship diagrams', () => {
    expect(getLayoutForDiagram('erDiagram\n  TENANT ||--o{ FLOW : owns', 'auto')).toBe('elk');
  });

  it('detects entity relationship diagrams after Mermaid frontmatter', () => {
    const code = `---
config:
  theme: neutral
---
erDiagram
  TENANT ||--o{ FLOW : owns`;

    expect(getLayoutForDiagram(code, 'auto')).toBe('elk');
  });

  it('preserves the configured layout for other diagram types', () => {
    expect(getLayoutForDiagram('flowchart LR\n  A --> B', 'auto', 'dagre-wrapper')).toBe('dagre-wrapper');
  });

  it('uses Dagre in automatic mode for other diagram types', () => {
    expect(getLayoutForDiagram('flowchart LR\n  A --> B', 'auto')).toBe('dagre');
  });

  it('uses the manually selected layout for any supported diagram', () => {
    expect(getLayoutForDiagram('erDiagram\n  A ||--o{ B : has', 'elk.force')).toBe('elk.force');
    expect(getLayoutForDiagram('flowchart LR\n  A --> B', 'elk.stress')).toBe('elk.stress');
  });

  it('only exposes layout algorithms registered by the compatible renderers', () => {
    expect(MERMAID_LAYOUT_OPTIONS.map(({ value }) => value)).toEqual([
      'auto',
      'dagre',
      'elk',
      'elk.stress',
      'elk.force',
      'elk.mrtree',
      'elk.sporeOverlap',
    ]);
  });

  it('overrides only the Mermaid layout in existing frontmatter', () => {
    const code = `---
config:
  theme: neutral
  layout: elk
---
flowchart LR
  A --> B`;

    expect(applyLayoutOverride(code, 'dagre')).toBe(`---
config:
  theme: neutral
  layout: dagre
---
flowchart LR
  A --> B`);
  });

  it('adds frontmatter when manually selecting a layout without existing config', () => {
    expect(applyLayoutOverride('flowchart LR\n  A --> B', 'elk.force')).toBe(`---
config:
  layout: elk.force
---
flowchart LR
  A --> B`);
  });

  it('preserves CRLF line endings when overriding frontmatter', () => {
    const code = '---\r\nconfig:\r\n  layout: elk\r\n---\r\nflowchart LR\r\n  A --> B';

    expect(applyLayoutOverride(code, 'dagre')).toBe('---\r\nconfig:\r\n  layout: dagre\r\n---\r\nflowchart LR\r\n  A --> B');
  });
});