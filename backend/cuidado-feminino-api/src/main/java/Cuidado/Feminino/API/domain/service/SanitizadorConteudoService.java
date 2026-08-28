package Cuidado.Feminino.API.domain.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SanitizadorConteudoService {

    private static final String MENSAGEM_CORPO_OBRIGATORIO = "Corpo do conteúdo é obrigatório";
    private static final Set<String> CORES = Set.of(
            "#34282B", "#746469", "#8F344D", "#D78F79", "#287A5A", "#B4233A");
    private static final Pattern ESTILO_COR = Pattern.compile(
            "(?i)^\\s*color\\s*:\\s*(#[0-9a-f]{6})\\s*;?\\s*$");
    private static final Pattern YOUTUBE_PATH = Pattern.compile("^/embed/([A-Za-z0-9_-]{11})$");

    private final Safelist safelist = new Safelist()
            .addTags("p", "h2", "h3", "strong", "em", "u", "ul", "ol", "li",
                    "blockquote", "br", "hr", "a", "img", "span", "iframe")
            .addAttributes("a", "href", "title", "target", "rel")
            .addAttributes("img", "src", "alt", "title", "loading")
            .addAttributes("span", "style")
            .addAttributes("iframe", "src", "title", "width", "height", "loading",
                    "allowfullscreen", "frameborder")
            .addProtocols("a", "href", "https")
            .addProtocols("img", "src", "https")
            .addProtocols("iframe", "src", "https");

    public String sanitizar(String html) {
        if (!StringUtils.hasText(html)) {
            throw new IllegalArgumentException(MENSAGEM_CORPO_OBRIGATORIO);
        }

        String limpo = Jsoup.clean(html, "", safelist,
                new Document.OutputSettings().prettyPrint(false));
        Document document = Jsoup.parseBodyFragment(limpo);

        sanitizarCores(document);
        sanitizarImagens(document);
        sanitizarVideos(document);
        protegerLinks(document);

        boolean possuiMidia = !document.select("img[src], iframe[src]").isEmpty();
        if (!StringUtils.hasText(document.text()) && !possuiMidia) {
            throw new IllegalArgumentException(MENSAGEM_CORPO_OBRIGATORIO);
        }
        return document.body().html();
    }

    private void sanitizarCores(Document document) {
        document.select("span[style]").forEach(span -> {
            Matcher matcher = ESTILO_COR.matcher(span.attr("style"));
            if (!matcher.matches()) {
                span.removeAttr("style");
                return;
            }

            String cor = matcher.group(1).toUpperCase(Locale.ROOT);
            if (CORES.contains(cor)) {
                span.attr("style", "color: " + cor);
            } else {
                span.removeAttr("style");
            }
        });
    }

    private void sanitizarImagens(Document document) {
        document.select("img").forEach(image -> {
            URI uri = criarUriHttps(image.attr("src"));
            String caminho = uri == null ? null : uri.getPath();
            String caminhoNormalizado = caminho == null ? "" : caminho.toLowerCase(Locale.ROOT);
            if (uri == null || caminho == null
                    || caminhoNormalizado.endsWith(".svg")
                    || caminhoNormalizado.endsWith(".svgz")) {
                image.remove();
                return;
            }
            image.attr("loading", "lazy");
        });
    }

    private void sanitizarVideos(Document document) {
        document.select("iframe").forEach(iframe -> {
            URI uri = criarUriHttps(iframe.attr("src"));
            Matcher caminho = uri == null ? null : YOUTUBE_PATH.matcher(uri.getPath());
            if (uri == null
                    || !"www.youtube-nocookie.com".equalsIgnoreCase(uri.getHost())
                    || !caminho.matches()) {
                iframe.remove();
                return;
            }
            iframe.attr("src", "https://www.youtube-nocookie.com/embed/" + caminho.group(1));
            iframe.removeAttr("allow");
        });
    }

    private void protegerLinks(Document document) {
        document.select("a[href]").forEach(link -> {
            if (criarUriHttps(link.attr("href")) == null) {
                link.removeAttr("href");
                link.removeAttr("target");
                link.removeAttr("rel");
                return;
            }
            link.attr("target", "_blank").attr("rel", "noopener noreferrer");
        });
    }

    private URI criarUriHttps(String valor) {
        if (!StringUtils.hasText(valor)) {
            return null;
        }
        try {
            URI uri = URI.create(valor);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !StringUtils.hasText(uri.getHost())
                    || uri.getUserInfo() != null) {
                return null;
            }
            return uri;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }
}
