package com.antony.edifiq.controller;
import java.util.List; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.Visita; import com.antony.edifiq.repository.EstadoVisitaRepository; import com.antony.edifiq.service.VisitaService;
@RestController @RequestMapping("/api/visitas") @CrossOrigin(origins="*")
public class VisitaController {
 private final VisitaService service; private final EstadoVisitaRepository estadoRepo;
 public VisitaController(VisitaService s,EstadoVisitaRepository e){service=s;estadoRepo=e;}
 @GetMapping public List<Visita> listar(){return service.listar();}
 @GetMapping("/apartamento/{id}") public List<Visita> porApartamento(@PathVariable Long id){return service.porApartamento(id);}
 @PostMapping public ResponseEntity<?> crear(@RequestBody @jakarta.validation.Valid Visita v){return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(v));}
 @PutMapping("/{id}") public ResponseEntity<?> actualizar(@PathVariable Long id,@RequestBody @jakarta.validation.Valid Visita v){return ResponseEntity.ok(service.actualizar(id,v));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> eliminar(@PathVariable Long id){service.eliminar(id);return ResponseEntity.noContent().build();}
 @PatchMapping("/{id}/finalizar") public ResponseEntity<?> finalizar(@PathVariable Long id){var v=service.listar().stream().filter(x->x.getId().equals(id)).findFirst().orElseThrow(()->new IllegalArgumentException("Visita no encontrada"));v.setFechaSalida(java.time.LocalDateTime.now());v.setEstadoVisita(estadoRepo.findAll().stream().filter(e->e.getNombre().equalsIgnoreCase("Finalizada")).findFirst().orElseThrow());return ResponseEntity.ok(service.actualizar(id,v));}
}
