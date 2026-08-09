import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import Button from "../../../src/components/forms/Button.vue";

const IconStub = defineComponent({
  setup() {
    return () => h("svg", { "data-testid": "icon" });
  },
});

/**
 * Sizing comes from the shared size tokens: every control is anchored to the
 * same height (`h-10` at medium), a text button adds horizontal padding
 * (`padX`) and an icon-only button is squared off with `aspect-square` instead.
 * The distinction that matters is that a button carrying text — from the
 * `label` prop or the default slot — must never be squared like an icon-only.
 */
describe("Button sizeClasses — icon+text vs icon-only", () => {
  it("applies text-button padding when icon and slot text are both present", () => {
    const wrapper = mount(Button, {
      props: { icon: IconStub },
      slots: { default: "Continue" },
    });
    const button = wrapper.find("button");
    expect(button.classes()).toContain("h-10");
    expect(button.classes()).toContain("px-3.5");
    expect(button.classes()).not.toContain("aspect-square");
  });

  it("squares the button when an icon is present but there is no label and no slot", () => {
    const wrapper = mount(Button, {
      props: { icon: IconStub, ariaLabel: "Submit" },
    });
    const button = wrapper.find("button");
    expect(button.classes()).toContain("h-10");
    expect(button.classes()).toContain("aspect-square");
    expect(button.classes()).not.toContain("px-3.5");
  });

  it("applies text-button padding when label prop and icon are both present", () => {
    const wrapper = mount(Button, {
      props: { label: "Continue", icon: IconStub },
    });
    const button = wrapper.find("button");
    expect(button.classes()).toContain("px-3.5");
    expect(button.classes()).not.toContain("aspect-square");
  });

  it("keeps the control height across sizes", () => {
    const small = mount(Button, { props: { label: "Go", size: "small" } });
    const large = mount(Button, { props: { label: "Go", size: "large" } });
    expect(small.find("button").classes()).toContain("h-9");
    expect(large.find("button").classes()).toContain("h-12");
  });
});
