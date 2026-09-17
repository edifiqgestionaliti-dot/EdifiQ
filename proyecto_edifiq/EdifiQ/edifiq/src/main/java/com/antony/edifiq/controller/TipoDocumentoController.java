package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.TipoDocumento;
import com.antony.edifiq.repository.TipoDocumentoRepository;

@RestController
@RequestMapping("/api/tipos-documento")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class TipoDocumentoController {

    private final TipoDocumentoRepository repo;

    public TipoDocumentoController(TipoDocumentoRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<TipoDocumento> listar() {
        return repo.findAll();
    }
}