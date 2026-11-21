/**
 * The quick feedback on a control (ui/usage/UsageUI.tsx): the small menu a
 * right click on a control opens while statistics are kept, and the form it
 * leads to. Kept with the statistics, by the control's feature id.
 */

import { create } from 'zustand';
import type { FEEDBACK } from './schema';

export type FeedbackKind = (typeof FEEDBACK)[number];

interface FeedbackState {
  menu: { id: string; x: number; y: number } | null;
  form: { id: string; v: FeedbackKind } | null;
}

export const useFeedback = create<FeedbackState>(() => ({ menu: null, form: null }));

/** Opens the menu for feature `id` at (x, y). */
export function openFeedback(id: string, x: number, y: number): void {
  useFeedback.setState({ menu: { id, x, y }, form: null });
}

/** Opens the form for feature `id`, the kind picked. */
export function feedbackForm(id: string, v: FeedbackKind): void {
  useFeedback.setState({ menu: null, form: { id, v } });
}
