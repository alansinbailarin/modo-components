import { describe, it, expect } from "vitest";
import {
  TOOLTIP_ARROW_SIZE,
  tooltipArrowCross,
  tooltipArrowInset,
} from "../../src/utils/tooltipArrow";

describe("tooltipArrowInset", () => {
  it("grows with the panel's corner radius", () => {
    expect(tooltipArrowInset("none", 200)).toBeLessThan(
      tooltipArrowInset("large", 200),
    );
  });

  it("always leaves room for the arrow's rotated width", () => {
    // Half of 8 * √2 ≈ 5.66. Anything less and a side corner of the diamond
    // shows past the panel edge.
    expect(tooltipArrowInset("none", 200)).toBeGreaterThanOrEqual(
      (TOOLTIP_ARROW_SIZE * Math.SQRT2) / 2,
    );
  });

  it("forces the centred fallback for a pill-shaped panel", () => {
    const panelW = 120;
    const inset = tooltipArrowInset("full", panelW);
    expect(tooltipArrowCross(10, panelW, inset)).toBe(panelW / 2);
  });
});

describe("tooltipArrowCross", () => {
  it("points at the trigger when the panel has room", () => {
    expect(tooltipArrowCross(90, 200, 12)).toBe(90);
  });

  it("keeps clear of both corners", () => {
    expect(tooltipArrowCross(2, 200, 12)).toBe(12);
    expect(tooltipArrowCross(198, 200, 12)).toBe(188);
  });

  it("centres the arrow on a panel too small to clear both corners", () => {
    // The old clamp inverted here — Math.min(Math.max(x, 12), 20 - 12) pinned
    // the arrow to 8px regardless of the trigger, i.e. past the wrong corner.
    expect(tooltipArrowCross(18, 20, 12)).toBe(10);
    expect(tooltipArrowCross(0, 20, 12)).toBe(10);
  });

  it("never returns a centre that puts the arrow outside the panel", () => {
    const half = TOOLTIP_ARROW_SIZE / 2;
    for (const panelSize of [12, 20, 24, 31, 48, 120]) {
      for (const centre of [-50, 0, 5, panelSize / 2, panelSize, panelSize + 50]) {
        const cross = tooltipArrowCross(
          centre,
          panelSize,
          tooltipArrowInset("medium", panelSize),
        );
        expect(cross - half).toBeGreaterThanOrEqual(0);
        expect(cross + half).toBeLessThanOrEqual(panelSize);
      }
    }
  });
});
