package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.antony.edifiq.model.Recibo;
import com.antony.edifiq.service.ReciboService;

@RestController
@RequestMapping("/api/recibos")
@CrossOrigin(origins = "*")
public class ReciboController {
	private final ReciboService service;

	public ReciboController(ReciboService s) {
		service = s;
	}

	@GetMapping
	public List<Recibo> listar() {
		return service.listar();
	}

	@GetMapping("/apartamento/{id}")
	public List<Recibo> porApartamento(@PathVariable Long id) {
		return service.porApartamento(id);
	}

	// Recibos que el residente ya marcó como pagados (subió comprobante) y el
	// admin todavía no ha revisado.
	@GetMapping("/pendientes-revision")
	public List<Recibo> pendientesRevision() {
		return service.pendientesPorRevisar();
	}

	// Registro de un recibo nuevo: lo puede usar tanto el admin como el vigilante.
	// Siempre nace en estado "Pendiente".
	@PostMapping
	public ResponseEntity<?> crear(
			@RequestBody @jakarta.validation.Valid Recibo r) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(r));
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> actualizar(
			@PathVariable Long id,
			@RequestBody @jakarta.validation.Valid Recibo r) {
		return ResponseEntity.ok(service.actualizar(id, r));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable Long id) {
		service.eliminar(id);
		return ResponseEntity.noContent().build();
	}

	// El residente selecciona un recibo pendiente y sube la foto del
	// comprobante de pago. El recibo pasa a "Pendiente por revisar".
	@PostMapping(value = "/{id}/comprobante", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> subirComprobante(
			@PathVariable Long id,
			@RequestParam("archivo") MultipartFile archivo) {
		return ResponseEntity.ok(service.subirComprobante(id, archivo));
	}

	// Solo el admin: aprueba el comprobante y marca el recibo como "Pagado".
	@PatchMapping("/{id}/verificar")
	public ResponseEntity<?> verificar(@PathVariable Long id) {
		return ResponseEntity.ok(service.verificarPago(id));
	}

	// Solo el admin: rechaza el comprobante y el recibo vuelve a "Pendiente".
	@PatchMapping("/{id}/rechazar")
	public ResponseEntity<?> rechazar(@PathVariable Long id) {
		return ResponseEntity.ok(service.rechazarComprobante(id));
	}
}
