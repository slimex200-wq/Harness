import * as cheerio from "cheerio";

export interface DiscoveredPage {
  readonly url: string;
  readonly category: "pricing" | "changelog" | "blog" | "product" | "docs" | "about";
  readonly label: string;
}

const CATEGORY_PATTERNS: Record<string, { paths: RegExp[]; keywords: RegExp[]; label: string }> = {
  pricing: {
    paths: [/\/pricing/i, /\/plans/i, /\/price/i, /\/packages/i, /\/subscription/i],
    keywords: [/pricing/i, /plans?\b/i, /price/i],
    label: "Pricing",
  },
  changelog: {
    paths: [/\/changelog/i, /\/releases/i, /\/updates/i, /\/whats-new/i, /\/release-notes/i, /\/patch/i],
    keywords: [/changelog/i, /release/i, /what'?s new/i, /updates?/i],
    label: "Updates",
  },
  blog: {
    paths: [/\/blog/i, /\/news/i, /\/articles/i, /\/posts/i],
    keywords: [/\bblog\b/i, /\bnews\b/i],
    label: "Blog",
  },
  product: {
    paths: [/\/products?/i, /\/features/i, /\/solutions/i, /\/platform/i],
    keywords: [/products?/i, /features/i, /solutions/i],
    label: "Product",
  },
  docs: {
    paths: [/\/docs/i, /\/documentation/i, /\/api/i, /\/reference/i, /\/developers/i],
    keywords: [/docs/i, /documentation/i, /\bapi\b/i],
    label: "Docs",
  },
  about: {
    paths: [/\/about/i, /\/company/i, /\/team/i, /\/careers/i],
    keywords: [/about\s*us/i, /company/i],
    label: "About",
  },
};

function categorizeUrl(url: string, text: string): string | null {
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pathPattern of patterns.paths) {
      if (pathPattern.test(url)) return category;
    }
    for (const kwPattern of patterns.keywords) {
      if (kwPattern.test(text)) return category;
    }
  }
  return null;
}

async function resolveCompanyUrl(companyName: string): Promise<string | null> {
  const query = encodeURIComponent(`${companyName} official website`);
  // Try common patterns first
  const guesses = [
    `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    `https://${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
    `https://${companyName.toLowerCase().replace(/\s+/g, "-")}.com`,
    `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.io`,
  ];

  for (const guess of guesses) {
    try {
      const res = await fetch(guess, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        redirect: "follow",
      });
      if (res.ok) return guess;
    } catch {
      // try next
    }
  }

  return null;
}

export async function discoverPages(companyName: string): Promise<{
  baseUrl: string;
  pages: DiscoveredPage[];
}> {
  const baseUrl = await resolveCompanyUrl(companyName);
  if (!baseUrl) {
    throw new Error(`Could not find website for "${companyName}"`);
  }

  const res = await fetch(baseUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; DiffWatch/1.0; +https://diffwatch.dev)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${baseUrl}: ${res.status}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const seen = new Set<string>();
  const pages: DiscoveredPage[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();
    if (!href) return;

    let fullUrl: string;
    try {
      fullUrl = new URL(href, baseUrl).toString();
    } catch {
      return;
    }

    // Only same-domain links
    const base = new URL(baseUrl);
    const link = new URL(fullUrl);
    if (link.hostname !== base.hostname && !link.hostname.endsWith(`.${base.hostname}`)) {
      return;
    }

    // Remove hash and query
    const cleanUrl = `${link.origin}${link.pathname}`.replace(/\/$/, "");
    if (seen.has(cleanUrl) || cleanUrl === baseUrl.replace(/\/$/, "")) return;
    seen.add(cleanUrl);

    const category = categorizeUrl(link.pathname, text);
    if (category) {
      const info = CATEGORY_PATTERNS[category];
      pages.push({
        url: cleanUrl,
        category: category as DiscoveredPage["category"],
        label: `${companyName} ${info.label}`,
      });
    }
  });

  // Deduplicate by category — keep first match per category
  const byCategory = new Map<string, DiscoveredPage>();
  for (const page of pages) {
    if (!byCategory.has(page.category)) {
      byCategory.set(page.category, page);
    }
  }

  return { baseUrl, pages: Array.from(byCategory.values()) };
}
