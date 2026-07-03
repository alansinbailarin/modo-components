<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Typography } from "mood-ui";
import type { DocTocApi } from "~/composables/useDocToc";

const props = defineProps<{ toc: DocTocApi }>();
const { t } = useI18n();

let observer: IntersectionObserver | null = null;
const visibleIds = ref<Set<string>>(new Set());

// ── npm weekly downloads ──────────────────────────────────────────────────────
const weeklyDownloads = ref<string | null>(null);

async function fetchDownloads() {
  try {
    const res = await fetch(
      "https://api.npmjs.org/downloads/point/last-week/mood-ui",
    );
    if (!res.ok) return;
    const data = (await res.json()) as { downloads: number };
    const n = data.downloads;
    weeklyDownloads.value =
      n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);
  } catch {
    // silently ignore (network/CORS issues in local dev)
  }
}

function setupObserver() {
  if (typeof window === "undefined") return;
  teardown();

  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visibleIds.value.add(e.target.id);
        else visibleIds.value.delete(e.target.id);
      }
      const ordered = props.toc.items.value;
      for (const item of ordered) {
        if (visibleIds.value.has(item.id)) {
          if (props.toc.activeId.value !== item.id) {
            props.toc.setActive(item.id);
          }
          return;
        }
      }
    },
    {
      rootMargin: "-80px 0px -65% 0px",
      threshold: [0, 1],
    },
  );

  for (const item of props.toc.items.value) {
    const el = document.getElementById(item.id);
    if (el) observer.observe(el);
  }
}

function teardown() {
  observer?.disconnect();
  observer = null;
  visibleIds.value.clear();
}

onMounted(() => {
  setTimeout(setupObserver, 50);
  fetchDownloads();
});
onBeforeUnmount(teardown);

watch(
  () => props.toc.items.value.map((i) => i.id).join(","),
  () => setTimeout(setupObserver, 50),
);

function go(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 64;
  window.scrollTo({ top, behavior: "smooth" });
  history.replaceState(null, "", `#${id}`);
}
</script>

<template>
  <!-- Drop the whole TOC column when the active page didn't register any
       items (Templates, ThemeStudio, dynamic content pages). Without the
       v-if on <nav> the empty 14rem reserved column stole horizontal
       space from the main content. -->
  <nav
    v-if="toc.items.value.length"
    class="hidden xl:flex xl:flex-col w-56 shrink-0"
  >
    <div
      class="sticky top-20 flex flex-col justify-between"
      style="height: calc(95dvh - 5rem)"
    >
      <!-- TOC list (scrollable if long) -->
      <div class="flex flex-col gap-3 overflow-y-auto pb-4">
        <Typography
          variant="overline"
          size="small"
          color="muted"
          weight="semibold"
        >
          {{ t("doc.onThisPage") }}
        </Typography>
        <ul class="flex flex-col gap-1 border-l border-border">
          <li v-for="item in toc.items.value" :key="item.id">
            <button
              type="button"
              class="w-full text-left py-1 px-3 -ml-px border-l-2 transition-colors cursor-pointer"
              :class="[
                item.level === 2 ? 'pl-6 text-xs' : 'pl-3 text-sm',
                toc.activeId.value === item.id
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              ]"
              @click="go(item.id)"
            >
              {{ item.label }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Pinned footer: Product Hunt + npm + issue link -->
      <div class="flex flex-col gap-3 shrink-0">
        <!-- Product Hunt badge -->
        <a
          href="https://www.producthunt.com/products/mood-ui?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-mood-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            alt="Mood UI - The Vue 3 component library built to ship fast. | Product Hunt"
            width="250"
            height="54"
            loading="lazy"
            class="w-full h-auto dark:hidden"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1186747&theme=light&t=1783046555507"
          />
          <img
            alt="Mood UI - The Vue 3 component library built to ship fast. | Product Hunt"
            width="250"
            height="54"
            loading="lazy"
            class="w-full h-auto hidden dark:block"
            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1186747&theme=dark&t=1783046555507"
          />
        </a>

        <!-- npm weekly downloads -->
        <a
          href="https://www.npmjs.com/package/mood-ui"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-between group"
        >
          <div class="flex items-center gap-1.5">
            <svg
              class="size-3.5 shrink-0 text-[#cb3837]"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M0 0v16h16V0H0zm13.3 13.3H8v-8H5.3v8H2.7V2.7h10.6v10.6z"
              />
            </svg>
            <span
              class="text-xs text-muted-foreground group-hover:text-foreground transition-colors"
              >mood-ui</span
            >
          </div>
          <span
            v-if="weeklyDownloads"
            class="text-[11px] font-medium tabular-nums px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground group-hover:text-foreground transition-colors"
          >
            {{ weeklyDownloads }}{{ t("toc.weeklySuffix") }}
          </span>
          <span v-else class="text-[11px] text-muted-foreground/40 italic"
            >npm</span
          >
        </a>

        <!-- GitHub: Star + Issue -->
        <div class="flex items-start gap-1.5">
          <svg
            class="size-3.5 shrink-0 mt-px text-muted-foreground"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          <div class="flex flex-col gap-1">
            <a
              href="https://github.com/alansinbailarin/mood-ui"
              target="_blank"
              rel="noopener noreferrer"
              class="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {{ t("toc.starTitle") }}
            </a>
            <a
              href="https://github.com/alansinbailarin/mood-ui/issues"
              target="_blank"
              rel="noopener noreferrer"
              class="text-[11px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
            >
              {{ t("toc.issueBody") }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
