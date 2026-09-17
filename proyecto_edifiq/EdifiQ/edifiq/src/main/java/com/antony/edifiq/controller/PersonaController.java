package com.antony.edifiq.controller;
import java.util.List;
import org.springframework.http.*; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.*; import com.antony.edifiq.repository.*;
@RestController @RequestMapping("/api/personas") @CrossOrigin(origins="*")
public class PersonaController {
 private final PersonaRepository repo; private final TipoDocumentoRepository tipoRepo;
 public PersonaController(PersonaRepository repo,TipoDocumentoRepository tipoRepo){this.repo=repo;this.tipoRepo=tipoRepo;}
 @GetMapping public List<Persona> listar(){return repo.findAll();}
 @PostMapping public ResponseEntity<?> crear(@RequestBody @jakarta.validation.Valid Persona p){
   if(p.getTipoDocumento()==null||p.getTipoDocumento().getId()==null)throw new IllegalArgumentException("El tipo de documento es obligatorio");
   if(repo.findByNumeroDocumento(p.getNumeroDocumento()).isPresent())throw new IllegalArgumentException("El número de documento ya está registrado");
   p.setTipoDocumento(tipoRepo.findById(p.getTipoDocumento().getId()).orElseThrow(()->new IllegalArgumentException("Tipo de documento no encontrado")));
   return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(p));
 }
 @PutMapping("/{id}") public ResponseEntity<?> actualizar(@PathVariable Long id,@RequestBody @jakarta.validation.Valid Persona datos){
   return repo.findById(id).map(p->{if(datos.getTipoDocumento()==null||datos.getTipoDocumento().getId()==null)throw new IllegalArgumentException("El tipo de documento es obligatorio");repo.findByNumeroDocumento(datos.getNumeroDocumento()).filter(x->!x.getId().equals(id)).ifPresent(x->{throw new IllegalArgumentException("El número de documento ya está registrado");});p.setTipoDocumento(tipoRepo.findById(datos.getTipoDocumento().getId()).orElseThrow(()->new IllegalArgumentException("Tipo de documento no encontrado")));p.setNumeroDocumento(datos.getNumeroDocumento());p.setNombres(datos.getNombres());p.setApellidos(datos.getApellidos());p.setCorreo(datos.getCorreo());p.setTelefono(datos.getTelefono());p.setActivo(datos.getActivo());return ResponseEntity.ok(repo.save(p));}).orElse(ResponseEntity.notFound().build());
 }
 @DeleteMapping("/{id}") public ResponseEntity<Void> eliminar(@PathVariable Long id){if(!repo.existsById(id))return ResponseEntity.notFound().build();repo.deleteById(id);return ResponseEntity.noContent().build();}
 @GetMapping("/documento/{numeroDocumento}") public ResponseEntity<?> buscarPorDocumento(@PathVariable String numeroDocumento){return repo.findByNumeroDocumento(numeroDocumento).map(ResponseEntity::ok).orElseGet(()->ResponseEntity.notFound().build());}
}
