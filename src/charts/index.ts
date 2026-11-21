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
 * - `data.ts`      what the aggregation is told of a dataset (meta, columns
 *                  a spec reads, the view's scope and its minutes).
 * - `run.ts`       one chart counted over all the data, the view's rows or a
 *                  volume's, in a worker (`runWorker.ts`): a document's chart.
 * - `convert.ts`   charts made elsewhere in this form: an expression chart's
 *                  numbers, chart data read back from JSON.
 * - `exprSpec.ts`, `exprRun.ts`, `exprSvg.ts`  the documents' charts counted
 *                  with Compare expressions; drawn through `convert.ts` like
 *                  every other chart, `exprSvg.ts` only where there is no canvas.
 *
 * One look across the viewer: a sign on a volume, a chart in an analysis
 * document (preview and export, `notes/export.ts`), the Volumes panel's list -
 * all are `ChartData` drawn by `draw.ts` (`ChartView` with hover and click,
 * `chartPng` for an export). A document's module chart is a `ChartBlock`
 * (`heat3d.chartBlock/1`) carrying its data, so it shows without the data
 * loaded; the documents register `registerChartBlockSink` to take the blocks a
 * sign sends. The chart settings form is `ui/charts/ChartSpecFields.tsx`, the
 * same for a sign and a document.
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
export { ChartView, ChartTable, paintChart, chartPng, fillTooltip, entityOf } from './ChartView';
export { exprToChartData, readChartData } from './convert';
export { runChart, type RunOptions } from './run';
export { aggScopes, metaOf, specColumns, windowMinutes } from './data';
export { registerChartBlockSink, sendChartBlock, hasChartBlockSink, isChartBlock, type ChartBlock } from './block';
