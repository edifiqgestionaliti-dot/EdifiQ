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

import com.antony.edifiq.model.Paquete;
import com.antony.edifiq.repository.EstadoPaqueteRepository;
import com.antony.edifiq.service.PaqueteService;

@RestController
@RequestMapping("/api/paquetes")
@CrossOrigin(origins = "*")
public class PaqueteController {
	private final PaqueteService service;
	private final EstadoPaqueteRepository estadoRepo;

	public PaqueteController(PaqueteService s, EstadoPaqueteRepository e) {
		service = s;
		estadoRepo = e;
	}

	@GetMapping
	public List<Paquete> listar() {
		return service.listar();
	}

	@GetMapping("/apartamento/{id}")
	public List<Paquete> porApartamento(@PathVariable Long id) {
		return service.porApartamento(id);
	}

	@PostMapping
	public ResponseEntity<?> crear(
			@RequestBody @jakarta.validation.Valid Paquete p) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(p));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizar(
			@PathVariable Long id,
			@RequestBody @jakarta.validation.Valid Paquete p) {
		return ResponseEntity.ok(service.actualizar(id, p));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		service.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	@PatchMapping("/{id}/entregar")
	public ResponseEntity<?> entregar(@PathVariable Long id) {
		var p = service.listar().stream()
				.filter(x -> x.getId().equals(id))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException("Paquete no encontrado"));
		var estado = estadoRepo.findAll().stream()
				.filter(e -> e.getNombre().equalsIgnoreCase("Entregado"))
				.findFirst()
				.orElseThrow(() -> new IllegalArgumentException(
						"Estado Entregado no configurado"));
		p.setEstadoPaquete(estado);
		p.setFechaEntrega(java.time.LocalDateTime.now());
		return ResponseEntity.ok(service.actualizar(id, p));
	}
}
