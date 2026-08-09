import { afterEach } from "vitest";

// jsdom does not implement matchMedia. The library's useColorMode composable
// calls it at module init via PopoverPanel.vue, so component tests crash
// without this stub.
if (typeof window !== "undefined" && !window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

// jsdom implements no layout, so Element.scrollIntoView does not exist.
// Components that keep an active option in view call it on open.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Vue Teleport leaves panels in <body> when components use <Transition> and
// jsdom can't run leave animations to completion. Reset between tests so
// `document.querySelector` always finds the panel from the current test.
afterEach(() => {
  document.body.innerHTML = "";
});
