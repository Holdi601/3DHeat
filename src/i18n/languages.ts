/**
 * The languages the viewer speaks, by their own names, and which of them a
 * browser asks for.
 *
 * Every language of Europe's states - the 24 of the EU, and Norwegian,
 * Icelandic, Ukrainian, Russian, Belarusian, Serbian, Bosnian, Macedonian,
 * Albanian, Turkish, Luxembourgish and Catalan - plus Japanese, Korean and
 * Chinese, simplified and traditional. English is the source every other is
 * translated from, and what a missing message falls back to.
 */

export interface Language {
  /** BCP 47 tag, as `Intl` takes it. */
  code: string;
  /** Its own name for itself. */
  name: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'nl', name: 'Nederlands' },
  { code: 'pl', name: 'Polski' },
  { code: 'cs', name: 'Čeština' },
  { code: 'sk', name: 'Slovenčina' },
  { code: 'sl', name: 'Slovenščina' },
  { code: 'hr', name: 'Hrvatski' },
  { code: 'bs', name: 'Bosanski' },
  { code: 'sr', name: 'Српски' },
  { code: 'mk', name: 'Македонски' },
  { code: 'bg', name: 'Български' },
  { code: 'ro', name: 'Română' },
  { code: 'hu', name: 'Magyar' },
  { code: 'el', name: 'Ελληνικά' },
  { code: 'sq', name: 'Shqip' },
  { code: 'tr', name: 'Türkçe' },
  { code: 'da', name: 'Dansk' },
  { code: 'sv', name: 'Svenska' },
  { code: 'no', name: 'Norsk' },
  { code: 'fi', name: 'Suomi' },
  { code: 'is', name: 'Íslenska' },
  { code: 'et', name: 'Eesti' },
  { code: 'lv', name: 'Latviešu' },
  { code: 'lt', name: 'Lietuvių' },
  { code: 'ga', name: 'Gaeilge' },
  { code: 'mt', name: 'Malti' },
  { code: 'lb', name: 'Lëtzebuergesch' },
  { code: 'ca', name: 'Català' },
  { code: 'uk', name: 'Українська' },
  { code: 'ru', name: 'Русский' },
  { code: 'be', name: 'Беларуская' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '简体中文' },
  { code: 'zh-Hant', name: '繁體中文' },
];

const CODES = new Set(LANGUAGES.map((l) => l.code));

/** Tags that name one of ours by another name. */
const ALIASES: Record<string, string> = {
  nb: 'no',
  nn: 'no',
  'zh-tw': 'zh-Hant',
  'zh-hk': 'zh-Hant',
  'zh-mo': 'zh-Hant',
  'zh-hant': 'zh-Hant',
  'zh-hans': 'zh',
  'zh-cn': 'zh',
  'zh-sg': 'zh',
  // Montenegrin is written as Serbian or Bosnian is; Serbian here.
  cnr: 'sr',
};

/** Ours, for one browser language tag; null when we do not speak it. */
export function match(tag: string): string | null {
  const lower = tag.toLowerCase();
  if (ALIASES[lower]) return ALIASES[lower];
  // Script before region: zh-Hant-TW is traditional, whatever the region.
  const parts = lower.split('-');
  if (parts[0] === 'zh') return parts.includes('hant') || ['tw', 'hk', 'mo'].includes(parts[1] ?? '') ? 'zh-Hant' : 'zh';
  if (CODES.has(parts[0])) return parts[0];
  return ALIASES[parts[0]] ?? null;
}

/** The first of the browser's languages we speak; English when none. */
export function detect(tags: readonly string[]): string {
  for (const tag of tags) {
    const code = match(tag);
    if (code) return code;
  }
  return 'en';
}
