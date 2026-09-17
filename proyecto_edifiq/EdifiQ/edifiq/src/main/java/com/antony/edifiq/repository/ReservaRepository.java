    package com.antony.edifiq.repository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import com.antony.edifiq.model.Reserva;
public interface ReservaRepository extends JpaRepository<Reserva,Long>{
 List<Reserva> findByApartamento_Id(Long idApartamento);
 List<Reserva> findByZona_IdAndFechaReserva(Long idZona, LocalDate fecha);
 @Query("""
 SELECT COUNT(r)>0 FROM Reserva r
 WHERE r.zona.id=:zona AND r.fechaReserva=:fecha
 AND r.estadoReserva.nombre <> 'Cancelada'
 AND (:id IS NULL OR r.id <> :id)
 AND r.horaInicio < :fin AND r.horaFin > :inicio
 """)
 boolean existeConflicto(@Param("zona") Long zona,@Param("fecha") LocalDate fecha,@Param("inicio") LocalTime inicio,@Param("fin") LocalTime fin,@Param("id") Long id);
}
