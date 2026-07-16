// apps/showroom/seo/keywords.ts
// Language-neutral SEO strategy per component page. User-facing copy lives in
// i18n (the `seo` block); this file holds target keywords, schema type, and
// related-component routes that drive internal linking + structured data.

export interface ComponentSeo {
  /** canonical (locale-less) route, e.g. "/calendar/scheduler" */
  route: string;
  /** i18n base key for this page's copy, e.g. "pages.dataDisplay.scheduler" */
  i18nKey: string;
  /** schema.org entity type for the page's primary thing */
  schemaType: "SoftwareSourceCode" | "TechArticle";
  /** target keywords, PRIMARY FIRST (primary is used as the schema name) */
  keywords: string[];
  /** locale-less routes of 2-4 related component pages for internal linking */
  related: string[];
}

export const COMPONENT_SEO: Record<string, ComponentSeo> = {
  "/data-display/chart": {
    route: "/data-display/chart",
    i18nKey: "pages.dataDisplay.chart",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Chart component", "Vue charts", "Vue SVG charts", "Recharts alternative Vue"],
    related: ["/data-display/stat", "/data-display/card", "/data-display/table"],
  },
  "/forms/menu-button": {
    route: "/forms/menu-button",
    i18nKey: "pages.forms.menuButton",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue MenuButton", "Vue dropdown button", "Vue split button", "Vue menu button"],
    related: ["/forms/button", "/forms/button-group", "/forms/segmented"],
  },
  "/data-display/table": {
    route: "/data-display/table",
    i18nKey: "pages.dataDisplay.table",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Data Table", "Vue table component", "AG Grid alternative Vue"],
    // NOTE: the original plan listed "/data-display/table-pagination" and
    // "/forms/pagination" — neither page exists (the build crawler 404s on
    // them). Pagination actually lives at /navigation/pagination; the other
    // two are real data-display siblings.
    related: ["/navigation/pagination", "/data-display/avatar", "/data-display/typography"],
  },
  "/calendar/scheduler": {
    route: "/calendar/scheduler",
    i18nKey: "pages.dataDisplay.scheduler",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Scheduler", "Vue resource scheduler", "FullCalendar alternative Vue"],
    related: ["/calendar", "/calendar/week-view", "/calendar/day-view"],
  },
  "/calendar": {
    route: "/calendar",
    i18nKey: "pages.dataDisplay.calendar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Calendar", "Vue calendar component", "Vue event calendar"],
    related: ["/calendar/month-view", "/calendar/week-view", "/calendar/scheduler"],
  },
  "/calendar/month-view": {
    route: "/calendar/month-view",
    i18nKey: "pages.dataDisplay.monthView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue month view", "Vue calendar month component"],
    related: ["/calendar", "/calendar/week-view", "/calendar/agenda-view"],
  },
  "/calendar/week-view": {
    route: "/calendar/week-view",
    i18nKey: "pages.dataDisplay.weekView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue week view", "Vue weekly calendar component"],
    related: ["/calendar", "/calendar/day-view", "/calendar/scheduler"],
  },
  "/calendar/day-view": {
    route: "/calendar/day-view",
    i18nKey: "pages.dataDisplay.dayView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue day view", "Vue daily calendar component"],
    related: ["/calendar", "/calendar/week-view", "/calendar/agenda-view"],
  },
  "/calendar/agenda-view": {
    route: "/calendar/agenda-view",
    i18nKey: "pages.dataDisplay.agendaView",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue agenda view", "Vue agenda list calendar"],
    related: ["/calendar", "/calendar/month-view", "/calendar/scheduler"],
  },
  "/forms/date-field": {
    route: "/forms/date-field",
    i18nKey: "pages.forms.dateField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue date picker", "Vue date field component", "Nuxt date picker"],
    related: ["/forms/date-range-field", "/forms/date-time-field", "/calendar"],
  },
  "/forms/date-time-field": {
    route: "/forms/date-time-field",
    i18nKey: "pages.forms.dateTimeField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue datetime picker", "Vue date time field"],
    related: ["/forms/date-field", "/forms/date-range-field", "/calendar/scheduler"],
  },
  "/forms/date-range-field": {
    route: "/forms/date-range-field",
    i18nKey: "pages.forms.dateRangeField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue date range picker", "Vue date range field component", "Vue dual calendar"],
    related: ["/forms/date-field", "/forms/date-time-field", "/calendar"],
  },
  "/forms/button": {
    route: "/forms/button",
    i18nKey: "pages.forms.button",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Button", "Vue button component", "Vue link button"],
    related: ["/forms/button-group", "/forms/segmented", "/forms/input"],
  },
  "/forms/button-group": {
    route: "/forms/button-group",
    i18nKey: "pages.forms.buttonGroup",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Button Group", "Vue button group component", "Vue segmented buttons"],
    related: ["/forms/button", "/forms/segmented", "/forms/radio-group"],
  },
  "/forms/input": {
    route: "/forms/input",
    i18nKey: "pages.forms.input",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Input", "Vue text input component", "Vue form input"],
    related: ["/forms/textarea", "/forms/search-input", "/forms/password-input"],
  },
  "/forms/textarea": {
    route: "/forms/textarea",
    i18nKey: "pages.forms.textarea",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Textarea", "Vue textarea component", "Vue autoresize textarea"],
    related: ["/forms/input", "/forms/form-field", "/forms/tag-input"],
  },
  "/forms/password-input": {
    route: "/forms/password-input",
    i18nKey: "pages.forms.passwordInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Password Input", "Vue password field component", "Vue password strength meter"],
    related: ["/forms/input", "/forms/otp-input", "/forms/form-field"],
  },
  "/forms/number-input": {
    route: "/forms/number-input",
    i18nKey: "pages.forms.numberInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Number Input", "Vue number input component", "Vue numeric stepper"],
    related: ["/forms/input", "/forms/slider", "/forms/range-slider"],
  },
  "/forms/search-input": {
    route: "/forms/search-input",
    i18nKey: "pages.forms.searchInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Search Input", "Vue search input component", "Vue search bar"],
    related: ["/forms/input", "/forms/combobox", "/forms/select"],
  },
  "/forms/select": {
    route: "/forms/select",
    i18nKey: "pages.forms.select",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Select", "Vue select dropdown component", "Vue multiselect"],
    related: ["/forms/multi-select", "/forms/combobox", "/forms/input"],
  },
  "/forms/multi-select": {
    route: "/forms/multi-select",
    i18nKey: "pages.forms.multiSelect",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Multi Select", "Vue multiselect component", "Vue multiple select"],
    related: ["/forms/select", "/forms/combobox", "/forms/tag-input"],
  },
  "/forms/combobox": {
    route: "/forms/combobox",
    i18nKey: "pages.forms.combobox",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Combobox", "Vue combobox component", "Vue autocomplete"],
    related: ["/forms/select", "/forms/multi-select", "/forms/search-input"],
  },
  "/forms/checkbox": {
    route: "/forms/checkbox",
    i18nKey: "pages.forms.checkbox",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Checkbox", "Vue checkbox component", "Vue indeterminate checkbox"],
    related: ["/forms/radio", "/forms/switch", "/forms/radio-group"],
  },
  "/forms/radio": {
    route: "/forms/radio",
    i18nKey: "pages.forms.radio",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Radio", "Vue radio button component", "Vue radio input"],
    related: ["/forms/radio-group", "/forms/checkbox", "/forms/switch"],
  },
  "/forms/radio-group": {
    route: "/forms/radio-group",
    i18nKey: "pages.forms.radioGroup",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Radio Group", "Vue radio group component", "Vue radio buttons"],
    related: ["/forms/radio", "/forms/checkbox", "/forms/segmented"],
  },
  "/forms/switch": {
    route: "/forms/switch",
    i18nKey: "pages.forms.switch",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Switch", "Vue toggle switch component", "Vue on off toggle"],
    related: ["/forms/checkbox", "/forms/radio", "/forms/color-mode-switch"],
  },
  "/forms/slider": {
    route: "/forms/slider",
    i18nKey: "pages.forms.slider",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Slider", "Vue slider component", "Vue range input"],
    related: ["/forms/range-slider", "/forms/number-input", "/forms/rating"],
  },
  "/forms/range-slider": {
    route: "/forms/range-slider",
    i18nKey: "pages.forms.rangeSlider",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Range Slider", "Vue range slider component", "Vue dual thumb slider"],
    related: ["/forms/slider", "/forms/number-input", "/forms/input"],
  },
  "/forms/file-input": {
    route: "/forms/file-input",
    i18nKey: "pages.forms.fileInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue File Input", "Vue file upload component", "Vue drag and drop upload"],
    related: ["/forms/avatar-upload", "/forms/input", "/forms/form-field"],
  },
  "/forms/phone-input": {
    route: "/forms/phone-input",
    i18nKey: "pages.forms.phoneInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Phone Input", "Vue phone number input component", "Vue international phone field"],
    related: ["/forms/input", "/forms/select", "/forms/otp-input"],
  },
  "/forms/color-picker": {
    route: "/forms/color-picker",
    i18nKey: "pages.forms.colorPicker",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Color Picker", "Vue color picker component", "Vue hex color input"],
    related: ["/forms/input", "/forms/select", "/forms/color-mode-switch"],
  },
  "/forms/otp-input": {
    route: "/forms/otp-input",
    i18nKey: "pages.forms.otpInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue OTP Input", "Vue OTP input component", "Vue verification code input"],
    related: ["/forms/password-input", "/forms/input", "/forms/phone-input"],
  },
  "/forms/tag-input": {
    route: "/forms/tag-input",
    i18nKey: "pages.forms.tagInput",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Tag Input", "Vue tag input component", "Vue tags field"],
    related: ["/forms/multi-select", "/forms/combobox", "/forms/input"],
  },
  "/forms/rating": {
    route: "/forms/rating",
    i18nKey: "pages.forms.rating",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Rating", "Vue rating component", "Vue star rating"],
    related: ["/forms/slider", "/forms/radio-group", "/forms/segmented"],
  },
  "/forms/segmented": {
    route: "/forms/segmented",
    i18nKey: "pages.forms.segmented",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Segmented Control", "Vue segmented control component", "Vue pill selector"],
    related: ["/forms/radio-group", "/forms/button-group", "/forms/switch"],
  },
  "/forms/avatar-upload": {
    route: "/forms/avatar-upload",
    i18nKey: "pages.forms.avatarUpload",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Avatar Upload", "Vue avatar upload component", "Vue image crop upload"],
    related: ["/forms/file-input", "/data-display/avatar", "/data-display/avatar-group"],
  },
  "/forms/form-field": {
    route: "/forms/form-field",
    i18nKey: "pages.forms.formField",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Form Field", "Vue form field component", "Vue form label wrapper"],
    related: ["/forms/input", "/forms/textarea", "/forms/select"],
  },
  "/forms/color-mode-switch": {
    route: "/forms/color-mode-switch",
    i18nKey: "pages.forms.colorModeSwitch",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Color Mode Switch", "Vue dark mode toggle component", "Vue theme switcher"],
    related: ["/forms/switch", "/forms/segmented", "/forms/color-picker"],
  },

  // ── Feedback ──────────────────────────────────────────────────────────────
  "/feedback/modal": {
    route: "/feedback/modal",
    i18nKey: "pages.feedback.modal",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Modal", "Vue dialog component", "Vue modal popup"],
    related: ["/feedback/drawer", "/feedback/confirm-dialog", "/layout/popover-panel"],
  },
  "/feedback/drawer": {
    route: "/feedback/drawer",
    i18nKey: "pages.feedback.drawer",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Drawer", "Vue slide-out panel component", "Vue bottom sheet"],
    related: ["/feedback/modal", "/layout/sidebar", "/layout/popover-panel"],
  },
  "/feedback/confirm-dialog": {
    route: "/feedback/confirm-dialog",
    i18nKey: "pages.feedback.confirmDialog",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Confirm Dialog", "Vue confirmation dialog component", "Vue useConfirm"],
    related: ["/feedback/modal", "/feedback/toast", "/feedback/drawer"],
  },
  "/feedback/toast": {
    route: "/feedback/toast",
    i18nKey: "pages.feedback.toast",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Toast", "Vue notification component", "Vue toast container"],
    related: ["/feedback/toast-item", "/feedback/banner", "/feedback/confirm-dialog"],
  },
  "/feedback/toast-item": {
    route: "/feedback/toast-item",
    i18nKey: "pages.feedback.toastItem",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Toast", "Vue snackbar component", "Vue toast notification"],
    related: ["/feedback/toast", "/feedback/banner", "/feedback/tooltip"],
  },
  "/feedback/tooltip": {
    route: "/feedback/tooltip",
    i18nKey: "pages.feedback.tooltip",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Tooltip", "Vue tooltip component", "Vue hover hint"],
    related: ["/feedback/badge", "/layout/popover-panel", "/navigation/dropdown-menu"],
  },
  "/feedback/banner": {
    route: "/feedback/banner",
    i18nKey: "pages.feedback.banner",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Banner", "Vue alert banner component", "Vue notification bar"],
    related: ["/feedback/toast", "/feedback/badge", "/feedback/empty-state"],
  },
  "/feedback/badge": {
    route: "/feedback/badge",
    i18nKey: "pages.feedback.badge",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Badge", "Vue badge component", "Vue status label"],
    related: ["/feedback/chip", "/data-display/avatar", "/feedback/banner"],
  },
  "/feedback/chip": {
    route: "/feedback/chip",
    i18nKey: "pages.feedback.chip",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Chip", "Vue chip component", "Vue notification badge"],
    related: ["/feedback/badge", "/data-display/avatar", "/data-display/avatar-group"],
  },
  "/feedback/empty-state": {
    route: "/feedback/empty-state",
    i18nKey: "pages.feedback.emptyState",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Empty State", "Vue empty state component", "Vue no data placeholder"],
    related: ["/feedback/skeleton", "/feedback/loader", "/feedback/banner"],
  },
  "/feedback/loader": {
    route: "/feedback/loader",
    i18nKey: "pages.feedback.loader",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Loader", "Vue spinner component", "Vue loading indicator"],
    related: ["/feedback/skeleton", "/feedback/progress-bar", "/feedback/empty-state"],
  },
  "/feedback/progress-bar": {
    route: "/feedback/progress-bar",
    i18nKey: "pages.feedback.progressBar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Progress Bar", "Vue progress bar component", "Vue linear progress"],
    related: ["/feedback/loader", "/feedback/skeleton", "/navigation/stepper"],
  },
  "/feedback/skeleton": {
    route: "/feedback/skeleton",
    i18nKey: "pages.feedback.skeleton",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Skeleton", "Vue skeleton loader component", "Vue content placeholder"],
    related: ["/feedback/loader", "/feedback/empty-state", "/feedback/progress-bar"],
  },

  // ── Navigation ────────────────────────────────────────────────────────────
  "/navigation/tabs": {
    route: "/navigation/tabs",
    i18nKey: "pages.navigation.tabs",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Tabs", "Vue tabs component", "Vue tab panels"],
    related: ["/navigation/stepper", "/forms/segmented", "/layout/page-header"],
  },
  "/navigation/breadcrumbs": {
    route: "/navigation/breadcrumbs",
    i18nKey: "pages.navigation.breadcrumbs",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Breadcrumbs", "Vue breadcrumbs component", "Vue breadcrumb navigation"],
    related: ["/navigation/pagination", "/layout/page-header", "/navigation/tabs"],
  },
  "/navigation/dropdown-menu": {
    route: "/navigation/dropdown-menu",
    i18nKey: "pages.navigation.dropdownMenu",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Dropdown Menu", "Vue dropdown menu component", "Vue context menu"],
    related: ["/layout/popover-panel", "/feedback/tooltip", "/navigation/switcher"],
  },
  "/navigation/pagination": {
    route: "/navigation/pagination",
    i18nKey: "pages.navigation.pagination",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Pagination", "Vue pagination component", "Vue paginator"],
    related: ["/data-display/table", "/navigation/breadcrumbs", "/navigation/stepper"],
  },
  "/navigation/stepper": {
    route: "/navigation/stepper",
    i18nKey: "pages.navigation.stepper",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Stepper", "Vue stepper component", "Vue wizard steps"],
    related: ["/navigation/tabs", "/feedback/progress-bar", "/navigation/pagination"],
  },
  "/navigation/switcher": {
    route: "/navigation/switcher",
    i18nKey: "pages.navigation.switcher",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Switcher", "Vue context switcher component", "Vue workspace switcher"],
    related: ["/navigation/dropdown-menu", "/data-display/avatar", "/layout/sidebar"],
  },

  // ── Layout ────────────────────────────────────────────────────────────────
  "/layout/app-shell": {
    route: "/layout/app-shell",
    i18nKey: "pages.layout.appShell",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue App Shell", "Vue dashboard layout component", "Vue admin layout"],
    related: ["/layout/sidebar", "/layout/topbar", "/layout/page-header"],
  },
  "/layout/sidebar": {
    route: "/layout/sidebar",
    i18nKey: "pages.layout.sidebar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Sidebar", "Vue sidebar navigation component", "Vue side menu"],
    related: ["/layout/app-shell", "/layout/topbar", "/navigation/switcher"],
  },
  "/layout/topbar": {
    route: "/layout/topbar",
    i18nKey: "pages.layout.topbar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Topbar", "Vue app top bar component", "Vue navbar"],
    related: ["/layout/app-shell", "/layout/sidebar", "/layout/page-header"],
  },
  "/layout/page-header": {
    route: "/layout/page-header",
    i18nKey: "pages.layout.pageHeader",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Page Header", "Vue page header component", "Vue page title bar"],
    related: ["/layout/topbar", "/navigation/breadcrumbs", "/navigation/tabs"],
  },
  "/layout/container": {
    route: "/layout/container",
    i18nKey: "pages.layout.container",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Container", "Vue layout container component", "Vue max-width wrapper"],
    related: ["/layout/stack", "/layout/canvas", "/layout/divider"],
  },
  "/layout/stack": {
    route: "/layout/stack",
    i18nKey: "pages.layout.stack",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Stack", "Vue flex stack component", "Vue layout primitive"],
    related: ["/layout/hstack", "/layout/vstack", "/layout/container"],
  },
  "/layout/hstack": {
    route: "/layout/hstack",
    i18nKey: "pages.layout.hstack",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue HStack", "Vue horizontal stack component", "Vue flex row"],
    related: ["/layout/stack", "/layout/vstack", "/layout/container"],
  },
  "/layout/vstack": {
    route: "/layout/vstack",
    i18nKey: "pages.layout.vstack",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue VStack", "Vue vertical stack component", "Vue flex column"],
    related: ["/layout/stack", "/layout/hstack", "/layout/container"],
  },
  "/layout/divider": {
    route: "/layout/divider",
    i18nKey: "pages.layout.divider",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Divider", "Vue divider component", "Vue separator line"],
    related: ["/layout/stack", "/layout/container", "/data-display/typography"],
  },
  "/layout/canvas": {
    route: "/layout/canvas",
    i18nKey: "pages.layout.canvas",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Canvas", "Vue pattern background component", "Vue workspace surface"],
    related: ["/layout/container", "/layout/stack", "/data-display/card"],
  },
  "/layout/popover-panel": {
    route: "/layout/popover-panel",
    i18nKey: "pages.layout.popoverPanel",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Popover", "Vue popover panel component", "Vue floating panel"],
    related: ["/navigation/dropdown-menu", "/feedback/tooltip", "/feedback/modal"],
  },

  // ── Data display ──────────────────────────────────────────────────────────
  "/data-display/avatar": {
    route: "/data-display/avatar",
    i18nKey: "pages.dataDisplay.avatar",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Avatar", "Vue avatar component", "Vue user avatar"],
    related: ["/data-display/avatar-group", "/feedback/chip", "/feedback/badge"],
  },
  "/data-display/avatar-group": {
    route: "/data-display/avatar-group",
    i18nKey: "pages.dataDisplay.avatarGroup",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Avatar Group", "Vue avatar group component", "Vue stacked avatars"],
    related: ["/data-display/avatar", "/feedback/chip", "/forms/avatar-upload"],
  },
  "/data-display/accordion": {
    route: "/data-display/accordion",
    i18nKey: "pages.dataDisplay.accordion",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Accordion", "Vue accordion component", "Vue collapse panel"],
    related: ["/navigation/tabs", "/data-display/card", "/data-display/timeline"],
  },
  "/data-display/card": {
    route: "/data-display/card",
    i18nKey: "pages.dataDisplay.card",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Card", "Vue card component", "Vue content card"],
    related: ["/data-display/stat", "/layout/container", "/data-display/accordion"],
  },
  "/data-display/stat": {
    route: "/data-display/stat",
    i18nKey: "pages.dataDisplay.stat",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Stat", "Vue KPI card component", "Vue metric card"],
    related: ["/data-display/card", "/feedback/progress-bar", "/data-display/typography"],
  },
  "/data-display/timeline": {
    route: "/data-display/timeline",
    i18nKey: "pages.dataDisplay.timeline",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Timeline", "Vue timeline component", "Vue activity feed"],
    related: ["/navigation/stepper", "/data-display/accordion", "/data-display/card"],
  },
  "/data-display/typography": {
    route: "/data-display/typography",
    i18nKey: "pages.dataDisplay.typography",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Typography", "Vue typography component", "Vue text styles"],
    related: ["/data-display/code", "/data-display/kbd", "/layout/divider"],
  },
  "/data-display/code": {
    route: "/data-display/code",
    i18nKey: "pages.dataDisplay.code",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Code", "Vue inline code component", "Vue code snippet"],
    related: ["/data-display/kbd", "/data-display/typography", "/data-display/card"],
  },
  "/data-display/kbd": {
    route: "/data-display/kbd",
    i18nKey: "pages.dataDisplay.kbd",
    schemaType: "SoftwareSourceCode",
    keywords: ["Vue Kbd", "Vue keyboard key component", "Vue shortcut key"],
    related: ["/data-display/code", "/data-display/typography", "/navigation/dropdown-menu"],
  },

  // ── Composables ───────────────────────────────────────────────────────────
  // APIs, not components → schemaType "TechArticle" (routed through
  // defineArticle in usePageSeo). related links cross-reference sibling
  // composables and the component each one pairs with.
  "/composables/use-auto-scroll": {
    route: "/composables/use-auto-scroll",
    i18nKey: "pages.composables.useAutoScroll",
    schemaType: "TechArticle",
    keywords: ["useAutoScroll Vue", "Vue drag scroll composable"],
    related: ["/composables/use-calendar", "/composables/use-local-storage"],
  },
  "/composables/use-calendar": {
    route: "/composables/use-calendar",
    i18nKey: "pages.composables.useCalendar",
    schemaType: "TechArticle",
    keywords: ["useCalendar Vue", "Vue calendar composable"],
    related: ["/calendar", "/forms/date-field", "/composables/use-locale"],
  },
  "/composables/use-color-mode": {
    route: "/composables/use-color-mode",
    i18nKey: "pages.composables.useColorMode",
    schemaType: "TechArticle",
    keywords: ["useColorMode Vue", "Vue dark mode composable"],
    related: ["/forms/color-mode-switch", "/composables/use-modo-config", "/composables/use-locale"],
  },
  "/composables/use-confirm": {
    route: "/composables/use-confirm",
    i18nKey: "pages.composables.useConfirm",
    schemaType: "TechArticle",
    keywords: ["useConfirm Vue", "Vue confirm dialog composable"],
    related: ["/feedback/confirm-dialog", "/composables/use-toast", "/feedback/modal"],
  },
  "/composables/use-local-storage": {
    route: "/composables/use-local-storage",
    i18nKey: "pages.composables.useLocalStorage",
    schemaType: "TechArticle",
    keywords: ["useLocalStorage Vue", "Vue localStorage composable"],
    related: ["/composables/use-color-mode", "/composables/use-locale", "/composables/use-modo-config"],
  },
  "/composables/use-locale": {
    route: "/composables/use-locale",
    i18nKey: "pages.composables.useLocale",
    schemaType: "TechArticle",
    keywords: ["useLocale Vue", "Vue locale switcher composable"],
    related: ["/composables/use-modo-config", "/composables/use-color-mode", "/composables/use-local-storage"],
  },
  "/composables/use-modo-config": {
    route: "/composables/use-modo-config",
    i18nKey: "pages.composables.useModoConfig",
    schemaType: "TechArticle",
    keywords: ["useModoConfig", "Vue theme config composable"],
    related: ["/composables/use-color-mode", "/composables/use-locale", "/composables/use-calendar"],
  },
  "/composables/use-toast": {
    route: "/composables/use-toast",
    i18nKey: "pages.composables.useToast",
    schemaType: "TechArticle",
    keywords: ["useToast Vue", "Vue toast composable"],
    related: ["/feedback/toast", "/composables/use-confirm", "/feedback/banner"],
  },
};

/** Strip a leading locale prefix (e.g. "/es/forms/x" → "/forms/x"). */
export function canonicalRoute(path: string): string {
  const stripped = path.replace(/^\/(es)(?=\/|$)/, "");
  const noTrailing = stripped.replace(/\/+$/, "");
  return noTrailing === "" ? "/" : noTrailing;
}

export function getComponentSeo(path: string): ComponentSeo | undefined {
  return COMPONENT_SEO[canonicalRoute(path)];
}
