import { describe, it, expect, afterEach } from "vitest";
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
