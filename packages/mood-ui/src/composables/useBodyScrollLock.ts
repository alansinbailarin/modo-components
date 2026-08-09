/**
 * Reference-counted `<body>` scroll lock, shared by every overlay that needs
 * one (Modal, Drawer, …).
 *
 * Each overlay used to save and restore `body.style.overflow` on its own. That
 * breaks as soon as two overlays are open at once: the second one saves the
 * *locked* value (`'hidden'`) as the thing to restore, so whichever releases
 * last writes `overflow: hidden` back onto <body> and the page can never
 * scroll again. Counting holders here means the original values are captured
 * once, by the first lock, and restored once, by the last release.
 *
 * Callers must pair every `lockBodyScroll()` with exactly one
 * `unlockBodyScroll()` — components track that with an instance-level flag so
 * a double release cannot drop the count below zero.
 */

let holders = 0;
let previousOverflow = '';
let previousPaddingRight = '';

export function lockBodyScroll(): void {
    if (typeof document === 'undefined') return;

    if (holders === 0) {
        // Compensate for the scrollbar the lock is about to remove, so the
        // page underneath doesn't shift sideways.
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        previousOverflow = document.body.style.overflow;
        previousPaddingRight = document.body.style.paddingRight;
        document.body.style.overflow = 'hidden';
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
    }

    holders += 1;
}

export function unlockBodyScroll(): void {
    if (typeof document === 'undefined' || holders === 0) return;

    holders -= 1;
    if (holders > 0) return;

    document.body.style.overflow = previousOverflow;
    document.body.style.paddingRight = previousPaddingRight;
    previousOverflow = '';
    previousPaddingRight = '';
}

/** Test-only escape hatch so specs can start from a known state. */
export function __resetBodyScrollLock(): void {
    holders = 0;
    previousOverflow = '';
    previousPaddingRight = '';
}
