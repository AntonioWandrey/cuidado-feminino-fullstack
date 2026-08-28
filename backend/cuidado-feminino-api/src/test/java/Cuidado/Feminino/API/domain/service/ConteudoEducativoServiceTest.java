package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoRequest;
import Cuidado.Feminino.API.application.exception.ConteudoEducativoNaoEncontradoException;
import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;
import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.repository.CategoriaConteudoRepository;
import Cuidado.Feminino.API.domain.repository.ConteudoEducativoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConteudoEducativoServiceTest {

    @Mock
    private ConteudoEducativoRepository repository;

    @Mock
    private CategoriaConteudoRepository categoriaRepository;

    @Mock
    private SanitizadorConteudoService sanitizador;

    private ConteudoEducativoService service;
    private CategoriaConteudo categoria;

    @BeforeEach
    void setUp() {
        service = new ConteudoEducativoService(repository, categoriaRepository, sanitizador);
        categoria = CategoriaConteudo.builder().id(3L).nome("Saúde").build();
    }

    @Test
    void deveBuscarDetalhePublicoSomenteEntreConteudosAtivos() {
        when(repository.findByIdAndAtivoTrue(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPublicoPorId(9L))
                .isInstanceOf(ConteudoEducativoNaoEncontradoException.class);

        verify(repository).findByIdAndAtivoTrue(9L);
        verify(repository, never()).findById(9L);
    }

    @Test
    void deveListarAtivosEInativosNaAdministracao() {
        ConteudoEducativo publicado = artigo(1L, true);
        ConteudoEducativo rascunho = artigo(2L, false);
        when(repository.findAll()).thenReturn(List.of(publicado, rascunho));

        var resultado = service.listarTodos();

        assertThat(resultado).extracting("ativo").containsExactly(true, false);
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    void deveAlterarPublicacaoParaOEstadoSolicitado(boolean ativo) {
        ConteudoEducativo artigo = artigo(7L, !ativo);
        when(repository.findById(7L)).thenReturn(Optional.of(artigo));
        when(repository.save(artigo)).thenReturn(artigo);

        var resultado = service.alterarPublicacao(7L, ativo);

        assertThat(artigo.getAtivo()).isEqualTo(ativo);
        assertThat(resultado.ativo()).isEqualTo(ativo);
        verify(repository).save(artigo);
    }

    @Test
    void deveExcluirLogicamenteSemApagarRegistro() {
        ConteudoEducativo artigo = artigo(8L, true);
        when(repository.findById(8L)).thenReturn(Optional.of(artigo));
        when(repository.save(artigo)).thenReturn(artigo);

        service.excluirLogicamente(8L);

        assertThat(artigo.getAtivo()).isFalse();
        verify(repository).save(artigo);
        verify(repository, never()).delete(any());
    }

    @Test
    void deveSanitizarCorpoAntesDeCriar() {
        ConteudoEducativoRequest request = request(
                "<p>Texto<script>alert(1)</script></p>",
                "https://example.org/capa.jpg",
                "https://example.org/referencia");
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        when(sanitizador.sanitizar(request.corpo())).thenReturn("<p>Texto</p>");
        when(repository.save(any())).thenAnswer(invocation -> {
            ConteudoEducativo salvo = invocation.getArgument(0);
            salvo.setId(10L);
            return salvo;
        });

        var resultado = service.criar(request);

        assertThat(resultado.corpo()).isEqualTo("<p>Texto</p>");
        verify(sanitizador).sanitizar(request.corpo());
    }

    @Test
    void devePreservarEntidadeQuandoSanitizacaoDaAtualizacaoFalha() {
        ConteudoEducativo artigo = artigo(11L, true);
        artigo.setTitulo("Título anterior");
        artigo.setCorpo("<p>Corpo anterior</p>");
        ConteudoEducativoRequest request = request("<p><br></p>", null, null);
        when(repository.findById(11L)).thenReturn(Optional.of(artigo));
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        when(sanitizador.sanitizar(request.corpo()))
                .thenThrow(new IllegalArgumentException("Corpo do conteúdo é obrigatório"));

        assertThatThrownBy(() -> service.atualizar(11L, request))
                .isInstanceOf(IllegalArgumentException.class);

        assertThat(artigo.getTitulo()).isEqualTo("Título anterior");
        assertThat(artigo.getCorpo()).isEqualTo("<p>Corpo anterior</p>");
        verify(repository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://example.org/capa.jpg",
            "data:image/png;base64,AAAA",
            "https://example.org/capa.svg",
            "https://example.org/capa.SVGZ",
            "não é uma url"
    })
    void deveRejeitarImagemDeCapaInsegura(String imagemCapaUrl) {
        ConteudoEducativoRequest request = request("<p>Corpo</p>", imagemCapaUrl, null);

        assertThatThrownBy(() -> service.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("URL da imagem de capa deve ser HTTPS e não pode apontar para SVG");

        verify(repository, never()).save(any());
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://example.org/referencia",
            "data:text/html;base64,AAAA",
            "não é uma url"
    })
    void deveRejeitarFonteDeReferenciaInsegura(String fonteReferencia) {
        ConteudoEducativoRequest request = request("<p>Corpo</p>", null, fonteReferencia);

        assertThatThrownBy(() -> service.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Fonte de referência deve ser uma URL HTTPS válida");

        verify(repository, never()).save(any());
    }

    @Test
    void deveAceitarMultiplasFontesHttpsSeparadasPorPipeAoEditar() {
        String fontes = "https://example.org/uma | https://example.org/duas | "
                + "https://example.org/tres";
        ConteudoEducativo artigo = artigo(12L, true);
        ConteudoEducativoRequest request = request("<p>Corpo atualizado</p>", null, fontes);
        when(repository.findById(12L)).thenReturn(Optional.of(artigo));
        when(categoriaRepository.findById(3L)).thenReturn(Optional.of(categoria));
        when(sanitizador.sanitizar(request.corpo())).thenReturn(request.corpo());
        when(repository.save(artigo)).thenReturn(artigo);

        var resultado = service.atualizar(12L, request);

        assertThat(resultado.fonteReferencia()).isEqualTo(fontes);
        verify(repository).save(artigo);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://example.org/uma | ",
            "| https://example.org/duas",
            "https://example.org/uma || https://example.org/duas",
            "https://example.org/uma | http://example.org/insegura",
            "https://example.org/uma | data:text/html;base64,AAAA",
            "https://example.org/uma | não é uma url"
    })
    void deveRejeitarListaDeFontesQuandoQualquerItemForVazioOuInseguro(String fontes) {
        ConteudoEducativoRequest request = request("<p>Corpo</p>", null, fontes);

        assertThatThrownBy(() -> service.criar(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Fonte de referência deve ser uma URL HTTPS válida");

        verify(repository, never()).save(any());
    }

    private ConteudoEducativo artigo(Long id, boolean ativo) {
        return ConteudoEducativo.builder()
                .id(id)
                .categoria(categoria)
                .titulo("Artigo " + id)
                .corpo("<p>Corpo</p>")
                .ativo(ativo)
                .destaque(false)
                .perfilAlvo(PerfilAlvo.TODAS)
                .build();
    }

    private ConteudoEducativoRequest request(String corpo, String imagemCapaUrl, String fonteReferencia) {
        return new ConteudoEducativoRequest(
                3L,
                "Novo artigo",
                "Subtítulo",
                corpo,
                "saúde",
                5,
                fonteReferencia,
                imagemCapaUrl,
                true,
                false,
                PerfilAlvo.TODAS);
    }
}
