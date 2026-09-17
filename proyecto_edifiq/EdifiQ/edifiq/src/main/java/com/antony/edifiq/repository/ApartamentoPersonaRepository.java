package com.antony.edifiq.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.*;
public interface ApartamentoPersonaRepository extends JpaRepository<ApartamentoPersona,ApartamentoPersonaId>{
 List<ApartamentoPersona> findByApartamento_Id(Long idApartamento);
 List<ApartamentoPersona> findByPersona_Id(Long idPersona);
 Optional<ApartamentoPersona> findByApartamento_IdAndPersona_Id(Long idApartamento,Long idPersona);
 boolean existsByPersona_Id(Long idPersona);
}
