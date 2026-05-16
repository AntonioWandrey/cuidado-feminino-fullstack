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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConteudoEducativoService {

    private final ConteudoEducativoRepository repository;
    private final CategoriaConteudoRepository categoriaRepository;

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
        CategoriaConteudo categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaConteudoNaoEncontradaException(request.categoriaId()));

        ConteudoEducativo conteudo = ConteudoEducativo.builder()
                .categoria(categoria)
                .titulo(request.titulo())
                .subtitulo(request.subtitulo())
                .corpo(request.corpo())
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

        CategoriaConteudo categoria = categoriaRepository.findById(request.categoriaId())
                .orElseThrow(() -> new CategoriaConteudoNaoEncontradaException(request.categoriaId()));

        conteudo.setCategoria(categoria);
        conteudo.setTitulo(request.titulo());
        conteudo.setSubtitulo(request.subtitulo());
        conteudo.setCorpo(request.corpo());
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
    public ConteudoEducativoResponse toggleAtivo(Long id) {
        ConteudoEducativo conteudo = buscarEntidadePorId(id);
        conteudo.setAtivo(!conteudo.getAtivo());
        ConteudoEducativo salvo = repository.save(conteudo);
        log.info("Conteúdo educativo {}: id={}", salvo.getAtivo() ? "ativado" : "desativado", id);
        return ConteudoEducativoResponse.de(salvo);
    }

    @Transactional
    public void deletar(Long id) {
        ConteudoEducativo conteudo = buscarEntidadePorId(id);
        repository.delete(conteudo);
        log.info("Conteúdo educativo deletado: id={}", id);
    }

    private ConteudoEducativo buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ConteudoEducativoNaoEncontradoException(id));
    }
}
