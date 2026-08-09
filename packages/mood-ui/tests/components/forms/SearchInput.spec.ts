import { describe, it, expect, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import SearchInput from "../../../src/components/forms/SearchInput.vue";

const ITEMS = [
  { id: "1", label: "Kate Moore" },
  { id: "2", label: "John Smith" },
  { id: "3", label: "Sara Johnson" },
];

/**
 * The results panel is teleported to <body>, so assertions read the document
 * rather than the wrapper. Focusing the input is what opens the dropdown.
 *
 * Wrappers are unmounted before the shared `afterEach` wipes <body>; leaving
 * them mounted makes Vue patch into detached nodes and throw.
 */
let mounted: VueWrapper[] = [];

afterEach(() => {
  mounted.forEach((w) => w.unmount());
  mounted = [];
});

async function openWith(props: Record<string, unknown>) {
  const wrapper = mount(SearchInput, {
    props: { items: ITEMS, ...props },
  });
  mounted.push(wrapper as VueWrapper);
  await wrapper.find("input").trigger("focus");
  await wrapper.vm.$nextTick();
  return wrapper;
}

describe("SearchInput — the field stays usable while loading", () => {
  it("does not disable the input while results are loading", async () => {
    const wrapper = mount(SearchInput, {
      props: { items: ITEMS, loading: true, ariaLabel: "Search" },
    });
    mounted.push(wrapper as VueWrapper);

    // A disabled element cannot hold focus: the browser blurs it, the popover
    // closes and the keystroke that triggered the request is dropped.
    expect(wrapper.find("input").element.disabled).toBe(false);
  });

  it("still honours an explicit disabled prop", () => {
    const wrapper = mount(SearchInput, {
      props: { items: ITEMS, disabled: true, ariaLabel: "Search" },
    });
    mounted.push(wrapper as VueWrapper);

    expect(wrapper.find("input").element.disabled).toBe(true);
  });

  it("opens the results dropdown on focus even if a request is in flight", async () => {
    const wrapper = await openWith({ loading: true });

    expect(document.querySelector(".modo-popover")).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(3);
  });
});

describe("SearchInput — results while loading", () => {
  it("keeps the current results rendered when loading flips on", async () => {
    const wrapper = await openWith({ loading: false });
    expect(document.querySelectorAll('[role="option"]').length).toBe(3);

    // A new keystroke puts the host in a loading state while the previous
    // results are still the best thing to show.
    await wrapper.setProps({ loading: true });

    const options = document.querySelectorAll('[role="option"]');
    expect(options.length).toBe(3);
    expect(document.querySelector('[role="listbox"]')?.getAttribute("aria-busy")).toBe("true");
  });

  it("drops aria-busy once loading finishes", async () => {
    const wrapper = await openWith({ loading: true });
    await wrapper.setProps({ loading: false });

    expect(document.querySelector('[role="listbox"]')?.getAttribute("aria-busy")).toBeNull();
  });

  it("shows the loader only when there is nothing to display yet", async () => {
    const wrapper = await openWith({ items: [], loading: true });

    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.querySelector(".modo-search-results")?.textContent?.trim()).not.toBe("");
  });

  it("keeps the dropdown open across a loading round-trip", async () => {
    const wrapper = await openWith({ loading: false });
    expect(document.querySelector(".modo-popover")).not.toBeNull();

    await wrapper.setProps({ loading: true });
    expect(document.querySelector(".modo-popover")).not.toBeNull();

    await wrapper.setProps({ loading: false, items: [{ id: "9", label: "Result" }] });
    expect(document.querySelector(".modo-popover")).not.toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(1);
  });

  it("falls back to the empty state when a search genuinely returns nothing", async () => {
    const wrapper = await openWith({ loading: true, emptyText: "No matches" });
    await wrapper.setProps({ loading: false, items: [] });

    expect(document.querySelector('[role="listbox"]')).toBeNull();
    expect(document.body.textContent).toContain("No matches");
  });
});
