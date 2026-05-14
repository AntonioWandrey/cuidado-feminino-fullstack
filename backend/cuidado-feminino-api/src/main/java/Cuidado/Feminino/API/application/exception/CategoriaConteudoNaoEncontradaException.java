package Cuidado.Feminino.API.application.exception;

public class CategoriaConteudoNaoEncontradaException extends RuntimeException {
    public CategoriaConteudoNaoEncontradaException(Long id) {
        super("Categoria de conteúdo não encontrada: id=" + id);
    }
}
