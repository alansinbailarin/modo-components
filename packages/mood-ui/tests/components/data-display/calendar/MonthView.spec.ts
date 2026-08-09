import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import MonthView from "../../../../src/components/data-display/calendar/MonthView.vue";
import {
  eventColorClass,
  eventColorClassStrong,
} from "../../../../src/composables/eventColors";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
});

const EVENTS = [
  {
    id: "1",
    title: "Training",
    start: new Date(2026, 7, 12, 15, 0),
    end: new Date(2026, 7, 12, 16, 0),
    color: "primary" as const,
  },
];

function mountMonth(props: Record<string, unknown> = {}) {
  const wrapper = mount(MonthView, {
    props: { events: EVENTS, modelValue: new Date(2026, 7, 12), ...props },
  });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

/** The event pill itself — `div.absolute.truncate` inside the week grid. */
const chip = (wrapper: VueWrapper) => {
  const el = wrapper.find("div.absolute.truncate");
  expect(el.exists()).toBe(true);
  expect(el.text()).toContain("Training");
  return el;
};

describe("eventColors — the accent is optional", () => {
  it("keeps the left rule by default", () => {
    expect(eventColorClass("primary")).toContain("border-l-2");
    expect(eventColorClassStrong("primary")).toContain("border-l-2");
  });

  it("drops it, and only it, when asked", () => {
    const off = eventColorClass("danger", false);
    expect(off).not.toContain("border-l");
    expect(off).toContain("bg-destructive/15");
    expect(off).toContain("text-destructive");
  });
});

describe("MonthView — event accent vs corner radius", () => {
  it("draws the left colour rule at a small radius", () => {
    const wrapper = mountMonth({ radius: "small" });
    expect(chip(wrapper)?.classes()).toContain("border-l-2");
  });

  it("drops it once the corners are too round to carry it", () => {
    // A one-sided border gets swept around the corner arc and renders as a
    // crescent hugging the side of the pill.
    const wrapper = mountMonth({ radius: "full" });
    const classes = chip(wrapper)?.classes() ?? [];
    expect(classes).not.toContain("border-l-2");
    expect(classes.join(" ")).toContain("bg-primary/20");
  });
});

describe("MonthView — maxHeight", () => {
  it("caps the root and scrolls the weeks", () => {
    const wrapper = mountMonth({ maxHeight: 420 });

    expect(wrapper.element.getAttribute("style")).toContain("max-height: 420px");
    const grid = wrapper.findAll("div").find((el) => el.classes().includes("overflow-y-auto"));
    expect(grid).toBeDefined();
  });

  it("accepts any CSS unit", () => {
    const wrapper = mountMonth({ maxHeight: "70vh" });
    expect(wrapper.element.getAttribute("style")).toContain("max-height: 70vh");
  });

  it("leaves the height alone when unset", () => {
    const wrapper = mountMonth();
    expect(wrapper.element.getAttribute("style") ?? "").not.toContain("max-height");
  });
});

describe("MonthView — the event tooltip keeps its surface", () => {
  /** Hovering an event chip opens the tooltip after useEventHover's delay. */
  async function hoverEvent(wrapper: VueWrapper) {
    await chip(wrapper).trigger("mouseenter", { clientX: 40, clientY: 60 });
    vi.advanceTimersByTime(400);
    await wrapper.vm.$nextTick();
  }

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders the built-in card when no slot is provided", async () => {
    const wrapper = mountMonth();
    await hoverEvent(wrapper);

    const tooltip = document.querySelector<HTMLElement>("body > div.fixed");
    expect(tooltip).not.toBeNull();
    expect(tooltip!.innerHTML).toContain("bg-foreground");
    expect(tooltip!.textContent).toContain("Training");
  });

  it("wraps a custom slot in a surface instead of leaving it bare", async () => {
    const wrapper = mount(MonthView, {
      props: { events: EVENTS, modelValue: new Date(2026, 7, 12) },
      slots: {
        "event-tooltip": '<span class="my-content">{{ params.event.title }}</span>',
      },
    });
    mounted.push(wrapper as VueWrapper);
    await hoverEvent(wrapper);

    const custom = document.querySelector(".my-content");
    expect(custom).not.toBeNull();
    // Without the wrapper the content sat directly on the positioned box, with
    // no background, radius, shadow or padding — text floating over the grid.
    const surface = custom!.parentElement!;
    expect(surface.className).toContain("bg-popover");
    expect(surface.className).toContain("shadow-lg");
    expect(surface.className).toContain("px-3");
  });
});
