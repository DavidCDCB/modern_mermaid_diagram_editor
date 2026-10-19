export const MERMAID_LAYOUT_OPTIONS = [
  { value: 'auto', label: 'layoutAuto' },
  { value: 'dagre', label: 'layoutDagre' },
  { value: 'elk', label: 'layoutElkLayered' },
  { value: 'elk.stress', label: 'layoutElkStress' },
  { value: 'elk.force', label: 'layoutElkForce' },
  { value: 'elk.mrtree', label: 'layoutElkMrTree' },
  { value: 'elk.sporeOverlap', label: 'layoutElkSporeOverlap' },
] as const;

export type MermaidLayout = typeof MERMAID_LAYOUT_OPTIONS[number]['value'];
export type MermaidLayoutAlgorithm = Exclude<MermaidLayout, 'auto'>;
export type MermaidLayoutLabel = typeof MERMAID_LAYOUT_OPTIONS[number]['label'];

const getDiagramSource = (code: string): string =>
  code.replace(/^\s*---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/, '').trimStart();

export const isErDiagram = (code: string): boolean => /^erDiagram(?:\s|$)/i.test(getDiagramSource(code));

export const getLayoutForDiagram = (
  code: string,
  selectedLayout: MermaidLayout = 'auto',
  configuredLayout?: string,
): string => {
  const isEntityRelationshipDiagram = isErDiagram(code);

  if (selectedLayout !== 'auto') return selectedLayout;

  return isEntityRelationshipDiagram ? 'elk' : configuredLayout ?? 'dagre';
};

export const applyLayoutOverride = (code: string, layout: MermaidLayoutAlgorithm): string => {
  const frontmatter = /^(---[ \t]*\r?\n)([\s\S]*?)(\r?\n---[ \t]*(?:\r?\n|$))/.exec(code);

  if (!frontmatter) {
    return `---\nconfig:\n  layout: ${layout}\n---\n${code}`;
  }

  const [, opening, frontmatterBody, closing] = frontmatter;
  const newline = code.includes('\r\n') ? '\r\n' : '\n';
  const lines = frontmatterBody.split(/\r?\n/);
  const configIndex = lines.findIndex((line) => /^[ \t]*config\s*:\s*(?:#.*)?$/.test(line));

  if (configIndex < 0) {
    lines.unshift('config:', `  layout: ${layout}`);
    return `${opening}${lines.join(newline)}${closing}${code.slice(frontmatter[0].length)}`;
  }

  const configIndent = lines[configIndex].match(/^[ \t]*/)?.[0] ?? '';
  const configEndIndex = lines.findIndex((line, index) => {
    if (index <= configIndex || line.trim() === '') return false;
    const indentation = line.match(/^[ \t]*/)?.[0] ?? '';
    return indentation.length <= configIndent.length;
  });
  const blockEnd = configEndIndex < 0 ? lines.length : configEndIndex;
  const layoutIndex = lines.findIndex((line, index) =>
    index > configIndex && index < blockEnd && /^[ \t]*layout\s*:/.test(line),
  );

  if (layoutIndex >= 0) {
    const indentation = lines[layoutIndex].match(/^[ \t]*/)?.[0] ?? `${configIndent}  `;
    lines[layoutIndex] = `${indentation}layout: ${layout}`;
  } else {
    const firstConfigOption = lines.slice(configIndex + 1, blockEnd).find((line) => line.trim() !== '');
    const optionIndent = firstConfigOption?.match(/^[ \t]*/)?.[0];
    lines.splice(configIndex + 1, 0, `${optionIndent ?? `${configIndent}  `}layout: ${layout}`);
  }

  return `${opening}${lines.join(newline)}${closing}${code.slice(frontmatter[0].length)}`;
};