import type { Component } from 'vue';
import type { ModoSize } from '../../config/ModoConfig';
import type { PopoverPlacement } from '../../composables/usePopover';
import type { DropdownMenuEntry, DropdownMenuItem } from '../navigation/DropdownMenu.interface';

/**
 * A button whose click opens a menu. Its DOM root is the trigger button, so it
 * drops straight into a `<ButtonGroup>` as a segment (inherits the group's
 * variant/size/radius and collapses its borders like any other button), and it
 * also works standalone.
 */
export interface MenuButton {
    /** Menu entries — same model as `DropdownMenu` (items / dividers / headers). */
    items: DropdownMenuEntry[];
    /** Visible trigger label. Optional — omit for an icon-only trigger. */
    label?: string;
    /** Leading trigger icon. */
    icon?: Component;
    /** Show the trailing chevron. @default true */
    chevron?: boolean;
    /** Trigger variant. Inside a ButtonGroup it inherits the group. @default 'outline' */
    variant?: 'normal' | 'outline' | 'ghost' | 'text';
    color?: 'default' | 'primary' | 'danger' | 'success' | 'warning';
    size?: ModoSize;
    radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
    disabled?: boolean;
    /** Menu placement. @default 'bottom-start' */
    placement?: PopoverPlacement;
    /** Min width of the menu panel. @default '12rem' */
    minWidth?: string;
    /** Close the menu after a selection. @default true */
    closeOnSelect?: boolean;
    /** Accessible name — required when the trigger is icon-only. */
    ariaLabel?: string;
}

export interface MenuButtonEmits {
    (e: 'select', item: DropdownMenuItem): void;
    (e: 'update:open', open: boolean): void;
}
