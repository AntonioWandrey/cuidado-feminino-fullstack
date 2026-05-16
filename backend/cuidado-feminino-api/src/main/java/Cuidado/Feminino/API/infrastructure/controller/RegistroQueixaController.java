package Cuidado.Feminino.API.infrastructure.controller;

import Cuidado.Feminino.API.application.dto.RegistroQueixaRequest;
import Cuidado.Feminino.API.application.dto.RegistroQueixaResponse;
import Cuidado.Feminino.API.application.dto.ResumoQueixasResponse;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import Cuidado.Feminino.API.domain.service.RegistroQueixaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/queixas")
@RequiredArgsConstructor
public class RegistroQueixaController {

    private final RegistroQueixaService queixaService;

    @PostMapping
    public ResponseEntity<RegistroQueixaResponse> registrar(@Valid @RequestBody RegistroQueixaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(queixaService.registrar(request));
    }

    @GetMapping
    public ResponseEntity<List<RegistroQueixaResponse>> listar(
            @RequestParam(required = false) TipoQueixa tipo) {
        return ResponseEntity.ok(queixaService.listar(tipo));
    }

    @GetMapping("/periodo")
    public ResponseEntity<List<RegistroQueixaResponse>> listarPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        return ResponseEntity.ok(queixaService.listarPorPeriodo(inicio, fim));
    }

    @GetMapping("/resumo")
    public ResponseEntity<ResumoQueixasResponse> resumo() {
        return ResponseEntity.ok(queixaService.resumo());
    }

    @PutMapping("/{id}")
    public ResponseEntity<RegistroQueixaResponse> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody RegistroQueixaRequest request) {
        return ResponseEntity.ok(queixaService.atualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        queixaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
