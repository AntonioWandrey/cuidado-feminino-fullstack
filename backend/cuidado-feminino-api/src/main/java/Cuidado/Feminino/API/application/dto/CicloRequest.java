package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.entity.CicloMenstrual;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;

import java.time.LocalDate;

public record CicloRequest(

        @NotNull(message = "Data de início é obrigatória")
        @PastOrPresent(message = "Data de início não pode ser no futuro")
        LocalDate dataInicio,

        CicloMenstrual.Fluxo fluxo,

        String observacoes
) {}
