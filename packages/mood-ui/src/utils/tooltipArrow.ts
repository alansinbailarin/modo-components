/**
 * Geometry for the tooltip arrow — a square rotated 45° that straddles one edge
 * of the panel, so only the outward-facing corner shows past it.
 *
 * Two things make the arrow read as a diamond instead of a tip:
 *
 * 1. Its rotated silhouette is wider than its box. An 8px square spans
 *    8 * √2 ≈ 11.3px once rotated, so it needs half of that — plus the panel's
 *    corner radius — of clearance from either end of the edge. Park it closer
 *    and a side corner pokes out past the rounded corner, outside the panel's
 *    silhouette.
 * 2. The cross-axis value points at the *centre* of the trigger, so it has to
 *    be applied as a centre, not as the box's leading edge. Using it raw as
 *    `left`/`top` shifts the arrow by half its size — invisible on a wide
 *    tooltip, decisive on a narrow one.
 */

/** Side of the (unrotated) arrow square, in px. Must match the `w-2 h-2` class. */
export const TOOLTIP_ARROW_SIZE = 8;

/** Half the arrow's rotated width: 8 * √2 / 2 ≈ 5.66, rounded up. */
const ARROW_HALF_DIAGONAL = 6;

/** Corner radius in px per `ModoRadius`, matching the panel's `rounded-*`. */
const PANEL_CORNER_RADIUS: Record<string, number> = {
  none: 0,
  small: 2,
  medium: 6,
  large: 8,
};

/**
 * Minimum distance from either end of the panel edge at which the arrow's
 * centre may sit. `full` has no straight edge to sit on, so it reports an inset
 * large enough to force the centred fallback below.
 */
export function tooltipArrowInset(radius: string, panelSize: number): number {
  if (radius === "full") return panelSize;
  return (PANEL_CORNER_RADIUS[radius] ?? PANEL_CORNER_RADIUS.medium) + ARROW_HALF_DIAGONAL;
}

/**
 * Centre of the arrow along the panel edge, in panel-local px.
 *
 * `triggerCentre` is where the arrow would ideally point. A panel too small to
 * hold the arrow anywhere clear of both corners gets it centred instead — that
 * is the small-tooltip case, where clamping to `[inset, panelSize - inset]`
 * inverts (the upper bound falls below the lower one) and pushed the arrow off
 * the wrong end of the panel.
 */
export function tooltipArrowCross(
  triggerCentre: number,
  panelSize: number,
  inset: number,
): number {
  if (panelSize <= inset * 2) return panelSize / 2;
  return Math.min(Math.max(triggerCentre, inset), panelSize - inset);
}
