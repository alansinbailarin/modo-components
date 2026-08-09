import { describe, it, expect, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import Combobox from "../../../src/components/forms/Combobox.vue";

const OPTIONS = [
  { value: "ar", label: "Argentina" },
  { value: "br", label: "Brazil" },
  { value: "cl", label: "Chile" },
];

/**
 * The options panel is teleported to <body>, so assertions read the document
 * rather than the wrapper. Focusing the input is what opens the dropdown.
 */
let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
});

async function openByFocus() {
  const wrapper = mount(Combobox, {
    props: { options: OPTIONS, ariaLabel: "Country" },
  });
  mounted.push(wrapper as VueWrapper);
  await wrapper.find("input").trigger("focus");
  await wrapper.vm.$nextTick();
  return wrapper;
}

describe("Combobox — the dropdown survives the scroll that focus itself causes", () => {
  it("opens on focus", async () => {
    await openByFocus();
    expect(document.querySelector(".modo-popover")).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(3);
  });

  it("stays open when the document scrolls right after focus", async () => {
    const wrapper = await openByFocus();
    expect(document.querySelector(".modo-popover")).not.toBeNull();

    // On mobile, focusing the input raises the virtual keyboard and the browser
    // scrolls the field into view — a scroll the user never asked for, arriving
    // milliseconds after the panel opened. Closing on it means the dropdown is
    // gone before it is ever seen.
    document.dispatchEvent(new Event("scroll"));
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".modo-popover")).not.toBeNull();
  });

  it("still closes on Escape", async () => {
    const wrapper = await openByFocus();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".modo-popover")).toBeNull();
  });

  it("still closes on a pointerdown outside the field", async () => {
    const wrapper = await openByFocus();

    const outside = document.createElement("button");
    document.body.appendChild(outside);
    outside.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await wrapper.vm.$nextTick();

    expect(document.querySelector(".modo-popover")).toBeNull();
    outside.remove();
  });
});
