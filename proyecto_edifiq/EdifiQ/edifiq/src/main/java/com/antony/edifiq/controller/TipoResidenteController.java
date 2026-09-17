package com.antony.edifiq.controller;
import java.util.List; import org.springframework.web.bind.annotation.*;
import com.antony.edifiq.model.TipoResidente; import com.antony.edifiq.repository.TipoResidenteRepository;
@RestController @RequestMapping("/api/tipos-residente") @CrossOrigin(origins="*")
public class TipoResidenteController {
 private final TipoResidenteRepository repo; public TipoResidenteController(TipoResidenteRepository repo){this.repo=repo;}
 @GetMapping public List<TipoResidente> listar(){return repo.findAll();}
}
