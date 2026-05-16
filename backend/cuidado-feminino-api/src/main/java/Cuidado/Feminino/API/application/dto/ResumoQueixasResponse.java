package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.enums.TipoQueixa;

import java.util.Map;

public record ResumoQueixasResponse(
        int totalQueixas,
        Map<TipoQueixa, Long> contagemPorTipo,
        String queixaMaisFrequente
) {}
