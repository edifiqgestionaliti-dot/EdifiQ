package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.Reserva;
import com.antony.edifiq.repository.EstadoReservaRepository;
import com.antony.edifiq.service.ReservaService;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*")
public class ReservaController {
	private final ReservaService service;
	private final EstadoReservaRepository estadoRepo;

	public ReservaController(ReservaService s, EstadoReservaRepository e) {
		service = s;
		estadoRepo = e;
	}

	@GetMapping
	public List<Reserva> listar() {
		return service.listar();
	}

	@GetMapping("/apartamento/{id}")
	public List<Reserva> porApartamento(@PathVariable Long id) {
		return service.porApartamento(id);
	}

	@PostMapping
	public ResponseEntity<?> crear(
			@RequestBody @jakarta.validation.Valid Reserva r) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(r));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizar(
			@PathVariable Long id,
			@RequestBody @jakarta.validation.Valid Reserva r) {
		return ResponseEntity.ok(service.actualizar(id, r));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		service.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/cancelar")
	public ResponseEntity<?> cancelar(@PathVariable Long id) {
		var r = service.listar().stream()
				.filter(x -> x.getId().equals(id))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada"));
		r.setEstadoReserva(estadoRepo.findAll().stream()
				.filter(e -> e.getNombre().equalsIgnoreCase("Cancelada"))
				.findFirst()
				.orElseThrow());
		return ResponseEntity.ok(service.actualizar(id, r));
	}
}
