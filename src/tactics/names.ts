/**
 * A figure's name as people write it: a class's in the reader's language
 * (`tactics.figure.<name>`), a named type from its catalogue name, its
 * designation in capitals and its name capitalised ("zsu-23-4-shilka" ->
 * "ZSU-23-4 Shilka", "f-16c" -> "F-16C").
 */

import { has, t } from '../i18n';

export function figureLabel(name: string): string {
  const key = `tactics.figure.${name}`;
  if (has(key)) return t(key);
  const tokens = name.split('-');
  const code = (s: string) => /\d/.test(s) || s.length <= 3;
  let out = '';
  tokens.forEach((tok, i) => {
    const word = code(tok) ? tok.toUpperCase() : tok[0].toUpperCase() + tok.slice(1);
    if (i === 0) out = word;
    else out += code(tok) && code(tokens[i - 1]) ? `-${word}` : ` ${word}`;
  });
  return out;
}
