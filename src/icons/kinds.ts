/**
 * @file kinds.ts
 * @description The glass drawing of every glyph kind (Drift's own types, folders, albums and the families of uploaded files): which shape it sits on and the marks on the card, once for the large drawing and once for the small one used at 32 px and below (fewer, thicker marks, one back sheet, a slightly larger card). Ported from the icon generator page; the per-kind `hue` is the base color the kind has with no item color of its own (the type registry and styles/glyphs.css hold the same colors for the UI).
 * Used by: draw.ts, appIcon.ts, scripts/render-app-icons.mjs.
 */
import { bar, box, check, inkOf, photo, rr, stroke, type Layout, type ShapeName } from './glass.ts';
import { paint, type Palette } from './palette.ts';

export type KindKey =
  | 'folder' | 'smart' | 'album' | 'page' | 'tasks' | 'whiteboard' | 'base'
  | 'pdf' | 'document' | 'sheet' | 'slides' | 'text' | 'image' | 'video' | 'audio' | 'archive' | 'code' | 'ebook' | 'disk' | 'executable' | 'shortcut' | 'other';

export interface KindArt {
  /** The kind's base color. */
  hue: string;
  shape: ShapeName | 'folder';
  marks: (p: string, c: Palette, small: boolean) => string;
}

export const KIND_ART: Record<KindKey, KindArt> = {
  folder: { hue: '#D17A00', shape: 'folder', marks: (p, c, s) => (s ? bar(128, 356, 124, 44, inkOf(p)) : bar(128, 380, 92, 26, inkOf(p))) },
  smart: {
    hue: '#6B655E', shape: 'folder',
    marks: (p, c, s) => (s
      ? `<circle cx="236" cy="312" r="52" ${paint('fill', c.ink[0])} fill-opacity=".14" stroke="${inkOf(p)}" stroke-width="28"/>${stroke('M278 354L322 398', inkOf(p), 32)}`
      : `<circle cx="240" cy="316" r="46" ${paint('fill', c.ink[0])} fill-opacity=".12" stroke="${inkOf(p)}" stroke-width="20"/>${stroke('M274 350L314 390', inkOf(p), 24)}`),
  },
  album: {
    hue: '#C2477A', shape: 'std',
    marks: (p, c, s) => (s
      ? `<path d="${rr(164, 100, 232, 196, 34)}" fill="url(#${p}s2)" transform="rotate(8 280 198)"/>` + photo(p, c, rr(110, 150, 250, 214, 34), 'M90,374L196,262C204,254 216,254 224,262L278,318L302,294C310,286 322,286 330,294L392,374Z', [300, 200, 24]) + `<path d="${rr(110, 150, 250, 214, 34)}" fill="none" stroke="#FFFFFF" stroke-width="6"/>`
      : `<path d="${rr(150, 104, 236, 190, 30)}" fill="url(#${p}s2)" transform="rotate(7 268 199)"/>` + photo(p, c, rr(118, 150, 236, 190, 30), 'M100,352L190,262C197,255 207,255 214,262L262,310L282,290C289,283 299,283 306,290L372,356Z', [296, 196, 20]) + `<path d="${rr(118, 150, 236, 190, 30)}" fill="none" stroke="#FFFFFF" stroke-width="5"/>${bar(136, 376, 120, 20, c.mid)}`),
  },
  page: {
    hue: '#64748B', shape: 'std',
    marks: (p, c, s) => (s
      ? box(124, 124, 200, 48, 20, inkOf(p)) + bar(124, 214, 264, 32, c.strong) + bar(124, 276, 220, 32, c.strong) + bar(124, 338, 170, 32, c.soft)
      : box(124, 118, 176, 34, 14, inkOf(p)) + bar(124, 182, 264, 16, c.strong) + bar(124, 214, 220, 16, c.strong) + bar(124, 246, 248, 16, c.soft)
        + `<path d="${rr(124, 290, 264, 104, 22)}" fill="url(#${p}s3)" fill-opacity=".45"/>` + box(144, 312, 46, 60, 12, inkOf(p)) + bar(210, 324, 150, 14, c.strong) + bar(210, 352, 104, 14, c.soft)),
  },
  tasks: {
    hue: '#13955A', shape: 'std',
    marks: (p, c, s) => (s
      ? `<circle cx="176" cy="184" r="40" fill="${inkOf(p)}"/>${check(176, 184, 1.4)}${bar(244, 166, 144, 36, c.soft)}<circle cx="176" cy="318" r="33" fill="none" ${paint('stroke', c.mid)} stroke-width="15"/>${bar(244, 300, 144, 36, c.strong)}`
      : bar(124, 118, 112, 20, c.strong)
        + `<circle cx="170" cy="200" r="28" fill="${inkOf(p)}"/>${check(170, 200)}${bar(228, 188, 150, 24, c.soft)}`
        + `<circle cx="170" cy="280" r="28" fill="${inkOf(p)}"/>${check(170, 280)}${bar(228, 268, 120, 24, c.soft)}`
        + `<circle cx="170" cy="360" r="24" fill="none" ${paint('stroke', c.mid)} stroke-width="10"/>${bar(228, 348, 156, 24, c.strong)}`),
  },
  whiteboard: {
    hue: '#7C4DE0', shape: 'land',
    marks: (p, c, s) => (s
      ? `<circle cx="164" cy="214" r="56" fill="${inkOf(p)}"/><rect x="262" y="172" width="126" height="88" rx="22" fill="none" ${paint('stroke', c.strong)} stroke-width="20"/>` + stroke('M116 336C160 290 200 380 248 334S340 292 396 328', inkOf(p), 26)
      : `<circle cx="160" cy="208" r="40" fill="${inkOf(p)}"/><rect x="264" y="172" width="110" height="74" rx="18" fill="none" ${paint('stroke', c.strong)} stroke-width="12"/>`
        + stroke('M212 209H246M234 197L247 209L234 221', c.strong, 10) + stroke('M114 334C150 292 186 372 228 330S302 290 340 330S386 352 398 318', inkOf(p), 14)),
  },
  base: {
    hue: '#0F766E', shape: 'std',
    marks: (p, c, s) => (s
      ? box(124, 124, 264, 58, 22, inkOf(p)) + bar(124, 220, 104, 40, c.strong) + bar(248, 220, 140, 40, c.soft) + bar(124, 292, 104, 40, c.strong) + bar(248, 292, 100, 40, c.soft)
      : box(124, 118, 264, 44, 16, inkOf(p)) + `<path d="${rr(110, 232, 292, 46, 16)}" fill="url(#${p}s3)" fill-opacity=".6"/>`
        + [190, 240, 290, 340].map((y, j) => bar(124, y, 84, 28, c.strong) + bar(224, y, j % 2 ? 124 : 164, 28, c.soft)).join('')),
  },
  pdf: {
    hue: '#DC3B2B', shape: 'fold',
    marks: (p, c, s) => (s
      ? `<path d="M128,74V250L178,214L228,250V74Z" fill="${inkOf(p)}"/>` + bar(124, 290, 264, 34, c.strong) + bar(124, 350, 190, 34, c.soft)
      : `<path d="M128,74V200L164,174L200,200V74Z" fill="${inkOf(p)}"/>` + bar(124, 244, 264, 18, c.strong) + bar(124, 280, 230, 18, c.strong) + bar(124, 316, 252, 18, c.soft) + bar(124, 352, 170, 18, c.soft)),
  },
  document: {
    hue: '#5246D9', shape: 'fold',
    marks: (p, c, s) => (s
      ? bar(124, 128, 176, 44, inkOf(p)) + bar(124, 216, 264, 30, c.strong) + bar(124, 272, 230, 30, c.strong) + bar(124, 328, 180, 30, c.soft)
      : bar(124, 124, 150, 30, inkOf(p)) + ([[264, c.strong], [236, c.strong], [264, c.soft], [248, c.strong], [210, c.soft], [140, c.soft]] as const).map(([w, col], i) => bar(124, 190 + i * 36, w, 16, col)).join('')),
  },
  sheet: {
    hue: '#1E9E48', shape: 'fold',
    marks: (p, c, s) => (s
      ? box(124, 190, 264, 54, 18, inkOf(p)) + bar(124, 268, 124, 44, c.strong) + bar(264, 268, 124, 44, c.soft) + bar(124, 336, 124, 44, c.soft) + bar(264, 336, 124, 44, c.soft)
      : bar(124, 128, 130, 24, c.strong) + box(124, 196, 264, 40, 14, inkOf(p)) + [252, 304, 356].map((y) => `<rect x="124" y="${y}" width="80" height="34" rx="10" ${paint('fill', c.strong)}/><rect x="216" y="${y}" width="80" height="34" rx="10" ${paint('fill', c.soft)}/><rect x="308" y="${y}" width="80" height="34" rx="10" ${paint('fill', c.soft)}/>`).join('')),
  },
  slides: {
    hue: '#E0601A', shape: 'fold',
    marks: (p, c, s) => (s
      ? box(124, 170, 264, 170, 30, inkOf(p)) + bar(156, 214, 140, 26, '#FFFFFF', 0.85) + bar(124, 368, 180, 32, c.soft)
      : bar(124, 128, 150, 24, c.strong) + box(124, 196, 264, 150, 24, inkOf(p)) + bar(152, 232, 128, 18, '#FFFFFF', 0.85) + bar(152, 264, 88, 14, '#FFFFFF', 0.6) + bar(124, 372, 140, 18, c.soft)),
  },
  text: {
    hue: '#4C7F8A', shape: 'fold',
    marks: (p, c, s) => (s
      ? bar(124, 176, 190, 34, c.strong) + bar(124, 240, 264, 34, c.soft) + bar(124, 304, 170, 34, c.strong) + `<rect x="306" y="292" width="16" height="58" rx="8" fill="${inkOf(p)}"/>`
      : bar(124, 128, 160, 22, c.strong) + ([[264, c.strong], [244, c.strong], [256, c.soft], [210, c.strong], [150, c.soft]] as const).map(([w, col], i) => bar(124, 196 + i * 36, w, 16, col)).join('') + `<rect x="284" y="330" width="10" height="36" rx="5" fill="${inkOf(p)}"/>`),
  },
  image: {
    hue: '#0F8F96', shape: 'std',
    marks: (p, c, s) => (s
      ? photo(p, c, rr(116, 104, 280, 276, 40), 'M96,384L206,268C214,259 228,259 236,268L292,330L318,304C326,296 340,296 348,304L420,384Z', [330, 172, 34])
      : photo(p, c, rr(120, 106, 272, 236, 32), 'M100,350L204,248C212,240 224,240 232,248L288,304L310,282C318,274 330,274 338,282L412,356Z', [322, 168, 26]) + bar(136, 376, 128, 20, c.mid)),
  },
  video: {
    hue: '#B3379E', shape: 'land',
    marks: (p, c, s) => (s
      ? `<circle cx="256" cy="246" r="98" fill="${inkOf(p)}"/><path d="M226,194L318,246L226,298Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="14" stroke-linejoin="round"/>`
      : `<circle cx="256" cy="232" r="66" fill="${inkOf(p)}"/><path d="M236,200L296,232L236,264Z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>` + bar(112, 342, 288, 14, c.soft) + bar(112, 342, 128, 14, inkOf(p)) + `<circle cx="240" cy="349" r="15" ${paint('fill', c.ink[1])} stroke="#FFFFFF" stroke-width="5"/>`),
  },
  audio: {
    hue: '#D63B7C', shape: 'fold',
    marks: (p, c, s) => {
      const note = `<rect x="218" y="196" width="16" height="156" fill="${inkOf(p)}"/><rect x="342" y="168" width="16" height="156" fill="${inkOf(p)}"/><path d="M218,196L358,168V206L218,234Z" fill="${inkOf(p)}"/><ellipse cx="194" cy="352" rx="40" ry="32" transform="rotate(-20 194 352)" fill="${inkOf(p)}"/><ellipse cx="318" cy="324" rx="40" ry="32" transform="rotate(-20 318 324)" fill="${inkOf(p)}"/>`;
      return s ? `<g transform="translate(270 270) scale(1.16) translate(-276 -262)">${note}</g>` : bar(124, 128, 130, 22, c.strong) + note;
    },
  },
  archive: {
    hue: '#9A6A2A', shape: 'fold',
    marks: (p, c, s) => (s
      ? [0, 1, 2].map((i) => `<rect x="${i % 2 ? 232 : 184}" y="${78 + i * 44}" width="44" height="28" rx="9" fill="${inkOf(p)}"/>`).join('') + box(180, 224, 100, 132, 28, inkOf(p)) + box(208, 262, 44, 56, 14, '#FFFFFF', ' fill-opacity=".9"')
      : [0, 1, 2, 3, 4, 5].map((i) => `<rect x="${i % 2 ? 228 : 196}" y="${78 + i * 28}" width="32" height="18" rx="6" fill="${inkOf(p)}"/>`).join('') + box(188, 250, 76, 104, 22, inkOf(p)) + box(210, 282, 32, 44, 12, '#FFFFFF', ' fill-opacity=".9"') + bar(296, 262, 92, 18, c.soft) + bar(296, 298, 70, 18, c.soft)),
  },
  code: {
    hue: '#2B7BD0', shape: 'fold',
    marks: (p, c, s) => (s
      ? stroke('M200,206L128,278L200,350', inkOf(p), 34) + stroke('M312,206L384,278L312,350', inkOf(p), 34)
      : bar(124, 128, 120, 20, c.strong) + bar(124, 162, 170, 20, c.soft) + stroke('M190,232L134,288L190,344', inkOf(p), 24) + stroke('M322,232L378,288L322,344', inkOf(p), 24) + stroke('M276,222L236,354', c.strong, 18)),
  },
  ebook: {
    hue: '#A3562E', shape: 'book',
    marks: (p, c, s) => (s
      ? stroke('M256,154V404', c.strong, 8) + bar(108, 200, 112, 32, c.soft) + bar(108, 260, 90, 32, c.soft) + bar(292, 196, 112, 40, inkOf(p)) + bar(292, 262, 90, 32, c.strong)
      : stroke('M256,154V404', c.strong, 6) + ([[182, 104], [214, 116], [246, 92], [278, 110]] as const).map(([y, w]) => bar(112, y, w, 14, c.soft)).join('') + bar(294, 180, 104, 24, inkOf(p)) + bar(294, 224, 110, 14, c.strong) + bar(294, 256, 96, 14, c.strong) + bar(294, 288, 104, 14, c.soft)),
  },
  disk: {
    hue: '#6F63D6', shape: 'disc',
    marks: (p, c, s) => (s
      ? `<circle cx="256" cy="256" r="80" fill="${inkOf(p)}"/><circle cx="256" cy="256" r="26" fill="#FFFFFF"/>`
      : stroke('M256,136A120,120 0 0 0 136,256', c.soft, 14) + stroke('M376,256A120,120 0 0 1 256,376', c.soft, 14) + `<circle cx="256" cy="256" r="64" fill="${inkOf(p)}"/><circle cx="256" cy="256" r="22" fill="#FFFFFF"/>`),
  },
  executable: {
    hue: '#2F7FA5', shape: 'win',
    marks: (p, c, s) => (s
      ? `<circle cx="124" cy="160" r="20" fill="${inkOf(p)}"/><circle cx="180" cy="160" r="20" ${paint('fill', c.strong)}/><circle cx="236" cy="160" r="20" ${paint('fill', c.soft)}/>` + box(112, 222, 150, 150, 30, inkOf(p)) + bar(286, 240, 120, 34, c.strong) + bar(286, 306, 90, 34, c.soft)
      : `<circle cx="112" cy="150" r="13" fill="${inkOf(p)}"/><circle cx="152" cy="150" r="13" ${paint('fill', c.strong)}/><circle cx="192" cy="150" r="13" ${paint('fill', c.soft)}/><rect x="88" y="184" width="336" height="5" ${paint('fill', c.soft)} fill-opacity=".7"/>` + box(112, 222, 120, 140, 24, inkOf(p)) + bar(256, 232, 152, 22, c.strong) + bar(256, 274, 120, 22, c.strong) + bar(256, 316, 140, 22, c.soft)),
  },
  shortcut: {
    hue: '#0E8FB0', shape: 'fold',
    marks: (p, c, s) => (s
      ? stroke('M150,388V316C150,252 196,224 250,224H344', inkOf(p), 38) + stroke('M298,170L352,224L298,278', inkOf(p), 38)
      : bar(124, 128, 140, 20, c.strong) + stroke('M156,384V318C156,262 196,236 248,236H340', inkOf(p), 28) + stroke('M300,190L346,236L300,282', inkOf(p), 28)),
  },
  other: { hue: '#78716C', shape: 'fold', marks: (p, c, s) => (s ? '' : bar(124, 214, 220, 18, c.soft) + bar(124, 250, 170, 18, c.soft)) },
};

/** The sections' stacks of cards: which kind, how the sheets sit behind it, and the section's own color. */
export interface SectionArt {
  kind: KindKey;
  layout: Layout;
  hue: string;
}

export const SECTION_ART = {
  drive: { kind: 'folder', layout: 'papers', hue: '#D17A00' },
  photos: { kind: 'image', layout: 'fan', hue: '#C2477A' },
  pages: { kind: 'page', layout: 'straight', hue: '#64748B' },
  tasks: { kind: 'tasks', layout: 'fan', hue: '#13955A' },
  whiteboards: { kind: 'whiteboard', layout: 'fan', hue: '#7C4DE0' },
  bases: { kind: 'base', layout: 'straight', hue: '#0F766E' },
} as const satisfies Record<string, SectionArt>;
export type SectionKey = keyof typeof SECTION_ART;
