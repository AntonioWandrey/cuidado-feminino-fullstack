package Cuidado.Feminino.API.application.dto;

import Cuidado.Feminino.API.domain.enums.Intensidade;
import Cuidado.Feminino.API.domain.enums.TipoQueixa;
import Cuidado.Feminino.API.domain.enums.VolumeSangramento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegistroQueixaRequest(

        @NotNull(message = "Data do registro é obrigatória")
        @PastOrPresent(message = "A data do registro não pode ser futura")
        LocalDate dataRegistro,

        @NotNull(message = "Tipo de queixa é obrigatório")
        TipoQueixa tipoQueixa,

        Intensidade intensidade,

        @Size(max = 1000, message = "Descrição deve ter no máximo 1000 caracteres")
        String descricao,

        Integer duracaoHoras,

        // Campos específicos de corrimento
        @Size(max = 50, message = "Cor do corrimento deve ter no máximo 50 caracteres")
        String corrimentoCor,
        Boolean corrimentoOdor,
        Boolean corrimentoCoceira,

        // Campos específicos de sangramento
        VolumeSangramento sangramentoVolume,

        Long conteudoRelacionadoId
) {}
