package com.antony.edifiq.controller;
import java.util.List; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.TipoServicio; import com.antony.edifiq.repository.TipoServicioRepository;
@RestController @RequestMapping("/api/tipos-servicio") @CrossOrigin(origins="*")
public class TipoServicioController {
 private final TipoServicioRepository repo; public TipoServicioController(TipoServicioRepository repo){this.repo=repo;}
 @GetMapping public List<TipoServicio> listar(){return repo.findAll();}
}
