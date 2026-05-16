package Cuidado.Feminino.API.application.exception;

public class SerieConteudoNaoEncontradaException extends RuntimeException {

    public SerieConteudoNaoEncontradaException(Long id) {
        super("Série de conteúdo não encontrada: id=" + id);
    }
}
