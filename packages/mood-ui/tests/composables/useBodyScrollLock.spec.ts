import { describe, it, expect, beforeEach } from "vitest";
import {
    lockBodyScroll,
    unlockBodyScroll,
    __resetBodyScrollLock,
} from "../../src/composables/useBodyScrollLock";

beforeEach(() => {
    __resetBodyScrollLock();
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
});

describe("body scroll lock", () => {
    it("locks and restores a single holder", () => {
        lockBodyScroll();
        expect(document.body.style.overflow).toBe("hidden");

        unlockBodyScroll();
        expect(document.body.style.overflow).toBe("");
    });

    it("restores the page's own overflow, not the locked value", () => {
        document.body.style.overflow = "auto";

        lockBodyScroll();
        unlockBodyScroll();

        expect(document.body.style.overflow).toBe("auto");
    });

    it("keeps the lock while a second holder is still open", () => {
        lockBodyScroll();
        lockBodyScroll();

        unlockBodyScroll();
        expect(document.body.style.overflow).toBe("hidden");

        unlockBodyScroll();
        expect(document.body.style.overflow).toBe("");
    });

    it("does not strand overflow:hidden when two overlays overlap", () => {
        // The regression behind issue #7: the second overlay used to capture
        // the already-locked value as "the thing to restore".
        lockBodyScroll();
        lockBodyScroll();
        unlockBodyScroll();
        unlockBodyScroll();

        expect(document.body.style.overflow).toBe("");
        expect(document.body.style.paddingRight).toBe("");
    });

    it("ignores an unbalanced release", () => {
        document.body.style.overflow = "auto";

        unlockBodyScroll();
        expect(document.body.style.overflow).toBe("auto");

        lockBodyScroll();
        unlockBodyScroll();
        unlockBodyScroll();
        expect(document.body.style.overflow).toBe("auto");
    });
});
