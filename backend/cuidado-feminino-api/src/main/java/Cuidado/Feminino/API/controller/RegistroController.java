package Cuidado.Feminino.API.controller;

import Cuidado.Feminino.API.model.RegistroSaude;
import Cuidado.Feminino.API.repository.RegistroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/saude")
public class RegistroController {

    @Autowired
    private RegistroRepository repository;

    // Rota para salvar um novo registro (Vem do formulário React)
    @PostMapping("/registrar")
    public ResponseEntity<RegistroSaude> criarRegistro(@RequestBody RegistroSaude registro) {
        RegistroSaude salvo = repository.save(registro);
        return ResponseEntity.ok(salvo);
    }

    // Rota para listar todos (Para o seu Dashboard/Histórico)
    @GetMapping("/historico")
    public List<RegistroSaude> listarHistorico() {
        return repository.findAll();
    }
}