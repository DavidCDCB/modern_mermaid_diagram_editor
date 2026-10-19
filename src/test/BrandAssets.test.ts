import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

const projectRoot = path.resolve(__dirname, '../..');
const readProjectFile = (relativePath: string) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

describe('Modern Mermaid Editor brand assets', () => {
  it('uses the new name in page title, extension manifest, and PWA configuration', () => {
    const html = readProjectFile('index.html');
    const extensionManifest = JSON.parse(readProjectFile('public/manifest.json'));
    const viteConfig = readProjectFile('vite.config.ts');
    const socialImage = readProjectFile('public/og-image.svg');

    expect(html).toContain('<title>Modern Mermaid Editor</title>');
    expect(html).toContain('name="application-name" content="Modern Mermaid Editor"');
    expect(html).toContain('rel="apple-touch-icon" href="/icon-192.png"');
    expect(extensionManifest.name).toBe('Modern Mermaid Editor');
    expect(viteConfig).toContain('name: "Modern Mermaid Editor"');
    expect(viteConfig).toContain('short_name: "Mermaid Editor"');
    expect(viteConfig).toContain('purpose: "any maskable"');
    expect(socialImage).toContain('Modern Mermaid Editor');
  });

  it('uses the diagram node mark in the favicon', () => {
    const favicon = readProjectFile('public/favicon.svg');

    expect(favicon.match(/class="logo-node"/g)).toHaveLength(3);
    expect(favicon).toContain('class="logo-connector"');
  });

  it('provides correctly sized PNG icons for the extension and PWA', () => {
    const icons = [
      ['icon-16.png', 16],
      ['icon-48.png', 48],
      ['icon-128.png', 128],
      ['icon-192.png', 192],
      ['icon-512.png', 512],
    ] as const;

    for (const [filename, size] of icons) {
      const png = fs.readFileSync(path.join(projectRoot, 'public', filename));
      expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      expect(png.readUInt32BE(16)).toBe(size);
      expect(png.readUInt32BE(20)).toBe(size);
    }
  });
});