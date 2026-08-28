package Cuidado.Feminino.API.domain.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SanitizadorConteudoServiceTest {

    private final SanitizadorConteudoService sanitizador = new SanitizadorConteudoService();

    @Test
    void deveRemoverScriptEventosEProtocolosPerigosos() {
        String html = "<p>Texto</p><script>alert(1)</script>"
                + "<img src='javascript:alert(1)' onerror='alert(2)'>"
                + "<a href='data:text/html;base64,SGk='>perigoso</a>";

        String seguro = sanitizador.sanitizar(html);

        assertThat(seguro)
                .contains("<p>Texto</p>")
                .doesNotContain("script", "javascript:", "onerror", "data:");
    }

    @Test
    void devePreservarFormatacaoImagemHttpsECorPermitida() {
        String html = "<h2>Título</h2><p><strong>Importante</strong> "
                + "<span style='color: #8F344D'>vinho</span></p>"
                + "<img src='https://images.example.org/capa.jpg' alt='Capa'>";

        String seguro = sanitizador.sanitizar(html);

        assertThat(seguro)
                .contains("<h2>Título</h2>", "<strong>Importante</strong>")
                .contains("color: #8F344D", "https://images.example.org/capa.jpg")
                .contains("loading=\"lazy\"");
    }

    @Test
    void deveAceitarSomenteYoutubeNoCookie() {
        String html = "<iframe src='https://evil.example/video'></iframe>"
                + "<iframe src='https://www.youtube-nocookie.com/embed/abcdefghijk'></iframe>"
                + "<iframe src='https://www.youtube-nocookie.com/embed/curto123'></iframe>"
                + "<iframe src='https://www.youtube-nocookie.com/embed/abcdefghijkl'></iframe>"
                + "<iframe src='http://www.youtube-nocookie.com/embed/abcdefghijk'></iframe>";

        String seguro = sanitizador.sanitizar(html);

        assertThat(seguro)
                .doesNotContain("evil.example", "http://www.youtube-nocookie.com")
                .doesNotContain("curto123", "abcdefghijkl")
                .contains("https://www.youtube-nocookie.com/embed/abcdefghijk");
    }

    @Test
    void deveNormalizarYoutubeSemQueryFragmentOuAutoplay() {
        String html = "<iframe "
                + "src='https://www.youtube-nocookie.com/embed/abcdefghijk?autoplay=1#inicio' "
                + "allow='accelerometer; autoplay; encrypted-media' allowfullscreen></iframe>";

        String seguro = sanitizador.sanitizar(html);

        assertThat(seguro)
                .contains("src=\"https://www.youtube-nocookie.com/embed/abcdefghijk\"")
                .contains("allowfullscreen")
                .doesNotContain("?autoplay", "#inicio", "allow=\"", "autoplay;");
    }

    @Test
    void deveRejeitarSvgEEstiloForaDaPaleta() {
        String html = "<p><span style='color: #FFFFFF'>texto</span></p>"
                + "<img src='https://images.example.org/icone.SVG?versao=1'>"
                + "<img src='https://images.example.org/icone.svgz'>";

        String seguro = sanitizador.sanitizar(html);

        assertThat(seguro)
                .contains("<span>texto</span>")
                .doesNotContain("style", ".SVG", ".svgz");
    }

    @Test
    void deveProtegerLinksHttpsEmNovaAba() {
        String seguro = sanitizador.sanitizar(
                "<p><a href='https://example.org/artigo'>Referência</a></p>");

        assertThat(seguro)
                .contains("href=\"https://example.org/artigo\"")
                .contains("target=\"_blank\"")
                .contains("rel=\"noopener noreferrer\"");
    }

    @Test
    void deveRemoverHrefHttpsMalformadoOuComCredenciais() {
        String seguro = sanitizador.sanitizar(
                "<p><a href='https://'>malformado</a> "
                        + "<a href='https://usuario@example.org/artigo'>credencial</a></p>");

        assertThat(seguro).doesNotContain("href", "usuario@");
    }

    @Test
    void deveRejeitarCorpoVisualmenteVazio() {
        assertThatThrownBy(() -> sanitizador.sanitizar("<p><br></p>"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Corpo do conteúdo é obrigatório");
    }
}
