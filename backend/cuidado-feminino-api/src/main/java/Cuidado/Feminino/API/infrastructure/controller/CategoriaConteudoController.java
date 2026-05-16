package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.CategoriaConteudoResponse;
import Cuidado.Feminino.API.domain.service.CategoriaConteudoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaConteudoController {

    private final CategoriaConteudoService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaConteudoResponse>> listar() {
        return ResponseEntity.ok(categoriaService.listarAtivas());
    }
}
