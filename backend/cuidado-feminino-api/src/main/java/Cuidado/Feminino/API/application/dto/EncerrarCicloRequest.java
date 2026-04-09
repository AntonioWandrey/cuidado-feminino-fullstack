package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.CicloMenstrual;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record EncerrarCicloRequest(

        @NotNull(message = "Data de fim é obrigatória")
        @PastOrPresent(message = "Data de fim não pode ser no futuro")
        LocalDate dataFim,

        CicloMenstrual.Fluxo fluxo,

        String observacoes
) {}
