package com.antony.edifiq.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antony.edifiq.model.Rol;

public interface RolRepository extends JpaRepository<Rol, Long> {
    Optional<Rol> findByNombreIgnoreCase(String nombre);
}