package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoRequest;
import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.application.exception.CategoriaConteudoNaoEncontradaException;
import Cuidado.Feminino.API.application.exception.ConteudoEducativoNaoEncontradoException;
import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;
import Cuidado.Feminino.API.domain.entity.ConteudoEducativo;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.repository.CategoriaConteudoRepository;
import Cuidado.Feminino.API.domain.repository.ConteudoEducativoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.util.Locale;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConteudoEducativoService {

    private final ConteudoEducativoRepository repository;
    private final CategoriaConteudoRepository categoriaRepository;
    private final SanitizadorConteudoService sanitizadorConteudoService;

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarAtivos() {
        return repository.findByAtivoTrueOrderByTituloAsc()
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarTodos() {
        return repository.findAll()
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConteudoEducativoResponse buscarPorId(Long id) {
        return ConteudoEducativoResponse.de(buscarEntidadePorId(id));
    }

    @Transactional(readOnly = true)
    public ConteudoEducativoResponse buscarPublicoPorId(Long id) {
        ConteudoEducativo conteudo = repository.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new ConteudoEducativoNaoEncontradoException(id));
        return ConteudoEducativoResponse.de(conteudo);
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarDestaques() {
        return repository.findByDestaqueTrueAndAtivoTrueOrderByTituloAsc()
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarPorPerfil(PerfilAlvo perfil) {
        return repository.findByPerfilAlvoAndAtivoTrueOrderByTituloAsc(perfil)
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> listarPorCategoria(Long categoriaId) {
        return repository.findByAtivoTrueAndCategoria_IdOrderByTituloAsc(categoriaId)
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConteudoEducativoResponse> buscar(String termo) {
        if (!StringUtils.hasText(termo)) {
            return listarAtivos();
        }
        return repository.buscarPorTermo(termo.trim())
                .stream()
                .map(ConteudoEducativoResponse::de)
                .toList();
    }

    @Transactional
    public ConteudoEducativoResponse criar(ConteudoEducativoRequest request) {
        validarUrlsExternas(request);
        String corpoSanitizado = sanitizadorConteudoService.sanitizar(request.corpo());
        CategoriaConteudo categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaConteudoNaoEncontradaException(request.categoriaId()));

        ConteudoEducativo conteudo = ConteudoEducativo.builder()
                .categoria(categoria)
                .titulo(request.titulo())
                .subtitulo(request.subtitulo())
                .corpo(corpoSanitizado)
                .palavrasChave(request.palavrasChave())
                .tempoLeituraMin(request.tempoLeituraMin())
                .fonteReferencia(request.fonteReferencia())
                .imagemCapaUrl(request.imagemCapaUrl())
                .ativo(request.ativo() != null ? request.ativo() : true)
                .destaque(request.destaque() != null ? request.destaque() : false)
                .perfilAlvo(request.perfilAlvo() != null ? request.perfilAlvo() : PerfilAlvo.TODAS)
                .build();

        ConteudoEducativo salvo = repository.save(conteudo);
        log.info("Conteúdo educativo criado: id={}, titulo={}", salvo.getId(), salvo.getTitulo());
        return ConteudoEducativoResponse.de(salvo);
    }

    @Transactional
    public ConteudoEducativoResponse atualizar(Long id, ConteudoEducativoRequest request) {
        ConteudoEducativo conteudo = buscarEntidadePorId(id);

        validarUrlsExternas(request);
        CategoriaConteudo categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaConteudoNaoEncontradaException(request.categoriaId()));
        String corpoSanitizado = sanitizadorConteudoService.sanitizar(request.corpo());

        conteudo.setCategoria(categoria);
        conteudo.setTitulo(request.titulo());
        conteudo.setSubtitulo(request.subtitulo());
        conteudo.setCorpo(corpoSanitizado);
        conteudo.setPalavrasChave(request.palavrasChave());
        conteudo.setTempoLeituraMin(request.tempoLeituraMin());
        conteudo.setFonteReferencia(request.fonteReferencia());
        conteudo.setImagemCapaUrl(request.imagemCapaUrl());
        if (request.ativo() != null) conteudo.setAtivo(request.ativo());
        if (request.destaque() != null) conteudo.setDestaque(request.destaque());
        if (request.perfilAlvo() != null) conteudo.setPerfilAlvo(request.perfilAlvo());

        ConteudoEducativo salvo = repository.save(conteudo);
        log.info("Conteúdo educativo atualizado: id={}", salvo.getId());
        return ConteudoEducativoResponse.de(salvo);
    }

    @Transactional
    public ConteudoEducativoResponse alterarPublicacao(Long id, boolean ativo) {
        ConteudoEducativo conteudo = buscarEntidadePorId(id);
        conteudo.setAtivo(ativo);
        ConteudoEducativo salvo = repository.save(conteudo);
        log.info("Publicação de conteúdo alterada: id={}, ativo={}", id, ativo);
        return ConteudoEducativoResponse.de(salvo);
    }

    @Transactional
    public void excluirLogicamente(Long id) {
        ConteudoEducativo conteudo = buscarEntidadePorId(id);
        conteudo.setAtivo(false);
        repository.save(conteudo);
        log.info("Conteúdo educativo excluído logicamente: id={}", id);
    }

    private ConteudoEducativo buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ConteudoEducativoNaoEncontradoException(id));
    }

    private void validarUrlsExternas(ConteudoEducativoRequest request) {
        if (StringUtils.hasText(request.imagemCapaUrl())) {
            URI uri = criarUriHttps(request.imagemCapaUrl(),
                    "URL da imagem de capa deve ser HTTPS e não pode apontar para SVG");
            String caminho = uri.getPath();
            String caminhoNormalizado = caminho == null ? "" : caminho.toLowerCase(Locale.ROOT);
            if (caminho == null
                    || caminhoNormalizado.endsWith(".svg")
                    || caminhoNormalizado.endsWith(".svgz")) {
                throw new IllegalArgumentException(
                        "URL da imagem de capa deve ser HTTPS e não pode apontar para SVG");
            }
        }

        if (StringUtils.hasText(request.fonteReferencia())) {
            validarFontesReferencia(request.fonteReferencia());
        }
    }

    private void validarFontesReferencia(String fontes) {
        String mensagemErro = "Fonte de referência deve ser uma URL HTTPS válida";
        for (String fonte : fontes.split("\\|", -1)) {
            if (!StringUtils.hasText(fonte)) {
                throw new IllegalArgumentException(mensagemErro);
            }
            criarUriHttps(fonte.trim(), mensagemErro);
        }
    }

    private URI criarUriHttps(String valor, String mensagemErro) {
        try {
            URI uri = URI.create(valor);
            if (!"https".equalsIgnoreCase(uri.getScheme())
                    || !StringUtils.hasText(uri.getHost())
                    || uri.getUserInfo() != null) {
                throw new IllegalArgumentException(mensagemErro);
            }
            return uri;
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException(mensagemErro);
        }
    }
}
