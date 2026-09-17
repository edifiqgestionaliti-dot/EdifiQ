package com.antony.edifiq.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.Visita;
public interface VisitaRepository extends JpaRepository<Visita,Long>{
 List<Visita> findByApartamento_Id(Long idApartamento);
 List<Visita> findByEstadoVisita_Id(Long idEstado);
}
