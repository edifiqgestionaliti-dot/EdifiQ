package com.antony.edifiq.controller;
import java.util.List; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.ZonaComun; import com.antony.edifiq.repository.ZonaComunRepository;
@RestController @RequestMapping("/api/zonas") @CrossOrigin(origins="*")
public class ZonaComunController {
 private final ZonaComunRepository repo; public ZonaComunController(ZonaComunRepository repo){this.repo=repo;}
 @GetMapping public List<ZonaComun> listar(){return repo.findAll();}
}
