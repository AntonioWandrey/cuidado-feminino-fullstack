import { useMemo } from "react";

import { sanitizeArticleHtml } from "@/lib/richText";

interface ConteudoRicoProps {
  html: string;
}

export const ConteudoRico = ({ html }: ConteudoRicoProps) => {
  const safeHtml = useMemo(() => sanitizeArticleHtml(html), [html]);

  return (
    <article
      className="article-content prose prose-stone max-w-none"
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
};
