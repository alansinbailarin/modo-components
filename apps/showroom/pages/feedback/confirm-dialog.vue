<script setup lang="ts">
import { ref, computed } from "vue";
import { Button, Typography, useConfirm, useToast } from "mood-ui";
import { useI18n } from "vue-i18n";
import ComponentDoc from "~/components/ComponentDoc.vue";
import CodePreview from "~/components/CodePreview.vue";

import ComponentPreview from "~/components/ComponentPreview.vue";




import type { PropDoc, EmitDoc, SlotDoc } from "~/types/component-doc";
import A11yDoc from "~/components/A11yDoc.vue";
import type {
  A11yKeyboardRow,
  A11yAriaRow,
} from "~/components/A11yDoc.vue";
import TbPills from "~/components/toolbar/TbPills.vue";
import TbSep from "~/components/toolbar/TbSep.vue";

const { t } = useI18n();


// ── A11y data ─────────────────────────────────────────────────────────────────
const a11yKeyboard = computed<A11yKeyboardRow[]>(() => [
  { keys: ["Tab"], action: t("pages.feedback.confirmDialog.a11y.kbTab") },
  {
    keys: ["Shift+Tab"],
    action: t("pages.feedback.confirmDialog.a11y.kbShiftTab"),
  },
  { keys: ["Escape"], action: t("pages.feedback.confirmDialog.a11y.kbEsc") },
]);

const a11yAria = computed<A11yAriaRow[]>(() => [
  {
    attribute: "role",
    value: '"dialog"',
    desc: t("pages.feedback.confirmDialog.a11y.ariaDialog"),
  },
  {
    attribute: "aria-modal",
    value: "true",
    desc: t("pages.feedback.confirmDialog.a11y.ariaModal"),
  },
  {
    attribute: "aria-labelledby",
    value: "id",
    desc: t("pages.feedback.confirmDialog.a11y.ariaLabelledBy"),
  },
]);

const a11yFocus = computed<string[]>(() => [
  t("pages.feedback.confirmDialog.a11y.focusTrap"),
  t("pages.feedback.confirmDialog.a11y.focusReturn"),
]);

type Tone = "default" | "primary" | "danger";
type Size = "xsmall" | "small" | "medium" | "large";

const { confirm } = useConfirm();
const toast = useToast();

const pgTone = ref<Tone>("primary");
const pgSize = ref<Size>("small");
const lastResult = ref<string>("—");

function resetPlayground() {
  pgTone.value = "primary";
  pgSize.value = "small";
  lastResult.value = "—";
}

async function runPlayground() {
  const ok = await confirm({
    title: t("pages.feedback.confirmDialog.playground.title"),
    description: t("pages.feedback.confirmDialog.playground.description"),
    confirmLabel: t("pages.feedback.confirmDialog.playground.confirmLabel"),
    cancelLabel: t("pages.feedback.confirmDialog.playground.cancelLabel"),
    color: pgTone.value,
    size: pgSize.value,
  });
  lastResult.value = ok
    ? t("pages.feedback.confirmDialog.playground.confirmed")
    : t("pages.feedback.confirmDialog.playground.cancelled");
}

const overviewCode = computed(() => {
  const parts: string[] = [
    `title: 'Continue with the action?'`,
    `description: '...'`,
  ];
  if (pgTone.value !== "primary") parts.push(`color: '${pgTone.value}'`);
  if (pgSize.value !== "small") parts.push(`size: '${pgSize.value}'`);
  return `<!-- Mount once near the root -->
<ConfirmDialog />

// From any component:
import { useConfirm } from 'mood-ui';
const { confirm } = useConfirm();
const ok = await confirm({
  ${parts.join(",\n  ")},
});`;
});

const basicCode = `import { useConfirm } from 'mood-ui';
const { confirm } = useConfirm();

async function ask() {
  const ok = await confirm('Confirm action?');
  if (ok) console.log('Confirmed');
}`;

const dangerCode = `import { useConfirm } from 'mood-ui';
const { confirm } = useConfirm();
const ok = await confirm({
  title: 'Delete item?',
  description: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  cancelLabel: 'Cancel',
  color: 'danger',
});`;

const asyncCode = `import { useConfirm, useToast } from 'mood-ui';
const { confirm } = useConfirm();
const toast = useToast();

async function publish() {
  const ok = await confirm({
    title: 'Publish now?',
    description: 'The content will be visible to all users.',
    confirmLabel: 'Publish',
    color: 'primary',
  });
  if (!ok) return;
  await api.publish();
  toast.success('Published');
}`;

const customCode = `import { useConfirm } from 'mood-ui';
const { confirm } = useConfirm();

await confirm({
  title: 'Log out',
  description: 'You will need to sign in again to access.',
  confirmLabel: 'Log out',
  cancelLabel: 'Stay',
  color: 'warning',
  hideCancel: false,
});`;

async function runBasic() {
  const ok = await confirm("Confirm action?");
  toast.info(ok ? "Confirmed" : "Cancelled");
}

async function runDanger() {
  const ok = await confirm({
    title: "Delete item?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    color: "danger",
  });
  if (ok) toast.success("Deleted");
  else toast.info("Cancelled");
}

async function runAsync() {
  const ok = await confirm({
    title: "Publish now?",
    description: "The content will be visible to all users.",
    confirmLabel: "Publish",
    color: "primary",
  });
  if (!ok) return;
  toast.info("Publishing…");
  await new Promise((r) => setTimeout(r, 800));
  toast.success("Published");
}

async function runCustom() {
  const ok = await confirm({
    title: "Log out",
    description: "You will need to sign in again to access.",
    confirmLabel: "Log out",
    cancelLabel: "Stay",
    color: "warning",
  });
  toast.info(ok ? "Logged out" : "Stayed");
}

const typesCode = `export type ConfirmColor = 'default' | 'primary' | 'danger' | 'warning' | 'success';

export interface ConfirmInput {
  title?: string;
  description?: string;
  icon?: Component;
  hideIcon?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  color?: ConfirmColor;
  size?: ModalSize;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  hideCancel?: boolean;
  dismissable?: boolean;
  autoFocusConfirm?: boolean;
}

export interface ConfirmDialog {
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
}`;

const propsList = computed<PropDoc[]>(() => [
  {
    name: "radius",
    type: "'none' | 'small' | 'medium' | 'large' | 'full'",
    description: t("pages.feedback.confirmDialog.props.radius"),
  },
]);

const emitsList: EmitDoc[] = [];
const slotsList: SlotDoc[] = [];
</script>

<template>
  <!-- The host is mounted once in app.vue. Mounting a second one here made a
       single confirm() render two stacked dialogs (and left the page's scroll
       locked), which is exactly what this page tells people not to do. -->
  <ComponentDoc
    :title="t('pages.feedback.confirmDialog.title')"
    category="Feedback"
    import-path="import { ConfirmDialog, useConfirm } from 'mood-ui'"
    :description="t('pages.feedback.confirmDialog.description')"
    :props-list="propsList"
    :emits-list="emitsList"
    :slots-list="slotsList"
  >
    <template #overview>
      <ComponentPreview
        :code="overviewCode"
        min-height="220px"
        lang="vue"
        @reset="resetPlayground"
      >
        <template #controls>
          <TbPills
            :label="t('pages.feedback.confirmDialog.controls.tone')"
            :options="[
              { value: 'default' },
              { value: 'primary' },
              { value: 'danger' },
            ]"
            v-model="pgTone"
          />
          <TbSep />
          <TbPills
            :label="t('pages.feedback.confirmDialog.controls.size')"
            :options="[
              { value: 'xsmall' },
              { value: 'small' },
              { value: 'medium' },
              { value: 'large' },
            ]"
            v-model="pgSize"
          />
        </template>

        <Button
          :color="pgTone === 'default' ? 'default' : pgTone"
          @click="runPlayground"
        >
          {{ t("pages.feedback.confirmDialog.playground.launch") }}
        </Button>
        <span class="text-sm text-muted-foreground">
          {{ t("pages.feedback.confirmDialog.playground.lastResult") }}
          {{ lastResult }}
        </span>
      </ComponentPreview>
    </template>

    <template #examples>
      <ComponentPreview
        :title="t('pages.feedback.confirmDialog.examples.basic.title')"
        :description="t('pages.feedback.confirmDialog.examples.basic.desc')"
        :code="basicCode"
        min-height="180px"
      >
        <Button @click="runBasic">{{
          t("pages.feedback.confirmDialog.examples.basic.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.confirmDialog.examples.danger.title')"
        :description="t('pages.feedback.confirmDialog.examples.danger.desc')"
        :code="dangerCode"
        min-height="180px"
      >
        <Button color="danger" @click="runDanger">{{
          t("pages.feedback.confirmDialog.examples.danger.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.confirmDialog.examples.async.title')"
        :description="t('pages.feedback.confirmDialog.examples.async.desc')"
        :code="asyncCode"
        min-height="180px"
      >
        <Button color="primary" @click="runAsync">{{
          t("pages.feedback.confirmDialog.examples.async.cta")
        }}</Button>
      </ComponentPreview>

      <ComponentPreview
        :title="t('pages.feedback.confirmDialog.examples.custom.title')"
        :description="t('pages.feedback.confirmDialog.examples.custom.desc')"
        :code="customCode"
        min-height="180px"
      >
        <Button color="warning" @click="runCustom">{{
          t("pages.feedback.confirmDialog.examples.custom.cta")
        }}</Button>
      </ComponentPreview>
    </template>

    <template #a11y>
      <A11yDoc
        :keyboard-rows="a11yKeyboard"
        :aria-rows="a11yAria"
        :focus-notes="a11yFocus"
      />
    </template>

    <template #extra>
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.feedback.confirmDialog.types.title") }}
      </Typography>
      <Typography variant="body" size="small" class="text-muted-foreground">
        {{ t("pages.feedback.confirmDialog.types.desc") }}
      </Typography>
      <CodePreview :code="typesCode" lang="ts" code-only />
    </template>
  </ComponentDoc>
</template>
