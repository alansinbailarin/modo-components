/**
 * Navigation manifest for the docs site.
 *
 * Derived from `docs/migration/hash-route-map.json` so the sidebar order
 * exactly mirrors what the legacy showroom presented at `mood-ui.com/#…`.
 * Each entry carries the Nuxt route — `<NuxtLink :to="entry.route">` is
 * the source of truth, no hash routing here.
 */

export interface NavEntry {
  id: string;
  label: string;
  route: string;
  badge?: "New" | "Beta";
}

export interface NavCategory {
  id: string;
  title: string;
  entries: NavEntry[];
  /**
   * When true, this category is excluded from the left sidebar but
   * still appears in the top header pill nav. Use for top-level
   * shortcuts that already have a dedicated tab (e.g. Theme Studio).
   */
  hiddenInSidebar?: boolean;
}

export const navManifest: NavCategory[] = [
  {
    id: "getting-started",
    title: "Getting started",
    entries: [{ id: "welcome", label: "Welcome", route: "/" }],
  },
  {
    id: "docs",
    title: "Docs",
    entries: [
      { id: "introduction", label: "Introduction", route: "/docs/introduction" },
      { id: "installation", label: "Installation", route: "/docs/installation" },
      { id: "nuxt-setup", label: "Nuxt setup", route: "/docs/nuxt-setup" },
      { id: "theming", label: "Theming", route: "/docs/theming" },
      { id: "i18n", label: "i18n", route: "/docs/i18n" },
      { id: "accessibility", label: "Accessibility", route: "/docs/accessibility" },
      { id: "llms", label: "LLMs & AI", route: "/docs/llms", badge: "New" },
      { id: "changelog", label: "Changelog", route: "/docs/changelog" },
    ],
  },
  {
    id: "templates",
    title: "Templates",
    entries: [{ id: "templates", label: "Templates", route: "/templates" }],
  },
  {
    id: "theme-studio",
    title: "Theme Studio",
    hiddenInSidebar: true,
    entries: [
      { id: "theme-studio", label: "Theme Studio", route: "/theme-studio", badge: "Beta" },
    ],
  },
  {
    id: "forms",
    title: "Forms",
    entries: [
      { id: "button", label: "Button", route: "/forms/button" },
      { id: "button-group", label: "ButtonGroup", route: "/forms/button-group" },
      { id: "menu-button", label: "MenuButton", route: "/forms/menu-button", badge: "New" },
      { id: "form-field", label: "FormField", route: "/forms/form-field", badge: "New" },
      { id: "input", label: "Input", route: "/forms/input" },
      { id: "textarea", label: "Textarea", route: "/forms/textarea" },
      { id: "password-input", label: "PasswordInput", route: "/forms/password-input" },
      { id: "number-input", label: "NumberInput", route: "/forms/number-input" },
      { id: "search-input", label: "SearchInput", route: "/forms/search-input" },
      { id: "select", label: "Select", route: "/forms/select" },
      { id: "multi-select", label: "MultiSelect", route: "/forms/multi-select" },
      { id: "combobox", label: "Combobox", route: "/forms/combobox" },
      { id: "checkbox", label: "Checkbox", route: "/forms/checkbox" },
      { id: "radio", label: "Radio", route: "/forms/radio" },
      { id: "radio-group", label: "Radio & RadioGroup", route: "/forms/radio-group" },
      { id: "switch", label: "Switch", route: "/forms/switch" },
      { id: "date-field", label: "DateField", route: "/forms/date-field" },
      { id: "date-time-field", label: "DateTimeField", route: "/forms/date-time-field" },
      { id: "date-range-field", label: "DateRangeField", route: "/forms/date-range-field" },
      { id: "file-input", label: "FileInput", route: "/forms/file-input" },
      { id: "slider", label: "Slider", route: "/forms/slider" },
      { id: "range-slider", label: "RangeSlider", route: "/forms/range-slider" },
      { id: "segmented", label: "Segmented", route: "/forms/segmented", badge: "New" },
      { id: "rating", label: "Rating", route: "/forms/rating", badge: "New" },
      { id: "color-picker", label: "ColorPicker", route: "/forms/color-picker", badge: "New" },
      { id: "tag-input", label: "TagInput", route: "/forms/tag-input", badge: "New" },
      { id: "color-mode-switch", label: "ColorModeSwitch", route: "/forms/color-mode-switch", badge: "New" },
      { id: "avatar-upload", label: "AvatarUpload", route: "/forms/avatar-upload", badge: "New" },
      { id: "phone-input", label: "PhoneInput", route: "/forms/phone-input", badge: "New" },
      { id: "otp-input", label: "OTPInput", route: "/forms/otp-input", badge: "New" },
    ],
  },
  {
    id: "feedback",
    title: "Feedback",
    entries: [
      { id: "badge", label: "Badge", route: "/feedback/badge" },
      { id: "banner", label: "Banner", route: "/feedback/banner" },
      { id: "chip", label: "Chip", route: "/feedback/chip" },
      { id: "drawer", label: "Drawer", route: "/feedback/drawer" },
      { id: "loader", label: "Loader", route: "/feedback/loader" },
      { id: "modal", label: "Modal", route: "/feedback/modal" },
      { id: "skeleton", label: "Skeleton", route: "/feedback/skeleton" },
      { id: "tooltip", label: "Tooltip", route: "/feedback/tooltip" },
      { id: "toast", label: "Toast", route: "/feedback/toast", badge: "New" },
      { id: "toast-item", label: "Toast (item)", route: "/feedback/toast-item" },
      { id: "confirm-dialog", label: "ConfirmDialog", route: "/feedback/confirm-dialog", badge: "New" },
      { id: "empty-state", label: "EmptyState", route: "/feedback/empty-state", badge: "New" },
      { id: "progress-bar", label: "ProgressBar", route: "/feedback/progress-bar", badge: "New" },
    ],
  },
  {
    id: "data-display",
    title: "Data display",
    entries: [
      { id: "card", label: "Card", route: "/data-display/card" },
      { id: "typography", label: "Typography", route: "/data-display/typography" },
      { id: "avatar", label: "Avatar", route: "/data-display/avatar" },
      { id: "avatar-group", label: "AvatarGroup", route: "/data-display/avatar-group" },
      { id: "accordion", label: "Accordion", route: "/data-display/accordion", badge: "New" },
      { id: "kbd", label: "Kbd", route: "/data-display/kbd", badge: "New" },
      { id: "code", label: "Code", route: "/data-display/code", badge: "New" },
      { id: "stat", label: "Stat", route: "/data-display/stat", badge: "New" },
      { id: "chart", label: "Chart", route: "/data-display/chart", badge: "New" },
      { id: "timeline", label: "Timeline", route: "/data-display/timeline", badge: "New" },
      { id: "table", label: "Table", route: "/data-display/table" },
    ],
  },
  {
    id: "calendar",
    title: "Calendar",
    entries: [
      { id: "calendar", label: "Calendar", route: "/calendar" },
      { id: "month-view", label: "MonthView", route: "/calendar/month-view" },
      { id: "week-view", label: "WeekView", route: "/calendar/week-view" },
      { id: "day-view", label: "DayView", route: "/calendar/day-view" },
      { id: "agenda-view", label: "AgendaView", route: "/calendar/agenda-view" },
      { id: "scheduler", label: "Scheduler", route: "/calendar/scheduler" },
    ],
  },
  {
    id: "date-picker",
    title: "Date picker",
    entries: [
      { id: "date-time-picker", label: "DateTimePicker", route: "/date-picker/date-time-picker" },
      { id: "date-range-picker", label: "DateRangePicker", route: "/date-picker/date-range-picker" },
    ],
  },
  {
    id: "layout",
    title: "Layout",
    entries: [
      { id: "app-shell", label: "AppShell", route: "/layout/app-shell" },
      { id: "canvas", label: "Canvas", route: "/layout/canvas" },
      { id: "sidebar", label: "Sidebar", route: "/layout/sidebar" },
      { id: "topbar", label: "Topbar", route: "/layout/topbar" },
      { id: "page-header", label: "PageHeader", route: "/layout/page-header" },
      { id: "container", label: "Container", route: "/layout/container" },
      { id: "divider", label: "Divider", route: "/layout/divider", badge: "New" },
      { id: "stack", label: "Stack", route: "/layout/stack", badge: "New" },
      { id: "hstack", label: "HStack", route: "/layout/hstack" },
      { id: "vstack", label: "VStack", route: "/layout/vstack" },
      { id: "popover-panel", label: "PopoverPanel", route: "/layout/popover-panel" },
    ],
  },
  {
    id: "navigation",
    title: "Navigation",
    entries: [
      { id: "tabs", label: "Tabs", route: "/navigation/tabs" },
      { id: "breadcrumbs", label: "Breadcrumbs", route: "/navigation/breadcrumbs", badge: "New" },
      { id: "dropdown-menu", label: "DropdownMenu", route: "/navigation/dropdown-menu", badge: "New" },
      { id: "pagination", label: "Pagination", route: "/navigation/pagination", badge: "New" },
      { id: "stepper", label: "Stepper", route: "/navigation/stepper", badge: "New" },
      { id: "switcher", label: "Switcher", route: "/navigation/switcher", badge: "New" },
    ],
  },
  {
    id: "composables",
    title: "Composables",
    entries: [
      { id: "use-color-mode", label: "useColorMode", route: "/composables/use-color-mode" },
      { id: "use-toast", label: "useToast", route: "/composables/use-toast" },
      { id: "use-confirm", label: "useConfirm", route: "/composables/use-confirm" },
      { id: "use-locale", label: "useLocale", route: "/composables/use-locale" },
      { id: "use-modo-config", label: "useModoConfig", route: "/composables/use-modo-config" },
      { id: "use-calendar", label: "useCalendar", route: "/composables/use-calendar" },
      { id: "use-auto-scroll", label: "useAutoScroll", route: "/composables/use-auto-scroll" },
      { id: "use-local-storage", label: "useLocalStorage", route: "/composables/use-local-storage" },
    ],
  },
  {
    id: "utilities",
    title: "Utilities",
    entries: [{ id: "event-colors", label: "eventColors", route: "/utilities/event-colors" }],
  },
];

/** Flat list of every entry — useful for the command palette. */
export const allEntries: NavEntry[] = navManifest.flatMap((c) => c.entries);

/** Categories that group sidebar sections under the "Components" header tab. */
export const COMPONENT_CATEGORY_IDS = [
  "forms",
  "feedback",
  "data-display",
  "calendar",
  "date-picker",
  "layout",
  "navigation",
  "composables",
  "utilities",
] as const;
