package com.antony.edifiq.controller;
import java.util.List; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.EstadoVisita; import com.antony.edifiq.repository.EstadoVisitaRepository;
@RestController @RequestMapping("/api/estados-visita") @CrossOrigin(origins="*")
public class EstadoVisitaController {
 private final EstadoVisitaRepository repo; public EstadoVisitaController(EstadoVisitaRepository repo){this.repo=repo;}
 @GetMapping public List<EstadoVisita> listar(){return repo.findAll();}
}
