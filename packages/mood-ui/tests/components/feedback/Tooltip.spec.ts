import { describe, it, expect, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Tooltip from "../../../src/components/feedback/Tooltip.vue";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
  vi.useRealTimers();
});

function mountTooltip(props: Record<string, unknown> = {}) {
  const wrapper = mount(Tooltip, {
    props: { content: "Details", ...props },
    slots: { default: "<button>trigger</button>" },
  });
  mounted.push(wrapper as VueWrapper);
  return wrapper;
}

const panel = () => document.querySelector('[role="tooltip"]');

describe("Tooltip — dismissal on touch devices", () => {
  it("closes when the page is scrolled by a touch drag", async () => {
    const wrapper = mountTooltip({ trigger: "click" });
    await wrapper.find("span").trigger("click");
    expect(panel()).not.toBeNull();

    // Nothing else ends a tooltip on touch: there is no cursor to move away,
    // so repositioning on scroll left it floating over the page.
    document.dispatchEvent(new Event("touchmove"));
    await wrapper.vm.$nextTick();

    expect(panel()).toBeNull();
    expect(wrapper.emitted("hide")).toHaveLength(1);
  });

  it("closes on a touch drag that started on the trigger itself", async () => {
    const wrapper = mountTooltip({ trigger: "click" });
    await wrapper.find("span").trigger("click");
    expect(panel()).not.toBeNull();

    // Touch events stay targeted at the element the finger landed on, so this
    // gesture never reaches the document listener.
    await wrapper.find("span").trigger("touchmove");

    expect(panel()).toBeNull();
  });

  it("cancels a pending open when the tap turns into a scroll", async () => {
    vi.useFakeTimers();
    const wrapper = mountTooltip({ openDelay: 200 });

    await wrapper.find("span").trigger("mouseenter");
    await wrapper.find("span").trigger("touchmove");
    vi.advanceTimersByTime(500);
    await wrapper.vm.$nextTick();

    expect(panel()).toBeNull();
    expect(wrapper.emitted("show")).toBeUndefined();
  });

  it("closes on an outside tap even when the trigger is not hover-based", async () => {
    const wrapper = mountTooltip({ trigger: "click" });
    await wrapper.find("span").trigger("click");
    expect(panel()).not.toBeNull();

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    outside.dispatchEvent(new Event("touchstart", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(panel()).toBeNull();
    outside.remove();
  });

  it("ignores a tap on the trigger itself", async () => {
    const wrapper = mountTooltip({ trigger: "click" });
    await wrapper.find("span").trigger("click");

    wrapper.find("span").element.dispatchEvent(
      new Event("touchstart", { bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(panel()).not.toBeNull();
  });
});
