package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.ApartamentoPersona;
import com.antony.edifiq.model.ApartamentoPersonaId;
import com.antony.edifiq.repository.ApartamentoPersonaRepository;
import com.antony.edifiq.repository.ApartamentoRepository;
import com.antony.edifiq.repository.PersonaRepository;
import com.antony.edifiq.repository.TipoResidenteRepository;

@RestController
@RequestMapping("/api/apartamentos-personas")
@CrossOrigin(origins = "*")
public class ApartamentoPersonaController {
  private final ApartamentoPersonaRepository repo;
  private final ApartamentoRepository aptRepo;
  private final PersonaRepository personaRepo;
  private final TipoResidenteRepository tipoRepo;

  public ApartamentoPersonaController(
      ApartamentoPersonaRepository r,
      ApartamentoRepository a,
      PersonaRepository p,
      TipoResidenteRepository t) {
    repo = r;
    aptRepo = a;
    personaRepo = p;
    tipoRepo = t;
  }

  @GetMapping
  public List<ApartamentoPersona> listar() {
    return repo.findAll();
  }

  @GetMapping("/apartamento/{id}")
  public List<ApartamentoPersona> porApartamento(@PathVariable Long id) {
    return repo.findByApartamento_Id(id);
  }

  @GetMapping("/persona/{id}")
  public List<ApartamentoPersona> porPersona(@PathVariable Long id) {
    return repo.findByPersona_Id(id);
  }

  @PostMapping
  public ResponseEntity<?> crear(@RequestBody ApartamentoPersona d) {
    if (d.getApartamento() == null
        || d.getApartamento().getId() == null
        || d.getPersona() == null
        || d.getPersona().getId() == null
        || d.getTipoResidente() == null
        || d.getTipoResidente().getId() == null) {
      return ResponseEntity.badRequest()
          .body("Apartamento, persona y tipo de residente son obligatorios");
    }

    var key = new ApartamentoPersonaId(
        d.getApartamento().getId(),
        d.getPersona().getId());

    if (repo.existsById(key)) {
      return ResponseEntity.badRequest()
          .body("La persona ya está asociada a ese apartamento");
    }

    d.setApartamento(aptRepo.findById(d.getApartamento().getId())
        .orElseThrow(() -> new IllegalArgumentException("Apartamento no encontrado")));
    d.setPersona(personaRepo.findById(d.getPersona().getId())
        .orElseThrow(() -> new IllegalArgumentException("Persona no encontrada")));
    d.setTipoResidente(tipoRepo.findById(d.getTipoResidente().getId())
        .orElseThrow(() -> new IllegalArgumentException(
            "Tipo de residente no encontrado")));

    return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(d));
  }

  @DeleteMapping("/{idApartamento}/{idPersona}")
  public ResponseEntity<Void> eliminar(
      @PathVariable Long idApartamento,
      @PathVariable Long idPersona) {
    repo.deleteById(new ApartamentoPersonaId(idApartamento, idPersona));
    return ResponseEntity.noContent().build();
  }
}
