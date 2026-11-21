/**
 * The shared chart module: one way to ask for a chart, aggregate it and draw
 * it, used by the volume signs (`ui/signs`) and by the notes' analysis
 * documents. Write new charts against this module rather than beside it, so
 * they read as one system (docs/volume-charts.md, "For developers").
 *
 * - `types.ts`     `ChartSpec` (kind, measure, group-by, diff, filter, sort)
 *                  and `ChartData` (groups x series of values), plain JSON.
 * - `aggregate.ts` rows (`RowTable`s) to `ChartData`, incrementally: counts,
 *                  shares, rates, means and percentiles, diffs, "Other",
 *                  sorting. Pure; runs in a worker.
 * - `palette.ts`   validated categorical slots for both themes, team colours,
 *                  the sequential hue, `readTheme` from the design tokens.
 * - `format.ts`    values, ticks and the worker's `@` labels in words.
 * - `draw.ts`      `ChartData` onto a 2D canvas, with hit regions, tooltips
 *                  and a table view.
 * - `ChartView.tsx` the React element for panels and documents.
 * - `block.ts`     a chart as a document block, and where blocks are sent.
 *
 * For the analysis documents (notes): a document's chart block is a
 * `ChartBlock` (`block.ts`, `heat3d.chartBlock/1`); it carries its `data`,
 * drawn with `ChartView` (React) or `paintChart` (a canvas), so the document
 * needs no data loaded to show it, and `tableOf` gives its table for an
 * export. Register the documents with `registerChartBlockSink` to receive the
 * blocks a volume's sign sends ("Send to document"). A chart a document
 * counts itself (from the Compare expressions, say) fills a `ChartData` and
 * draws it the same way, so every chart in the viewer reads as one system.
 *
 * Rules every chart here keeps (from the dataviz method): one value axis,
 * never two; thin marks; a legend from two series on; a tooltip on every
 * mark; text in text inks; colours that follow the entity, never its rank.
 */

export * from './types';
export { aggregate, createAgg, addRows, advanceAgg, canAdvance, finishAgg, tableOf as rowTableOf, ALL_SCOPE } from './aggregate';
export type { Agg, AggMeta, AggScope, AggSource, ColumnMeta, RowTable } from './aggregate';
export { colorChart, readTheme, DARK_THEME, LIGHT_THEME, SERIES_DARK, SERIES_LIGHT, type ChartTheme } from './palette';
export { fmtValue, localizeChart, sayLabel, niceTicks, clock } from './format';
export { drawChart, hitAt, tooltipOf, tableOf, type Hit } from './draw';
export { ChartView, ChartTable, paintChart, fillTooltip, entityOf } from './ChartView';
export { registerChartBlockSink, sendChartBlock, hasChartBlockSink, isChartBlock, type ChartBlock } from './block';
