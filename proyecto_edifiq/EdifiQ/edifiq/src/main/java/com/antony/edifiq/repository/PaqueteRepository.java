package com.antony.edifiq.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.Paquete;
public interface PaqueteRepository extends JpaRepository<Paquete,Long>{
 List<Paquete> findByApartamento_Id(Long idApartamento);
 List<Paquete> findByEstadoPaquete_Id(Long idEstado);
}
