<script setup lang="ts">
import { inject, onMounted, watch } from "vue";
import { Banner, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  DocumentTextIcon,
  BookOpenIcon,
  SparklesIcon,
  CommandLineIcon,
} from "@heroicons/vue/24/outline";
import CodePreview from "~/components/CodePreview.vue";
import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const { t, locale } = useI18n();

useSeoMeta({
  title: () => t("pages.docs.llms.title"),
  description: () => t("pages.docs.llms.subtitle"),
  ogTitle: () => `${t("pages.docs.llms.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.llms.subtitle"),
});

defineOgImage("Default", {
  title: t("pages.docs.llms.title"),
  description: t("pages.docs.llms.subtitle"),
  category: "Docs",
});

const toc = inject(DOC_TOC_KEY, null);
function registerToc() {
  if (!toc) return;
  toc.register({ id: "files", label: t("pages.docs.llms.filesTitle"), level: 1 });
  toc.register({ id: "how", label: t("pages.docs.llms.howTitle"), level: 1 });
  toc.register({ id: "sync", label: t("pages.docs.llms.syncTitle"), level: 1 });
}
onMounted(registerToc);
watch(locale, registerToc);

const promptSnippet = `Use mood-ui for the UI. Follow the component API in
https://mood-ui.com/llms-full.txt exactly — import every component
from "mood-ui" and use only the props documented there.`;

const curlSnippet = `# Short index — components + composables
curl https://mood-ui.com/llms.txt

# Full reference — props, types, setup
curl https://mood-ui.com/llms-full.txt`;
</script>

<template>
  <div class="flex flex-col gap-10">
    <!-- Header -->
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.llms.overline") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("pages.docs.llms.title") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.llms.subtitle") }}
      </Typography>
      <div class="flex flex-wrap gap-2 pt-1">
        <a
          href="/llms.txt"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors"
        >
          <DocumentTextIcon class="size-4 text-primary" />
          {{ t("pages.docs.llms.openShort") }}
        </a>
        <a
          href="/llms-full.txt"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted/40 hover:border-primary/40 transition-colors"
        >
          <BookOpenIcon class="size-4 text-success" />
          {{ t("pages.docs.llms.openFull") }}
        </a>
      </div>
    </header>

    <!-- Two files -->
    <section id="files" v-reveal class="flex flex-col gap-4 scroll-mt-20">
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.docs.llms.filesTitle") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-4">
        <Card variant="outlined" padding="large" class="flex flex-col gap-3">
          <Stack direction="row" spacing="small" class="items-center">
            <div class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <DocumentTextIcon class="size-5" />
            </div>
            <code class="text-sm font-mono text-foreground">{{ t("pages.docs.llms.shortName") }}</code>
          </Stack>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.llms.shortDesc") }}
          </Typography>
        </Card>
        <Card variant="outlined" padding="large" class="flex flex-col gap-3">
          <Stack direction="row" spacing="small" class="items-center">
            <div class="size-10 rounded-xl bg-success/10 text-success grid place-items-center">
              <BookOpenIcon class="size-5" />
            </div>
            <code class="text-sm font-mono text-foreground">{{ t("pages.docs.llms.fullName") }}</code>
          </Stack>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.llms.fullDesc") }}
          </Typography>
        </Card>
      </div>
    </section>

    <!-- How to use -->
    <section id="how" v-reveal class="flex flex-col gap-4 scroll-mt-20">
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.docs.llms.howTitle") }}
      </Typography>
      <ol class="relative flex flex-col gap-10 pl-8 border-l border-border ml-3">
        <li class="relative flex flex-col gap-3">
          <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">1</span>
          <Stack direction="row" spacing="small" class="items-center">
            <SparklesIcon class="size-5 text-primary shrink-0" />
            <Typography variant="title" size="large" weight="medium">{{ t("pages.docs.llms.step1Title") }}</Typography>
          </Stack>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.llms.step1Desc") }}
          </Typography>
        </li>
        <li class="relative flex flex-col gap-3">
          <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">2</span>
          <Typography variant="title" size="large" weight="medium">{{ t("pages.docs.llms.step2Title") }}</Typography>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.llms.step2Desc") }}
          </Typography>
          <CodePreview :code="promptSnippet" lang="text" code-only />
        </li>
        <li class="relative flex flex-col gap-3">
          <span class="absolute -left-[2.75rem] top-0.5 size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary text-xs font-medium grid place-items-center select-none">3</span>
          <Stack direction="row" spacing="small" class="items-center">
            <CommandLineIcon class="size-5 text-foreground shrink-0" />
            <Typography variant="title" size="large" weight="medium">{{ t("pages.docs.llms.step3Title") }}</Typography>
          </Stack>
          <Typography variant="body" size="small" color="muted" weight="light">
            {{ t("pages.docs.llms.step3Desc") }}
          </Typography>
          <CodePreview :code="curlSnippet" lang="bash" code-only />
        </li>
      </ol>
    </section>

    <!-- Always in sync -->
    <section id="sync" v-reveal class="flex flex-col gap-4 scroll-mt-20">
      <Typography variant="heading" size="large" weight="medium" as="h2">
        {{ t("pages.docs.llms.syncTitle") }}
      </Typography>
      <Banner color="info" variant="subtle">
        {{ t("pages.docs.llms.syncDesc") }}
      </Banner>
    </section>
  </div>
</template>
