package Cuidado.Feminino.API.domain.service;

import Cuidado.Feminino.API.application.dto.CategoriaConteudoRequest;
import Cuidado.Feminino.API.application.dto.CategoriaConteudoResponse;
import Cuidado.Feminino.API.application.exception.CategoriaConteudoNaoEncontradaException;
import Cuidado.Feminino.API.domain.entity.CategoriaConteudo;
import Cuidado.Feminino.API.domain.repository.CategoriaConteudoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoriaConteudoService {

    private final CategoriaConteudoRepository repository;

    @Transactional(readOnly = true)
    public List<CategoriaConteudoResponse> listarAtivas() {
        return repository.findByAtivoTrueOrderByOrdemAscNomeAsc()
                .stream()
                .map(CategoriaConteudoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoriaConteudoResponse> listarTodas() {
        return repository.findAll()
                .stream()
                .map(CategoriaConteudoResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaConteudoResponse buscarPorId(Long id) {
        return CategoriaConteudoResponse.de(buscarEntidadePorId(id));
    }

    @Transactional
    public CategoriaConteudoResponse criar(CategoriaConteudoRequest request) {
        CategoriaConteudo categoria = CategoriaConteudo.builder()
                .nome(request.nome())
                .descricao(request.descricao())
                .icone(request.icone())
                .ordem(request.ordem() != null ? request.ordem() : 0)
                .ativo(request.ativo() != null ? request.ativo() : true)
                .build();

        CategoriaConteudo salva = repository.save(categoria);
        log.info("Categoria de conteúdo criada: id={}, nome={}", salva.getId(), salva.getNome());
        return CategoriaConteudoResponse.de(salva);
    }

    @Transactional
    public CategoriaConteudoResponse atualizar(Long id, CategoriaConteudoRequest request) {
        CategoriaConteudo categoria = buscarEntidadePorId(id);

        categoria.setNome(request.nome());
        categoria.setDescricao(request.descricao());
        categoria.setIcone(request.icone());
        if (request.ordem() != null) categoria.setOrdem(request.ordem());
        if (request.ativo() != null) categoria.setAtivo(request.ativo());

        CategoriaConteudo salva = repository.save(categoria);
        log.info("Categoria de conteúdo atualizada: id={}", salva.getId());
        return CategoriaConteudoResponse.de(salva);
    }

    @Transactional
    public void deletar(Long id) {
        CategoriaConteudo categoria = buscarEntidadePorId(id);
        repository.delete(categoria);
        log.info("Categoria de conteúdo deletada: id={}", id);
    }

    private CategoriaConteudo buscarEntidadePorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new CategoriaConteudoNaoEncontradaException(id));
    }
}
