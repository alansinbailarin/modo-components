// apps/showroom/composables/usePageSeo.ts
import { getComponentSeo } from "~/seo/keywords";
import { navManifest } from "~/utils/nav-manifest";

export interface PageSeoResult {
  /** keyword H1 for the page, or null to fall back to the plain title */
  h1: string | null;
  intro: string | null;
  related: { label: string; route: string }[];
  breadcrumbs: { label: string; route: string }[];
}

/**
 * Centralized on-page SEO for a component doc page. Reads the keyword map +
 * the page's `seo.*` i18n copy, registers keyword-rich meta + structured data,
 * and returns the visible keyword H1 / intro / links for the template.
 */
export function usePageSeo(routePath: string): PageSeoResult {
  const { t, te } = useI18n();
  const localePath = useLocalePath();
  const site = useSiteConfig();
  const seo = getComponentSeo(routePath);

  if (!seo) {
    return { h1: null, intro: null, related: [], breadcrumbs: [] };
  }

  const k = (suffix: string) => `${seo.i18nKey}.seo.${suffix}`;
  const has = (suffix: string) => te(k(suffix));
  const metaTitle = has("metaTitle") ? t(k("metaTitle")) : t(`${seo.i18nKey}.title`);
  const metaDescription = has("metaDescription")
    ? t(k("metaDescription"))
    : t(`${seo.i18nKey}.description`);
  const h1 = has("h1") ? t(k("h1")) : null;
  const intro = has("intro") ? t(k("intro")) : null;

  // ── Meta (keyword-rich; ComponentDoc is a child of the page so this wins) ──
  useSeoMeta({
    title: metaTitle,
    ogTitle: `${metaTitle} · mood-ui`,
    description: metaDescription,
    ogDescription: metaDescription,
    twitterTitle: `${metaTitle} · mood-ui`,
    twitterDescription: metaDescription,
  });

  // ── Internal links + breadcrumb labels from the nav manifest ──────────────
  const labelFor = (route: string): string => {
    for (const cat of navManifest) {
      const entry = cat.entries.find((e) => e.route === route);
      if (entry) return entry.label;
    }
    return route;
  };
  const categoryOf = (route: string) =>
    navManifest.find((c) => c.entries.some((e) => e.route === route));

  const related = seo.related.map((r) => ({ label: labelFor(r), route: r }));
  const cat = categoryOf(seo.route);
  const breadcrumbs = [
    { label: t("home"), route: "/" },
    ...(cat ? [{ label: cat.title, route: cat.entries[0]?.route ?? seo.route }] : []),
    { label: labelFor(seo.route), route: seo.route },
  ];

  // ── Structured data: component entity + breadcrumb trail ──────────────────
  const abs = (p: string) => site.url + localePath(p);
  // nuxt-schema-org (vendored schema-org v3) has no `defineSoftwareSourceCode`
  // resolver, so the SoftwareSourceCode entity is emitted as a raw graph node
  // (useSchemaOrg normalizes raw nodes — it auto-assigns an @id and includes
  // them in the @graph). TechArticle uses `defineArticle` with the @type cast,
  // since the article resolver preserves an explicit @type.
  const entity =
    seo.schemaType === "SoftwareSourceCode"
      ? {
          "@type": "SoftwareSourceCode",
          name: seo.keywords[0],
          description: metaDescription,
          codeRepository: "https://github.com/alansinbailarin/mood-ui",
          programmingLanguage: "TypeScript",
          runtimePlatform: "Vue 3",
          isAccessibleForFree: true,
          keywords: seo.keywords.join(", "),
        }
      : defineArticle({
          "@type": "TechArticle",
          headline: metaTitle,
          description: metaDescription,
        });

  useSchemaOrg([
    entity,
    defineBreadcrumb({
      itemListElement: breadcrumbs.map((b) => ({ name: b.label, item: abs(b.route) })),
    }),
  ]);

  return { h1, intro, related, breadcrumbs };
}
