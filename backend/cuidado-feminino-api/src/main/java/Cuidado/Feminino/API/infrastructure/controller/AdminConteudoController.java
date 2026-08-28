package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoRequest;
import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.application.dto.PublicacaoConteudoRequest;
import Cuidado.Feminino.API.domain.service.ConteudoEducativoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * API administrativa sem autenticação, restrita à demonstração local.
 * Não deve ser exposta externamente antes da implementação de autenticação e autorização.
 */
@RestController
@RequestMapping("/api/admin/conteudos")
@RequiredArgsConstructor
public class AdminConteudoController {

    private final ConteudoEducativoService conteudoService;

    @GetMapping
    public ResponseEntity<List<ConteudoEducativoResponse>> listarTodos() {
        return ResponseEntity.ok(conteudoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConteudoEducativoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(conteudoService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ConteudoEducativoResponse> criar(
            @Valid @RequestBody ConteudoEducativoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(conteudoService.criar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConteudoEducativoResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody ConteudoEducativoRequest request) {
        return ResponseEntity.ok(conteudoService.atualizar(id, request));
    }

    @PatchMapping("/{id}/publicacao")
    public ResponseEntity<ConteudoEducativoResponse> alterarPublicacao(
            @PathVariable Long id,
            @Valid @RequestBody PublicacaoConteudoRequest request) {
        return ResponseEntity.ok(conteudoService.alterarPublicacao(id, request.ativo()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        conteudoService.excluirLogicamente(id);
        return ResponseEntity.noContent().build();
    }
}
