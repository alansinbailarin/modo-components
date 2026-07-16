<script setup lang="ts">
import { computed, inject, onMounted, watch } from "vue";
import { Badge, Card, Stack, Typography } from "mood-ui";
import { useI18n } from "vue-i18n";
import {
  TagIcon,
  BookOpenIcon,
  PaintBrushIcon,
} from "@heroicons/vue/24/outline";





import { vReveal } from "~/composables/useScrollReveal";
import { DOC_TOC_KEY } from "~/composables/useDocToc";

const { t, tm, rt, locale } = useI18n();

// vue-i18n 11 pre-compiles every translation string at build time into a
// VNode-like AST so {placeholder} interpolations are cheap at runtime.
// `tm()` returns those raw ASTs; rendering one as `{{ ast }}` prints the
// AST object as JSON (which is what was happening in changelog.vue — the
// release titles and items were showing as `{ "type": 0, "start": 0, … }`).
// `resolveMessage()` walks the structure, calling `rt()` on every leaf so
// templates get plain strings back, the same as `t('key')` would return.
function resolveMessage(v: unknown): unknown {
  if (v === null || v === undefined) return v;
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.map(resolveMessage);
  if (typeof v === "object") {
    // AST nodes carry `type`/`body` in dev and the minified `t`/`b` keys in
    // production builds (vue-i18n's message compiler swaps to short keys to
    // shave bytes off the runtime). Checking only the long form left every
    // release rendered as raw JSON on mood-ui.com.
    const o = v as Record<string, unknown>;
    const isAstNode =
      ("type" in o && "body" in o) || ("t" in o && "b" in o);
    if (isAstNode) {
      try {
        return rt(v as never);
      } catch {
        return "";
      }
    }
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as object)) {
      out[k] = resolveMessage(val);
    }
    return out;
  }
  return v;
}

useSeoMeta({
  title: () => t("pages.docs.changelog.title"),
  description: () => t("pages.docs.changelog.description"),
  ogTitle: () => `${t("pages.docs.changelog.title")} · mood-ui`,
  ogDescription: () => t("pages.docs.changelog.description"),
});

defineOgImage("Default", {
  title: t("pages.docs.changelog.title"),
  description: t("pages.docs.changelog.description"),
  category: "Docs",
});
const go = useEntryNav();
const toc = inject(DOC_TOC_KEY, null);

function registerToc() {
  if (!toc) return;
  for (const r of releases) {
    toc.register({
      id: r.version.replaceAll(".", "-"),
      label: r.version,
      level: 1,
    });
  }
  toc.register({
    id: "next-steps",
    label: t("pages.docs.changelog.nextSteps"),
    level: 1,
  });
}

onMounted(registerToc);
watch(locale, registerToc);

interface Release {
  version: string;
  date: string;
  tag: "major" | "minor" | "patch";
}

const releases: Release[] = [
  { version: "v0.11.0", date: "2026-07-16", tag: "minor" },
  { version: "v0.10.0", date: "2026-06-28", tag: "minor" },
  { version: "v0.9.3", date: "2026-05-28", tag: "patch" },
  { version: "v0.9.2", date: "2026-05-28", tag: "patch" },
  { version: "v0.9.1", date: "2026-05-28", tag: "patch" },
  { version: "v0.9.0", date: "2026-05-18", tag: "minor" },
  { version: "v0.8.2", date: "2026-05-13", tag: "patch" },
  { version: "v0.8.1", date: "2026-05-13", tag: "patch" },
  { version: "v0.8.0", date: "2026-05-12", tag: "minor" },
  { version: "v0.7.1", date: "2026-05-09", tag: "patch" },
  { version: "v0.7.0", date: "2026-05-08", tag: "minor" },
  { version: "v0.6.0", date: "2026-05-07", tag: "minor" },
  { version: "v0.5.2", date: "2026-05-01", tag: "patch" },
  { version: "v0.5.0", date: "2026-04-22", tag: "minor" },
  { version: "v0.4.0", date: "2026-03-30", tag: "minor" },
  { version: "v0.3.0", date: "2026-02-14", tag: "minor" },
  { version: "v0.1.0", date: "2026-01-08", tag: "major" },
];

const tagColor = (tag: Release["tag"]) =>
  tag === "major"
    ? ("danger" as const)
    : tag === "minor"
      ? ("primary" as const)
      : ("success" as const);

const releasesMap = computed(
  () =>
    resolveMessage(tm("pages.docs.changelog.releases")) as Record<
      string,
      { title: string; items: string[] }
    >,
);

const items = computed(() =>
  releases.map((r) => ({
    ...r,
    body: {
      title:
        (releasesMap.value[r.version] as { title: string })?.title ?? r.version,
      items: ((releasesMap.value[r.version] as { items: string[] })?.items ??
        []) as string[],
    },
  })),
);
</script>

<template>
  <article class="flex flex-col gap-12 pb-12">
    <header v-reveal class="flex flex-col gap-3">
      <Typography variant="overline" size="medium" color="muted">
        {{ t("pages.docs.changelog.kicker") }}
      </Typography>
      <Typography
        variant="display"
        size="medium"
        as="h1"
        weight="medium"
        class="tracking-tight leading-[1.05]"
      >
        {{ t("docsNav.changelog") }}
      </Typography>
      <Typography variant="body" size="medium" color="muted" weight="light">
        {{ t("pages.docs.changelog.intro") }}
      </Typography>
    </header>

    <ol class="relative flex flex-col gap-6 border-l border-border pl-8 ml-3">
      <li
        v-for="r in items"
        :key="r.version"
        :id="r.version.replaceAll('.', '-')"
        v-reveal
        class="relative"
      >
        <span
          class="absolute -left-[2.75rem] top-2 grid place-items-center size-6 rounded-full bg-card ring-1 ring-primary/40 text-primary"
        >
          <TagIcon class="size-3.5" />
        </span>
        <Card variant="outlined" padding="large">
          <Stack direction="column" spacing="small">
            <div class="flex items-center gap-3 flex-wrap">
              <Typography
                variant="title"
                size="large"
                as="h2"
                weight="semibold"
                >{{ r.version }}</Typography
              >
              <Badge
                :color="tagColor(r.tag)"
                variant="subtle"
                class="capitalize"
              >
                {{ r.tag }}
              </Badge>
              <time
                :datetime="r.date"
                class="text-xs font-mono text-muted-foreground ml-auto"
                >{{ r.date }}</time
              >
            </div>
            <Typography variant="body" size="medium" weight="medium">{{
              r.body.title
            }}</Typography>
            <ul
              class="space-y-1.5 text-sm text-muted-foreground list-disc pl-4"
            >
              <li v-for="(item, idx) in r.body.items" :key="idx">{{ item }}</li>
            </ul>
          </Stack>
        </Card>
      </li>
    </ol>

    <!-- Next steps -->
    <section id="next-steps" v-reveal class="flex flex-col gap-4">
      <Typography variant="heading" size="large" weight="medium">
        {{ t("pages.docs.changelog.nextSteps") }}
      </Typography>
      <div class="grid sm:grid-cols-2 gap-4">
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('introduction')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              <BookOpenIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">
              {{ t("pages.docs.changelog.next.introductionTitle") }}
            </Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.changelog.next.introductionDesc") }}
            </Typography>
          </Stack>
        </Card>
        <Card
          variant="outlined"
          padding="large"
          class="relative overflow-hidden cursor-pointer hover:border-success/40 hover:-translate-y-0.5 transition-all duration-300 group"
          @click="go('theming')"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065] text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl bg-success/10 text-success grid place-items-center group-hover:bg-success group-hover:text-white transition-colors"
            >
              <PaintBrushIcon class="size-5" />
            </div>
            <Typography variant="title" size="medium" weight="medium" as="h3">
              {{ t("pages.docs.changelog.next.themingTitle") }}
            </Typography>
            <Typography
              variant="body"
              size="small"
              color="muted"
              weight="light"
            >
              {{ t("pages.docs.changelog.next.themingDesc") }}
            </Typography>
          </Stack>
        </Card>
      </div>
    </section>
  </article>
</template>
