<script setup lang="ts">
import { ref, computed } from "vue";
import { MenuButton, Button, ButtonGroup } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  TrashIcon,
  UserIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  ArrowUpTrayIcon,
} from "@heroicons/vue/24/outline";
import ComponentDoc from "~/components/ComponentDoc.vue";
import ComponentPreview from "~/components/ComponentPreview.vue";
import type { PropDoc, EmitDoc } from "~/types/component-doc";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbToggle from "~/components/toolbar/TbToggle.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();

// ── Menu data ─────────────────────────────────────────────────────────────────
const items = [
  { id: "edit", label: "Edit", icon: PencilSquareIcon },
  { id: "duplicate", label: "Duplicate", icon: DocumentDuplicateIcon },
  { id: "archive", label: "Archive", icon: ArchiveBoxIcon },
];
const exportItems = [
  { id: "csv", label: "Export as CSV" },
  { id: "xlsx", label: "Export as Excel" },
  { id: "pdf", label: "Export as PDF" },
];
const richItems = [
  { type: "header", label: "Account" },
  { id: "profile", label: "Profile", icon: UserIcon, shortcut: "⌘P" },
  { id: "settings", label: "Settings", icon: Cog6ToothIcon, shortcut: "⌘," },
  { type: "divider" },
  { type: "header", label: "Danger zone" },
  { id: "delete", label: "Delete project", description: "This cannot be undone", icon: TrashIcon, danger: true },
];

// ── Overview playground ───────────────────────────────────────────────────────
const pgVariant = ref<"normal" | "outline" | "ghost" | "text">("outline");
const pgSize = ref<"small" | "medium" | "large">("medium");
const pgChevron = ref(true);

function resetPlayground() {
  pgVariant.value = "outline";
  pgSize.value = "medium";
  pgChevron.value = true;
}

const overviewCode = computed(() => {
  const a: string[] = ['label="Actions"', ':items="items"'];
  if (pgVariant.value !== "outline") a.push(`variant="${pgVariant.value}"`);
  if (pgSize.value !== "medium") a.push(`size="${pgSize.value}"`);
  if (!pgChevron.value) a.push(':chevron="false"');
  return `<MenuButton ${a.join(" ")} />`;
});

// ── Example code ──────────────────────────────────────────────────────────────
const basicCode = `<script setup lang="ts">
import { MenuButton } from 'mood-ui';
import { PencilSquareIcon, DocumentDuplicateIcon, ArchiveBoxIcon } from '@heroicons/vue/24/outline';

const items = [
  { id: 'edit', label: 'Edit', icon: PencilSquareIcon },
  { id: 'duplicate', label: 'Duplicate', icon: DocumentDuplicateIcon },
  { id: 'archive', label: 'Archive', icon: ArchiveBoxIcon },
];
<\/script>

<template>
  <MenuButton label="Actions" :items="items" @select="(i) => console.log(i.id)" />
</template>`;

const groupCode = `<ButtonGroup variant="outline">
  <Button :icon="ArrowUpTrayIcon">Export</Button>
  <MenuButton :items="exportItems" aria-label="More export options" />
</ButtonGroup>`;

const iconCode = `<MenuButton
  :items="items"
  :icon="EllipsisVerticalIcon"
  :chevron="false"
  variant="ghost"
  aria-label="Options"
/>`;

const richCode = `const items = [
  { type: 'header', label: 'Account' },
  { id: 'profile',  label: 'Profile',  icon: UserIcon,      shortcut: '⌘P' },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, shortcut: '⌘,' },
  { type: 'divider' },
  { type: 'header', label: 'Danger zone' },
  { id: 'delete', label: 'Delete project', description: 'This cannot be undone',
    icon: TrashIcon, danger: true },
];

<MenuButton label="Account" :items="items" />`;

// ── API ───────────────────────────────────────────────────────────────────────
const propsList = computed<PropDoc[]>(() => [
  { name: "items", type: "DropdownMenuEntry[]", required: true, description: "Menu entries — the same model as DropdownMenu (items / dividers / headers)." },
  { name: "label", type: "string", description: "Visible trigger label. Omit for an icon-only trigger." },
  { name: "icon", type: "Component", description: "Leading trigger icon." },
  { name: "chevron", type: "boolean", default: "true", description: "Show the trailing chevron." },
  { name: "variant", type: "'normal' | 'outline' | 'ghost' | 'text'", default: "'outline'", description: "Trigger variant. Inside a ButtonGroup it inherits the group." },
  { name: "color", type: "'default' | 'primary' | 'danger' | 'success' | 'warning'", description: "Trigger color." },
  { name: "size", type: "ModoSize", description: "Trigger size. Inherits the group / provider." },
  { name: "radius", type: "'none' | 'small' | 'medium' | 'large' | 'full'", description: "Corner radius." },
  { name: "disabled", type: "boolean", description: "Disable the trigger." },
  { name: "placement", type: "PopoverPlacement", default: "'bottom-start'", description: "Menu placement relative to the trigger." },
  { name: "minWidth", type: "string", default: "'12rem'", description: "Min width of the menu panel." },
  { name: "closeOnSelect", type: "boolean", default: "true", description: "Close the menu after a selection." },
  { name: "ariaLabel", type: "string", description: "Accessible name — required when the trigger is icon-only." },
]);

const emitsList = computed<EmitDoc[]>(() => [
  { name: "select", payload: "DropdownMenuItem", description: "Fired when a menu item is chosen." },
  { name: "update:open", payload: "boolean", description: "Fired when the menu opens or closes." },
]);

const variantPills = [{ value: "normal" }, { value: "outline" }, { value: "ghost" }, { value: "text" }];
const sizePills = [{ value: "small" }, { value: "medium" }, { value: "large" }];
</script>

<template>
  <ComponentDoc
    :title="t('pages.forms.menuButton.title')"
    category="Forms"
    import-path="import { MenuButton } from 'mood-ui'"
    :description="t('pages.forms.menuButton.description')"
    :props-list="propsList"
    :emits-list="emitsList"
  >
    <template #overview>
      <ComponentPreview :code="overviewCode" min-height="200px" @reset="resetPlayground">
        <template #controls>
          <TbPills :label="t('pages.forms.menuButton.controls.variant')" :options="variantPills" v-model="pgVariant" />
          <TbSep />
          <TbPills :label="t('pages.forms.menuButton.controls.size')" :options="sizePills" v-model="pgSize" />
          <TbSep />
          <TbToggle :label="t('pages.forms.menuButton.controls.chevron')" v-model="pgChevron" />
        </template>

        <MenuButton label="Actions" :items="items" :variant="pgVariant" :size="pgSize" :chevron="pgChevron" />
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.forms.menuButton.examples.basic.title')"
        :description="t('pages.forms.menuButton.examples.basic.desc')"
        :code="basicCode"
      >
        <MenuButton label="Actions" :items="items" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.menuButton.examples.group.title')"
        :description="t('pages.forms.menuButton.examples.group.desc')"
        :code="groupCode"
      >
        <ButtonGroup variant="outline">
          <Button :icon="ArrowUpTrayIcon">Export</Button>
          <MenuButton :items="exportItems" aria-label="More export options" />
        </ButtonGroup>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.menuButton.examples.icon.title')"
        :description="t('pages.forms.menuButton.examples.icon.desc')"
        :code="iconCode"
      >
        <MenuButton :items="items" :icon="EllipsisVerticalIcon" :chevron="false" variant="ghost" aria-label="Options" />
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.forms.menuButton.examples.rich.title')"
        :description="t('pages.forms.menuButton.examples.rich.desc')"
        :code="richCode"
      >
        <MenuButton label="Account" :items="richItems" />
      </ComponentPreview>
    </template>
  </ComponentDoc>
</template>
