/**
 * Dashboards: BI-style pages of tiles over the loaded data (docs/dashboards.md).
 * The public face of the module, for the workspaces that build on it:
 *
 * - `model.ts`     what a dashboard is (`Dashboard`, `Page`, `Tile`,
 *                  `MeasureDef`, `FilterDef`, ...), plain JSON, and
 *                  `makeDashboard` / `makeTile` / `parseBundle`.
 * - `store.ts`     `useDash`: the dashboards as an op-log document (synced in
 *                  a shared session, kept in the session file and the
 *                  browser), the one open, the page shown, edit mode, undo /
 *                  redo, and the interaction (selection, drills, drill-through).
 * - `sources.ts`   `registerDashboardSource`: a workspace's own rows (any
 *                  `Dataset`-shaped table) for dashboards that name it, and
 *                  its link to its own 3D view (`viewMask` / `onViewChange`,
 *                  `applySelection`).
 * - `ci.ts`        a rate's confidence interval: Wilson, bootstrap.
 * - `templates.ts` `registerTemplate`: a ready-made dashboard, built from the
 *                  data's field catalogue.
 * - `fields.ts`    the field catalogue of a dataset (roles, columns,
 *                  calculated columns, bins, hierarchies).
 * - `plan.ts`      tiles to queries: filters, cross-filter, drill, measures.
 * - `query.ts`     the engine in the row workers: clause bitsets, shared
 *                  masks, incremental folds.
 * - `client.ts`    `dashClient`: which pages are shown, the workers, results.
 * - `finish.ts`    numbers to what each visual draws; `export.ts` PNG, PDF,
 *                  CSV, JSON; `link.ts` the dashboard driving the 3D view.
 *
 * The UI is `ui/dashboards/`: `DashboardWindow` (in every workspace),
 * `DashboardPage` (one page anywhere, e.g. a document block), `Canvas`.
 */

export * from './model';
export { useDash, pageShown, interOf, bundleOf, onLocalDashBatch, DASH_DOC, type DashDoc, type DashState } from './store';
export { dashClient, DASH_PLAY_EVERY } from './client';
export { registerDashboardSource, dashboardSource, dashboardSources, registeredSource, VIEW_SOURCE, type DashSource, type SourceMask, type SourceSelection, type SourceViewInputs } from './sources';
export { wilson, bootstrap, rateInterval, normalQuantile, type CiMethod } from './ci';
export { wantedSelection } from './link';
export { TEMPLATES, templatesFor, registerTemplate, type Template } from './templates';
export { catalogOf, fieldWithRole, roleOf, dimOf, type Catalog, type FieldInfo, type FieldRole } from './fields';
export { planTile, tileClauses, toggleSelection, drillDown, drillUp, expandDown, drillTargets, throughFilters, type Selection, type DrillState, type Interaction, type TilePlan } from './plan';
export type { TileData, CiInfo, CiValue } from './finish';
export { csvRows, toCsv, jpegPdf } from './export';
