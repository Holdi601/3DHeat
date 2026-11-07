import { detect } from '../i18n/languages';
import { LANGUAGES, setLanguage, t, useLangStore } from '../i18n';

/**
 * The language the viewer speaks: the browser's by default, or one picked -
 * kept in this browser. Each language by its own name, so it is found by
 * someone who cannot read the one shown.
 */
export function LanguagePicker() {
  const choice = useLangStore((s) => s.choice);
  useLangStore((s) => s.lang);
  const browser = typeof navigator !== 'undefined' ? detect(navigator.languages ?? [navigator.language]) : 'en';
  const nameOf = (code: string) => LANGUAGES.find((l) => l.code === code)?.name ?? code;
  return (
    <select
      className="language-picker"
      value={choice}
      onChange={(e) => void setLanguage(e.target.value)}
      aria-label={t('common.language')}
      title={t('common.language')}
    >
      <option value="auto">{t('common.languageAuto', { name: nameOf(browser) })}</option>
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code} lang={l.code}>
          {l.name}
        </option>
      ))}
    </select>
  );
}
