package com.antony.edifiq.controller;
import java.util.List; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.TipoVisita; import com.antony.edifiq.repository.TipoVisitaRepository;
@RestController @RequestMapping("/api/tipos-visita") @CrossOrigin(origins="*")
public class TipoVisitaController {
 private final TipoVisitaRepository repo; public TipoVisitaController(TipoVisitaRepository repo){this.repo=repo;}
 @GetMapping public List<TipoVisita> listar(){return repo.findAll();}
}
