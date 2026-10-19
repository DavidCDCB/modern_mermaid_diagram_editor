import { describe, expect, it } from 'vitest';
import { addErRelationshipLineJumps } from '../utils/erLineJumps';

const encodePoints = (points: Array<{ x: number; y: number }>) =>
  btoa(JSON.stringify(points));

describe('addErRelationshipLineJumps', () => {
  it('adds an arc to the horizontal relationship at an orthogonal crossing', () => {
    const horizontalPoints = encodePoints([{ x: 0, y: 5 }, { x: 30, y: 5 }]);
    const verticalPoints = encodePoints([{ x: 15, y: 0 }, { x: 15, y: 10 }]);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg"><g class="edges">
      <path class="relationshipLine" data-id="horizontal" data-points="${horizontalPoints}" d="M0,5L30,5" marker-start="url(#cardinality)" />
      <path class="relationshipLine" data-id="vertical" data-points="${verticalPoints}" d="M15,0L15,10" />
    </g></svg>`;

    const result = addErRelationshipLineJumps(svg);
    const document = new DOMParser().parseFromString(result, 'image/svg+xml');
    const horizontalPath = document.querySelector('[data-id="horizontal"]');
    const verticalPath = document.querySelector('[data-id="vertical"]');

    expect(horizontalPath?.getAttribute('d')).toContain('A5,5 0 0 1');
    expect(horizontalPath?.getAttribute('marker-start')).toBe('url(#cardinality)');
    expect(verticalPath?.getAttribute('d')).toBe('M15,0L15,10');
  });

  it('returns the original SVG when relationship routes do not cross', () => {
    const first = encodePoints([{ x: 0, y: 0 }, { x: 10, y: 0 }]);
    const second = encodePoints([{ x: 0, y: 5 }, { x: 10, y: 5 }]);
    const svg = `<svg><path class="relationshipLine" data-id="a" data-points="${first}" d="M0,0L10,0" /><path class="relationshipLine" data-id="b" data-points="${second}" d="M0,5L10,5" /></svg>`;

    expect(addErRelationshipLineJumps(svg)).toBe(svg);
  });

  it('does not treat endpoint touches as crossings', () => {
    const first = encodePoints([{ x: 0, y: 0 }, { x: 5, y: 5 }]);
    const second = encodePoints([{ x: 5, y: 5 }, { x: 10, y: 0 }]);
    const svg = `<svg><path class="relationshipLine" data-id="a" data-points="${first}" d="M0,0L5,5" /><path class="relationshipLine" data-id="b" data-points="${second}" d="M5,5L10,0" /></svg>`;

    expect(addErRelationshipLineJumps(svg)).toBe(svg);
  });

  it('adds an arc when diagonal relationship routes cross', () => {
    const rising = encodePoints([{ x: 0, y: 0 }, { x: 20, y: 20 }]);
    const falling = encodePoints([{ x: 0, y: 20 }, { x: 20, y: 0 }]);
    const svg = `<svg><path class="relationshipLine" data-id="rising" data-points="${rising}" d="M0,0L20,20" /><path class="relationshipLine" data-id="falling" data-points="${falling}" d="M0,20L20,0" /></svg>`;

    const result = addErRelationshipLineJumps(svg);
    const document = new DOMParser().parseFromString(result, 'image/svg+xml');

    expect(document.querySelector('[data-id="falling"]')?.getAttribute('d')).toContain('A5,5');
    expect(document.querySelector('[data-id="rising"]')?.getAttribute('d')).toBe('M0,0L20,20');
  });
});