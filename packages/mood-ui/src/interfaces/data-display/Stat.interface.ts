import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';

export interface Stat {
    /** Short label (e.g. "Revenue"). Optional — omit for a chart-only card. */
    label?: string;
    /**
     * Main metric value. Pre-formatted by the consumer. Optional — omit it (and
     * `trend`) to render just the visualization from the `#chart` slot, so the
     * chart fills the card ("chart-only" stat).
     */
    value?: string | number;
    /** Optional helper text shown below the value. */
    description?: string;
    /** Optional leading icon. */
    icon?: Component;
    /** Trend metadata. Renders an arrow + delta. */
    trend?: {
        /** Numeric delta (positive or negative). */
        value: number;
        /** Optional formatted display value. Defaults to `${value}%`. */
        label?: string;
        /** Override the auto direction (positive → up, negative → down). */
        direction?: 'up' | 'down' | 'neutral';
    };
    /**
     * Visual container. Card variants are rendered by the shared `Card`
     * component (so styling stays consistent): `outlined` = border only (no
     * shadow), `elevated` = border + subtle shadow, `filled` = muted surface.
     * `plain` renders no container. @default 'plain'
     */
    variant?: 'plain' | 'outlined' | 'elevated' | 'filled';
    /** Corner radius of the card. Inherits from `ModoProvider` if omitted. */
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    /** Semantic color family for the icon and trend. */
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    /** Size scale. Inherits from `ModoProvider` if omitted. */
    size?: ModoSize;
    /** Show a decorative loading skeleton instead of the value. */
    loading?: boolean;
}
