package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.PrevisaoResponse;
import Cuidado.Feminino.API.domain.service.CicloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/previsoes")
@RequiredArgsConstructor
public class PrevisaoCicloController {

    private final CicloService cicloService;

    @GetMapping
    public ResponseEntity<PrevisaoResponse> obterPrevisaoAtual() {
        return ResponseEntity.ok(cicloService.gerarPrevisao());
    }

    @PostMapping("/calcular")
    public ResponseEntity<PrevisaoResponse> recalcular() {
        return ResponseEntity.ok(cicloService.gerarPrevisao());
    }
}
