package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.*;
import Cuidado.Feminino.API.domain.service.CicloService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ciclos")
@RequiredArgsConstructor
public class CicloController {

    private final CicloService cicloService;

    @PostMapping
    public ResponseEntity<CicloResponse> registrarInicio(@Valid @RequestBody CicloRequest request) {
        CicloResponse response = cicloService.registrarInicio(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}/encerrar")
    public ResponseEntity<CicloResponse> encerrarCiclo(
            @PathVariable Long id,
            @Valid @RequestBody EncerrarCicloRequest request) {
        return ResponseEntity.ok(cicloService.encerrarCiclo(id, request));
    }

    @GetMapping
    public ResponseEntity<List<CicloResponse>> listarCiclos() {
        return ResponseEntity.ok(cicloService.listarCiclos());
    }

    @GetMapping("/previsao")
    public ResponseEntity<PrevisaoResponse> obterPrevisao() {
        return ResponseEntity.ok(cicloService.gerarPrevisao());
    }

    @GetMapping("/calendario")
    public ResponseEntity<CalendarioResponse> obterCalendario(
            @RequestParam(defaultValue = "3") int meses) {
        if (meses < 1 || meses > 12) {
            throw new IllegalArgumentException("O parâmetro 'meses' deve estar entre 1 e 12");
        }
        return ResponseEntity.ok(cicloService.gerarCalendario(meses));
    }
}
