<script setup lang="ts">
definePageMeta({ layout: "landing" });

import { navManifest } from "~/utils/nav-manifest";
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { Avatar, AvatarGroup, Badge, Button, Card, Stack, Switch, Tooltip, Typography } from "mood-ui";
import {
  ArrowRightIcon,
  SparklesIcon,
  SwatchIcon,
  GlobeAltIcon,
  MoonIcon,
  BoltIcon,
  ShieldCheckIcon,
  PuzzlePieceIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  HeartIcon,
  ArrowUpRightIcon,
} from "@heroicons/vue/24/outline";
import { CheckBadgeIcon } from "@heroicons/vue/24/solid";









import { useI18n } from "vue-i18n";
import { vReveal, vRevealChildren } from "~/composables/useScrollReveal";
const go = useEntryNav();
const { t } = useI18n();


const cardStyles = [
  {
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:20px_20px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:radial-gradient(circle,currentColor_1.5px,transparent_1.5px)] [background-size:18px_18px]",
    hoverBorder: "hover:border-success/40",
  },
  {
    iconClasses:
      "bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white",
    patternClasses:
      "text-warning [background-image:repeating-linear-gradient(-60deg,currentColor_0,currentColor_1px,transparent_0,transparent_12px)]",
    hoverBorder: "hover:border-warning/40",
  },
  {
    iconClasses:
      "bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white",
    patternClasses:
      "text-destructive [background-image:linear-gradient(45deg,currentColor_1px,transparent_1px),linear-gradient(-45deg,currentColor_1px,transparent_1px)] [background-size:14px_14px]",
    hoverBorder: "hover:border-destructive/40",
  },
  {
    iconClasses:
      "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
    patternClasses:
      "text-primary [background-image:radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:28px_28px]",
    hoverBorder: "hover:border-primary/50",
  },
  {
    iconClasses:
      "bg-success/10 text-success group-hover:bg-success group-hover:text-white",
    patternClasses:
      "text-success [background-image:repeating-linear-gradient(0deg,currentColor_0,currentColor_1px,transparent_0,transparent_18px)]",
    hoverBorder: "hover:border-success/40",
  },
];

const totalComponents = navManifest
  .filter(
    (c) =>
      !["getting-started", "docs", "templates", "theme-studio"].includes(c.id),
  )
  .reduce((acc, c) => acc + c.entries.length, 0);

// Decorative switch state for the floating tile
const demoNotif = ref(true);

// SEO: rendered server-side via Nuxt's head helpers so the first paint
// already contains the title, description, OG tags and a SoftwareApplication
// JSON-LD blob that Google can use for rich results. The legacy showroom
// did this in onMounted, which kept it out of the indexable HTML.
const seoTitle = computed(() =>
  t("pages.welcome.seo.title", { n: totalComponents }),
);
const seoDescription = computed(() =>
  t("pages.welcome.seo.description", { n: totalComponents }),
);

const localePath = useLocalePath();
const homeUrl = computed(() => `https://mood-ui.com${localePath("/")}`);

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: "website",
  ogUrl: () => homeUrl.value,
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
});

defineOgImage("Default", {
  description: seoDescription.value,
});

// SoftwareApplication as a plain JSON-LD script. We deliberately do NOT use
// nuxt-schema-org's useSchemaOrg here: it registers a reactive head entry that
// nuxt-og-image's SEO extractor walks with toValue() and overflows the stack on.
// A static script tag is valid structured data and sidesteps that entirely.
// The Organization + WebSite/SearchAction identity still comes from the module
// (configured in nuxt.config) and links the site together.
useHead({
  script: [
    {
      type: "application/ld+json",
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Mood UI",
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        description: seoDescription.value,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        license: "https://opensource.org/licenses/MIT",
        programmingLanguage: ["Vue 3", "TypeScript"],
        url: homeUrl.value,
      }),
    },
  ],
});

const stats = computed(() => [
  { label: t("components"), value: String(totalComponents) },
  { label: t("pages.welcome.stats.composables"), value: "24" },
  { label: t("settings.language"), value: "ES · EN" },
  { label: t("pages.welcome.stats.bundle"), value: "131 KB" },
]);

const featureList = computed(() => [
  {
    icon: SwatchIcon,
    title: t("pages.welcome.features.theming.title"),
    text: t("pages.welcome.features.theming.text"),
  },
  {
    icon: GlobeAltIcon,
    title: t("pages.welcome.features.i18n.title"),
    text: t("pages.welcome.features.i18n.text"),
  },
  {
    icon: MoonIcon,
    title: t("pages.welcome.features.darkMode.title"),
    text: t("pages.welcome.features.darkMode.text"),
  },
  {
    icon: ShieldCheckIcon,
    title: t("pages.welcome.features.a11y.title"),
    text: t("pages.welcome.features.a11y.text"),
  },
  {
    icon: BoltIcon,
    title: t("pages.welcome.features.ts.title"),
    text: t("pages.welcome.features.ts.text"),
  },
  {
    icon: PuzzlePieceIcon,
    title: t("pages.welcome.features.tailwind.title"),
    text: t("pages.welcome.features.tailwind.text"),
  },
]);

const categoryHighlights = computed(() =>
  navManifest
    .filter(
      (c) =>
        !["getting-started", "docs", "templates", "theme-studio"].includes(
          c.id,
        ),
    )
    .map((c) => ({
      id: c.id,
      title: c.title,
      count: c.entries.length,
      firstEntryId: c.entries[0]?.id,
    })),
);

const installCmd = "npm install mood-ui";
const usageCode = `import { ModoProvider, Button } from 'mood-ui';
import 'mood-ui/style.css';

<ModoProvider color="primary" theme="system">
  <Button color="primary">Hello mood-ui</Button>
</ModoProvider>`;

const copied = ref<"install" | "usage" | null>(null);
async function copy(value: string, kind: "install" | "usage") {
  try {
    await navigator.clipboard.writeText(value);
    copied.value = kind;
    setTimeout(() => (copied.value = null), 1500);
  } catch {
    /* no-op */
  }
}

const teamUsers = [
  { name: "Olivia", src: "https://i.pravatar.cc/64?img=47" },
  { name: "Phoenix", src: "https://i.pravatar.cc/64?img=12" },
  { name: "Lana", src: "https://i.pravatar.cc/64?img=32" },
  { name: "Demi", src: "https://i.pravatar.cc/64?img=5" },
  { name: "Candice", src: "https://i.pravatar.cc/64?img=24" },
];

function navigateToGithub() {
  window.open(
    "https://github.com/alansinbailarin/mood-ui",
    "_blank",
    "noopener",
  );
}
</script>

<template>
  <!-- ─────────────────────────  HERO  ───────────────────────── -->
  <section class="relative overflow-hidden pt-16 lg:pt-28 pb-12 lg:pb-20">
    <!-- Soft, breathing gradient backdrop -->
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        class="showroom-hero-glow absolute -top-40 left-1/2 -translate-x-1/2 w-[1200px] h-[640px] rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent blur-3xl"
      ></div>
      <div
        class="absolute top-32 -right-32 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-accent/25 to-transparent blur-3xl opacity-70"
      ></div>
      <div
        class="absolute top-40 -left-32 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-success/15 to-transparent blur-3xl opacity-60"
      ></div>
      <!-- Faint grid -->
      <div
        class="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      ></div>
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 relative">
      <!-- ─── Floating components (decorative, hidden on small screens) ─── -->

      <!-- TOP LEFT — Badge chip -->
      <div
        v-reveal="'scale'"
        class="hidden md:flex absolute top-2 left-0 lg:left-4 items-center gap-1.5 rounded-full bg-card border border-border shadow-lg pl-1.5 pr-3 py-1 -rotate-6 hover:rotate-0 transition-transform duration-300"
      >
        <span class="size-5 rounded-full bg-success/15 grid place-items-center">
          <CheckBadgeIcon class="size-3.5 text-success" />
        </span>
        <span class="text-[11px] font-semibold text-foreground">{{
          t("labels.waiAria")
        }}</span>
      </div>

      <!-- TOP RIGHT — Avatar group card -->
      <div
        v-reveal="'scale'"
        class="hidden md:flex absolute top-0 right-0 lg:right-4 items-center gap-2 bg-card border border-border rounded-2xl shadow-xl p-2 pr-3 rotate-3 hover:rotate-0 transition-transform duration-300"
      >
        <AvatarGroup size="small" radius="large" :max="3">
          <Avatar
            v-for="u in teamUsers.slice(0, 3)"
            :key="u.name"
            :src="u.src"
            :alt="u.name"
            size="small"
          />
        </AvatarGroup>
        <span class="text-[11px] font-semibold text-foreground"
          >320+ {{ t("components") }}</span
        >
      </div>

      <!-- MID LEFT — Switch tile -->
      <div
        v-reveal
        class="hidden lg:flex absolute top-[42%] -left-4 xl:-left-12 flex-col gap-1.5 bg-card border border-border rounded-2xl shadow-xl p-3 -rotate-[8deg] hover:rotate-0 transition-transform duration-300 w-[150px]"
      >
        <div class="flex items-center justify-between gap-2">
          <span
            class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            >{{ t("labels.darkMode") }}</span
          >
          <Switch v-model="demoNotif" size="small" />
        </div>
        <div class="flex items-center gap-1">
          <span class="size-3 rounded-sm bg-foreground"></span>
          <span class="size-3 rounded-sm bg-muted"></span>
        </div>
      </div>

      <!-- MID RIGHT — Color palette tile -->
      <div
        v-reveal
        class="hidden lg:flex absolute top-[40%] -right-4 xl:-right-12 flex-col gap-2 bg-card border border-border rounded-2xl shadow-xl p-3 rotate-[7deg] hover:rotate-0 transition-transform duration-300 w-[160px]"
      >
        <span
          class="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >{{ t("labels.theme") }}</span
        >
        <div class="flex gap-1">
          <span class="size-5 rounded-full bg-primary ring-2 ring-card"></span>
          <span class="size-5 rounded-full bg-success ring-2 ring-card"></span>
          <span class="size-5 rounded-full bg-warning ring-2 ring-card"></span>
          <span
            class="size-5 rounded-full bg-destructive ring-2 ring-card"
          ></span>
          <span
            class="size-5 rounded-full bg-muted-foreground ring-2 ring-card"
          ></span>
        </div>
      </div>

      <!-- BOTTOM LEFT — npm command pill -->
      <div
        v-reveal="'scale'"
        class="hidden md:flex absolute bottom-2 left-2 lg:left-12 items-center gap-2 bg-foreground text-background rounded-xl shadow-2xl px-3 py-2 -rotate-3 hover:rotate-0 transition-transform duration-300 font-mono text-[11px]"
      >
        <span class="text-success">$</span>
        <span>npm i mood-ui</span>
        <ClipboardDocumentIcon class="size-3.5 opacity-60" />
      </div>

      <!-- BOTTOM RIGHT — Mini stat -->
      <div
        v-reveal="'scale'"
        class="hidden md:flex absolute bottom-0 right-2 lg:right-12 flex-col bg-card border border-border rounded-2xl shadow-xl px-3 py-2 rotate-[5deg] hover:rotate-0 transition-transform duration-300"
      >
        <span
          class="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground"
          >{{ t("labels.bundle") }}</span
        >
        <span class="text-base font-semibold text-foreground tabular-nums"
          >131
          <span class="text-[10px] font-normal text-muted-foreground">{{
            t("labels.kbGzip")
          }}</span></span
        >
      </div>

      <!-- ─── Centered content ─── -->
      <div
        v-reveal
        class="relative z-10 flex flex-col items-center text-center gap-6 max-w-3xl mx-auto pt-8 lg:pt-4"
      >
        <a
          href="https://github.com/alansinbailarin/mood-ui"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground hover:border-primary/60 hover:text-foreground transition-colors"
        >
          <span class="size-1.5 rounded-full bg-success animate-pulse"></span>
          {{ t("pages.welcome.badge") }}
          <ArrowTopRightOnSquareIcon class="size-3.5" />
        </a>

        <h1
          class="text-[2.5rem] sm:text-6xl lg:text-[5rem] font-light leading-[1.02] tracking-[-0.04em] text-foreground"
        >
          {{ t("pages.welcome.headline1") }}
          <span
            class="block font-medium bg-gradient-to-br from-primary via-primary to-accent bg-clip-text text-transparent"
          >
            {{ t("pages.welcome.headline2") }}
          </span>
        </h1>

        <p
          class="text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed font-light"
        >
          {{ t("pages.welcome.lead", { n: totalComponents }) }}
        </p>

        <div class="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button color="primary" size="large" @click="go('button')">
            {{ t("pages.welcome.ctaExplore") }}
            <template #suffix><ArrowRightIcon class="size-5" /></template>
          </Button>
          <Button
            rel="noopener"
            variant="outline"
            size="medium"
            :icon="ArrowUpRightIcon"
            @click="navigateToGithub()"
          >
            {{ t("pages.welcome.ctaGithub") }}
          </Button>
        </div>

        <!-- Product Hunt badge -->
        <a
          href="https://www.producthunt.com/products/mood-ui?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-mood-ui"
          target="_blank"
          rel="noopener noreferrer"
          class="pt-1"
        >
          <img
            alt="Mood UI - The Vue 3 component library built to ship fast. | Product Hunt"
            width="250"
            height="54"
            class="dark:hidden"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1186747&theme=light&t=1783046555507"
          />
          <img
            alt="Mood UI - The Vue 3 component library built to ship fast. | Product Hunt"
            width="250"
            height="54"
            class="hidden dark:block"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1186747&theme=dark&t=1783046555507"
          />
        </a>

        <!-- micro feature line -->
        <div
          class="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 text-xs text-muted-foreground"
        >
          <span class="inline-flex items-center gap-1.5"
            ><CheckIcon class="size-3.5 text-success" />
            {{ t("labels.vue3") }}</span
          >
          <span class="inline-flex items-center gap-1.5"
            ><CheckIcon class="size-3.5 text-success" />
            {{ t("labels.tailwindV4") }}</span
          >
          <span class="inline-flex items-center gap-1.5"
            ><CheckIcon class="size-3.5 text-success" />
            {{ t("labels.typescript") }}</span
          >
          <span class="inline-flex items-center gap-1.5"
            ><CheckIcon class="size-3.5 text-success" />
            {{ t("labels.mit") }}</span
          >
          <span class="inline-flex items-center gap-1.5"
            ><CheckIcon class="size-3.5 text-success" />
            {{ t("labels.a11y") }}</span
          >
        </div>
      </div>
    </div>
  </section>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-15 pt-12 pb-20">
    <!-- ───────────────────────  STATS STRIP  ─────────────────── -->
    <section v-reveal>
      <div
        class="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-border bg-border"
      >
        <div
          v-for="s in stats"
          :key="s.label"
          class="bg-card p-6 flex flex-col gap-1"
        >
          <span
            class="text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
          >
            {{ s.label }}
          </span>
          <span
            class="text-3xl lg:text-4xl font-light tracking-tight text-foreground"
          >
            {{ s.value }}
          </span>
        </div>
      </div>
    </section>

    <!-- ───────────────────────  FEATURES  ────────────────────── -->
    <section class="flex flex-col gap-12">
      <div v-reveal class="flex flex-col gap-3 max-w-2xl">
        <Typography variant="overline" size="medium" color="muted">
          {{ t("pages.welcome.featuresKicker") }}
        </Typography>
        <Typography
          variant="display"
          size="medium"
          as="h1"
          weight="medium"
          class="tracking-tight leading-[1.05]"
        >
          {{ t("pages.welcome.featuresTitle") }}
        </Typography>
        <Typography variant="body" size="medium" color="muted" weight="light">
          {{ t("pages.welcome.featuresSubtitle") }}
        </Typography>
      </div>

      <div v-reveal-children class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          v-for="(f, i) in featureList"
          :key="f.title"
          variant="outlined"
          padding="large"
          class="relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300"
          :class="cardStyles[i].hoverBorder"
        >
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.065]"
            :class="cardStyles[i].patternClasses"
          />
          <Stack direction="column" spacing="small" class="relative">
            <div
              class="size-10 rounded-xl grid place-items-center transition-colors"
              :class="cardStyles[i].iconClasses"
            >
              <component :is="f.icon" class="size-5" />
            </div>
            <Typography variant="title" size="small" as="h3">{{
              f.title
            }}</Typography>
            <Typography variant="body" size="small" color="muted">{{
              f.text
            }}</Typography>
          </Stack>
        </Card>
      </div>
    </section>

    <!-- ───────────────────────  INSTALL  ─────────────────────── -->
    <section class="flex flex-col gap-5">
      <Typography
        v-reveal=""
        variant="overline"
        class="text-muted-foreground max-w-2xl"
      >
        {{ t("pages.welcome.installKicker") }}
      </Typography>

      <div v-reveal class="grid lg:grid-cols-2 gap-4">
        <Card variant="outlined" padding="none" class="overflow-hidden">
          <div
            class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40"
          >
            <span class="text-xs font-mono text-muted-foreground">{{
              t("labels.terminal")
            }}</span>
            <Tooltip
              :content="
                copied === 'install'
                  ? t('pages.welcome.copy.copied')
                  : t('pages.welcome.copy.tooltip')
              "
            >
              <button
                type="button"
                :aria-label="t('pages.welcome.copy.ariaInstall')"
                class="text-muted-foreground hover:text-foreground transition-colors"
                @click="copy(installCmd, 'install')"
              >
                <CheckIcon
                  v-if="copied === 'install'"
                  class="size-4 text-success"
                />
                <ClipboardDocumentIcon v-else class="size-4" />
              </button>
            </Tooltip>
          </div>
          <pre
            class="p-5 font-mono text-sm overflow-x-auto"
          ><span class="text-muted-foreground select-none">$ </span><span class="text-foreground">{{ installCmd }}</span></pre>
        </Card>

        <Card
          variant="outlined"
          padding="none"
          class="overflow-hidden lg:row-span-2"
        >
          <div
            class="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/40"
          >
            <span class="text-xs font-mono text-muted-foreground">{{
              t("labels.appVue")
            }}</span>
            <Tooltip
              :content="
                copied === 'usage'
                  ? t('pages.welcome.copy.copied')
                  : t('pages.welcome.copy.tooltip')
              "
            >
              <button
                type="button"
                :aria-label="t('pages.welcome.copy.ariaUsage')"
                class="text-muted-foreground hover:text-foreground transition-colors"
                @click="copy(usageCode, 'usage')"
              >
                <CheckIcon
                  v-if="copied === 'usage'"
                  class="size-4 text-success"
                />
                <ClipboardDocumentIcon v-else class="size-4" />
              </button>
            </Tooltip>
          </div>
          <pre
            class="p-5 font-mono text-sm overflow-x-auto leading-relaxed text-foreground"
          ><code>{{ usageCode }}</code></pre>
        </Card>

        <Card variant="outlined" padding="large">
          <Stack direction="column" spacing="small">
            <h3 class="text-lg font-semibold">
              {{ t("pages.welcome.nextSteps") }}
            </h3>
            <p class="text-sm text-muted-foreground">
              {{ t("pages.welcome.nextStepsBody") }}
            </p>
            <div class="flex flex-wrap gap-2 pt-2">
              <Button size="small" variant="outline" @click="go('button')">
                {{ t("components") }}
              </Button>
              <Button size="small" variant="outline" @click="go('theming')">
                {{ t("docsNav.theming") }}
              </Button>
              <Button
                as="a"
                href="https://www.npmjs.com/package/mood-ui"
                target="_blank"
                rel="noopener"
                size="small"
                variant="ghost"
              >
                npm
                <template #suffix
                  ><ArrowTopRightOnSquareIcon class="size-3.5"
                /></template>
              </Button>
            </div>
          </Stack>
        </Card>
      </div>
    </section>

    <!-- ───────────────────────  CATALOG WALL  ─────────────────── -->
    <section class="flex flex-col gap-12">
      <div v-reveal class="flex flex-col gap-3 max-w-2xl">
        <Typography
          v-reveal=""
          variant="overline"
          class="text-muted-foreground max-w-2xl"
        >
          {{ t("pages.welcome.catalogKicker") }}
        </Typography>
        <Typography
          variant="display"
          size="medium"
          as="h1"
          weight="medium"
          class="tracking-tight leading-[1.05]"
        >
          {{ t("pages.welcome.catalogTitle", { n: totalComponents }) }}
        </Typography>

        <Typography variant="body" size="medium" color="muted" weight="light">
          {{ t("pages.welcome.catalogSubtitle") }}
        </Typography>
      </div>

      <div
        v-reveal-children
        class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <Card
          v-for="cat in categoryHighlights"
          :key="cat.id"
          variant="outlined"
          padding="large"
          class="group cursor-pointer hover:border-primary/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          @click="cat.firstEntryId && go(cat.firstEntryId)"
        >
          <Stack direction="column" spacing="small">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">{{ cat.title }}</h3>
              <Badge color="primary" variant="subtle">{{ cat.count }}</Badge>
            </div>
            <span class="text-xs text-muted-foreground">{{
              t("pages.welcome.clickToExplore")
            }}</span>
            <div
              class="flex items-center text-primary text-sm font-medium pt-2 group-hover:gap-2 gap-1 transition-all"
            >
              {{ t("pages.welcome.viewComponents") }}
              <ArrowRightIcon class="size-4" />
            </div>
          </Stack>
        </Card>
      </div>
    </section>

    <!-- ───────────────────────  FOOTER CTA  ─────────────────── -->
    <section v-reveal="'scale'">
      <Card
        variant="elevated"
        padding="large"
        class="relative overflow-hidden bg-gradient-to-br from-primary/8 via-card to-accent/8 border-primary/20"
      >
        <div
          class="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-primary/15 blur-3xl"
        ></div>

        <div class="relative grid lg:grid-cols-[1.5fr_1fr] gap-8 items-center">
          <div class="flex flex-col gap-4">
            <h2
              class="text-3xl lg:text-5xl font-light tracking-tight text-foreground"
            >
              {{ t("pages.welcome.finalCtaTitle") }}
            </h2>
            <p
              class="text-base lg:text-lg text-muted-foreground font-light leading-relaxed"
            >
              {{ t("pages.welcome.finalCtaBody") }}
            </p>
            <div class="flex flex-wrap gap-3 pt-2">
              <Button color="primary" size="large" @click="go('button')">
                {{ t("pages.welcome.ctaExplore") }}
                <template #suffix><ArrowRightIcon class="size-5" /></template>
              </Button>
              <Button
                as="a"
                href="https://github.com/alansinbailarin/mood-ui"
                target="_blank"
                rel="noopener"
                variant="ghost"
                size="large"
              >
                <template #prefix><HeartIcon class="size-5" /></template>
                {{ t("starOnGithub") }}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </section>
  </div>
</template>
