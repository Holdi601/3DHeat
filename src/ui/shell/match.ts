/** How the command palette ranks a command against what was typed. */

/** The fields a command is found by. */
export interface Findable {
  label: string;
  hint?: string;
  words?: string;
  group: string;
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

/** How well `cmd` matches `query`: 0 for not at all, higher for better. Every word must be found. */
export function score(cmd: Findable, query: string): number {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return 1;
  const label = fold(cmd.label);
  const rest = fold(`${cmd.hint ?? ''} ${cmd.words ?? ''}`);
  let total = 0;
  for (const w of words) {
    const i = label.indexOf(w);
    if (i === 0) total += 6;
    else if (i > 0) total += /[\s/(›-]/.test(label[i - 1]) ? 4 : 2;
    else if (rest.includes(w)) total += 1;
    else return 0;
  }
  if (label === words.join(' ')) total += 6;
  // Actions and sections ahead of single settings with the same words.
  if (cmd.group === 'action' || cmd.group === 'workspace' || cmd.group === 'mode') total += 1.5;
  else if (cmd.group === 'section') total += 1;
  return total - label.length / 200;
}
