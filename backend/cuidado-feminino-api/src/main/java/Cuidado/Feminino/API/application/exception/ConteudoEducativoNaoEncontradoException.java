package Cuidado.Feminino.API.application.exception;

public class ConteudoEducativoNaoEncontradoException extends RuntimeException {
    public ConteudoEducativoNaoEncontradoException(Long id) {
        super("Conteúdo educativo não encontrado: id=" + id);
    }
}
