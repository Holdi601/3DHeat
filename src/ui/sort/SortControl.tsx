import type { KeyboardEvent, ReactNode, ThHTMLAttributes } from 'react';
import { t } from '../../i18n';
import type { Sort } from './useSort';
import './sort.css';

/**
 * The sort of a list: a dropdown of what it can be sorted by and a button for
 * the direction. The same small control above every list in the viewer.
 */
export function SortControl<T>({ sort, className }: { sort: Sort<T>; className?: string }) {
  const asc = sort.dir === 'asc';
  return (
    <div className={`sort-ctl${className ? ` ${className}` : ''}`} data-testid={`sort-${sort.list}`}>
      <span className="sort-label">{t('ui.sort.by')}</span>
      {sort.options.length > 1 ? (
        <select value={sort.by} onChange={(e) => sort.set(e.target.value)} aria-label={t('ui.sort.by')}>
          {sort.options.map((o) => (
            <option key={o.id} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="sort-only">{sort.option.label}</span>
      )}
      <button
        className="sort-dir"
        onClick={sort.flip}
        title={t(asc ? 'ui.sort.asc' : 'ui.sort.desc')}
        aria-label={t(asc ? 'ui.sort.asc' : 'ui.sort.desc')}
      >
        {asc ? '↑' : '↓'}
      </button>
    </div>
  );
}

/**
 * A table's column header that sorts the table by its column: a click sorts
 * by it, a second click the other way; the arrow shows which column and which
 * way. `id` is the sort option the column is.
 */
export function SortTh<T>({
  sort,
  id,
  children,
  className,
  title,
  ...rest
}: { sort: Sort<T>; id: string; children?: ReactNode } & ThHTMLAttributes<HTMLTableCellElement>) {
  const on = sort.by === id;
  const label = typeof children === 'string' ? children : (sort.options.find((o) => o.id === id)?.label ?? id);
  const key = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      sort.click(id);
    }
  };
  return (
    <th
      {...rest}
      className={`sort-th${on ? ' on' : ''}${className ? ` ${className}` : ''}`}
      aria-sort={on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
      title={title ? `${title}\n${t('ui.sort.column', { column: label })}` : t('ui.sort.column', { column: label })}
      tabIndex={0}
      onClick={() => sort.click(id)}
      onKeyDown={key}
    >
      {children}
      <span className="sort-ind" aria-hidden>
        {on ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}
      </span>
    </th>
  );
}
