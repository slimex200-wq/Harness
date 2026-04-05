import * as cheerio from "cheerio";
import crypto from "crypto";

export interface CrawlResult {
  readonly content: string;
  readonly hash: string;
  readonly title: string;
  readonly textContent: string;
}

const BLOCKED_PATTERNS = [
  /^https?:\/\/(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.0\.0\.0|localhost|\[::1\])/i,
  /^(?!https?:\/\/)/i,
];

function validateUrl(url: string): void {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(url)) {
      throw new Error(`Blocked URL: internal or non-HTTP(S) address`);
    }
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Blocked URL: only HTTP(S) allowed`);
    }
  } catch {
    throw new Error(`Invalid URL format`);
  }
}

export async function crawlUrl(
  url: string,
  selector?: string | null,
): Promise<CrawlResult> {
  validateUrl(url);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; DiffWatch/1.0; +https://diffwatch.dev)",
      Accept: "text/html",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, noscript, iframe, svg").remove();

  const targetContent = selector ? $(selector).html() ?? "" : $("body").html() ?? "";
  const textContent = selector
    ? $(selector).text().trim()
    : $("body").text().trim();
  const title = $("title").text().trim();

  const hash = crypto
    .createHash("sha256")
    .update(textContent)
    .digest("hex")
    .slice(0, 16);

  return { content: targetContent, hash, title, textContent };
}
