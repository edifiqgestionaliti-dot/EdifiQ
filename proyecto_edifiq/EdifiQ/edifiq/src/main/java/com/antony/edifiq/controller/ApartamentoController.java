package com.antony.edifiq.controller;
import java.util.List; import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.Apartamento; import com.antony.edifiq.service.ApartamentoService;
@RestController @RequestMapping("/api/apartamentos") @CrossOrigin(origins="*")
public class ApartamentoController {
 private final ApartamentoService service; public ApartamentoController(ApartamentoService s){service=s;}
 @GetMapping public List<Apartamento> listar(){return service.listar();}
 @GetMapping("/{id}") public ResponseEntity<Apartamento> obtener(@PathVariable Long id){try{return ResponseEntity.ok(service.obtener(id));}catch(IllegalArgumentException e){return ResponseEntity.notFound().build();}}
 @GetMapping("/torre/{idTorre}") public List<Apartamento> porTorre(@PathVariable Long idTorre){return service.porTorre(idTorre);}
 @PostMapping public ResponseEntity<?> crear(@RequestBody @jakarta.validation.Valid Apartamento a){return ResponseEntity.status(HttpStatus.CREATED).body(service.guardar(a));}
 @PutMapping("/{id}") public ResponseEntity<?> actualizar(@PathVariable Long id,@RequestBody @jakarta.validation.Valid Apartamento a){return ResponseEntity.ok(service.actualizar(id,a));}
 @DeleteMapping("/{id}") public ResponseEntity<Void> eliminar(@PathVariable Long id){service.eliminar(id);return ResponseEntity.noContent().build();}
}
