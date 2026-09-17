package com.antony.edifiq.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.Usuario;
public interface UsuarioRepository extends JpaRepository<Usuario,Long>{
 boolean existsByPersona_Id(Long idPersona);
 Optional<Usuario> findByUsername(String username);
 Optional<Usuario> findByPersona_CorreoIgnoreCase(String correo);
 Optional<Usuario> findByUsernameAndPassword(String username,String password);
}
