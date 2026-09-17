package com.antony.edifiq.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.antony.edifiq.model.Apartamento;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.TorreRepository;

@Service
public class ApartamentoService {
  private final ApartamentoRepository repo;
  private final TorreRepository torreRepo;

  public ApartamentoService(
      ApartamentoRepository repo,
      TorreRepository torreRepo) {
    this.repo = repo;
    this.torreRepo = torreRepo;
  }

  public List<Apartamento> listar() {
    return repo.findAll();
  }

  public Apartamento obtener(Long id) {
    return repo.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado"));
  }

  @Transactional
  public Apartamento guardar(Apartamento a) {
    if (a.getTorre() == null || a.getTorre().getId() == null) {
      throw new IllegalArgumentException("La torre es obligatoria");
    }

    var torre = torreRepo.findById(a.getTorre().getId())
        .orElseThrow(() -> new IllegalArgumentException("Torre no encontrada"));

    if (repo.existsByNumeroApartamentoAndTorre_Id(
        a.getNumeroApartamento(), torre.getId())) {
      throw new IllegalArgumentException("Ese apartamento ya existe en la torre");
    }

    a.setTorre(torre);
    if (a.getActivo() == null) {
      a.setActivo(true);
    }
    return repo.save(a);
  }

  @Transactional
  public Apartamento actualizar(Long id, Apartamento datos) {
    var a = obtener(id);

    if (datos.getTorre() == null || datos.getTorre().getId() == null) {
      throw new IllegalArgumentException("La torre es obligatoria");
    }

    var torre = torreRepo.findById(datos.getTorre().getId())
        .orElseThrow(() -> new IllegalArgumentException("Torre no encontrada"));

    if (repo.existsByNumeroApartamentoAndTorre_IdAndIdNot(
        datos.getNumeroApartamento(), torre.getId(), id)) {
      throw new IllegalArgumentException("Ese apartamento ya existe en la torre");
    }

    a.setNumeroApartamento(datos.getNumeroApartamento());
    a.setPiso(datos.getPiso());
    a.setActivo(datos.getActivo());
    a.setTorre(torre);
    return repo.save(a);
  }

  public void eliminar(Long id) {
    repo.deleteById(id);
  }

  public List<Apartamento> porTorre(Long id) {
    return repo.findByTorre_Id(id);
  }
}
