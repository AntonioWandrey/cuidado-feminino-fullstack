package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.ConteudoEducativoResponse;
import Cuidado.Feminino.API.application.dto.SerieConteudoResponse;
import Cuidado.Feminino.API.domain.service.SerieConteudoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SerieConteudoController {

    private final SerieConteudoService serieService;

    @GetMapping
    public ResponseEntity<List<SerieConteudoResponse>> listar() {
        return ResponseEntity.ok(serieService.listarAtivas());
    }

    @GetMapping("/{id}/conteudos")
    public ResponseEntity<List<ConteudoEducativoResponse>> conteudosDaSerie(@PathVariable Long id) {
        return ResponseEntity.ok(serieService.listarConteudosDaSerie(id));
    }
}
