package com.antony.edifiq.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antony.edifiq.model.EstadoUsuario;

public interface EstadoUsuarioRepository extends JpaRepository<EstadoUsuario, Long> {
	Optional<EstadoUsuario> findByNombreIgnoreCase(String nombre);
}