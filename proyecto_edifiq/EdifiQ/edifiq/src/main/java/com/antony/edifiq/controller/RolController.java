package com.antony.edifiq.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.antony.edifiq.model.Rol;
import com.antony.edifiq.repository.RolRepository;

@RestController
@RequestMapping("/api/roles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class RolController {

    private final RolRepository repo;

    public RolController(RolRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Rol> listar() {
        return repo.findAll();
    }
}