package com.antony.edifiq.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.Apartamento;
public interface ApartamentoRepository extends JpaRepository<Apartamento,Long>{
 boolean existsByNumeroApartamentoAndTorre_Id(String numeroApartamento, Long idTorre);
 boolean existsByNumeroApartamentoAndTorre_IdAndIdNot(String numeroApartamento, Long idTorre, Long id);
 List<Apartamento> findByActivoTrue();
 List<Apartamento> findByTorre_Id(Long idTorre);
}
