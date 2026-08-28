import DOMPurify from "dompurify";

export const ARTICLE_COLORS = [
  "#34282B",
  "#746469",
  "#8F344D",
  "#D78F79",
  "#287A5A",
  "#B4233A",
] as const;

const COLOR_PATTERN = /^color:\s*(#[0-9a-f]{6})\s*;?$/i;
const HTML_PATTERN = /<\/?[a-z][\s\S]*>/i;
let hooksConfigured = false;

export const isHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const isSafeImageUrl = (value: string) => {
  if (!isHttpsUrl(value)) return false;
  const url = new URL(value);
  const pathname = url.pathname.toLowerCase();
  return !pathname.endsWith(".svg") && !pathname.endsWith(".svgz");
};

export const areSafeReferenceUrls = (value: string) => {
  if (!value.trim()) return true;
  const references = value.split("|").map((reference) => reference.trim());
  return references.length > 0 && references.every(Boolean) && references.every(isHttpsUrl);
};

const isSafeYoutubeEmbed = (value: string) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === "www.youtube-nocookie.com" &&
      /^\/embed\/[A-Za-z0-9_-]{11}$/.test(url.pathname) &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
};

const configureSanitizerHooks = () => {
  if (hooksConfigured) return;
  hooksConfigured = true;

  DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    if (data.attrName === "href") {
      data.keepAttr = node instanceof HTMLAnchorElement && isHttpsUrl(data.attrValue);
    }

    if (data.attrName === "src") {
      data.keepAttr =
        (node instanceof HTMLImageElement && isSafeImageUrl(data.attrValue)) ||
        (node instanceof HTMLIFrameElement && isSafeYoutubeEmbed(data.attrValue));
    }

    if (data.attrName === "style") {
      const match = COLOR_PATTERN.exec(data.attrValue.trim());
      data.keepAttr = Boolean(
        match &&
          ARTICLE_COLORS.includes(
            match[1].toUpperCase() as (typeof ARTICLE_COLORS)[number],
          ),
      );
    }
  });

  DOMPurify.addHook("uponSanitizeElement", (node) => {
    if (
      node instanceof HTMLIFrameElement &&
      !isSafeYoutubeEmbed(node.getAttribute("src") ?? "")
    ) {
      node.remove();
    }
  });

  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (node instanceof HTMLAnchorElement && node.hasAttribute("href")) {
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }
    if (node instanceof HTMLIFrameElement) {
      node.removeAttribute("allow");
    }
  });
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const normalizeArticleHtml = (content: string) => {
  if (!content.trim() || HTML_PATTERN.test(content)) return content;

  return content
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
};

export const sanitizeArticleHtml = (content: string): string => {
  configureSanitizerHooks();
  return DOMPurify.sanitize(normalizeArticleHtml(content), {
    ALLOWED_TAGS: [
      "p",
      "h2",
      "h3",
      "strong",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "blockquote",
      "br",
      "hr",
      "a",
      "img",
      "span",
      "iframe",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "style",
      "target",
      "rel",
      "allow",
      "allowfullscreen",
      "frameborder",
      "loading",
      "data-youtube-video",
    ],
  });
};

export const isSemanticallyEmptyHtml = (content: string) => {
  const sanitized = sanitizeArticleHtml(content);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = sanitized;
  return !(wrapper.textContent?.trim() || wrapper.querySelector("img, iframe"));
};
