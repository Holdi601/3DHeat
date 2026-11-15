/**
 * The debrief: the built-in narrator's few paragraphs over the report, each
 * with buttons to the findings it says; below it, on the user's request, the
 * same report written up by the external model they set up, streamed in, its
 * cited ids turned into the same buttons.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { lang, t } from '../../i18n';
import { citedIds, debriefPrompt } from '../../insights/ai/prompt';
import { useAi } from '../../insights/ai/settings';
import { baseDebrief } from '../../insights/narrate';
import type { Insight, InsightReport } from '../../insights/types';
import { AiSettingsButton } from './AiSettings';
import { insightText } from './say';
import { useAiStream } from './useAiStream';
import { LensPicker, References, useLens } from './LensView';

export function Debrief({ report, onPick }: { report: InsightReport; onPick: (ins: Insight) => void }) {
  const samples = report.dataset.exposure === 'samples';
  const say = (i: Insight) => insightText(i, samples);
  const lens = useLens((s) => s.lens);
  const d = useMemo(() => baseDebrief(report, say, lens), [report, lang(), lens]); // eslint-disable-line react-hooks/exhaustive-deps
  const byId = useMemo(() => new Map(report.insights.map((i) => [i.id, i])), [report]);
  const rank = useMemo(() => new Map([...report.insights].sort((a, b) => b.strength - a.strength).map((i, n) => [i.id, n + 1])), [report]);
  const ai = useAi();
  const stream = useAiStream('debrief');
  const about = useMemo(() => report.insights.map((i) => i.id).join(',') + report.elapsedMs, [report]);
  const answer = stream.about === about;
  const [question, setQuestion] = useState('');

  const cite = (id: string) => {
    const ins = byId.get(id);
    return ins ? (
      <button key={id} className="ins-cite" onClick={() => onPick(ins)} title={`${t('insights.debrief.citeTitle')}: ${say(ins)}`}>
        {rank.get(id)}
      </button>
    ) : null;
  };

  const write = () => {
    // Sentences said as the viewer says them, with raw keys for the model's own wording.
    const sayKey = (key: string, params: Record<string, number | string>) => {
      const ins = report.insights.find((i) => i.sentence.key === key && i.sentence.params === params);
      return ins ? say(ins) : t(key, params);
    };
    stream.start(debriefPrompt(report, sayKey, { language: lang(), names: ai.names, question, lens }), about);
  };

  const copy = () => navigator.clipboard?.writeText((answer && stream.text) || d.text).catch(() => undefined);

  return (
    <div className="ins-debrief">
      <LensPicker />
      {d.paragraphs.map((p, i) => (
        <div key={i} className={p.role ? `ins-p ins-lens-${p.role}` : 'ins-p'}>
          {p.text} {p.cites.map(cite)}
          {p.refs && <References ids={p.refs} />}
        </div>
      ))}
      <div className="ins-ai">
        <div className="row wrap" style={{ gap: 6, alignItems: 'center' }}>
          <strong>{t('insights.ai.title')}</strong>
          <AiSettingsButton />
          <button className="link" onClick={copy}>
            {t('insights.debrief.copy')}
          </button>
        </div>
        {!ai.enabled ? (
          <div className="hint">{t('insights.ai.off')}</div>
        ) : (
          <>
            <textarea className="ins-ai-q" rows={2} value={question} placeholder={t('insights.ai.question')} onChange={(e) => setQuestion(e.target.value)} />
            <div className="row" style={{ gap: 6 }}>
              <button onClick={write} disabled={stream.running} title={t('insights.ai.writeTitle')}>
                {t('insights.ai.write')}
              </button>
              {stream.running && <button onClick={stream.cancel}>{t('insights.ai.cancel')}</button>}
            </div>
          </>
        )}
        {answer && stream.running && !stream.text && <div className="hint">{t('insights.ai.writing')}</div>}
        {answer && stream.text && (
          <div className="ins-ai-out" aria-live="polite">
            {withCites(stream.text, new Set(byId.keys()), cite)}
          </div>
        )}
        {answer && stream.via && stream.text && !stream.running && <div className="hint">{t('insights.ai.via', { model: stream.via.model, host: stream.via.host })}</div>}
        {answer && stream.error && <div className="hint ins-err">{stream.error}</div>}
      </div>
    </div>
  );
}

/** The answer with each cited id it knows as a button, the rest as text. */
function withCites(text: string, ids: Set<string>, cite: (id: string) => ReactNode): ReactNode[] {
  const known = new Set(citedIds(text, ids));
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\[([^\]\s]+)\]/g)) {
    if (!known.has(m[1])) continue;
    out.push(text.slice(last, m.index));
    out.push(cite(m[1]));
    last = m.index! + m[0].length;
  }
  out.push(text.slice(last));
  return out;
}
