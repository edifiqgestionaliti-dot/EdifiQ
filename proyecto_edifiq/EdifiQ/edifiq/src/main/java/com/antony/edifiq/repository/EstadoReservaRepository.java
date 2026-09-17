package com.antony.edifiq.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.antony.edifiq.model.EstadoReserva;
public interface EstadoReservaRepository extends JpaRepository<EstadoReserva, Long> {
}
