/**
 * Public entry point of the `mood-ui` package.
 *
 * This module re-exports every component, composable and type that is
 * intended to be consumed by external apps. Internal helpers stay
 * unexported on purpose — anything not listed here is private.
 */

// Global stylesheet — CSS custom properties, Tailwind base + utilities.
// Vite picks this up and outputs it to dist/mood-ui.css.
import "./style.css";

/* ------------------------------------------------------------------ */
/*  Provider + config                                                  */
/* ------------------------------------------------------------------ */
export { default as ModoProvider } from "./components/ModoProvider.vue";
export {
  MODO_CONFIG,
  defaultModoConfig,
  type ModoColor,
  type ModoRadius,
  type ModoSize,
  type ModoTheme,
  type ModoHalo,
  type ModoConfig,
  type ModoAiConfig,
  type ModoSurfaces,
} from "./config/ModoConfig";
export {
  surfacesToCssVars,
  darkSurfaces,
  type DarkSurfacePreset,
} from "./config/surfaces";
export {
  MODO_LOCALE,
  defaultLocale,
  mergeLocale,
  type ModoLocale,
  type PartialLocale,
} from "./config/ModoLocale";
export { locales, type LocaleKey } from "./config/locales";
export {
  defaultPalettes,
  paletteFromHex,
  mergePalettes,
  palettesToCssVars,
  semanticTokensFromPalettes,
  type ModoPalette,
  type ModoPalettes,
  type PaletteShade,
} from "./config/palettes";

/* ------------------------------------------------------------------ */
/*  Composables                                                         */
/* ------------------------------------------------------------------ */
export {
  useModoConfig,
  useResolvedColor,
  useResolvedRadius,
  useResolvedSize,
  useSizeTokens,
  useResolvedTheme,
  useResolvedHalo,
  useModoLocale,
  useLocaleString,
} from "./composables/useModoConfig";
export { SIZE_TOKENS, normalizeSize, type SizeTokenSet } from "./config/sizes";
export {
  useColorMode,
  configureColorMode,
  resolveColorMode,
  type ColorMode,
  type ColorModeOptions,
} from "./composables/useColorMode";
export { useToast, useToastQueue } from "./composables/useToast";
export { useConfirm, useConfirmQueue } from "./composables/useConfirm";
export { useLocale } from "./composables/useLocale";
export { useLocalStorage } from "./composables/useLocalStorage";
export {
  useAutoScroll,
  type UseAutoScrollInput,
} from "./composables/useAutoScroll";
export {
  usePopover,
  type UsePopoverOptions,
  type PopoverPlacement,
  type PopoverPosition,
} from "./composables/usePopover";
export {
  useCalendar,
  isSameDay,
  startOfDay,
  type CalendarDay,
  type UseCalendarOptions,
} from "./composables/useCalendar";
export {
  eventColorClass,
  eventColorClassStrong,
  hexToRgba,
  type EventColor,
} from "./composables/eventColors";

/* ------------------------------------------------------------------ */
/*  Forms                                                               */
/* ------------------------------------------------------------------ */
export { default as Button } from "./components/forms/Button.vue";
export { default as ButtonGroup } from "./components/forms/ButtonGroup.vue";
export { default as MenuButton } from "./components/forms/MenuButton.vue";
export { default as FormField } from "./components/forms/FormField.vue";
export { default as Input } from "./components/forms/Input.vue";
export { default as Textarea } from "./components/forms/Textarea.vue";
export { default as PasswordInput } from "./components/forms/PasswordInput.vue";
export { default as NumberInput } from "./components/forms/NumberInput.vue";
export { default as SearchInput } from "./components/forms/SearchInput.vue";
export { default as Select } from "./components/forms/Select.vue";
export { default as MultiSelect } from "./components/forms/MultiSelect.vue";
export { default as Combobox } from "./components/forms/Combobox.vue";
export { default as Checkbox } from "./components/forms/Checkbox.vue";
export { default as Radio } from "./components/forms/Radio.vue";
export { default as RadioGroup } from "./components/forms/RadioGroup.vue";
export { default as Switch } from "./components/forms/Switch.vue";
export { default as Slider } from "./components/forms/Slider.vue";
export { default as RangeSlider } from "./components/forms/RangeSlider.vue";
export { default as FileInput } from "./components/forms/FileInput.vue";
export { default as DateField } from "./components/forms/DateField.vue";
export { default as DateRangeField } from "./components/forms/DateRangeField.vue";
export { default as DateTimeField } from "./components/forms/DateTimeField.vue";
export { default as Segmented } from "./components/forms/Segmented.vue";
export { default as Rating } from "./components/forms/Rating.vue";
export { default as ColorPicker } from "./components/forms/ColorPicker.vue";
export { default as TagInput } from "./components/forms/TagInput.vue";
export { default as PhoneInput } from "./components/forms/PhoneInput.vue";
export type { PhoneInput as PhoneInputProps } from "./interfaces/forms/PhoneInput.interface";
export { default as OTPInput } from "./components/forms/OTPInput.vue";
export type { OTPInput as OTPInputProps } from "./interfaces/forms/OTPInput.interface";
export { default as ColorModeSwitch } from "./components/forms/ColorModeSwitch.vue";
export { default as AvatarUpload } from "./components/forms/AvatarUpload.vue";
export { default as AvatarCropper } from "./components/forms/AvatarCropper.vue";
export {
  createAvatarProvider,
  type CreateAvatarProviderOptions,
} from "./utils/createAvatarProvider";

/* ------------------------------------------------------------------ */
/*  Feedback                                                            */
/* ------------------------------------------------------------------ */
export { default as Badge } from "./components/feedback/Badge.vue";
export { default as Banner } from "./components/feedback/Banner.vue";
export { default as Chip } from "./components/feedback/Chip.vue";
export { default as Drawer } from "./components/feedback/Drawer.vue";
export { default as Loader } from "./components/feedback/Loader.vue";
export { default as Modal } from "./components/feedback/Modal.vue";
export { default as Skeleton } from "./components/feedback/Skeleton.vue";
export { default as Tooltip } from "./components/feedback/Tooltip.vue";
export { default as Toast } from "./components/feedback/Toast.vue";
export { default as ToastContainer } from "./components/feedback/ToastContainer.vue";
export { default as ConfirmDialog } from "./components/feedback/ConfirmDialog.vue";
export { default as EmptyState } from "./components/feedback/EmptyState.vue";
export { default as ProgressBar } from "./components/feedback/ProgressBar.vue";

/* ------------------------------------------------------------------ */
/*  Layout                                                              */
/* ------------------------------------------------------------------ */
export { default as AppShell } from "./components/layout/AppShell.vue";
export { default as Canvas } from "./components/layout/Canvas.vue";
export { default as Container } from "./components/layout/Container.vue";
export { default as Divider } from "./components/layout/Divider.vue";
export { default as Stack } from "./components/layout/Stack.vue";
export { default as HStack } from "./components/layout/HStack.vue";
export { default as VStack } from "./components/layout/VStack.vue";
export { default as PageHeader } from "./components/layout/PageHeader.vue";
export { default as PopoverPanel } from "./components/layout/PopoverPanel.vue";
export { default as Sidebar } from "./components/layout/Sidebar.vue";
export { default as SidebarRow } from "./components/layout/SidebarRow.vue";
export { default as SidebarRowContent } from "./components/layout/SidebarRowContent.vue";
export { default as Topbar } from "./components/layout/Topbar.vue";

/* ------------------------------------------------------------------ */
/*  Navigation                                                          */
/* ------------------------------------------------------------------ */
export { default as Tabs } from "./components/navigation/Tabs.vue";
export { default as Breadcrumbs } from "./components/navigation/Breadcrumbs.vue";
export { default as DropdownMenu } from "./components/navigation/DropdownMenu.vue";
export { default as Pagination } from "./components/navigation/Pagination.vue";
export { default as Stepper } from "./components/navigation/Stepper.vue";
export { default as Switcher } from "./components/navigation/Switcher.vue";

/* ------------------------------------------------------------------ */
/*  Data display                                                        */
/* ------------------------------------------------------------------ */
export { default as Card } from "./components/data-display/Card.vue";
export { default as Typography } from "./components/data-display/Typography.vue";
export { default as Avatar } from "./components/data-display/avatar/Avatar.vue";
export { default as AvatarGroup } from "./components/data-display/avatar/AvatarGroup.vue";
export { default as Kbd } from "./components/data-display/Kbd.vue";
export { default as Code } from "./components/data-display/Code.vue";
export { default as Accordion } from "./components/data-display/Accordion.vue";
export { default as Stat } from "./components/data-display/Stat.vue";
export { default as Chart } from "./components/data-display/Chart.vue";
export { default as Timeline } from "./components/data-display/Timeline.vue";

/* ------------------------------------------------------------------ */
/*  Calendar / Scheduler                                                */
/* ------------------------------------------------------------------ */
export { default as Calendar } from "./components/data-display/calendar/Calendar.vue";
export { default as MonthView } from "./components/data-display/calendar/MonthView.vue";
export { default as WeekView } from "./components/data-display/calendar/WeekView.vue";
export { default as DayView } from "./components/data-display/calendar/DayView.vue";
export { default as AgendaView } from "./components/data-display/calendar/AgendaView.vue";
export { default as Scheduler } from "./components/data-display/calendar/Scheduler.vue";
export { default as CalendarHeader } from "./components/data-display/calendar/CalendarHeader.vue";
export { default as CalendarEventTooltip } from "./components/data-display/calendar/CalendarEventTooltip.vue";

/* ------------------------------------------------------------------ */
/*  Date pickers                                                        */
/* ------------------------------------------------------------------ */
export { default as DateRangePicker } from "./components/data-display/date-picker/DateRangePicker.vue";
export { default as DateTimePicker } from "./components/data-display/date-picker/DateTimePicker.vue";

/* ------------------------------------------------------------------ */
/*  Table                                                               */
/* ------------------------------------------------------------------ */
export { default as Table } from "./components/data-display/table/Table.vue";
export { default as TableColumn } from "./components/data-display/table/TableColumn.vue";
export { default as TablePagination } from "./components/data-display/table/TablePagination.vue";

/* ------------------------------------------------------------------ */
/*  Public types — re-exports per category                              */
/* ------------------------------------------------------------------ */
export type * from "./interfaces/forms/Button.interface";
export type * from "./interfaces/forms/FormField.interface";
export type * from "./interfaces/forms/ButtonGroup.interface";
export type * from "./interfaces/forms/MenuButton.interface";
export type * from "./interfaces/forms/Input.interface";
export type * from "./interfaces/forms/Textarea.interface";
export type * from "./interfaces/forms/PasswordInput.interface";
export type * from "./interfaces/forms/NumberInput.interface";
export type * from "./interfaces/forms/SearchInput.interface";
export type * from "./interfaces/forms/Select.interface";
export type * from "./interfaces/forms/Combobox.interface";
export type * from "./interfaces/forms/Checkbox.interface";
export type * from "./interfaces/forms/Radio.interface";
export type * from "./interfaces/forms/Switch.interface";
export type * from "./interfaces/forms/Slider.interface";
export type * from "./interfaces/forms/RangeSlider.interface";
export type * from "./interfaces/forms/FileInput.interface";
export type * from "./interfaces/forms/DateField.interface";
export type * from "./interfaces/forms/DateRangeField.interface";
export type * from "./interfaces/forms/DateTimeField.interface";
export type * from "./interfaces/forms/Segmented.interface";
export type * from "./interfaces/forms/Rating.interface";
export type * from "./interfaces/forms/ColorPicker.interface";
export type * from "./interfaces/forms/TagInput.interface";
export type * from "./interfaces/forms/ColorModeSwitch.interface";
export type * from "./interfaces/forms/AvatarUpload.interface";

export type * from "./interfaces/feedback/Badge.interface";
export type * from "./interfaces/feedback/Banner.interface";
export type * from "./interfaces/feedback/Chip.interface";
export type * from "./interfaces/feedback/Drawer.interface";
export type * from "./interfaces/feedback/Loader.interface";
export type * from "./interfaces/feedback/Modal.interface";
export type * from "./interfaces/feedback/Skeleton.interface";
export type * from "./interfaces/feedback/Tooltip.interface";
export type * from "./interfaces/feedback/Toast.interface";
export type * from "./interfaces/feedback/ConfirmDialog.interface";
export type * from "./interfaces/feedback/EmptyState.interface";
export type * from "./interfaces/feedback/ProgressBar.interface";

export type * from "./interfaces/layout/AppShell.interface";
export type * from "./interfaces/layout/Canvas.interface";
export type * from "./interfaces/layout/Container.interface";
export type * from "./interfaces/layout/Divider.interface";
export type * from "./interfaces/layout/Stack.interface";
export type * from "./interfaces/layout/PageHeader.interface";
export type * from "./interfaces/layout/Sidebar.interface";
export type * from "./interfaces/layout/Topbar.interface";

export type * from "./interfaces/navigation/Tabs.interface";
export type * from "./interfaces/navigation/Breadcrumbs.interface";
export type * from "./interfaces/navigation/DropdownMenu.interface";
export type * from "./interfaces/navigation/Pagination.interface";
export type * from "./interfaces/navigation/Stepper.interface";
export type * from "./interfaces/navigation/Switcher.interface";

export type * from "./interfaces/data-display/Card.interface";
export type * from "./interfaces/data-display/Typography.interface";
export type * from "./interfaces/data-display/Kbd.interface";
export type * from "./interfaces/data-display/Code.interface";
export type * from "./interfaces/data-display/Accordion.interface";
export type * from "./interfaces/data-display/Stat.interface";
export type * from "./interfaces/data-display/Chart.interface";
export type * from "./interfaces/data-display/Timeline.interface";
export type * from "./interfaces/data-display/avatar/Avatar.interface";
export type * from "./interfaces/data-display/avatar/AvatarGroup.interface";
export type * from "./interfaces/data-display/calendar/Calendar.interface";
export type * from "./interfaces/data-display/calendar/AgendaView.interface";
export type * from "./interfaces/data-display/calendar/MonthView.interface";
export type * from "./interfaces/data-display/calendar/WeekView.interface";
export type * from "./interfaces/data-display/calendar/DayView.interface";
export type * from "./interfaces/data-display/calendar/Scheduler.interface";
export type * from "./interfaces/data-display/date-picker/DateRangePicker.interface";
export type * from "./interfaces/data-display/date-picker/DateTimePicker.interface";
export type * from "./interfaces/data-display/table/Table.interface";
export type * from "./interfaces/data-display/table/TableColumn.interface";
export type * from "./interfaces/data-display/table/TablePagination.interface";
