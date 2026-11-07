/**
 * The GPU memory the renderer may use for rows, from what the user chose.
 *
 * One function, asked by both the load's fit check (`checkFit`) and the engine
 * when it hands a dataset to the renderer, because the two disagreeing is a load
 * the check approves and the renderer then partly leaves "Not resident". The
 * choice applies as made, above the detected figure too — past that figure it is
 * the user's judgement, which the Resources panel says in so many words — and is
 * capped only at `ceiling`, the highest the slider goes (`Budgets.gpuCeiling`).
 *
 * No floor: the slider has one of its own, and a smaller figure set from the
 * console is a deliberate way to see what residency limits do.
 */
export function effectiveGpuBudget(requested: number, ceiling: number): number {
  if (!Number.isFinite(requested) || requested < 0) return 0;
  if (!Number.isFinite(ceiling) || ceiling <= 0) return requested;
  return Math.min(requested, ceiling);
}
