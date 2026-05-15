package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.domain.enums.PerfilAlvo;
import Cuidado.Feminino.API.domain.service.ConteudoEducativoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conteudos")
@RequiredArgsConstructor
public class ConteudoEducativoController {

    private final ConteudoEducativoService conteudoService;

    @GetMapping
    public ResponseEntity<List<ConteudoEducativoResponse>> listar(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) PerfilAlvo perfilAlvo) {

        if (categoriaId != null) {
            return ResponseEntity.ok(conteudoService.listarPorCategoria(categoriaId));
        }
        if (perfilAlvo != null) {
            return ResponseEntity.ok(conteudoService.listarPorPerfil(perfilAlvo));
        }
        return ResponseEntity.ok(conteudoService.listarAtivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConteudoEducativoResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(conteudoService.buscarPorId(id));
    }

    @GetMapping("/busca")
    public ResponseEntity<List<ConteudoEducativoResponse>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(conteudoService.buscar(q));
    }

    @GetMapping("/destaque")
    public ResponseEntity<List<ConteudoEducativoResponse>> destaques() {
        return ResponseEntity.ok(conteudoService.listarDestaques());
    }

    @GetMapping("/perfil/{perfil}")
    public ResponseEntity<List<ConteudoEducativoResponse>> porPerfil(@PathVariable PerfilAlvo perfil) {
        return ResponseEntity.ok(conteudoService.listarPorPerfil(perfil));
    }
}
