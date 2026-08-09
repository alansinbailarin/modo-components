import { describe, it, expect, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import PhoneInput from "../../../src/components/forms/PhoneInput.vue";

let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
});

/** Opens the country dropdown the way a user does: clicking the flag. */
async function openCountryList() {
  const wrapper = mount(PhoneInput, {
    props: { modelValue: "", country: "MX", ariaLabel: "Phone" },
    attachTo: document.body,
  });
  mounted.push(wrapper as VueWrapper);

  await wrapper.find("button").trigger("click");
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
}

const searchField = () =>
  document.querySelector<HTMLInputElement>('.modo-popover input[type="text"]');
const numberField = () =>
  document.querySelector<HTMLInputElement>('input[type="tel"]');

describe("PhoneInput — Tab out of the country search", () => {
  it("focuses the search field when the dropdown opens", async () => {
    await openCountryList();
    expect(searchField()).not.toBeNull();
    expect(document.activeElement).toBe(searchField());
  });

  it("moves focus to the number input", async () => {
    const wrapper = await openCountryList();

    // The panel is teleported to <body>, so the browser's own Tab order walks
    // past the field entirely instead of reaching the number input.
    searchField()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(numberField());
    expect(document.querySelector(".modo-popover")).toBeNull();
  });

  it("returns focus to the flag trigger on Shift+Tab", async () => {
    const wrapper = await openCountryList();

    searchField()!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true }),
    );
    await wrapper.vm.$nextTick();

    expect(document.activeElement).toBe(wrapper.find("button").element);
    expect(document.querySelector(".modo-popover")).toBeNull();
  });
});
