package com.antony.edifiq.controller;
import java.util.List;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.Torre; import com.antony.edifiq.repository.TorreRepository;
@RestController @RequestMapping("/api/torres") @CrossOrigin(origins="*")
public class TorreController {
 private final TorreRepository repo; public TorreController(TorreRepository repo){this.repo=repo;}
 @GetMapping public List<Torre> listar(){return repo.findAll();}
 @PostMapping public ResponseEntity<Torre> crear(@RequestBody Torre t){return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(t));}
 @PutMapping("/{id}") public ResponseEntity<Torre> actualizar(@PathVariable Long id,@RequestBody Torre d){return repo.findById(id).map(t->{t.setNombreTorre(d.getNombreTorre());return ResponseEntity.ok(repo.save(t));}).orElse(ResponseEntity.notFound().build());}
 @DeleteMapping("/{id}") public ResponseEntity<Void> eliminar(@PathVariable Long id){if(!repo.existsById(id))return ResponseEntity.notFound().build();repo.deleteById(id);return ResponseEntity.noContent().build();}
}
