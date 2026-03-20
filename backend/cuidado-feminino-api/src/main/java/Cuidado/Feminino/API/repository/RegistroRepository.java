package Cuidado.Feminino.API.repository;

import Cuidado.Feminino.API.model.RegistroSaude;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RegistroRepository extends JpaRepository<RegistroSaude, Long> {
  
    // Métodos de consulta personalizados podem ser adicionados aqui, se necessário

}
