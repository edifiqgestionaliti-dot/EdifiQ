package com.antony.edifiq.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.antony.edifiq.model.TipoDocumento;

public interface TipoDocumentoRepository extends JpaRepository<TipoDocumento, Long> {
}